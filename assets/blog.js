/* 星河裂變 部落格｜分類篩選、文章目錄 */

// 列表頁：分類篩選
document.querySelectorAll(".filters button.chip").forEach((btn) => btn.addEventListener("click", () => {
  document.querySelectorAll(".filters button.chip").forEach((b) => b.classList.toggle("on", b === btn));
  const cat = btn.dataset.cat;
  document.querySelectorAll(".list [data-cat]").forEach((el) => {
    el.style.display = cat === "all" || el.dataset.cat === cat ? "" : "none";
  });
}));

// 文章頁：用 H2 自動產生側欄目錄（少於 3 個小標題就不顯示），捲動時標示目前段落
const toc = document.querySelector(".toc");
const heads = [...document.querySelectorAll(".post-body h2[id]")];
if (toc && heads.length >= 3) {
  const ol = toc.querySelector("ol");
  heads.forEach((h) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.appendChild(a);
    ol.appendChild(li);
  });
  toc.hidden = false;
  const links = [...ol.querySelectorAll("a")];
  const spy = () => {
    let i = 0;
    heads.forEach((h, k) => { if (h.getBoundingClientRect().top < 140) i = k; });
    links.forEach((a, k) => a.classList.toggle("on", k === i));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();
} else if (toc) {
  toc.remove();
  document.querySelector(".post-layout")?.classList.add("no-toc");
}
