# Debt Netting — Design Spec

**Date:** 2026-04-15

## Goal

Show users the net balance they have with each counterparty, automatically offsetting mutual debts. If Person 1 is owed ₱1,000 by Person 2, and Person 2 is owed ₱500 by Person 1, the app displays a single net balance: Person 2 owes Person 1 ₱500.

## Approach

Pure client-side computation. The `transactions` array is already loaded into React state. A utility function nets amounts per counterparty from that array — no new database queries, no schema changes, no migrations.

## Data Model

No changes to the database schema. The existing `transactions` table is the source of truth. Only transactions with `status = 'unpaid'` or `status = 'pending'` are included in the net balance calculation. Settled transactions are excluded.

## Utility Function

**Location:** `lib/supabase/db.js`

```js
// computeBalances(transactions, userId)
// Returns: [{ profile, netAmount, direction }]
//   profile    — the counterparty's profile object (from tx.payer or tx.recipient)
//   netAmount  — absolute net amount in pesos (always positive)
//   direction  — 'you_owe' | 'they_owe'
//
// Logic:
//   For each counterparty, sum amounts where payer_id === userId (you owe them)
//   and sum amounts where recipient_id === userId (they owe you).
//   net = theyOweYou - youOweThem
//   If net > 0 → direction = 'they_owe', netAmount = net
//   If net < 0 → direction = 'you_owe',  netAmount = Math.abs(net)
//   If net === 0 → exclude from results
```

## UI — Balances Tab

A new "Balances" tab is added to the main navigation, positioned between Dashboard and Groups.

### Balance list

- One row per counterparty with a non-zero net balance.
- Each row shows: avatar (initials fallback), display name, net amount (₱X,XXX), direction label.
- Direction label: **"you owe"** (red/amber tint) or **"they owe"** (green tint).
- Pairs with net = ₱0 are hidden.
- Empty state: "All settled up!" message when there are no outstanding balances.

### Tapping a row

Opens a filtered transaction list showing only transactions between the current user and that counterparty. Uses the existing transaction detail flow — no new settle action needed.

## Files Changed

| File | Change |
|------|--------|
| `lib/supabase/db.js` | Add `computeBalances(transactions, userId)` pure utility function |
| `app/app/page.js` | Add Balances tab to nav; add Balances view with computed rows; add filtered detail drill-down |

## Out of Scope

- Group-level balances (who owes what within a group split) — separate feature
- Automatic creation of offset/cancellation transaction records
- Push notifications when a balance changes
