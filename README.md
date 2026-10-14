# Dhar Hishab - Lend / Borrow Tracker BD

An offline, bilingual (English / Bangla) personal lend/borrow ledger for Bangladesh.
Track who owes you, who you owe, and what is due soon - with no account, no server,
and no network requests. All data stays in your browser's localStorage.

## Problem

Informal lending between family, friends, neighbours, and small traders is common
in Bangladesh, but it is usually tracked in memory, on paper, or in scattered chat
messages. That leads to forgotten repayments, disputed amounts, and awkward
conversations. Dhar Hishab gives one small, honest ledger: people, transactions,
balances, and due dates - nothing more.

## Features

1. **People CRUD** - Name (required, 1-60 chars), optional BD mobile
   (must match `01[3-9]` + 8 digits when given), optional note. A person can only
   be deleted when they have zero transactions; otherwise the app shows an inline
   error. (There is no cascade delete of a person with history.)
2. **Transactions** - Person, type (LEND / BORROW / REPAY_RECEIVED / REPAY_GIVEN),
   amount (BDT, > 0, max 10,000,000, max 2 decimals), date (not in the future),
   optional due date, optional note. Money is stored as **integer paisa** - no
   float math. Transactions can be deleted with a confirm dialog.
3. **Balances** - Per-person net balance in paisa: LEND +amount, BORROW -amount,
   REPAY_RECEIVED -amount, REPAY_GIVEN +amount. Positive = they owe you;
   negative = you owe them; zero = settled. Dashboard shows total owed TO you
   (sum of positive balances), total YOU owe (sum of absolute negative balances),
   net, and the count of people with an outstanding balance. Each person shows a
   status chip: They owe you / You owe them / Settled, plus their oldest due date.
4. **Due tracking** - Optional due date on LEND / BORROW transactions. The
   dashboard "Due soon / Overdue" list shows, for each person with a positive
   balance, the earliest due date among their LEND transactions: overdue if before
   today, due-soon if within 7 days. **Approximation (documented):** partial
   repayments do not retire individual due dates, so a due date stays listed
   until the person's balance reaches zero or the transaction is deleted.
5. **Data tab** - JSON export (download), JSON import with STRICT validation
   (version, types, ids, amounts, dates; malformed files are rejected and
   existing data stays intact, with an inline error), and typed-DELETE erase-all
   (the user must type `DELETE` and confirm).
6. **EN / Bangla toggle** - Persisted in localStorage. Bangla mode shows
   Bengali digits. The app ships EMPTY (no demo people or transactions) and
   makes zero network requests by design. Empty, loading, and error states are
   handled inline (empty dashboard / people / transactions lists, inline form
   errors, import error banner).

## Stack

- Plain HTML + CSS + JavaScript. No framework, no bundler, no CDN, no npm
  dependencies at runtime.
- `js/logic.js` - pure logic (no DOM): validation, balance math, due flags,
  import validation, money formatting. Works in Node and in the browser.
- `js/app.js` - DOM wiring only; calls `logic.js`.
- Tests: Node unit tests + headless-Chrome smoke tests over raw CDP.

## Getting started

Just open `index.html` in a modern browser (Chrome / Edge / Firefox / Safari).
No build step, no server needed. For a local server (optional):

```bash
npx --yes serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000/ (or the `index.html` path).

## Testing

```bash
node tests/test_logic.js   # unit tests (Node, no deps)
node tests/smoke.mjs       # headless-Chrome smoke via raw CDP
```

The smoke test loads `index.html?asof=2026-10-14` so due-date flags are
deterministic. It asserts the hand-verified figures in TEST_RESULTS.md,
validation rejections, BN digit rendering, persistence, 390 px layout, zero
console errors, and zero non-file network requests.

## Deployment

Static site. Copy the whole folder to any static host (GitHub Pages, Netlify,
or any file server). There is no backend to deploy.

## Limitations

- **Personal tracker only - not accounting or legal software.** No financial
  advice. Do not use it as a formal loan book, for tax, or as legal evidence.
- Single-browser storage: data lives in one browser's localStorage. Back up
  with JSON export before clearing browser data or switching devices.
- No sync, no multi-user, no notifications/reminders, no interest calculation.
- Due dates are an approximation (see Feature 4): they are per-LEND-entry
  dates, not amortised against partial repayments.
- No authentication: anyone with access to the browser profile can see the data.
- Demo/auth features: none. This is a local-only tool by design.

## Project status

Complete MVP. Unit + smoke tests green; see TEST_RESULTS.md for real numbers.
