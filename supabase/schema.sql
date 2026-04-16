-- AbonoShare — Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES (all tables first, policies after)
-- ============================================================

create table public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  mobile       text        not null unique,
  email        text,
  photo_url    text,
  discoverable boolean     not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table public.qr_codes (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  slot         text        not null check (slot in ('primary','secondary','tertiary')),
  storage_path text        not null,
  created_at   timestamptz default now(),
  unique (user_id, slot)
);

create table public.groups (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  created_by uuid        references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table public.group_members (
  id        uuid        primary key default gen_random_uuid(),
  group_id  uuid        not null references public.groups(id) on delete cascade,
  user_id   uuid        not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

create table public.transactions (
  id           uuid          primary key default gen_random_uuid(),
  payer_id     uuid          not null references public.profiles(id) on delete restrict,
  recipient_id uuid          not null references public.profiles(id) on delete restrict,
  group_id     uuid          references public.groups(id) on delete set null,
  amount       numeric(12,2) not null check (amount > 0),
  description  text,
  category     text          not null default 'others'
                             check (category in ('food','transport','utilities','entertainment','others')),
  status       text          not null default 'unpaid'
                             check (status in ('unpaid','pending','settled')),
  created_at   timestamptz   default now(),
  paid_at      timestamptz,
  verified_at  timestamptz
);

create table public.receipts (
  id             uuid        primary key default gen_random_uuid(),
  transaction_id uuid        not null unique references public.transactions(id) on delete cascade,
  uploaded_by    uuid        not null references public.profiles(id) on delete restrict,
  storage_path   text        not null,
  created_at     timestamptz default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, mobile)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce(new.raw_user_meta_data->>'mobile', '')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS — enable on all tables
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.qr_codes      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.transactions  enable row level security;
alter table public.receipts      enable row level security;

-- ============================================================
-- RLS POLICIES — profiles
-- (group_members now exists so the subquery is valid)
-- ============================================================

create policy "profiles: select own or discoverable or shared group"
  on public.profiles for select
  using (
    auth.uid() = id
    or discoverable = true
    or exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid() and gm2.user_id = profiles.id
    )
  );

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: delete own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ============================================================
-- RLS POLICIES — qr_codes
-- ============================================================

create policy "qr_codes: any authed user can select"
  on public.qr_codes for select
  using (auth.uid() is not null);

create policy "qr_codes: insert own"
  on public.qr_codes for insert
  with check (auth.uid() = user_id);

create policy "qr_codes: update own"
  on public.qr_codes for update
  using (auth.uid() = user_id);

create policy "qr_codes: delete own"
  on public.qr_codes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES — groups
-- ============================================================

create policy "groups: select if member"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "groups: any authed user can insert"
  on public.groups for insert
  with check (auth.uid() is not null);

create policy "groups: update if creator"
  on public.groups for update
  using (auth.uid() = created_by);

create policy "groups: delete if creator"
  on public.groups for delete
  using (auth.uid() = created_by);

-- ============================================================
-- RLS POLICIES — group_members
-- ============================================================

create policy "group_members: select if same group"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members me
      where me.group_id = group_members.group_id and me.user_id = auth.uid()
    )
  );

create policy "group_members: insert if group creator"
  on public.group_members for insert
  with check (
    exists (
      select 1 from public.groups
      where id = group_id and created_by = auth.uid()
    )
  );

create policy "group_members: delete if creator or self"
  on public.group_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.groups
      where id = group_members.group_id and created_by = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES — transactions
-- ============================================================

create policy "transactions: select if payer or recipient"
  on public.transactions for select
  using (auth.uid() = payer_id or auth.uid() = recipient_id);

create policy "transactions: insert as payer"
  on public.transactions for insert
  with check (auth.uid() = payer_id);

create policy "transactions: payer can update when unpaid"
  on public.transactions for update
  using (auth.uid() = payer_id and status = 'unpaid');

create policy "transactions: recipient can settle when pending"
  on public.transactions for update
  using (auth.uid() = recipient_id and status = 'pending');

create policy "transactions: payer can delete when unpaid"
  on public.transactions for delete
  using (auth.uid() = payer_id and status = 'unpaid');

-- ============================================================
-- RLS POLICIES — receipts
-- ============================================================

create policy "receipts: select if payer or recipient"
  on public.receipts for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_id
        and (t.payer_id = auth.uid() or t.recipient_id = auth.uid())
    )
  );

create policy "receipts: insert as payer"
  on public.receipts for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.payer_id = auth.uid()
    )
  );

create policy "receipts: delete if uploader and pending"
  on public.receipts for delete
  using (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.transactions t
      where t.id = transaction_id and t.status = 'pending'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_transactions_payer     on public.transactions(payer_id);
create index idx_transactions_recipient on public.transactions(recipient_id);
create index idx_transactions_group     on public.transactions(group_id);
create index idx_transactions_status    on public.transactions(status);
create index idx_group_members_user     on public.group_members(user_id);
create index idx_group_members_group    on public.group_members(group_id);
create index idx_profiles_mobile        on public.profiles(mobile);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('qr-codes', 'qr-codes', false),
  ('receipts',  'receipts',  false)
on conflict (id) do nothing;

-- qr-codes bucket policies
create policy "qr-codes: owner can upload"
  on storage.objects for insert
  with check (bucket_id = 'qr-codes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "qr-codes: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'qr-codes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "qr-codes: any authed user can read"
  on storage.objects for select
  using (bucket_id = 'qr-codes' and auth.uid() is not null);

-- receipts bucket policies
create policy "receipts: authed user can upload"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid() is not null);

create policy "receipts: authed user can read"
  on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid() is not null);

-- ── MIGRATION: group-discovery (2026-04-15) ──────────────────
-- Run the SQL above manually in Supabase SQL editor.
-- Tables: group_join_requests
-- Columns added: groups.is_public, groups.total_settled
-- Trigger: trg_update_group_total_settled
-- RLS: groups SELECT opened to all authenticated; join_requests policies added

-- ============================================================
-- MIGRATION: auto-add creator as group member
-- ============================================================

create or replace function public.handle_group_creator_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.group_members (group_id, user_id)
  values (new.id, new.created_by)
  on conflict do nothing;
  return new;
end;
$$;

create trigger trg_auto_add_creator_as_member
  after insert on public.groups
  for each row execute function public.handle_group_creator_member();
