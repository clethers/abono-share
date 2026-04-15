# Group Discovery & Join Requests — Design Spec

**Date:** 2026-04-15

## Goal

Let users browse all groups on a public leaderboard, apply to join any public group with an optional intro message, and have the group creator approve or decline applications. The landing page also shows a live leaderboard teaser to entice sign-ups.

---

## Data Model

### Changes to `groups` table

Add two columns:

```sql
alter table public.groups
  add column is_public       boolean       not null default true,
  add column total_settled   numeric(12,2) not null default 0;
```

- `is_public` — when `true`, the Apply button is shown on the group's public profile. When `false`, the group appears on the leaderboard but has no Apply button (invite-only).
- `total_settled` — denormalized aggregate of all `settled` transaction amounts in this group. Updated by a trigger on the `transactions` table whenever a transaction's status changes to `'settled'`. Non-members can read this value without touching individual transaction rows.

### Trigger: update `total_settled`

```sql
create or replace function public.update_group_total_settled()
returns trigger language plpgsql security definer as $$
begin
  if new.group_id is not null then
    update public.groups
    set total_settled = (
      select coalesce(sum(amount), 0)
      from public.transactions
      where group_id = new.group_id and status = 'settled'
    )
    where id = new.group_id;
  end if;
  return new;
end;
$$;

create trigger trg_update_group_total_settled
  after insert or update of status on public.transactions
  for each row execute function public.update_group_total_settled();
```

### New table: `group_join_requests`

```sql
create table public.group_join_requests (
  id         uuid        primary key default gen_random_uuid(),
  group_id   uuid        not null references public.groups(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  message    text,
  status     text        not null default 'pending'
                         check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);
```

One active request per person per group. Reapplying after decline requires the old record to be deleted first (handled by the app).

### RLS policy updates

**`groups` SELECT:** Change from members-only to all authenticated users, so the leaderboard works.

```sql
-- drop old policy
drop policy "groups: select if member" on public.groups;

-- new policy
create policy "groups: select if authenticated"
  on public.groups for select
  to authenticated
  using (true);
```

**`group_join_requests` policies:**

```sql
alter table public.group_join_requests enable row level security;

-- Applicant can insert their own request to a public group
create policy "join_requests: insert own"
  on public.group_join_requests for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.groups
      where id = group_id and is_public = true
    )
  );

-- Applicant can read their own requests
create policy "join_requests: select own"
  on public.group_join_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Group creator can read requests for their groups
create policy "join_requests: select if creator"
  on public.group_join_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );

-- Group creator can update (approve/decline) requests for their groups
create policy "join_requests: update if creator"
  on public.group_join_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );
```

---

## Query Helpers (`lib/supabase/db.js`)

```js
// Fetch all groups for leaderboard, sorted by total_settled desc
export async function getPublicGroups(supabase) {}

// Submit a join request (message is optional)
export async function applyToGroup(supabase, groupId, message) {}

// Fetch pending join requests for groups the current user created
export async function getJoinRequests(supabase, userId) {}

// Approve a join request — inserts into group_members, sets status to 'approved'
export async function approveJoinRequest(supabase, requestId, groupId, applicantId) {}

// Decline a join request — sets status to 'declined'
export async function declineJoinRequest(supabase, requestId) {}
```

---

## UI — App (`app/app/page.js`)

### Navigation

New **Discover** tab added in both desktop sidebar and mobile bottom nav, positioned between Groups and Settings. Active when `activeView === 'discover'`.

### Discover view (`activeView === 'discover'`)

- Leaderboard sorted by `total_settled` desc, fetched via `getPublicGroups`
- Top 3 rows: gold/silver/bronze medal emoji. Rows 4+ show rank number.
- Each row: rank, group name, member count, total settled value
- Tapping a row opens the **Group Profile Sheet** (modal overlay)
- Empty state: "No groups yet — create one!" with a link to create

### Group Profile Sheet (modal)

Shown when a leaderboard row is tapped. Displays:
- Group name, rank badge, member count, total settled
- Privacy badge: "Public" or "Invite-only"
- State-dependent action:
  - **Public + not a member + no pending request:** "Apply to Join" button → opens Apply Modal
  - **Pending request exists:** "Application Pending" badge (no button)
  - **Already a member:** "You're in ✓" badge (no button)
  - **Invite-only:** No button, just "Invite-only" badge

### Apply Modal

Opens over the Group Profile Sheet:
- Group name as heading
- Optional textarea: placeholder "Introduce yourself... (optional)", max 200 chars
- "Send Application" button — calls `applyToGroup`, shows loading state
- On success: closes modal, group profile sheet updates to "Application Pending"

### Group Detail — Requests section (creator only)

When `selectedGroup.created_by === user.id` and there are pending requests, a "Join Requests" card appears at the top of the group detail view (above the Members section). Each row shows:
- Applicant name + avatar initials
- Their message (if any), in italics
- Timestamp
- **Approve** button (green): calls `approveJoinRequest`, adds to group_members, refreshes group
- **Decline** button (gray): calls `declineJoinRequest`, removes row

### Create Group form

Add a **Public / Invite-only** toggle below the group name input. Defaults to Public. Passes `is_public` to `createGroup`.

### State additions

```js
const [discoverGroups, setDiscoverGroups] = useState([]);
const [viewingGroup, setViewingGroup] = useState(null);       // group profile sheet
const [isApplying, setIsApplying] = useState(false);          // apply modal open
const [applyMessage, setApplyMessage] = useState('');
const [joinRequests, setJoinRequests] = useState([]);
const [newGroupIsPublic, setNewGroupIsPublic] = useState(true);
```

Load `discoverGroups` and `joinRequests` alongside other data in `loadData`.

---

## UI — Landing Page (`app/page.js`)

New section between "How it works" and the dark "The App" section:

- Heading: *"Groups are already thriving"*
- Subtitle: *"See who's splitting the most. Join them."*
- Mini leaderboard: top 5 groups fetched server-side (Next.js server component or `generateStaticParams`), showing rank, name, member count, and total settled — individual transactions always hidden
- CTA button: "Join the community →" → links to `/app`
- Dark background (`#0F172A`) to break up the page visually

---

## Out of Scope

- Push notifications for join request approvals
- Group chat or comments
- Kick/remove members from within the join request flow (existing remove flow handles this)
- Paginating the leaderboard beyond 50 groups
- Rate-limiting applications (one per group enforced by unique constraint)
