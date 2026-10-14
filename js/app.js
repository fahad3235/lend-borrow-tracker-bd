(function () {
  "use strict";
  var LB = window.LendBorrow;
  var DATA_KEY = "lendBorrow:data:v1";
  var LANG_KEY = "lendBorrow:lang";

  var I18N = {
    en: {
      app_title: "Dhar Hishab - Lend / Borrow Tracker",
      app_subtitle: "Offline personal ledger for Bangladesh. Your data stays in this browser.",
      tab_dashboard: "Dashboard",
      tab_people: "People",
      tab_transactions: "Transactions",
      tab_data: "Data",
      owed_to_you: "Owed to you",
      you_owe: "You owe",
      net: "Net",
      bdt: "BDT",
      outstanding: "People with outstanding balance",
      outstanding_sub: "Balance is not zero",
      due_title: "Due soon / Overdue",
      due_hint: "Earliest due date among a person's LEND entries. Partial repayments do not retire individual due dates.",
      due_empty: "No due or overdue amounts.",
      balances_title: "Balances by person",
      dashboard_empty: "No people yet. Add a person to start tracking.",
      add_person: "Add person",
      name_label: "Name",
      mobile_label: "BD mobile (optional)",
      note_label: "Note (optional)",
      add_person_btn: "Add person",
      people_list: "People",
      people_empty: "No people yet.",
      add_tx: "Add transaction",
      person_label: "Person",
      type_label: "Type",
      type_lend: "LEND - you lent, they owe you",
      type_borrow: "BORROW - you borrowed, you owe them",
      type_repay_received: "REPAY RECEIVED - they repaid you",
      type_repay_given: "REPAY GIVEN - you repaid them",
      amount_label: "Amount (BDT)",
      date_label: "Date",
      due_label: "Due date (optional, for LEND / BORROW)",
      add_tx_btn: "Add transaction",
      tx_list: "Transactions",
      tx_empty: "No transactions yet.",
      data_title: "Backup and restore",
      data_hint: "Export downloads a JSON backup. Import validates strictly and keeps your current data if the file is invalid.",
      export_btn: "Export JSON",
      import_label: "Import JSON file",
      import_btn: "Import",
      danger_title: "Danger zone",
      danger_hint: "Erase-all deletes every person and transaction. Type DELETE to confirm.",
      erase_label: "Type DELETE to erase everything",
      erase_btn: "Erase all data",
      footer: "Personal tracker only - not accounting or legal software. No financial advice.",
      status_owe_you: "They owe you",
      status_you_owe: "You owe them",
      status_settled: "Settled",
      overdue: "Overdue",
      due_soon: "Due soon",
      delete_btn: "Delete",
      due_prefix: "Due",
      balance_label: "Balance",
      confirm_delete_tx: "Delete this transaction?",
      confirm_erase: "Erase ALL data? This cannot be undone.",
      person_added: "Person added.",
      tx_added: "Transaction added.",
      import_ok: "Import successful.",
      erase_ok: "All data erased.",
      delete_blocked: "Cannot delete: this person has transactions.",
      no_people_for_tx: "Add a person first before adding a transaction."
    },
    bn: {
      app_title: "\u09a7\u09be\u09b0 \u09b9\u09bf\u09b8\u09be\u09ac",
      app_subtitle: "\u0985\u09ab\u09b2\u09be\u0987\u09a8 \u09b9\u09bf\u09b8\u09be\u09ac\u0964",
      tab_dashboard: "\u09a1\u09cd\u09af\u09be\u09b6\u09ac\u09cb\u09b0\u09cd\u09a1",
      tab_people: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf",
      tab_transactions: "\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8",
      tab_data: "\u09a1\u09c7\u099f\u09be",
      owed_to_you: "\u0986\u09aa\u09a8\u09be\u0995\u09c7 \u09aa\u09be\u0993\u09a8\u09be",
      you_owe: "\u0986\u09aa\u09a8\u09bf \u09a6\u09c7\u09a8",
      net: "\u09a8\u09bf\u099f",
      bdt: "\u099f\u09be\u0995\u09be",
      outstanding: "\u09ac\u0995\u09c7\u09df\u09be \u0986\u099b\u09c7 \u098f\u09ae\u09a8 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf",
      outstanding_sub: "\u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8 \u09b6\u09c2\u09a8\u09cd\u09af \u09a8\u09df",
      due_title: "\u09b6\u09c0\u0998\u09cd\u09b0\u0987 \u09ac\u0995\u09c7\u09df\u09be / \u09ae\u09c7\u09df\u09be\u09a6\u0989\u09a4\u09cd\u09a4\u09c0\u09b0\u09cd\u09a3",
      due_hint: "\u09a7\u09be\u09b0\u09c7\u09b0 \u09b8\u09ac\u099a\u09c7\u09df\u09c7 \u0986\u0997\u09c7\u09b0 \u09ae\u09c7\u09df\u09be\u09a6\u0964",
      due_empty: "\u0995\u09cb\u09a8\u09cb \u09ac\u0995\u09c7\u09df\u09be \u09a8\u09c7\u0987\u0964",
      balances_title: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u0985\u09a8\u09c1\u09af\u09be\u09df\u09c0 \u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8",
      dashboard_empty: "\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09a8\u09c7\u0987\u0964",
      add_person: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
      name_label: "\u09a8\u09be\u09ae",
      mobile_label: "\u09ac\u09bf\u09a1\u09bf \u09ae\u09cb\u09ac\u09be\u0987\u09b2 (\u0987\u099a\u09cd\u099b\u09be\u0995\u09c3\u09a4)",
      note_label: "\u09a8\u09cb\u099f (\u0987\u099a\u09cd\u099b\u09be\u0995\u09c3\u09a4)",
      add_person_btn: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
      people_list: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be",
      people_empty: "\u0995\u09cb\u09a8\u09cb \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09a8\u09c7\u0987\u0964",
      add_tx: "\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
      person_label: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf",
      type_label: "\u09a7\u09b0\u09a8",
      type_lend: "\u09a7\u09be\u09b0 \u09a6\u09bf\u09b2\u09c7\u09a8 - \u09a4\u09be\u09b0\u09be \u0986\u09aa\u09a8\u09be\u0995\u09c7 \u09a6\u09c7\u09ac\u09c7",
      type_borrow: "\u09a7\u09be\u09b0 \u09a8\u09bf\u09b2\u09c7\u09a8 - \u0986\u09aa\u09a8\u09bf \u09a6\u09c7\u09ac\u09c7\u09a8",
      type_repay_received: "\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7 \u09aa\u09c7\u09b2\u09c7\u09a8",
      type_repay_given: "\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7 \u09a6\u09bf\u09b2\u09c7\u09a8",
      amount_label: "\u099f\u09be\u0995\u09be\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3",
      date_label: "\u09a4\u09be\u09b0\u09bf\u0996",
      due_label: "\u09ae\u09c7\u09df\u09be\u09a6 (\u0987\u099a\u09cd\u099b\u09be\u0995\u09c3\u09a4)",
      add_tx_btn: "\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8",
      tx_list: "\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u09c7\u09b0 \u09a4\u09be\u09b2\u09bf\u0995\u09be",
      tx_empty: "\u0995\u09cb\u09a8\u09cb \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09a8\u09c7\u0987\u0964",
      data_title: "\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u0993 \u09b0\u09bf\u09b8\u09cd\u099f\u09cb\u09b0",
      data_hint: "\u09b0\u09aa\u09cd\u09a4\u09be\u09a8\u09bf JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u0995\u09b0\u09c7\u0964",
      export_btn: "JSON \u09b0\u09aa\u09cd\u09a4\u09be\u09a8\u09bf",
      import_label: "JSON \u09ab\u09be\u0987\u09b2 \u0986\u09ae\u09a6\u09be\u09a8\u09bf",
      import_btn: "\u0986\u09ae\u09a6\u09be\u09a8\u09bf",
      danger_title: "\u09ac\u09bf\u09aa\u099c\u09cd\u099c\u09a8\u0995 \u0985\u099e\u09cd\u099a\u09b2",
      danger_hint: "\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09c7 \u09af\u09be\u09ac\u09c7\u0964 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964",
      erase_label: "\u09b8\u09ac \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8",
      erase_btn: "\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09c1\u09a8",
      footer: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u09ae\u09be\u09a4\u09cd\u09b0\u0964",
      status_owe_you: "\u09a4\u09be\u09b0\u09be \u0986\u09aa\u09a8\u09be\u0995\u09c7 \u09a6\u09c7\u09ac\u09c7",
      status_you_owe: "\u0986\u09aa\u09a8\u09bf \u09a6\u09c7\u09ac\u09c7\u09a8",
      status_settled: "\u09ae\u09bf\u099f\u09ae\u09be\u099f",
      overdue: "\u09ae\u09c7\u09df\u09be\u09a6\u0989\u09a4\u09cd\u09a4\u09c0\u09b0\u09cd\u09a3",
      due_soon: "\u09b6\u09c0\u0998\u09cd\u09b0\u0987 \u09ac\u0995\u09c7\u09df\u09be",
      delete_btn: "\u09ae\u09c1\u099b\u09c1\u09a8",
      due_prefix: "\u09ae\u09c7\u09df\u09be\u09a6",
      confirm_delete_tx: "\u098f\u0987 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8\u099f\u09bf \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?",
      confirm_erase: "\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?",
      person_added: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09af\u09cb\u0997 \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      tx_added: "\u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u09af\u09cb\u0997 \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      import_ok: "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09b8\u09ab\u09b2 \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      erase_ok: "\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964",
      delete_blocked: "\u09ae\u09c1\u099b\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be: \u098f\u0987 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u09b0 \u09b2\u09c7\u09a8\u09a6\u09c7\u09a8 \u0986\u099b\u09c7\u0964",
      no_people_for_tx: "\u09aa\u09cd\u09b0\u09a5\u09ae\u09c7 \u098f\u0995\u099c\u09a8 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964"
    }
  };

  var ERRORS = {
    en: {
      name_required: "Name is required.",
      name_too_long: "Name must be 1-60 characters.",
      mobile_invalid: "Mobile must match 01[3-9] followed by 8 digits.",
      note_too_long: "Note is too long.",
      person_required: "Choose a person.",
      person_not_found: "Person not found.",
      type_invalid: "Type is invalid.",
      amount_required: "Amount is required.",
      amount_invalid: "Amount is invalid.",
      amount_must_be_positive: "Amount must be greater than zero.",
      amount_too_large: "Amount must be at most 10,000,000 BDT.",
      amount_max_2_decimals: "Amount can have at most 2 decimal places.",
      date_invalid: "Date is invalid.",
      date_in_future: "Date cannot be in the future.",
      due_date_invalid: "Due date is invalid.",
      import_invalid: "Import failed: invalid file. Your data was kept.",
      erase_mismatch: "Type DELETE exactly to erase everything."
    },
    bn: {
      name_required: "\u09a8\u09be\u09ae \u09a6\u09be\u09a7\u09cd\u09af\u09a4\u09be\u09ae\u09c2\u09b2\u0995\u0964",
      name_too_long: "\u09a8\u09be\u09ae \u09e7-\u09ec\u09e6 \u0985\u0995\u09cd\u09b7\u09b0\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964",
      mobile_invalid: "\u09ae\u09cb\u09ac\u09be\u0987\u09b2 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964",
      note_too_long: "\u09a8\u09cb\u099f \u0985\u09a8\u09c7\u0995 \u09ac\u09a1\u09bc\u0964",
      person_required: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09ac\u09be\u099b\u09c1\u09a8\u0964",
      person_not_found: "\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf \u09aa\u09be\u0993\u09df\u09be \u09af\u09be\u09df\u09a8\u09bf\u0964",
      type_invalid: "\u09a7\u09b0\u09a8 \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964",
      amount_required: "\u099f\u09be\u0995\u09be\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09a6\u09be\u09a7\u09cd\u09af\u09a4\u09be\u09ae\u09c2\u09b2\u0995\u0964",
      amount_invalid: "\u099f\u09be\u0995\u09be\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964",
      amount_must_be_positive: "\u099f\u09be\u0995\u09be\u09b0 \u09aa\u09b0\u09bf\u09ae\u09be\u09a3 \u09b6\u09c2\u09a8\u09cd\u09af\u09c7\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964",
      amount_too_large: "\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e7\u09e6,\u09e6\u09e6,\u09e6\u09e6\u09e6 \u099f\u09be\u0995\u09be\u0964",
      amount_max_2_decimals: "\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e8 \u09a6\u09b6\u09ae\u09bf\u0995 \u09b8\u09cd\u09a5\u09be\u09a8\u0964",
      date_invalid: "\u09a4\u09be\u09b0\u09bf\u0996 \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964",
      date_in_future: "\u09a4\u09be\u09b0\u09bf\u0996 \u09ad\u09ac\u09bf\u09b7\u09cd\u09af\u09a4\u09c7 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964",
      due_date_invalid: "\u09ae\u09c7\u09df\u09be\u09a6 \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964",
      import_invalid: "\u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 \u09b9\u09df\u09c7\u099b\u09c7\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09a4\u09a5\u09cd\u09af \u0985\u0995\u09cd\u09b7\u09a4 \u0986\u099b\u09c7\u0964",
      erase_mismatch: "DELETE \u09b9\u09c1\u09ac\u09b9\u09c1 \u09b2\u09bf\u0996\u09c1\u09a8\u0964"
    }
  };

  function getLang() {
    try {
      var v = localStorage.getItem(LANG_KEY);
      if (v === "bn" || v === "en") return v;
    } catch (e) {}
    return "en";
  }
  var lang = getLang();

  function t(key) {
    if (I18N[lang] && I18N[lang][key]) return I18N[lang][key];
    if (I18N.en[key]) return I18N.en[key];
    return key;
  }
  function terr(code) {
    if (ERRORS[lang] && ERRORS[lang][code]) return ERRORS[lang][code];
    if (ERRORS.en[code]) return ERRORS.en[code];
    return code;
  }

  function getAsof() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get("asof"); } catch (e) {}
    if (q && LB.isValidDateString(q)) return q;
    return LB.todayString();
  }
  var asof = getAsof();

  function loadState() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      if (!raw) return { people: [], transactions: [] };
      var parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.transactions)) {
        return { people: parsed.people, transactions: parsed.transactions };
      }
    } catch (e) {}
    return { people: [], transactions: [] };
  }
  var state = loadState();

  function save() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmt(paisa) { return LB.formatMoney(paisa, { bengali: lang === "bn" }); }

  function statusFor(balance) {
    if (balance > 0) return { label: t("status_owe_you"), cls: "chip-owe-you" };
    if (balance < 0) return { label: t("status_you_owe"), cls: "chip-you-owe" };
    return { label: t("status_settled"), cls: "chip-settled" };
  }

  function applyI18n() {
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      els[i].textContent = t(key);
    }
    $("lang-en").className = lang === "en" ? "active" : "";
    $("lang-bn").className = lang === "bn" ? "active" : "";
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyI18n();
    renderAll();
  }

  function showTab(name) {
    var tabs = document.querySelectorAll(".tabs button");
    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i].getAttribute("data-tab") === name;
      tabs[i].className = active ? "active" : "";
      tabs[i].setAttribute("aria-selected", active ? "true" : "false");
    }
    var panels = document.querySelectorAll(".panel");
    for (var j = 0; j < panels.length; j++) {
      panels[j].classList.toggle("active", panels[j].id === "panel-" + name);
    }
  }

  function renderDashboard() {
    var balances = LB.computeAllBalances(state.people, state.transactions);
    var totals = LB.computeTotals(balances);
    $("stat-owed").textContent = fmt(totals.owedToYou);
    $("stat-owe").textContent = fmt(totals.youOwe);
    $("stat-net").textContent = fmt(totals.net);
    $("stat-net").className = "value " + (totals.net > 0 ? "pos" : totals.net < 0 ? "neg" : "");
    $("stat-outstanding").textContent = lang === "bn" ? LB.toBengaliDigits(String(totals.outstandingCount)) : String(totals.outstandingCount);

    var due = LB.dueList(state.people, state.transactions, balances, asof);
    var dueEl = $("due-list");
    $("due-empty").style.display = due.length ? "none" : "block";
    var dh = "";
    for (var i = 0; i < due.length; i++) {
      var d = due[i];
      var chipCls = d.status === "overdue" ? "chip-overdue" : "chip-due-soon";
      var chipLabel = d.status === "overdue" ? t("overdue") : t("due_soon");
      dh += '<div class="person-row"><div><div class="person-name">' + esc(d.person.name) + '</div><div class="person-meta">' + esc(t("due_prefix")) + ": " + esc(d.dueDate) + '</div></div><div><span class="chip ' + chipCls + '">' + esc(chipLabel) + '</span> <strong>' + esc(fmt(d.balance)) + '</strong></div></div>';
    }
    dueEl.innerHTML = dh;

    var balEl = $("balance-list");
    $("balance-empty").style.display = state.people.length ? "none" : "block";
    var bh = "";
    var sorted = state.people.slice().sort(function (a, b) {
      var an = (a.name || "").toLowerCase();
      var bn = (b.name || "").toLowerCase();
      return an < bn ? -1 : an > bn ? 1 : 0;
    });
    for (var j = 0; j < sorted.length; j++) {
      var p = sorted[j];
      var bal = balances[p.id] || 0;
      var st = statusFor(bal);
      var ds = LB.dueStatusForPerson(p.id, state.transactions, asof);
      var dueTxt = "";
      if (ds.dueDate && ds.status !== "none") {
        dueTxt = ' <span class="chip ' + (ds.status === "overdue" ? "chip-overdue" : "chip-due-soon") + '">' + esc(ds.status === "overdue" ? t("overdue") : t("due_soon")) + " " + esc(ds.dueDate) + '</span>';
      } else if (ds.dueDate) {
        dueTxt = ' <span class="person-meta">' + esc(t("due_prefix")) + ": " + esc(ds.dueDate) + '</span>';
      }
      bh += '<div class="person-row"><div><div class="person-name">' + esc(p.name) + '</div><div class="person-meta">' + esc(p.mobile || "") + '</div></div><div><span class="chip ' + st.cls + '">' + esc(st.label) + '</span> <strong>' + esc(fmt(bal)) + '</strong>' + dueTxt + '</div></div>';
    }
    balEl.innerHTML = bh;
  }

  function renderPeople() {
    var listEl = $("people-list");
    $("people-empty").style.display = state.people.length ? "none" : "block";
    var balances = LB.computeAllBalances(state.people, state.transactions);
    var h = "";
    for (var i = 0; i < state.people.length; i++) {
      var p = state.people[i];
      var bal = balances[p.id] || 0;
      var st = statusFor(bal);
      h += '<div class="person-row" data-person-id="' + esc(p.id) + '"><div><div class="person-name">' + esc(p.name) + '</div><div class="person-meta">' + esc(p.mobile || "") + (p.note ? " - " + esc(p.note) : "") + '</div><div><span class="chip ' + st.cls + '">' + esc(st.label) + '</span> <strong>' + esc(fmt(bal)) + '</strong></div></div><div><button type="button" class="btn btn-ghost btn-small person-delete" data-id="' + esc(p.id) + '">' + esc(t("delete_btn")) + '</button></div></div>';
    }
    listEl.innerHTML = h;
    var btns = listEl.querySelectorAll(".person-delete");
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener("click", function (ev) {
        var id = ev.currentTarget.getAttribute("data-id");
        if (!LB.canDeletePerson(id, state.transactions)) {
          $("person-error").textContent = t("delete_blocked");
          return;
        }
        state.people = state.people.filter(function (x) { return x.id !== id; });
        save();
        renderAll();
      });
    }
    // Refresh person select for transactions
    var sel = $("tx-person");
    var cur = sel.value;
    var opts = "";
    if (state.people.length === 0) {
      opts = '<option value="">' + esc(t("no_people_for_tx")) + '</option>';
    } else {
      for (var k = 0; k < state.people.length; k++) {
        opts += '<option value="' + esc(state.people[k].id) + '">' + esc(state.people[k].name) + '</option>';
      }
    }
    sel.innerHTML = opts;
    if (cur) sel.value = cur;
  }

  function renderTransactions() {
    var listEl = $("tx-list");
    $("tx-empty").style.display = state.transactions.length ? "none" : "block";
    var byId = {};
    for (var i = 0; i < state.people.length; i++) byId[state.people[i].id] = state.people[i].name;
    var sorted = state.transactions.slice().sort(function (a, b) {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
    var h = "";
    for (var j = 0; j < sorted.length; j++) {
      var tx = sorted[j];
      h += '<div class="tx-row" data-tx-id="' + esc(tx.id) + '"><div><strong>' + esc(byId[tx.personId] || "?") + '</strong> - ' + esc(tx.type) + '<div class="person-meta">' + esc(tx.date) + (tx.dueDate ? " | " + esc(t("due_prefix")) + ": " + esc(tx.dueDate) : "") + (tx.note ? " | " + esc(tx.note) : "") + '</div></div><div><strong>' + esc(fmt(tx.amountPaisa)) + '</strong> <button type="button" class="btn btn-ghost btn-small tx-delete" data-id="' + esc(tx.id) + '">' + esc(t("delete_btn")) + '</button></div></div>';
    }
    listEl.innerHTML = h;
    var btns = listEl.querySelectorAll(".tx-delete");
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener("click", function (ev) {
        if (!window.confirm(t("confirm_delete_tx"))) return;
        var id = ev.currentTarget.getAttribute("data-id");
        state.transactions = state.transactions.filter(function (x) { return x.id !== id; });
        save();
        renderAll();
      });
    }
  }

  function renderAll() {
    renderDashboard();
    renderPeople();
    renderTransactions();
  }

  function setBanner(msg, ok) {
    var el = $("data-banner");
    el.textContent = msg || "";
    el.className = "banner " + (msg ? (ok ? "ok-banner" : "error-banner") : "");
  }

  function init() {
    applyI18n();
    var tabs = document.querySelectorAll(".tabs button");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function (ev) {
        showTab(ev.currentTarget.getAttribute("data-tab"));
      });
    }
    $("lang-en").addEventListener("click", function () { setLang("en"); });
    $("lang-bn").addEventListener("click", function () { setLang("bn"); });

    $("tx-date").value = LB.todayString();

    $("person-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var res = LB.validatePerson({
        name: $("person-name").value,
        mobile: $("person-mobile").value,
        note: $("person-note").value
      });
      if (!res.ok) {
        $("person-error").textContent = res.errors.map(terr).join(" ");
        return;
      }
      $("person-error").textContent = "";
      state.people.push({ id: LB.newId(), name: res.person.name, mobile: res.person.mobile, note: res.person.note });
      save();
      $("person-form").reset();
      renderAll();
    });

    $("tx-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (state.people.length === 0) {
        $("tx-error").textContent = t("no_people_for_tx");
        return;
      }
      var res = LB.validateTransaction({
        personId: $("tx-person").value,
        type: $("tx-type").value,
        amount: $("tx-amount").value,
        date: $("tx-date").value,
        dueDate: $("tx-due").value,
        note: $("tx-note").value
      }, state.people, LB.todayString());
      if (!res.ok) {
        $("tx-error").textContent = res.errors.map(terr).join(" ");
        return;
      }
      $("tx-error").textContent = "";
      state.transactions.push({
        id: LB.newId(),
        personId: res.normalized.personId,
        type: res.normalized.type,
        amountPaisa: res.normalized.amountPaisa,
        date: res.normalized.date,
        dueDate: res.normalized.dueDate,
        note: res.normalized.note
      });
      save();
      $("tx-form").reset();
      $("tx-date").value = LB.todayString();
      renderAll();
    });

    $("btn-export").addEventListener("click", function () {
      var data = LB.buildExport(state.people, state.transactions);
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "dhar-hishab-" + LB.todayString() + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      setBanner(t("person_added"), true);
    });

    $("import-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var file = $("import-file").files[0];
      if (!file) {
        $("import-error").textContent = terr("import_invalid");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var parsed;
        try { parsed = JSON.parse(reader.result); } catch (e) { parsed = null; }
        var res = parsed ? LB.validateImport(parsed) : { ok: false };
        if (!res.ok) {
          $("import-error").textContent = terr("import_invalid");
          setBanner(terr("import_invalid"), false);
          return;
        }
        $("import-error").textContent = "";
        state.people = res.people;
        state.transactions = res.transactions;
        save();
        setBanner(t("import_ok"), true);
        renderAll();
      };
      reader.readAsText(file);
    });

    $("erase-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      if ($("erase-confirm").value !== "DELETE") {
        $("erase-error").textContent = terr("erase_mismatch");
        return;
      }
      if (!window.confirm(t("confirm_erase"))) return;
      $("erase-error").textContent = "";
      state = { people: [], transactions: [] };
      save();
      $("erase-form").reset();
      setBanner(t("erase_ok"), true);
      renderAll();
    });

    renderAll();
    window.__lendBorrowApp = { getState: function () { return state; }, getLang: function () { return lang; }, getAsof: function () { return asof; }, t: t };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
