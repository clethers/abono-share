# Debt Netting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Balances tab that shows the net amount owed between the current user and each counterparty, automatically offsetting mutual debts.

**Architecture:** A pure JS utility `computeBalances(transactions, userId)` nets amounts per counterparty from the already-loaded `transactions` state — no DB queries or schema changes. A new "Balances" nav tab renders one row per non-zero net balance, with a drill-down to filtered transactions per counterparty.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS, Lucide React icons, existing Supabase data already in state.

---

## File Structure

| File | Change |
|------|--------|
| `lib/supabase/db.js` | Add `computeBalances(transactions, userId)` — pure function, no Supabase call |
| `app/app/page.js` | Add `balanceCounterparty` state; add Balances nav items (desktop + mobile); add `balances` and `balance-detail` view sections; import `computeBalances` |

---

### Task 1: Add `computeBalances` utility

**Files:**
- Modify: `lib/supabase/db.js` (append at end of file)

- [ ] **Step 1: Append the utility function to `lib/supabase/db.js`**

Add at the very end of the file:

```js
// ─── BALANCES ─────────────────────────────────────────────────

/**
 * Compute net balances between the current user and all counterparties.
 * Only unpaid and pending transactions are included; settled ones are excluded.
 *
 * @param {Array} transactions - the transactions array from state (with joined payer/recipient profiles)
 * @param {string} userId - the current user's id
 * @returns {Array<{ profile: object, netAmount: number, direction: 'they_owe'|'you_owe' }>}
 */
export function computeBalances(transactions, userId) {
  const map = {};

  transactions.forEach(tx => {
    if (tx.status === 'settled') return;

    const isDebtor = tx.payer_id === userId;
    const counterpartyId = isDebtor ? tx.recipient_id : tx.payer_id;
    const profile = isDebtor ? tx.recipient : tx.payer;

    if (!map[counterpartyId]) {
      map[counterpartyId] = { profile, youOwe: 0, theyOwe: 0 };
    }

    if (isDebtor) {
      map[counterpartyId].youOwe += Number(tx.amount);
    } else {
      map[counterpartyId].theyOwe += Number(tx.amount);
    }
  });

  return Object.values(map)
    .map(({ profile, youOwe, theyOwe }) => {
      const net = theyOwe - youOwe;
      if (net === 0) return null;
      return {
        profile,
        netAmount: Math.abs(net),
        direction: net > 0 ? 'they_owe' : 'you_owe',
      };
    })
    .filter(Boolean);
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/db.js
git commit -m "feat: add computeBalances utility for debt netting"
```

---

### Task 2: Import `computeBalances` in the page

**Files:**
- Modify: `app/app/page.js` — update the import block at the top

- [ ] **Step 1: Add `computeBalances` to the import from `../../lib/supabase/db`**

Find this block near the top of `app/app/page.js`:

```js
import {
  getProfile,
  updateProfile,
  getQrCodes,
  uploadQrCode,
  getQrSignedUrl,
  getTransactions,
  createTransaction,
  markTransactionPending,
  settleTransaction,
  uploadReceipt,
  getReceiptSignedUrl,
  getGroups,
  createGroup,
  addGroupMember,
  removeGroupMember,
  findProfileByMobile,
} from '../../lib/supabase/db';
```

Replace with:

```js
import {
  getProfile,
  updateProfile,
  getQrCodes,
  uploadQrCode,
  getQrSignedUrl,
  getTransactions,
  createTransaction,
  markTransactionPending,
  settleTransaction,
  uploadReceipt,
  getReceiptSignedUrl,
  getGroups,
  createGroup,
  addGroupMember,
  removeGroupMember,
  findProfileByMobile,
  computeBalances,
} from '../../lib/supabase/db';
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

---

### Task 3: Add `balanceCounterparty` state

**Files:**
- Modify: `app/app/page.js` — state declarations section (~line 217)

- [ ] **Step 1: Add state for the counterparty selected from the Balances list**

Find this line:

```js
  const [receiptSignedUrl, setReceiptSignedUrl] = useState(null);
```

Add directly after it:

```js
  const [balanceCounterparty, setBalanceCounterparty] = useState(null);
```

- [ ] **Step 2: Update the `activeView` comment to document new views**

Find:

```js
  const [activeView, setActiveView] = useState('active'); // active, dashboard, settle-up, detail, add-bill, groups
```

Replace with:

```js
  const [activeView, setActiveView] = useState('active'); // active, dashboard, settle-up, detail, add-bill, groups, balances, balance-detail
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

---

### Task 4: Add Balances nav item — desktop sidebar

**Files:**
- Modify: `app/app/page.js` — desktop `<nav>` block (~line 882)

- [ ] **Step 1: Add a Balances button between Active and Groups in the desktop nav**

Find this button in the desktop nav:

```jsx
          <button 
            onClick={() => setActiveView('groups')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'groups' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <UsersRound size={18} />
            Groups
          </button>
```

Replace with:

```jsx
          <button
            onClick={() => setActiveView('balances')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'balances' || activeView === 'balance-detail' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <ArrowRight size={18} />
            Balances
          </button>
          <button 
            onClick={() => setActiveView('groups')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeView === 'groups' || activeView === 'group-detail' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'}`}
          >
            <UsersRound size={18} />
            Groups
          </button>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

---

### Task 5: Add Balances nav item — mobile bottom bar

**Files:**
- Modify: `app/app/page.js` — mobile `<nav>` block (~line 921)

- [ ] **Step 1: Add a Balances button between Active and Groups in the mobile nav**

Find this in the mobile nav:

```jsx
          <button
            onClick={() => setActiveView('groups')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'groups' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <UsersRound size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Groups</span>
          </button>
```

Replace with:

```jsx
          <button
            onClick={() => setActiveView('balances')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'balances' || activeView === 'balance-detail' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <ArrowRight size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Balances</span>
          </button>
          <button
            onClick={() => setActiveView('groups')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[64px] transition-colors ${activeView === 'groups' || activeView === 'group-detail' ? 'text-brand' : 'text-ink-secondary'}`}
          >
            <UsersRound size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Groups</span>
          </button>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

---

### Task 6: Add Balances view section

**Files:**
- Modify: `app/app/page.js` — view rendering section, after the `groups` view block

The `groups` view ends around the line `{activeView === 'groups' && (` block's closing `)}`. Add the new views immediately after it, before `{activeView === 'settle-up' && (`.

- [ ] **Step 1: Find the insertion point**

Locate this line in the view rendering area:

```jsx
          {activeView === 'settle-up' && (
```

- [ ] **Step 2: Insert the Balances view and Balance-Detail view immediately before `{activeView === 'settle-up' && (`**

```jsx
          {activeView === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-ink-primary">Balances</h2>
              </div>

              <section className="card-theme glass overflow-hidden">
                <div className="card-header-theme">Net Amounts Owed</div>
                {(() => {
                  const balances = computeBalances(transactions, user.id);
                  if (balances.length === 0) {
                    return (
                      <div className="p-12 text-center space-y-3">
                        <div className="inline-flex p-4 bg-[#F4F7F9]/50 rounded-full text-[#CBD5E1]">
                          <CheckCircle2 size={32} />
                        </div>
                        <p className="text-ink-secondary text-sm font-medium">All settled up!</p>
                        <p className="text-ink-secondary text-xs">No outstanding balances with anyone.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="divide-y divide-border-theme">
                      {balances.map(({ profile, netAmount, direction }) => (
                        <div
                          key={profile?.id}
                          onClick={() => { setBalanceCounterparty(profile); setActiveView('balance-detail'); }}
                          className="p-4 flex items-center justify-between hover:bg-[#F4F7F9]/50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${direction === 'they_owe' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                              {(profile?.display_name || '?').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-ink-primary">{profile?.display_name || profile?.id?.slice(0, 8)}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-widest ${direction === 'they_owe' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {direction === 'they_owe' ? 'They owe you' : 'You owe them'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`font-black text-lg ${direction === 'they_owe' ? 'text-emerald-600' : 'text-red-500'}`}>
                              ₱{netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <ChevronRight size={16} className="text-ink-secondary group-hover:text-brand transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </section>
            </motion.div>
          )}

          {activeView === 'balance-detail' && balanceCounterparty && (
            <motion.div
              key="balance-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('balances')}
                  className="p-2 rounded-xl bg-surface hover:bg-border-theme transition-colors text-ink-secondary"
                >
                  <ArrowRight size={18} className="rotate-180" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-ink-primary">{balanceCounterparty.display_name}</h2>
                  <p className="text-xs text-ink-secondary font-medium">Transaction history</p>
                </div>
              </div>

              <section className="card-theme glass overflow-hidden">
                <div className="divide-y divide-border-theme">
                  {transactions
                    .filter(tx => tx.payer_id === balanceCounterparty.id || tx.recipient_id === balanceCounterparty.id)
                    .map(tx => (
                      <div
                        key={tx.id}
                        onClick={() => { setSelectedTx(tx); setActiveView('detail'); }}
                        className="p-4 flex items-center justify-between hover:bg-[#F4F7F9]/50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.payer_id === user.id ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {tx.payer_id === user.id ? <ArrowRight className="rotate-45" size={18} /> : <ArrowRight className="-rotate-135" size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-sm text-ink-primary">
                                {tx.payer_id === user.id ? `To ${tx.recipient?.display_name || tx.recipient_id?.slice(0, 8)}` : `From ${tx.payer?.display_name || tx.payer_id?.slice(0, 8)}`}
                              </p>
                              {tx.category && <CategoryTag category={tx.category} />}
                            </div>
                            <StatusBadge status={tx.status} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-ink-primary">₱{Number(tx.amount).toFixed(2)}</p>
                          <p className="text-[10px] text-ink-secondary uppercase font-bold tracking-widest">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            </motion.div>
          )}

```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

---

### Task 7: Update FAB visibility and final commit

The floating "+" action button is currently visible on `dashboard`, `groups`, and `active`. Add `balances` and `balance-detail` to its visibility condition.

**Files:**
- Modify: `app/app/page.js` — FAB section (~line 1769)

- [ ] **Step 1: Update FAB condition**

Find:

```jsx
      {(activeView === 'dashboard' || activeView === 'groups' || activeView === 'active') && (
```

Replace with:

```jsx
      {(activeView === 'dashboard' || activeView === 'groups' || activeView === 'active' || activeView === 'balances' || activeView === 'balance-detail') && (
```

- [ ] **Step 2: Verify final build passes**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 3: Commit all changes**

```bash
git add app/app/page.js
git commit -m "feat: add Balances tab with debt netting"
```
