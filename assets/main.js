/* 星河裂變 銷售頁｜共用設定（a / b / c 三版共用） */

// ▼▼▼ 之後只要改這兩行 ▼▼▼
// 預約演示連結（預設為站內報名頁；場次與接收網址在 assets/booking.js 設定）
const BOOKING_URL = "booking/index.html";
// 預購優惠截止時間（台灣時間，格式不要動，只改數字）
const DEADLINE = "2026-10-31T23:59:59+08:00";
// ▲▲▲ 之後只要改這兩行 ▲▲▲

// 所有預約按鈕套用同一個連結，並帶上追蹤資訊：
// from＝哪一版 Landing Page、intent＝預約演示／洽詢預購、pos＝按了頁面上哪顆按鈕、
// utm_*＝廣告連結上的參數、ref＝訪客從哪個網站連到 Landing Page
const variant = document.body.dataset.variant || "";
const POSITIONS = [
  [".nav", "導覽列"], [".hero", "首屏"], [".path", "方案區"], [".final", "頁尾"], [".sticky-cta", "手機浮動按鈕"],
];
const pageParams = new URLSearchParams(location.search);
let ref = "";
try { if (document.referrer) ref = new URL(document.referrer).hostname; } catch (err) { /* 略過 */ }
document.querySelectorAll("[data-booking]").forEach((a) => {
  const intent = a.dataset.booking === "preorder" ? "preorder" : "demo";
  const pos = (POSITIONS.find(([sel]) => a.closest(sel)) || [, "其他"])[1];
  const q = new URLSearchParams({ from: variant, intent, pos });
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((k) => {
    if (pageParams.get(k)) q.set(k, pageParams.get(k));
  });
  if (ref && ref !== location.hostname) q.set("ref", ref);
  a.href = `${BOOKING_URL}?${q}`;
  if (/^https?:/.test(BOOKING_URL)) {
    a.target = "_blank";
    a.rel = "noopener";
  }
});

// 倒數計時
const end = new Date(DEADLINE).getTime();
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    el.querySelector("[data-d]").textContent = pad(d);
    el.querySelector("[data-h]").textContent = pad(h);
    el.querySelector("[data-m]").textContent = pad(m);
    el.querySelector("[data-s]").textContent = pad(s);
  });
  document.querySelectorAll("[data-countdown-inline]").forEach((el) => {
    el.textContent = `${d} 天 ${pad(h)}:${pad(m)}:${pad(s)}`;
  });
}
tick();
setInterval(tick, 1000);

// 截止日期文字
const dl = new Date(DEADLINE);
document.querySelectorAll("[data-deadline]").forEach((el) => {
  el.textContent = `${dl.getMonth() + 1}/${dl.getDate()} ${pad(dl.getHours())}:${pad(dl.getMinutes())}`;
});

// 捲動進場動畫
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
