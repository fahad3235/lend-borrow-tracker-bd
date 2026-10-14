# TEST RESULTS - Dhar Hishab (lend-borrow-tracker-bd)

Verified 2026-10-14 (Asia/Dhaka) by running the real checks below.
Nothing here is invented: counts are the actual tool output.

## Unit tests (Node, no deps)

Command: `node tests/test_logic.js`

Result: **PASS: 106 assertions** (exit 0).

Coverage: amount parsing (valid / zero / negative / 3-decimal / > 10,000,000 /
empty / non-numeric / number input), person validation (name length, BD mobile
`01[3-9]` + 8 digits incl. rejection of `012345`), transaction validation
(future date, bad date, bad type, unknown person, bad due date, oversize amount),
balances, totals, due flags, Bengali digits, delete guard, import validation
(wrong version, negative amount, bad date, unknown person, bad mobile,
duplicate id, bad type, bad due date, oversize / zero amount), export shape,
unique ids.

## Smoke tests (headless Chrome, raw CDP, no npm deps)

Command: `node tests/smoke.mjs` (loads `index.html?asof=2026-10-14`)

Result: **SMOKE: 52/52 passed** (exit 0).

- Console errors: **0**
- Page exceptions: **0**
- Non-file network requests: **0** (only `file:` URLs)
- 390 px: **no horizontal overflow** (`documentElement.scrollWidth <= 390`)
- Persistence across reload verified; BN toggle shows Bengali digits and
  persists `lendBorrow:lang = bn`; delete-person blocked when transactions
  exist; import-validation logic rejects wrong version / negative amount /
  bad date.

## Hand-verified figures (asserted in BOTH unit + smoke tests)

- Karim: LEND 5000 (2026-10-01) + BORROW 2000 (2026-10-02) +
  REPAY_RECEIVED 1000 (2026-10-05) -> balance **2,000.00 owed to you**.
- Add Rina: BORROW 3000 -> dashboard **owed-to-you 2,000.00**,
  **you-owe 3,000.00**, **net -1,000.00**, **2 people outstanding**.
- Then REPAY_GIVEN 3000 to Rina -> Rina **settled (0)**, you-owe **0**,
  net **2,000.00**.
- Validation: amount 0 / negative / 3-decimal / > 10,000,000 rejected;
  future date rejected; bad BD mobile `012345` rejected; malformed import
  (wrong version, negative amount, bad date) rejected with data intact.
- Due flags (asof 2026-10-14): LEND due 2026-10-10 -> **overdue**;
  due 2026-10-18 -> **due-soon**; due 2026-11-01 -> **neither**.
  Boundary also asserted: due 2026-10-21 (7 days) -> due-soon;
  due 2026-10-22 (8 days) -> neither. BORROW due dates are ignored
  (only LEND due dates feed the due list).

## Due-date approximation (documented)

The due list shows the earliest due date among a person's LEND transactions
while their balance is positive. Partial repayments do NOT retire individual
due dates: a due date stays listed until the person's balance reaches zero
or the transaction is deleted. Same note in README.md and in the app's
due-section hint.

## ASCII / Bengali constraint

Command: `grep -rP '[^\x00-\x7F]' . --exclude-dir=node_modules`

Result: **no output, exit 1 (no matches)** - every source file is pure ASCII.
All Bengali UI text comes from `\uXXXX` escapes in the `js/app.js` i18n
dictionary (plus `\u09e6`-`\u09ef` Bengali digits in `js/logic.js`),
injected into the DOM by JS. `index.html` contains no raw Bengali.

## Repairs made

- **Test-side fix (1):** smoke test expected `1,000.00` after switching back
  to English, but the seeded due-test state legitimately totals `3,000.00`
  owed (3 x LEND 1,000.00). Fixed the expectation to `3,000.00`. App code
  was correct; the test expectation was wrong. Re-ran: 52/52 green.
- **Test-side fix (2, pre-run):** corrected one Bengali escape in an error
  string (`\u044f` Cyrillic -> `\u09af`) before running tests.
- **App bugs found:** none. First full smoke run was 51/52 with only the
  test-expectation failure above.

## Remaining / known limits

- localStorage-only: no sync, no reminders, no interest, no auth.
  Anyone with the browser profile can see the data.
- Personal tracker only - not accounting / legal software, no financial advice.
