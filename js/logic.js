(function (global) {
  "use strict";

  var TYPES = ["LEND", "BORROW", "REPAY_RECEIVED", "REPAY_GIVEN"];
  var SIGNS = { LEND: 1, BORROW: -1, REPAY_RECEIVED: -1, REPAY_GIVEN: 1 };
  var MAX_AMOUNT_BDT = 10000000;
  var MAX_PAISA = 1000000000; // 10,000,000 BDT in paisa
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var MOBILE_RE = /^01[3-9]\d{8}$/;
  var BN_DIGITS = ["\u09e6", "\u09e7", "\u09e8", "\u09e9", "\u09ea", "\u09eb", "\u09ec", "\u09ed", "\u09ee", "\u09ef"];

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function isValidDateString(s) {
    if (typeof s !== "string" || !DATE_RE.test(s)) return false;
    var y = parseInt(s.slice(0, 4), 10);
    var m = parseInt(s.slice(5, 7), 10);
    var d = parseInt(s.slice(8, 10), 10);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }

  function parseDateUTC(s) {
    if (!isValidDateString(s)) return null;
    var y = parseInt(s.slice(0, 4), 10);
    var m = parseInt(s.slice(5, 7), 10);
    var d = parseInt(s.slice(8, 10), 10);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function dateToString(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return y + "-" + m + "-" + day;
  }

  function todayString() {
    return dateToString(new Date());
  }

  function daysBetween(aStr, bStr) {
    var a = parseDateUTC(aStr);
    var b = parseDateUTC(bStr);
    if (!a || !b) return null;
    var ms = b.getTime() - a.getTime();
    return Math.round(ms / 86400000);
  }

  function toBengaliDigits(str) {
    var s = String(str);
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= "0" && ch <= "9") out += BN_DIGITS[ch.charCodeAt(0) - 48];
      else out += ch;
    }
    return out;
  }

  function groupThousands(intStr) {
    var out = "";
    var n = intStr.length;
    for (var i = 0; i < n; i++) {
      if (i > 0 && (n - i) % 3 === 0) out += ",";
      out += intStr.charAt(i);
    }
    return out;
  }

  function formatMoney(paisa, opts) {
    var o = opts || {};
    var useBn = !!o.bengali;
    var p = Number(paisa);
    if (!isFinite(p) || Math.floor(p) !== p) return useBn ? toBengaliDigits("0.00") : "0.00";
    var sign = p < 0 ? "-" : "";
    var abs = Math.abs(p);
    var taka = Math.floor(abs / 100);
    var rem = abs % 100;
    var remStr = rem < 10 ? "0" + rem : String(rem);
    var s = sign + groupThousands(String(taka)) + "." + remStr;
    return useBn ? toBengaliDigits(s) : s;
  }

  // Parse a user-entered amount (string or number) into integer paisa.
  // Rejects: empty, non-numeric, zero, negative, > 10,000,000, > 2 decimals.
  function parseAmountToPaisa(value) {
    if (typeof value === "number") {
      if (!isFinite(value)) return { ok: false, paisa: 0, error: "amount_invalid" };
      if (value <= 0) return { ok: false, paisa: 0, error: "amount_must_be_positive" };
      if (value > MAX_AMOUNT_BDT) return { ok: false, paisa: 0, error: "amount_too_large" };
      var scaled = value * 100;
      if (Math.abs(scaled - Math.round(scaled)) > 0.000001) {
        return { ok: false, paisa: 0, error: "amount_max_2_decimals" };
      }
      return { ok: true, paisa: Math.round(scaled), error: "" };
    }
    if (typeof value !== "string") return { ok: false, paisa: 0, error: "amount_invalid" };
    var s = value.trim();
    if (s === "") return { ok: false, paisa: 0, error: "amount_required" };
    if (!/^\d+(\.\d{1,2})?$/.test(s)) {
      if (/^-/.test(s)) return { ok: false, paisa: 0, error: "amount_must_be_positive" };
      if (/\.\d{3,}/.test(s)) return { ok: false, paisa: 0, error: "amount_max_2_decimals" };
      return { ok: false, paisa: 0, error: "amount_invalid" };
    }
    var parts = s.split(".");
    var intPart = parseInt(parts[0], 10);
    var frac = parts.length > 1 ? parts[1] : "";
    while (frac.length < 2) frac += "0";
    var paisa = intPart * 100 + parseInt(frac, 10);
    if (paisa <= 0) return { ok: false, paisa: 0, error: "amount_must_be_positive" };
    if (paisa > MAX_PAISA) return { ok: false, paisa: 0, error: "amount_too_large" };
    return { ok: true, paisa: paisa, error: "" };
  }

  function validatePerson(input) {
    var errors = [];
    var src = input || {};
    var name = typeof src.name === "string" ? src.name.trim() : "";
    if (name.length === 0) errors.push("name_required");
    if (name.length > 60) errors.push("name_too_long");
    var mobile = typeof src.mobile === "string" ? src.mobile.trim() : "";
    if (mobile !== "" && !MOBILE_RE.test(mobile)) errors.push("mobile_invalid");
    var note = typeof src.note === "string" ? src.note : "";
    if (note.length > 500) errors.push("note_too_long");
    if (errors.length > 0) return { ok: false, errors: errors };
    return { ok: true, errors: [], person: { name: name, mobile: mobile, note: note } };
  }

  function validateTransaction(input, people, today) {
    var errors = [];
    var src = input || {};
    var list = Array.isArray(people) ? people : [];
    var todayStr = today || todayString();
    if (typeof src.personId !== "string" || src.personId === "") {
      errors.push("person_required");
    } else {
      var found = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].id === src.personId) { found = true; break; }
      }
      if (!found) errors.push("person_not_found");
    }
    if (TYPES.indexOf(src.type) === -1) errors.push("type_invalid");
    var amt = parseAmountToPaisa(src.amount);
    if (!amt.ok) errors.push(amt.error);
    if (typeof src.date !== "string" || !isValidDateString(src.date)) {
      errors.push("date_invalid");
    } else if (src.date > todayStr) {
      errors.push("date_in_future");
    }
    if (src.dueDate !== undefined && src.dueDate !== null && src.dueDate !== "") {
      if (typeof src.dueDate !== "string" || !isValidDateString(src.dueDate)) {
        errors.push("due_date_invalid");
      }
    }
    var note = typeof src.note === "string" ? src.note : "";
    if (note.length > 500) errors.push("note_too_long");
    if (errors.length > 0) return { ok: false, errors: errors, paisa: 0 };
    return {
      ok: true,
      errors: [],
      paisa: amt.paisa,
      normalized: {
        personId: src.personId,
        type: src.type,
        amountPaisa: amt.paisa,
        date: src.date,
        dueDate: (src.dueDate === undefined || src.dueDate === null) ? "" : String(src.dueDate),
        note: note
      }
    };
  }

  function personBalance(personId, transactions) {
    var total = 0;
    var list = Array.isArray(transactions) ? transactions : [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (t && t.personId === personId && SIGNS[t.type] !== undefined) {
        total += SIGNS[t.type] * (t.amountPaisa || 0);
      }
    }
    return total;
  }

  function computeAllBalances(people, transactions) {
    var out = {};
    var plist = Array.isArray(people) ? people : [];
    for (var i = 0; i < plist.length; i++) {
      if (plist[i] && plist[i].id) out[plist[i].id] = 0;
    }
    var tlist = Array.isArray(transactions) ? transactions : [];
    for (var j = 0; j < tlist.length; j++) {
      var t = tlist[j];
      if (t && t.personId && SIGNS[t.type] !== undefined) {
        if (out[t.personId] === undefined) out[t.personId] = 0;
        out[t.personId] += SIGNS[t.type] * (t.amountPaisa || 0);
      }
    }
    return out;
  }

  function computeTotals(balances) {
    var values = [];
    if (Array.isArray(balances)) {
      values = balances;
    } else if (isPlainObject(balances)) {
      for (var k in balances) {
        if (Object.prototype.hasOwnProperty.call(balances, k)) values.push(balances[k]);
      }
    }
    var owedToYou = 0;
    var youOwe = 0;
    var outstanding = 0;
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      if (v > 0) { owedToYou += v; outstanding++; }
      else if (v < 0) { youOwe += -v; outstanding++; }
    }
    return { owedToYou: owedToYou, youOwe: youOwe, net: owedToYou - youOwe, outstandingCount: outstanding };
  }

  // Earliest dueDate among a person's LEND transactions.
  // status: "overdue" if due < asof, "due-soon" if within 7 days (inclusive), else "none".
  function dueStatusForPerson(personId, transactions, asof) {
    var asofStr = asof || todayString();
    var earliest = null;
    var list = Array.isArray(transactions) ? transactions : [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (t && t.personId === personId && t.type === "LEND" && t.dueDate) {
        if (!isValidDateString(t.dueDate)) continue;
        if (earliest === null || t.dueDate < earliest) earliest = t.dueDate;
      }
    }
    if (earliest === null) return { dueDate: null, status: "none" };
    if (earliest < asofStr) return { dueDate: earliest, status: "overdue" };
    var diff = daysBetween(asofStr, earliest);
    if (diff !== null && diff <= 7) return { dueDate: earliest, status: "due-soon" };
    return { dueDate: earliest, status: "none" };
  }

  function dueList(people, transactions, balances, asof) {
    var asofStr = asof || todayString();
    var bal = balances || computeAllBalances(people, transactions);
    var out = [];
    var list = Array.isArray(people) ? people : [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || !p.id) continue;
      if ((bal[p.id] || 0) <= 0) continue;
      var ds = dueStatusForPerson(p.id, transactions, asofStr);
      if (ds.status === "overdue" || ds.status === "due-soon") {
        out.push({ person: p, balance: bal[p.id], dueDate: ds.dueDate, status: ds.status });
      }
    }
    out.sort(function (a, b) {
      if (a.dueDate < b.dueDate) return -1;
      if (a.dueDate > b.dueDate) return 1;
      return 0;
    });
    return out;
  }

  function canDeletePerson(personId, transactions) {
    var list = Array.isArray(transactions) ? transactions : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].personId === personId) return false;
    }
    return true;
  }

  function newId() {
    var rand = Math.floor(Math.random() * 1000000000).toString(36);
    return "id-" + Date.now().toString(36) + "-" + rand;
  }

  function buildExport(people, transactions) {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      people: Array.isArray(people) ? people : [],
      transactions: Array.isArray(transactions) ? transactions : []
    };
  }

  // STRICT import validation. Returns { ok, error, people, transactions }.
  // On failure, caller must keep existing data intact.
  function validateImport(data) {
    function fail(code) { return { ok: false, error: code, people: [], transactions: [] }; }
    if (!isPlainObject(data)) return fail("import_not_object");
    if (data.version !== 1) return fail("import_version");
    if (!Array.isArray(data.people)) return fail("import_people");
    if (!Array.isArray(data.transactions)) return fail("import_transactions");
    var people = [];
    var seenPeople = {};
    for (var i = 0; i < data.people.length; i++) {
      var p = data.people[i];
      if (!isPlainObject(p)) return fail("import_person");
      if (typeof p.id !== "string" || p.id === "") return fail("import_person_id");
      if (seenPeople[p.id]) return fail("import_person_duplicate");
      seenPeople[p.id] = true;
      var vp = validatePerson(p);
      if (!vp.ok) return fail("import_person");
      if (typeof p.note !== "undefined" && typeof p.note !== "string") return fail("import_person");
      people.push({ id: p.id, name: vp.person.name, mobile: vp.person.mobile, note: typeof p.note === "string" ? p.note : "" });
    }
    var txs = [];
    var seenTx = {};
    for (var j = 0; j < data.transactions.length; j++) {
      var t = data.transactions[j];
      if (!isPlainObject(t)) return fail("import_transaction");
      if (typeof t.id !== "string" || t.id === "") return fail("import_transaction_id");
      if (seenTx[t.id]) return fail("import_transaction_duplicate");
      seenTx[t.id] = true;
      if (typeof t.personId !== "string" || !seenPeople[t.personId]) return fail("import_transaction_person");
      if (TYPES.indexOf(t.type) === -1) return fail("import_transaction_type");
      if (typeof t.amountPaisa !== "number" || Math.floor(t.amountPaisa) !== t.amountPaisa) return fail("import_transaction_amount");
      if (t.amountPaisa <= 0 || t.amountPaisa > MAX_PAISA) return fail("import_transaction_amount");
      if (typeof t.date !== "string" || !isValidDateString(t.date)) return fail("import_transaction_date");
      var due = "";
      if (t.dueDate !== undefined && t.dueDate !== null && t.dueDate !== "") {
        if (typeof t.dueDate !== "string" || !isValidDateString(t.dueDate)) return fail("import_transaction_due_date");
        due = t.dueDate;
      }
      if (typeof t.note !== "undefined" && typeof t.note !== "string") return fail("import_transaction_note");
      txs.push({
        id: t.id,
        personId: t.personId,
        type: t.type,
        amountPaisa: t.amountPaisa,
        date: t.date,
        dueDate: due,
        note: typeof t.note === "string" ? t.note : ""
      });
    }
    return { ok: true, error: "", people: people, transactions: txs };
  }

  var api = {
    TYPES: TYPES,
    SIGNS: SIGNS,
    MAX_AMOUNT_BDT: MAX_AMOUNT_BDT,
    MAX_PAISA: MAX_PAISA,
    isValidDateString: isValidDateString,
    parseDateUTC: parseDateUTC,
    dateToString: dateToString,
    todayString: todayString,
    daysBetween: daysBetween,
    toBengaliDigits: toBengaliDigits,
    formatMoney: formatMoney,
    parseAmountToPaisa: parseAmountToPaisa,
    validatePerson: validatePerson,
    validateTransaction: validateTransaction,
    personBalance: personBalance,
    computeAllBalances: computeAllBalances,
    computeTotals: computeTotals,
    dueStatusForPerson: dueStatusForPerson,
    dueList: dueList,
    canDeletePerson: canDeletePerson,
    newId: newId,
    buildExport: buildExport,
    validateImport: validateImport
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.LendBorrow = api;
  }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
