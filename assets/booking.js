/* 星河裂變 報名頁／感謝頁｜共用設定 */

// ▼▼▼ 工程師部署時設定 ▼▼▼
// Google Apps Script 部署後的「網頁應用程式網址」（設定步驟見 booking/README.md）
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwEBqirvqLTc21Fq__o5WqjYMIP_HCtmof4esFQVNDiFA1CGBSt5uxP5GNN8q7hEwvi/exec";
// ▲▲▲ 工程師部署時設定 ▲▲▲

// 「洽詢預購」承諾多久內聯絡（報名頁、感謝頁都會用到）
const CONTACT_WITHIN = "1 個工作天";

// 說明會場次平常在 Google 試算表的「場次」分頁管理，網站會自動讀取。
// 下面只是備用清單：試算表讀不到（或還沒設定 FORM_ENDPOINT）時才會用到。
const FALLBACK_SESSIONS = [
  { date: "2026-10-20", start: "08:00", end: "09:30" },
  { date: "2026-10-27", start: "08:00", end: "09:30" },
  { date: "2026-11-03", start: "08:00", end: "09:30" },
  { date: "2026-11-10", start: "08:00", end: "09:30" },
];

const WEEK = "日一二三四五六";
const LANDING = {
  a: "../stop-waiting-on-you/",
  b: "../your-workday-back/",
  c: "../flow-without-you/",
};
const LANDING_NAME = {
  a: "A｜我以為自己是老闆",
  b: "B｜你有多久沒在上班時間做自己的工作",
  c: "C｜你缺的不是人手而是不用經過你的流程",
};
const PICKED_KEY = "booking-picked";
const params = new URLSearchParams(location.search);
const from = LANDING[params.get("from")] ? params.get("from") : "";
const intent = params.get("intent") === "preorder" ? "preorder" : "demo";
const preorder = intent === "preorder";

// 「洽詢預購」要替換的文字（「預約演示」維持 HTML 原文）
const PREORDER_COPY = {
  form: {
    docTitle: "星河裂變｜洽詢預購方案",
    eyebrow: "洽詢預購方案",
    title: `留下資料，我們 ${CONTACT_WITHIN}內聯絡你`,
    lead: "我們會用你留下的手機或 LINE，說明方案內容、預購優惠和付款方式",
    sessionLegend: "<span>03</span>也想順便參加線上說明會嗎？<em>選填，可複選</em>",
    consent: "我同意星河裂變蒐集以上資料，用於方案說明、說明會通知與後續聯繫<i>*</i>",
    submit: "送出洽詢",
  },
  thanks: {
    docTitle: "星河裂變｜已收到你的洽詢",
    eyebrow: "已收到你的洽詢",
    title: `謝謝你，我們 ${CONTACT_WITHIN}內聯絡你`,
    pickedLabel: "你也報名了這些場次",
    lead: "我們會用手機或 LINE 聯絡你；有報名說明會的話，會議連結會另外寄到你的 Email",
  },
};
const applyCopy = (copy) => {
  if (!preorder) return;
  document.title = copy.docTitle;
  document.querySelectorAll("[data-copy]").forEach((el) => {
    if (copy[el.dataset.copy]) el.innerHTML = copy[el.dataset.copy];
  });
};

const sessionId = (s) => `${s.date.replace(/-/g, "")}-${s.start.replace(":", "")}`;
const dayLabel = (s) => {
  const d = new Date(`${s.date}T00:00:00+08:00`);
  return `${d.getMonth() + 1}/${d.getDate()}（${WEEK[d.getDay()]}）`;
};
const sessionLabel = (s) => `${dayLabel(s)} ${s.start}–${s.end}`;
const ended = (s) => new Date(`${s.date}T${s.end}:00+08:00`).getTime() < Date.now();
const valid = (s) => s && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && /^\d{2}:\d{2}$/.test(s.start) && /^\d{2}:\d{2}$/.test(s.end);

// 讀取場次：先問試算表，失敗就用備用清單
async function loadSessions() {
  let list = FALLBACK_SESSIONS;
  if (FORM_ENDPOINT) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${FORM_ENDPOINT}?action=sessions`, { cache: "no-store", signal: ctrl.signal });
      const json = await res.json();
      if (!Array.isArray(json.sessions)) throw new Error("格式不符");
      list = json.sessions;
    } catch (err) {
      console.warn("[booking] 讀不到試算表場次，改用備用清單", err);
    } finally {
      clearTimeout(timer);
    }
  }
  return list
    .filter((s) => valid(s) && !ended(s))
    .map((s) => ({ ...s, id: sessionId(s) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

// 「回到介紹」連回原本那一版
document.querySelectorAll("[data-back]").forEach((a) => {
  a.href = LANDING[from] || LANDING.a;
});

/* ---------- 報名頁 ---------- */
const form = document.querySelector("#booking-form");
if (form) {
  applyCopy(PREORDER_COPY.form);
  form.elements.intent.value = intent;
  form.elements.from.value = from;

  const box = form.querySelector("[data-sessions]");
  const status = form.querySelector("[data-status]");
  const submit = form.querySelector("button[type=submit]");
  const sessionGroup = form.querySelector("[data-session-group]");
  const submitLabel = submit.textContent;
  let open = [];

  // 場次選項（載入完成前先鎖住送出鈕）
  submit.disabled = true;
  loadSessions().then((list) => {
    open = list;
    if (open.length) {
      box.innerHTML = open.map((s) => `
        <label class="session">
          <input type="checkbox" name="sessions" value="${s.id}">
          <span><b>${dayLabel(s)}</b>${s.start}–${s.end}<small>線上</small></span>
        </label>`).join("");
    } else if (preorder) {
      sessionGroup.hidden = true; // 洽詢預購場次是選填，沒有場次就整段不顯示
    } else {
      box.innerHTML = `<p class="field-note">目前沒有開放中的場次，請先送出資料，有新場次時會通知你</p>`;
    }
    submit.disabled = false;
  });

  form.addEventListener("change", (e) => {
    if (e.target.name === "sessions") sessionGroup.classList.remove("invalid");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    const ids = [...form.querySelectorAll("input[name=sessions]:checked")].map((i) => i.value);
    const picked = open.filter((s) => ids.includes(s.id));
    if (!preorder && open.length && !picked.length) {
      sessionGroup.classList.add("invalid");
      sessionGroup.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!form.reportValidity()) return;
    if (form.elements.website.value) return; // 機器人陷阱欄位

    // 送到試算表的欄位：表頭即欄位名稱，新欄位會自動新增
    const fd = new FormData(form);
    const data = new URLSearchParams();
    data.append("送出時間", new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }));
    data.append("報名意向", intent === "preorder" ? "洽詢預購" : "預約演示");
    data.append("來源版本", LANDING_NAME[from] || "直接進入報名頁");
    ["姓名", "公司／品牌名稱", "職稱", "Email", "手機", "LINE ID", "經營型態", "管理品牌數", "從哪裡知道我們", "想先問的問題"]
      .forEach((k) => data.append(k, (fd.get(k) || "").trim()));
    data.append("最想解決的問題", fd.getAll("最想解決的問題").join("、"));
    data.append("報名場次", picked.map(sessionLabel).join("、"));
    open.forEach((s) => data.append(`場次 ${dayLabel(s)}`, picked.includes(s) ? "✓" : ""));
    data.append("個資同意", "同意");
    // 追蹤資訊（放在最後幾欄）
    data.append("點擊位置", params.get("pos") || "");
    data.append("廣告來源 utm_source", params.get("utm_source") || "");
    data.append("廣告媒介 utm_medium", params.get("utm_medium") || "");
    data.append("廣告活動 utm_campaign", params.get("utm_campaign") || "");
    data.append("廣告素材 utm_content", params.get("utm_content") || "");
    data.append("從哪個網站連過來", params.get("ref") || "");

    // 感謝頁要顯示的場次
    try { sessionStorage.setItem(PICKED_KEY, JSON.stringify(picked)); } catch (err) { /* 無痕模式可能不能存，略過 */ }
    const thanks = `thanks.html?from=${from}&intent=${intent}`;
    const local = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);

    if (!FORM_ENDPOINT) {
      if (local) {
        console.warn("[booking] FORM_ENDPOINT 尚未設定，本機預覽直接進入感謝頁", Object.fromEntries(data));
        location.href = thanks;
      } else {
        status.textContent = "報名系統設定中，請稍後再試或直接聯繫我們";
      }
      return;
    }

    submit.disabled = true;
    submit.textContent = "送出中…";
    try {
      // Apps Script 的 POST 不回傳 CORS 標頭，用 no-cors 送出（拿不到回應內容，但資料會寫入）
      await fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", body: data });
      location.href = thanks;
    } catch (err) {
      submit.disabled = false;
      submit.textContent = submitLabel;
      status.textContent = "送出失敗，請檢查網路後再試一次";
    }
  });
}

/* ---------- 感謝頁 ---------- */
const list = document.querySelector("[data-picked]");
if (list) {
  applyCopy(PREORDER_COPY.thanks);
  let picked = [];
  try { picked = JSON.parse(sessionStorage.getItem(PICKED_KEY) || "[]").filter(valid); } catch (err) { /* 略過 */ }
  if (picked.length) {
    list.innerHTML = picked.map((s) => `<li><b>${dayLabel(s)}</b>${s.start}–${s.end}<small>線上</small></li>`).join("");
  } else {
    list.closest("[data-picked-wrap]").hidden = true;
  }
}
