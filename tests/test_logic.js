"use strict";
var assert = require("node:assert");
var LB = require("../js/logic.js");

var count = 0;
function eq(actual, expected, msg) { count++; assert.strictEqual(actual, expected, msg || ""); }
function ok(v, msg) { count++; assert.ok(v, msg || ""); }

// --- parseAmountToPaisa ---
eq(LB.parseAmountToPaisa("5000").paisa, 500000);
eq(LB.parseAmountToPaisa("5000").ok, true);
eq(LB.parseAmountToPaisa("10.05").paisa, 1005);
eq(LB.parseAmountToPaisa("0.01").paisa, 1);
eq(LB.parseAmountToPaisa("10000000").paisa, 1000000000);
eq(LB.parseAmountToPaisa("10000000.00").paisa, 1000000000);
eq(LB.parseAmountToPaisa("0").ok, false);
eq(LB.parseAmountToPaisa("0.00").ok, false);
eq(LB.parseAmountToPaisa("-5").ok, false);
eq(LB.parseAmountToPaisa(-5).ok, false);
eq(LB.parseAmountToPaisa("10.123").ok, false);
eq(LB.parseAmountToPaisa("10.123").error, "amount_max_2_decimals");
eq(LB.parseAmountToPaisa("10000000.01").ok, false);
eq(LB.parseAmountToPaisa("10000001").ok, false);
eq(LB.parseAmountToPaisa("").ok, false);
eq(LB.parseAmountToPaisa("abc").ok, false);
eq(LB.parseAmountToPaisa("12.3").paisa, 1230);
eq(LB.parseAmountToPaisa(2000).paisa, 200000);
eq(LB.parseAmountToPaisa(10.123).ok, false);
eq(LB.parseAmountToPaisa(0).ok, false);
eq(LB.parseAmountToPaisa("  500 ").paisa, 50000);

// --- validatePerson ---
eq(LB.validatePerson({ name: "Karim", mobile: "01712345678", note: "" }).ok, true);
eq(LB.validatePerson({ name: "  Karim  ", mobile: "", note: "" }).person.name, "Karim");
eq(LB.validatePerson({ name: "", mobile: "", note: "" }).ok, false);
eq(LB.validatePerson({ name: "x".repeat(61), mobile: "", note: "" }).ok, false);
eq(LB.validatePerson({ name: "x".repeat(60), mobile: "", note: "" }).ok, true);
eq(LB.validatePerson({ name: "Karim", mobile: "012345", note: "" }).ok, false);
eq(LB.validatePerson({ name: "Karim", mobile: "0171234567", note: "" }).ok, false);
eq(LB.validatePerson({ name: "Karim", mobile: "017123456789", note: "" }).ok, false);
eq(LB.validatePerson({ name: "Karim", mobile: "02712345678", note: "" }).ok, false);
eq(LB.validatePerson({ name: "Karim", mobile: "01312345678", note: "" }).ok, true);
eq(LB.validatePerson({ name: "Karim", mobile: "01912345678", note: "" }).ok, true);
eq(LB.validatePerson({ name: "Karim", mobile: "01012345678", note: "" }).ok, false);

// --- isValidDateString ---
eq(LB.isValidDateString("2026-10-14"), true);
eq(LB.isValidDateString("2026-02-30"), false);
eq(LB.isValidDateString("2026-13-01"), false);
eq(LB.isValidDateString("14-10-2026"), false);
eq(LB.isValidDateString("2026-10-14x"), false);
eq(LB.isValidDateString(""), false);

// --- validateTransaction ---
var people = [{ id: "p1", name: "Karim", mobile: "", note: "" }];
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "5000", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, true);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "5000", date: "2026-10-20", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "5000", date: "2026-10-20", dueDate: "", note: "" }, people, "2026-10-14").errors.indexOf("date_in_future") !== -1, true);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "0", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "10.123", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "nope", type: "LEND", amount: "100", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "WRONG", amount: "100", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "100", date: "2026-02-30", dueDate: "", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "100", date: "2026-10-01", dueDate: "bad", note: "" }, people, "2026-10-14").ok, false);
eq(LB.validateTransaction({ personId: "p1", type: "LEND", amount: "10000001", date: "2026-10-01", dueDate: "", note: "" }, people, "2026-10-14").ok, false);

// --- Hand-verified math: Karim + Rina ---
var karim = { id: "karim", name: "Karim", mobile: "", note: "" };
var rina = { id: "rina", name: "Rina", mobile: "", note: "" };
var txs = [
  { id: "t1", personId: "karim", type: "LEND", amountPaisa: 500000, date: "2026-10-01", dueDate: "", note: "" },
  { id: "t2", personId: "karim", type: "BORROW", amountPaisa: 200000, date: "2026-10-02", dueDate: "", note: "" },
  { id: "t3", personId: "karim", type: "REPAY_RECEIVED", amountPaisa: 100000, date: "2026-10-05", dueDate: "", note: "" }
];
eq(LB.personBalance("karim", txs), 200000);
eq(LB.formatMoney(LB.personBalance("karim", txs)), "2,000.00");
var txs2 = txs.concat([{ id: "t4", personId: "rina", type: "BORROW", amountPaisa: 300000, date: "2026-10-03", dueDate: "", note: "" }]);
var bal2 = LB.computeAllBalances([karim, rina], txs2);
eq(bal2.karim, 200000);
eq(bal2.rina, -300000);
var tot2 = LB.computeTotals(bal2);
eq(tot2.owedToYou, 200000);
eq(tot2.youOwe, 300000);
eq(tot2.net, -100000);
eq(tot2.outstandingCount, 2);
var txs3 = txs2.concat([{ id: "t5", personId: "rina", type: "REPAY_GIVEN", amountPaisa: 300000, date: "2026-10-06", dueDate: "", note: "" }]);
var bal3 = LB.computeAllBalances([karim, rina], txs3);
eq(bal3.rina, 0);
var tot3 = LB.computeTotals(bal3);
eq(tot3.youOwe, 0);
eq(tot3.net, 200000);
eq(tot3.owedToYou, 200000);
eq(tot3.outstandingCount, 1);

// --- Due flags (asof 2026-10-14) ---
function dueWith(due) {
  return LB.dueStatusForPerson("karim", [{ id: "d1", personId: "karim", type: "LEND", amountPaisa: 10000, date: "2026-10-01", dueDate: due, note: "" }], "2026-10-14");
}
eq(dueWith("2026-10-10").status, "overdue");
eq(dueWith("2026-10-18").status, "due-soon");
eq(dueWith("2026-11-01").status, "none");
eq(dueWith("2026-10-21").status, "due-soon");
eq(dueWith("2026-10-22").status, "none");
eq(dueWith("").status, "none");
eq(LB.dueStatusForPerson("karim", [{ id: "d2", personId: "karim", type: "BORROW", amountPaisa: 10000, date: "2026-10-01", dueDate: "2026-10-10", note: "" }], "2026-10-14").status, "none");
eq(LB.dueStatusForPerson("karim", [], "2026-10-14").status, "none");
// Earliest due wins
var multi = [
  { id: "m1", personId: "karim", type: "LEND", amountPaisa: 10000, date: "2026-10-01", dueDate: "2026-11-01", note: "" },
  { id: "m2", personId: "karim", type: "LEND", amountPaisa: 10000, date: "2026-10-01", dueDate: "2026-10-10", note: "" }
];
eq(LB.dueStatusForPerson("karim", multi, "2026-10-14").dueDate, "2026-10-10");

// --- formatMoney / Bengali digits ---
eq(LB.formatMoney(200000), "2,000.00");
eq(LB.formatMoney(-100000), "-1,000.00");
eq(LB.formatMoney(0), "0.00");
eq(LB.formatMoney(105), "1.05");
eq(LB.formatMoney(1000000000), "10,000,000.00");
eq(LB.toBengaliDigits("123"), "\u09e7\u09e8\u09e9");
eq(LB.toBengaliDigits("2,000.00"), "\u09e8,\u09e6\u09e6\u09e6.\u09e6\u09e6");
eq(LB.formatMoney(200000, { bengali: true }), "\u09e8,\u09e6\u09e6\u09e6.\u09e6\u09e6");

// --- canDeletePerson ---
eq(LB.canDeletePerson("karim", txs), false);
eq(LB.canDeletePerson("rina", txs), true);
eq(LB.canDeletePerson("karim", []), true);

// --- computeTotals edge ---
var emptyTot = LB.computeTotals({});
eq(emptyTot.owedToYou, 0);
eq(emptyTot.youOwe, 0);
eq(emptyTot.net, 0);
eq(emptyTot.outstandingCount, 0);
eq(LB.computeTotals([0, 0]).outstandingCount, 0);

// --- daysBetween ---
eq(LB.daysBetween("2026-10-14", "2026-10-18"), 4);
eq(LB.daysBetween("2026-10-14", "2026-10-10"), -4);

// --- validateImport ---
var good = {
  version: 1,
  exportedAt: "2026-10-14T00:00:00.000Z",
  people: [{ id: "p1", name: "Karim", mobile: "", note: "" }],
  transactions: [{ id: "t1", personId: "p1", type: "LEND", amountPaisa: 500000, date: "2026-10-01", dueDate: "", note: "" }]
};
eq(LB.validateImport(good).ok, true);
eq(LB.validateImport({ version: 2, people: [], transactions: [] }).ok, false);
eq(LB.validateImport({ version: 1, people: [], transactions: [] }).ok, true);
eq(LB.validateImport(null).ok, false);
eq(LB.validateImport("x").ok, false);
var badAmt = JSON.parse(JSON.stringify(good));
badAmt.transactions[0].amountPaisa = -500;
eq(LB.validateImport(badAmt).ok, false);
var badDate = JSON.parse(JSON.stringify(good));
badDate.transactions[0].date = "not-a-date";
eq(LB.validateImport(badDate).ok, false);
var badPerson = JSON.parse(JSON.stringify(good));
badPerson.transactions[0].personId = "ghost";
eq(LB.validateImport(badPerson).ok, false);
var badMobile = JSON.parse(JSON.stringify(good));
badMobile.people[0].mobile = "012345";
eq(LB.validateImport(badMobile).ok, false);
var dup = JSON.parse(JSON.stringify(good));
dup.people.push({ id: "p1", name: "Other", mobile: "", note: "" });
eq(LB.validateImport(dup).ok, false);
var badType = JSON.parse(JSON.stringify(good));
badType.transactions[0].type = "NOPE";
eq(LB.validateImport(badType).ok, false);
var badDue = JSON.parse(JSON.stringify(good));
badDue.transactions[0].dueDate = "2026-13-01";
eq(LB.validateImport(badDue).ok, false);
var tooBig = JSON.parse(JSON.stringify(good));
tooBig.transactions[0].amountPaisa = 1000000001;
eq(LB.validateImport(tooBig).ok, false);
var zeroAmt = JSON.parse(JSON.stringify(good));
zeroAmt.transactions[0].amountPaisa = 0;
eq(LB.validateImport(zeroAmt).ok, false);

// --- buildExport / newId ---
var exp = LB.buildExport(good.people, good.transactions);
eq(exp.version, 1);
ok(typeof exp.exportedAt === "string");
ok(LB.newId() !== LB.newId(), "ids unique");

console.log("PASS: " + count + " assertions");
