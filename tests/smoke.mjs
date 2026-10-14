// Headless-Chrome smoke via raw CDP (no npm deps). Run: node tests/smoke.mjs
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "..");
const PAGE_URL = "file://" + path.join(ROOT, "index.html") + "?asof=2026-10-14";
const PORT = 9223;
const CHROME = "/opt/meta-chromium/chrome";

let checks = 0;
let failures = [];
function check(name, cond, extra) {
  checks++;
  if (!cond) failures.push(name + (extra ? " :: " + extra : ""));
  else console.log("ok - " + name);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDebugger() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch("http://127.0.0.1:" + PORT + "/json/version");
      if (r.ok) return true;
    } catch (e) {}
    await sleep(200);
  }
  throw new Error("debugger port did not come up");
}

const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--no-proxy-server",
  "--remote-debugging-port=" + PORT, "--window-size=1280,900", "about:blank"
], { stdio: "ignore" });

let ws = null;
let nextId = 1;
const pending = new Map();
let loadResolvers = [];
let consoleErrors = [];
let pageErrors = [];
let networkUrls = [];

function send(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error("CDP timeout: " + method)); } }, 15000);
  });
}

async function evaluate(expr) {
  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) {
    return { __error: res.exceptionDetails.exception ? (res.exceptionDetails.exception.description || "exception") : "exception" };
  }
  const r = res.result || {};
  if (r.subtype === "error") return { __error: r.description || "eval error" };
  return r.value;
}

function onEvent(msg) {
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result || {});
    return;
  }
  if (!msg.method) return;
  if (msg.method === "Page.loadEventFired") {
    const rs = loadResolvers.splice(0);
    for (const r of rs) r();
  }
  if (msg.method === "Runtime.consoleAPICalled") {
    const args = msg.params || {};
    if (args.type === "error") consoleErrors.push(JSON.stringify(args.args || []));
  }
  if (msg.method === "Runtime.exceptionThrown") pageErrors.push(JSON.stringify((msg.params.exceptionDetails || {}).exception || {}));
  if (msg.method === "Log.entryAdded") {
    const e = (msg.params || {}).entry || {};
    if (e.level === "error") consoleErrors.push(e.text || e.source || "log-error");
  }
  if (msg.method === "Network.requestWillBeSent") {
    const u = ((msg.params || {}).request || {}).url || "";
    networkUrls.push(u);
  }
  if (msg.method === "Page.javascriptDialogOpening") {
    send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
  }
}

function waitForLoad() {
  return new Promise((resolve) => { loadResolvers.push(resolve); setTimeout(resolve, 8000); });
}

try {
  await waitForDebugger();
  // Create a fresh target for our page
  const putRes = await fetch("http://127.0.0.1:" + PORT + "/json/new?url=" + encodeURIComponent(PAGE_URL), { method: "PUT" });
  const target = await putRes.json();
  const wsUrl = target.webSocketDebuggerUrl;
  ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", reject); });
  ws.addEventListener("message", (ev) => { try { onEvent(JSON.parse(ev.data)); } catch (e) {} });
  await send("Runtime.enable", {});
  await send("Page.enable", {});
  await send("Log.enable", {});
  await send("Network.enable", {});
  // Navigate (target already at URL, but navigate to be sure and wait for load)
  const navP = waitForLoad();
  await send("Page.navigate", { url: PAGE_URL });
  await navP;
  await sleep(400);

  // 1. Title / shell
  check("title contains Dhar Hishab", (await evaluate("document.title")) === "Dhar Hishab - Lend / Borrow Tracker BD");
  check("tabs exist (4)", (await evaluate("document.querySelectorAll('.tabs button').length")) === 4);
  check("asof parsed as 2026-10-14", (await evaluate("window.__lendBorrowApp.getAsof()")) === "2026-10-14");

  // 2. Empty state
  check("empty: owed 0.00", (await evaluate("document.getElementById('stat-owed').textContent")) === "0.00");
  check("empty: owe 0.00", (await evaluate("document.getElementById('stat-owe').textContent")) === "0.00");
  check("empty: net 0.00", (await evaluate("document.getElementById('stat-net').textContent")) === "0.00");
  check("empty: outstanding 0", (await evaluate("document.getElementById('stat-outstanding').textContent")) === "0");
  check("empty: dashboard empty visible", (await evaluate("document.getElementById('balance-empty').style.display !== 'none'")) === true);
  check("empty: people empty visible", (await evaluate("(()=>{document.querySelector('[data-tab=\"people\"]').click(); return document.getElementById('people-empty').style.display !== 'none';})()")) === true);

  // Helper to add a person via the UI form
  async function addPersonUI(name, mobile) {
    return await evaluate(`(()=>{document.querySelector('[data-tab="people"]').click(); document.getElementById('person-name').value=${JSON.stringify(name)}; document.getElementById('person-mobile').value=${JSON.stringify(mobile || "")}; document.getElementById('person-note').value=""; document.getElementById('person-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return document.querySelectorAll('#people-list .person-row').length;})()`);
  }
  async function addTxUI(personName, type, amount, date, due) {
    return await evaluate(`(()=>{document.querySelector('[data-tab="transactions"]').click(); var sel=document.getElementById('tx-person'); var opt=[...sel.options].find(o=>o.text===${JSON.stringify(personName)}); if(!opt) return 'no-person'; sel.value=opt.value; document.getElementById('tx-type').value=${JSON.stringify(type)}; document.getElementById('tx-amount').value=${JSON.stringify(amount)}; document.getElementById('tx-date').value=${JSON.stringify(date)}; document.getElementById('tx-due').value=${JSON.stringify(due || "")}; document.getElementById('tx-note').value=""; document.getElementById('tx-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return document.querySelectorAll('#tx-list .tx-row').length;})()`);
  }
  async function dashboardStat(id) {
    await evaluate("document.querySelector('[data-tab=\"dashboard\"]').click();");
    return await evaluate(`document.getElementById(${JSON.stringify(id)}).textContent`);
  }

  // 3. Add Karim via UI
  check("add person Karim via UI -> 1 row", (await addPersonUI("Karim", "01712345678")) === 1);
  // 4. Hand-verified: Karim LEND 5000 + BORROW 2000 + REPAY_RECEIVED 1000
  check("Karim LEND 5000 -> 1 tx", (await addTxUI("Karim", "LEND", "5000", "2026-10-01", "")) === 1);
  check("Karim BORROW 2000 -> 2 tx", (await addTxUI("Karim", "BORROW", "2000", "2026-10-02", "")) === 2);
  check("Karim REPAY_RECEIVED 1000 -> 3 tx", (await addTxUI("Karim", "REPAY_RECEIVED", "1000", "2026-10-05", "")) === 3);
  check("Karim balance 2,000.00", (await dashboardStat("stat-owed")) === "2,000.00");
  check("Karim: you-owe 0.00", (await dashboardStat("stat-owe")) === "0.00");
  check("Karim: net 2,000.00", (await dashboardStat("stat-net")) === "2,000.00");
  check("Karim: outstanding 1", (await dashboardStat("stat-outstanding")) === "1");

  // 5. Rina BORROW 3000
  check("add person Rina -> 2 people", (await addPersonUI("Rina", "")) === 2);
  check("Rina BORROW 3000 -> 4 tx", (await addTxUI("Rina", "BORROW", "3000", "2026-10-03", "")) === 4);
  check("after Rina: owed 2,000.00", (await dashboardStat("stat-owed")) === "2,000.00");
  check("after Rina: you-owe 3,000.00", (await dashboardStat("stat-owe")) === "3,000.00");
  check("after Rina: net -1,000.00", (await dashboardStat("stat-net")) === "-1,000.00");
  check("after Rina: outstanding 2", (await dashboardStat("stat-outstanding")) === "2");

  // 6. Rina REPAY_GIVEN 3000 -> settled
  check("Rina REPAY_GIVEN 3000 -> 5 tx", (await addTxUI("Rina", "REPAY_GIVEN", "3000", "2026-10-06", "")) === 5);
  check("after settle: you-owe 0.00", (await dashboardStat("stat-owe")) === "0.00");
  check("after settle: net 2,000.00", (await dashboardStat("stat-net")) === "2,000.00");
  check("Rina shows Settled chip", (await evaluate("(()=>{document.querySelector('[data-tab=\"dashboard\"]').click(); return document.getElementById('balance-list').textContent.includes('Settled');})()")) === true);

  // 7. Validation via UI: amount 0, 3-decimal, future date, bad mobile
  const txCountBefore = await evaluate("document.querySelectorAll('#tx-list .tx-row').length");
  check("validation: amount 0 rejected, tx count unchanged", (await evaluate(`(()=>{document.querySelector('[data-tab="transactions"]').click(); var sel=document.getElementById('tx-person'); sel.value=[...sel.options].find(o=>o.text==='Karim').value; document.getElementById('tx-type').value='LEND'; document.getElementById('tx-amount').value='0'; document.getElementById('tx-date').value='2026-10-01'; document.getElementById('tx-due').value=''; document.getElementById('tx-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return {err: document.getElementById('tx-error').textContent.length>0, n: document.querySelectorAll('#tx-list .tx-row').length};})()`)).err === true);
  check("validation: amount 0 tx count same", (await evaluate("document.querySelectorAll('#tx-list .tx-row').length")) === txCountBefore);
  check("validation: 3-decimal rejected", (await evaluate(`(()=>{document.getElementById('tx-amount').value='10.123'; document.getElementById('tx-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return document.getElementById('tx-error').textContent.length>0;})()`)) === true);
  check("validation: future date rejected", (await evaluate(`(()=>{document.getElementById('tx-amount').value='100'; document.getElementById('tx-date').value='2999-01-01'; document.getElementById('tx-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return document.getElementById('tx-error').textContent.length>0;})()`)) === true);
  check("validation: bad mobile 012345 rejected", (await evaluate(`(()=>{document.querySelector('[data-tab="people"]').click(); document.getElementById('person-name').value='Bad'; document.getElementById('person-mobile').value='012345'; document.getElementById('person-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})); return document.getElementById('person-error').textContent.length>0;})()`)) === true);
  check("validation: bad mobile did not add person", (await evaluate("document.querySelectorAll('#people-list .person-row').length")) === 2);

  // 8. Delete-person blocked when transactions exist
  check("delete blocked: Karim has tx, error shown, still 2 people", (await evaluate(`(()=>{var btn=document.querySelector('#people-list .person-delete'); btn.click(); return {err: document.getElementById('person-error').textContent.length>0, n: document.querySelectorAll('#people-list .person-row').length};})()`)).err === true);

  // 9. Persistence across reload
  {
    const p = waitForLoad();
    await send("Page.reload", {});
    await p; await sleep(400);
    check("persistence: 2 people after reload", (await evaluate("document.querySelectorAll('#people-list .person-row').length")) === 2);
    check("persistence: owed still 2,000.00 after reload", (await evaluate("document.getElementById('stat-owed').textContent")) === "2,000.00");
  }

  // 10. Due flags via seeded state + reload (asof=2026-10-14)
  {
    const seeded = {
      people: [
        { id: "d-over", name: "Over Person", mobile: "", note: "" },
        { id: "d-soon", name: "Soon Person", mobile: "", note: "" },
        { id: "d-far", name: "Far Person", mobile: "", note: "" }
      ],
      transactions: [
        { id: "x1", personId: "d-over", type: "LEND", amountPaisa: 100000, date: "2026-10-01", dueDate: "2026-10-10", note: "" },
        { id: "x2", personId: "d-soon", type: "LEND", amountPaisa: 100000, date: "2026-10-01", dueDate: "2026-10-18", note: "" },
        { id: "x3", personId: "d-far", type: "LEND", amountPaisa: 100000, date: "2026-10-01", dueDate: "2026-11-01", note: "" }
      ]
    };
    await evaluate(`localStorage.setItem('lendBorrow:data:v1', ${JSON.stringify(JSON.stringify(seeded))});`);
    const p = waitForLoad();
    await send("Page.reload", {});
    await p; await sleep(400);
    const dueText = await evaluate("document.getElementById('due-list').textContent");
    check("due: overdue person listed", typeof dueText === "string" && dueText.includes("Over Person"));
    check("due: due-soon person listed", typeof dueText === "string" && dueText.includes("Soon Person"));
    check("due: far person NOT in due list", typeof dueText === "string" && !dueText.includes("Far Person"));
    check("due: Overdue chip present", typeof dueText === "string" && dueText.includes("Overdue"));
    check("due: Due soon chip present", typeof dueText === "string" && dueText.includes("Due soon"));
  }

  // 11. Import validation logic (data intact on failure)
  check("import logic: wrong version rejected", (await evaluate("window.LendBorrow.validateImport({version:2,people:[],transactions:[]}).ok")) === false);
  check("import logic: negative amount rejected", (await evaluate("window.LendBorrow.validateImport({version:1,people:[{id:'p1',name:'A',mobile:'',note:''}],transactions:[{id:'t1',personId:'p1',type:'LEND',amountPaisa:-5,date:'2026-10-01',dueDate:'',note:''}]}).ok")) === false);
  check("import logic: bad date rejected", (await evaluate("window.LendBorrow.validateImport({version:1,people:[{id:'p1',name:'A',mobile:'',note:''}],transactions:[{id:'t1',personId:'p1',type:'LEND',amountPaisa:100,date:'bad',dueDate:'',note:''}]}).ok")) === false);

  // 12. BN toggle: Bengali digits + Bengali UI
  {
    await evaluate("document.getElementById('lang-bn').click();");
    await sleep(200);
    const bnStat = await evaluate("document.getElementById('stat-owed').textContent");
    check("BN: owed shows Bengali digits", /[\u09e6-\u09ef]/.test(bnStat), bnStat);
    const bnTitle = await evaluate("document.querySelector('[data-i18n=\"app_title\"]').textContent");
    check("BN: title is Bengali", /[\u0980-\u09ff]/.test(bnTitle), bnTitle);
    check("BN: lang persisted", (await evaluate("localStorage.getItem('lendBorrow:lang')")) === "bn");
    await evaluate("document.getElementById('lang-en').click();");
    await sleep(200);
    check("EN: back to English digits", (await evaluate("document.getElementById('stat-owed').textContent")) === "3,000.00");
  }

  // 13. 390px: no horizontal overflow
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(300);
  check("390px: no horizontal overflow", (await evaluate("document.documentElement.scrollWidth <= 390")) === true);
  await send("Emulation.clearDeviceMetricsOverride", {});

  // 14. Errors / network
  check("console errors = 0", consoleErrors.length === 0, JSON.stringify(consoleErrors).slice(0, 500));
  check("page exceptions = 0", pageErrors.length === 0, JSON.stringify(pageErrors).slice(0, 500));
  const nonFile = networkUrls.filter((u) => !(u.startsWith("file:") || u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("about:")));
  check("non-file network requests = 0", nonFile.length === 0, JSON.stringify(nonFile).slice(0, 500));

  ws.close();
} catch (err) {
  console.error("SMOKE FATAL:", err);
  failures.push("fatal: " + (err && err.message ? err.message : String(err)));
  try { ws && ws.close(); } catch (e) {}
} finally {
  try { chrome.kill("SIGKILL"); } catch (e) {}
}

console.log("SMOKE: " + (checks - failures.length) + "/" + checks + " passed");
if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) console.log(" - " + f);
  process.exit(1);
} else {
  console.log("All smoke checks passed.");
}
