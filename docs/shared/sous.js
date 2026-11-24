/* =========================================================
   СОУС · общий скрипт прототипов
   Подключение на странице:
     <script src="../shared/pages.js"></script>
     <script src="../shared/sous.js"></script>
     <script> ...данные и виды страницы...; const PAGE = {...}; start(); </script>

   Страница описывает объект PAGE:
     section       путь раздела из pages.js, например "/vacancies" (подсветка в меню)
     currentPath() путь текущего экрана для панели страниц, например "/vacancies/:id"
     render()      рисует содержимое #app
     actions       { "имя-действия": (el, e, id) => {} } для кнопок с data-act
     onDD(key, v, el)    выбор в кастомном списке; вернуть true, если обработано
     onRoute()           вызывается при смене #адреса перед перерисовкой
     authText(kind, id)  [заголовок, подзаголовок] окна входа для действия
     loginRole(pending)  роль после входа ("worker", "employer"...)
     afterLogin(pending) продолжить действие после входа
     roleHints           { роль: "подпись в панели ролей" }
   ========================================================= */

/* Экраны, которые ещё не готовы: клик показывает подсказку, а не уводит на другой сайт */
const STAND = "#!";

const ROLES = {
  guest:    { label: "Гость",        name: "",                  initials: "" },
  worker:   { label: "Специалист",   name: "Михаил Соколов",    initials: "МС" },
  employer: { label: "Работодатель", name: "Shine&Go",          initials: "SG" },
  client:   { label: "Автовладелец", name: "Иван Михайлов",     initials: "ИМ" },
  supplier: { label: "Поставщик",    name: "Koch Chemie",       initials: "KC" },
  partner:  { label: "Партнёр",      name: "Детейлинг Партнёр", initials: "ДП" },
};

/* Шапка: 5 групп по задачам. Пункт ведёт на готовый экран, если он отмечен в pages.js */
const NAV = [
  ["Работа", [
    ["/vacancies", "Вакансии и резюме", "Постоянная работа и сотрудники"],
    ["/gigs", "Подработки", "Разовые смены и срочные подмены"],
    ["/companies", "Компании", "Мойки, студии и автосервисы"],
  ]],
  ["Автоуслуги", [
    ["/orders", "Заявки автовладельцев", "Клиенты ищут исполнителя"],
    ["/promos", "Кешбэк и акции", "Скидки у партнёров"],
    ["/sous-map", "Карта СОУС", "Компании и услуги на карте"],
  ]],
  ["Закупки", [
    ["/suppliers", "Поставщики", "Автохимия, оборудование, расходники"],
    ["/supply-requests", "Заявки на закупку", "Поставщики предлагают цену"],
    ["/calculator", "Калькулятор расхода", "Сколько химии нужно"],
  ]],
  ["Обучение", [
    ["/training", "Учебный центр", "Курсы и сертификаты"],
    ["/events", "Мероприятия", "Форумы и встречи индустрии"],
  ]],
  ["Сообщество", [
    ["/feed", "Лента и автоновости", "Новости и опыт коллег"],
    ["/chats", "Чаты", "Обсуждения по специализациям"],
  ]],
];

const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Екатеринбург"];

/* ---------- Состояние (страница дополняет его через Object.assign) ---------- */
function read(k, d) { try { return localStorage.getItem(k) || d; } catch { return d; } }
function write(k, v) { try { localStorage.setItem(k, v); } catch {} }
const state = {
  role: read("sous-role", "guest"),
  theme: read("sous-theme", "dark"),
  protoOpen: false,
  pagesOpen: false,
  pendingAction: null,
};

/* ---------- Утилиты ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ");
const salary = (a, b) => b ? `${fmt(a)}–${fmt(b)} ₽` : `от ${fmt(a)} ₽`;
const ago = (d) => d === 0 ? "Сегодня" : d === 1 ? "Вчера" : d < 5 ? `${d} дня назад` : d < 7 ? `${d} дней назад` : d < 14 ? "Неделю назад" : "Две недели назад";
const initials = (s) => s.replace(/[«»"]/g, "").split(/[\s&]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  return `${n} ${m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many}`;
}
function route() { return location.hash.replace(/^#!?/, "") || "/"; }

/* ---------- Иконки (одна линия, 16px, обводка 1.75) ---------- */
const ICONS = {
  search: '<circle cx="7.5" cy="7.5" r="5"/><path d="m11.5 11.5 3 3"/>',
  pin: '<path d="M8 14.5s5-4.3 5-8.2A5 5 0 0 0 3 6.3c0 3.9 5 8.2 5 8.2Z"/><circle cx="8" cy="6.3" r="1.8"/>',
  clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2 1.5"/>',
  briefcase: '<rect x="2" y="5" width="12" height="9" rx="1.5"/><path d="M5.5 5V3.5A1 1 0 0 1 6.5 2.5h3a1 1 0 0 1 1 1V5M2 9h12"/>',
  heart: '<path d="M8 13.5S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 7.5-6 7.5Z"/>',
  shield: '<path d="M8 1.8 13 3.6v4c0 3.2-2.2 5.6-5 6.6-2.8-1-5-3.4-5-6.6v-4Z"/><path d="m5.8 8 1.6 1.6 2.9-3"/>',
  down: '<path d="m4 6 4 4 4-4"/>',
  back: '<path d="M10 3.5 5.5 8l4.5 4.5"/>',
  right: '<path d="M6 3.5 10.5 8 6 12.5"/>',
  x: '<path d="m4 4 8 8M12 4l-8 8"/>',
  sliders: '<path d="M2.5 4.5h7M12.5 4.5h1M2.5 11.5h1M6.5 11.5h7"/><circle cx="11" cy="4.5" r="1.5"/><circle cx="5" cy="11.5" r="1.5"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  sun: '<circle cx="8" cy="8" r="2.8"/><path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9"/>',
  moon: '<path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"/>',
  bell: '<path d="M4 6.5a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S4 10.5 4 6.5ZM6.5 13.5a1.6 1.6 0 0 0 3 0"/>',
  message: '<path d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v6a1.5 1.5 0 0 1-1.5 1.5H6.5L3.5 14v-2.5H4A1.5 1.5 0 0 1 2.5 10Z"/>',
  menu: '<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>',
  check: '<path d="m3.5 8.5 3 3 6-7"/>',
  dot: '<circle cx="8" cy="8" r="1.5"/>',
  info: '<circle cx="8" cy="8" r="6"/><path d="M8 7.2v3.6M8 5.2v.1"/>',
  flag: '<path d="M3.5 14V2.5M3.5 3h8l-1.5 3 1.5 3h-8"/>',
  send: '<path d="m2.5 8 11-5.5-3.5 11-2-4.5Z"/><path d="m8 9 2.2-2.2"/>',
  users: '<circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5a4.5 4.5 0 0 1 9 0M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12 9.5a4.5 4.5 0 0 1 2.5 4"/>',
  edit: '<path d="M10.5 2.5 13.5 5.5 6 13H3v-3Z"/>',
  pages: '<path d="M5.5 2.5h6a1 1 0 0 1 1 1v8"/><rect x="3.5" y="4.5" width="7" height="9" rx="1"/><path d="M5.5 7.5h3M5.5 10h3"/>',
};
const icon = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* ---------- Ссылки на экраны ---------- */
/* ссылка на экран в этой же папке превращается в якорь, чтобы не перезагружать страницу */
function localHref(href) {
  const m = href.match(/^\.\.\/([^/]+)\/(#.*)$/);
  const folder = location.pathname.split("/").slice(-2, -1)[0];
  return m && m[1] === folder ? m[2] : href;
}
/* адрес пункта меню: готовый экран из pages.js или подсказка «ещё в работе» */
function pageHref(path) {
  const p = window.SOUS_FIND_PAGE(path);
  return p && p.href && p.status === "done" ? localHref(p.href) : STAND + path;
}
function soon(path) {
  const page = window.SOUS_FIND_PAGE(path);
  const name = page ? page.title : "Этот экран";
  toast(`«${name}» ещё в работе`, "Экран появится в прототипе после согласования. Список всех страниц открывается круглой кнопкой внизу", "info");
}

/* ---------- Кастомный выпадающий список ---------- */
const DD = {};
function dd({ key, name = key, value, options, variant = "", iconName = "", label = "" }) {
  const opts = options.map((o) => Array.isArray(o) ? o : [o, o]);
  DD[key] = opts;
  const cur = opts.find(([v]) => v === value) || opts[0];
  return `<div class="dd ${variant}" data-dd="${key}" data-value="${esc(cur[0])}">
    <input type="hidden" name="${name}" value="${esc(cur[0])}">
    <button type="button" class="dd-btn" data-act="dd" aria-haspopup="listbox" aria-expanded="false"${label ? ` aria-label="${label}"` : ""}>${iconName ? icon(iconName, "lg") : ""}<span class="dd-val">${esc(cur[1])}</span>${icon("down", "chev")}</button>
  </div>`;
}
let ddOpen = null;
function openDD(el) {
  closeDD();
  const btn = $(".dd-btn", el), opts = DD[el.dataset.dd];
  const pop = document.createElement("div");
  pop.className = "dd-pop"; pop.setAttribute("role", "listbox");
  pop.innerHTML = opts.map(([v, l]) => `<button type="button" class="dd-opt" role="option" data-act="dd-opt" data-v="${esc(v)}" aria-selected="${v === el.dataset.value}">${esc(l)}${icon("check")}</button>`).join("");
  document.body.appendChild(pop);
  el.classList.add("open"); btn.setAttribute("aria-expanded", "true");
  ddOpen = { el, pop };
  placeDD();
  ($(".dd-opt[aria-selected=true]", pop) || $(".dd-opt", pop)).classList.add("active");
}
function placeDD() {
  if (!ddOpen) return;
  const { el, pop } = ddOpen, r = $(".dd-btn", el).getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return closeDD();
  const w = Math.max(r.width, 200), below = window.innerHeight - r.bottom;
  pop.style.minWidth = w + "px";
  pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
  const up = below < Math.min(pop.offsetHeight + 12, 240) && r.top > below;
  pop.style.top = up ? "" : (r.bottom + 6) + "px";
  pop.style.bottom = up ? (window.innerHeight - r.top + 6) + "px" : "";
}
function closeDD() {
  if (!ddOpen) return;
  ddOpen.pop.remove(); ddOpen.el.classList.remove("open");
  $(".dd-btn", ddOpen.el)?.setAttribute("aria-expanded", "false");
  ddOpen = null;
}
function setDD(el, v) {
  const opt = DD[el.dataset.dd]?.find(([x]) => x === v);
  if (!opt) return;
  el.dataset.value = v; $("input", el).value = v; $(".dd-val", el).textContent = opt[1];
}
function pickDD(v) {
  const { el } = ddOpen; const key = el.dataset.dd;
  closeDD(); $(".dd-btn", el).focus();
  if (!PAGE.onDD?.(key, v, el)) setDD(el, v);
}
window.addEventListener("resize", closeDD);
document.addEventListener("scroll", (e) => { if (ddOpen && !ddOpen.pop.contains(e.target)) placeDD(); }, true);

/* ---------- Шапка, мобильное меню, футер ---------- */
function navCurrent() { return NAV.findIndex(([, items]) => items.some(([path]) => path === PAGE.section)); }
function renderHeader() {
  const r = state.role, user = ROLES[r], cur = navCurrent();
  const right = r === "guest"
    ? `<a class="link hide-m" href="#" data-act="login">Войти</a><button class="btn sm hide-m" data-act="register">Регистрация</button>`
    : `<a class="btn ghost icon-only hide-m" href="${pageHref("/messages")}" aria-label="Сообщения">${icon("message", "lg")}</a>
       <a class="btn ghost icon-only hide-m" href="${pageHref("/notifications")}" aria-label="Уведомления">${icon("bell", "lg")}</a>
       <a class="avatar" href="${pageHref("/dashboard")}" title="Кабинет: ${esc(user.name)}">${user.initials}</a>`;
  $("#top").innerHTML = `<div class="top-in">
    <a class="logo" href="${pageHref("/")}"><img src="../assets/logo.png" alt=""><span>СОУС</span></a>
    <nav class="nav" aria-label="Разделы">${NAV.map(([title, items], i) => `
      <div class="nav-item" data-nav="${i}">
        <button class="nav-btn ${i === cur ? "current" : ""}" aria-expanded="false" data-act="nav" data-i="${i}">${title}${icon("down")}</button>
        <div class="menu" role="menu">${items.map(([path, label, sub]) => `<a role="menuitem" class="${path === PAGE.section ? "here" : ""}" href="${pageHref(path)}"><b>${label}</b><span>${sub}</span></a>`).join("")}</div>
      </div>`).join("")}
    </nav>
    <div class="top-actions">
      <button class="btn ghost icon-only" data-act="theme" aria-label="${state.theme === "dark" ? "Светлая тема" : "Тёмная тема"}">${icon(state.theme === "dark" ? "sun" : "moon", "lg")}</button>
      ${right}
      <button class="btn icon-only burger" data-act="burger" aria-label="Меню">${icon("menu", "lg")}</button>
    </div>
  </div>`;
}
function closeNav() { $$(".nav-item.open").forEach((n) => { n.classList.remove("open"); $("button", n).setAttribute("aria-expanded", "false"); }); }
function mobileMenu() {
  const wrap = document.createElement("div");
  wrap.className = "drawer-wrap";
  wrap.dataset.act = "close-drawer";
  const r = state.role;
  wrap.innerHTML = `<aside class="drawer" role="dialog" aria-modal="true" aria-label="Меню">
    <div class="drawer-head"><a class="logo" href="${pageHref("/")}"><img src="../assets/logo.png" alt=""><span>СОУС</span></a><button class="btn icon-only" data-act="close-drawer" aria-label="Закрыть">${icon("x", "lg")}</button></div>
    <div class="drawer-body">
      ${r === "guest" ? `<div class="grid2"><button class="btn" data-act="login">Войти</button><button class="btn primary" data-act="register">Регистрация</button></div>`
        : `<div class="grid2"><a class="btn" href="${pageHref("/messages")}">${icon("message")}Сообщения</a><a class="btn" href="${pageHref("/dashboard")}">Кабинет</a></div>`}
      ${NAV.map(([t, items]) => `<div class="m-group"><b>${t}</b>${items.map(([path, l]) => `<a href="${pageHref(path)}" class="${path === PAGE.section ? "here" : ""}">${l}${icon("right")}</a>`).join("")}</div>`).join("")}
    </div></aside>`;
  document.body.appendChild(wrap);
  document.body.classList.add("lock");
}
function closeDrawer() { $(".drawer-wrap")?.remove(); document.body.classList.remove("lock"); }
function renderFooter() {
  const f = $("#footer");
  if (f) f.innerHTML = `<div class="wrap"><a class="logo" href="${pageHref("/")}"><img src="../assets/logo.png" alt=""><span>СОУС</span></a><span>Работа, автоуслуги, закупки и обучение для индустрии автоуслуг</span><nav><a href="${pageHref("/contacts")}">Контакты</a><a href="${pageHref("/terms")}">Оферта</a><a href="${pageHref("/privacy")}">Приватность</a></nav></div>`;
}

/* ---------- Окна, вход, уведомления ---------- */
function openModal(html) {
  $("#modal-root").innerHTML = `<div class="backdrop" data-act="close-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.body.classList.add("lock");
  setTimeout(() => ($("#modal-root [autofocus]") || $("#modal-root .modal button, #modal-root .modal input"))?.focus(), 30);
}
function closeModal() { closeDD(); $("#modal-root").innerHTML = ""; document.body.classList.remove("lock"); }
const mHead = (title, sub = "") => `<div class="m-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div><button class="btn sm ghost icon-only" data-act="close" aria-label="Закрыть">${icon("x", "lg")}</button></div>`;

/* Вход в момент действия: смотреть можно без регистрации, вход нужен для действия */
function authModal(kind, id) {
  const base = {
    login: ["Вход", "По номеру телефона, без пароля"],
    register: ["Регистрация", "Вход по номеру телефона, роль выберете на следующем шаге"],
  };
  const text = PAGE.authText?.(kind, id) || base[kind] || base.login;
  state.pendingAction = { kind, id };
  openModal(`${mHead(text[0], text[1])}
    <div class="m-body"><p class="hint">${icon("info")}Смотреть разделы можно без регистрации. Вход нужен для отклика, сообщения и публикации</p></div>
    <div class="m-foot"><button class="btn" data-act="auth-register">Регистрация</button><button class="btn primary" data-act="auth-login" autofocus>Войти по телефону</button></div>`);
}
function needAuth(kind, id) { if (state.role === "guest") { authModal(kind, id); return true; } return false; }

function toast(title, text = "", kind = "ok") {
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.innerHTML = `${icon(kind === "info" ? "info" : "check")}<div><b>${title}</b>${text ? `<span>${text}</span>` : ""}</div>`;
  $("#toast-root").appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

/* ---------- Панель прототипа: роли и страницы (в продукт не входит) ---------- */
function pagesPanel() {
  const all = window.SOUS_PAGES.flatMap((g) => g.pages);
  const done = all.filter((p) => p.status === "done").length, wip = all.filter((p) => p.status === "wip").length;
  const cur = PAGE.currentPath?.() || PAGE.section;
  const label = { done: "Готово", wip: "В работе" };
  return `<section class="pages-panel" role="dialog" aria-label="Страницы прототипа">
    <div class="pp-head"><h3>Страницы</h3><p class="num">Готово ${done} из ${all.length} · в работе ${wip}</p>
      <div class="pp-bar" aria-hidden="true"><i style="width:${done / all.length * 100}%"></i><i class="wip" style="width:${wip / all.length * 100}%"></i></div>
      <div class="pp-legend"><span><i class="st done"></i>Готово</span><span><i class="st wip"></i>В работе</span><span><i class="st todo"></i>Не начато</span><span><i class="st here"></i>Вы здесь</span></div>
    </div>
    <div class="pp-list">${window.SOUS_PAGES.map((g) => `<div class="pp-group"><b>${g.title}<span class="num">${g.pages.filter((p) => p.status === "done").length}/${g.pages.length}</span></b>
      ${g.pages.map((p) => {
        const here = p.path === cur, st = p.status || "todo";
        const inner = `<i class="st ${st}"></i><span class="pp-t">${p.title}<small>${p.note ? p.note : p.path}</small></span><span class="pp-s">${here ? "Вы здесь" : label[st] || ""}</span>`;
        return p.href && st !== "todo"
          ? `<a class="pp-row ${here ? "here" : ""}" href="${localHref(p.href)}" data-act="page-go">${inner}</a>`
          : `<div class="pp-row muted">${inner}</div>`;
      }).join("")}</div>`).join("")}</div>
  </section>`;
}
function renderProto() {
  const hints = PAGE.roleHints || {};
  $("#proto-root").innerHTML = `<div class="proto">
    ${state.protoOpen ? `<section class="proto-panel"><h3>Роль пользователя</h3><p>Служебная панель прототипа. Показывает, как страница меняется для каждой роли</p>
      <div class="roles">${Object.entries(ROLES).map(([id, r]) => `<button data-act="role" data-role="${id}" aria-pressed="${state.role === id}">${r.label}<span>${hints[id] || ""}</span></button>`).join("")}</div></section>` : ""}
    ${state.pagesOpen ? pagesPanel() : ""}
    <button class="proto-pages" data-act="pages" aria-label="Все страницы прототипа" aria-expanded="${state.pagesOpen}">${icon("pages", "lg")}</button>
    <button class="proto-btn" data-act="proto" aria-expanded="${state.protoOpen}">Прототип · ${ROLES[state.role].label}${icon("down")}</button>
  </div>`;
  const list = $(".pp-list"), here = $(".pp-row.here");
  if (list && here) list.scrollTop = here.offsetTop - list.offsetTop - list.clientHeight / 2 + here.offsetHeight / 2;
}

/* ---------- Рендер ---------- */
function render() { renderHeader(); renderProto(); PAGE.render(); }
function setRole(role) { state.role = role; write("sous-role", role); render(); }

/* ---------- События ---------- */
document.addEventListener("keydown", (e) => {
  if (ddOpen) {
    const opts = $$(".dd-opt", ddOpen.pop), i = opts.findIndex((o) => o.classList.contains("active"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = opts[(i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length];
      opts.forEach((o) => o.classList.remove("active")); n.classList.add("active"); n.scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); pickDD(opts[i].dataset.v); return; }
    if (e.key === "Escape" || e.key === "Tab") { const b = $(".dd-btn", ddOpen.el); closeDD(); if (e.key === "Escape") { b.focus(); return; } }
  } else if (e.key === "ArrowDown" && e.target.classList?.contains("dd-btn")) { e.preventDefault(); openDD(e.target.closest(".dd")); return; }
  if (e.key === "Escape") { closeModal(); closeDrawer(); closeNav(); }
});

const SHARED_ACTIONS = {
  dd: (el) => { const box = el.closest(".dd"); ddOpen?.el === box ? closeDD() : openDD(box); },
  "dd-opt": (el) => pickDD(el.dataset.v),
  nav: (el) => { const item = el.closest(".nav-item"); const open = !item.classList.contains("open"); closeNav(); if (open) { item.classList.add("open"); el.setAttribute("aria-expanded", "true"); } },
  theme: () => { state.theme = state.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = state.theme; write("sous-theme", state.theme); renderHeader(); },
  burger: mobileMenu,
  "close-drawer": closeDrawer,
  login: (el, e) => { e.preventDefault(); closeDrawer(); authModal("login"); },
  register: () => { closeDrawer(); authModal("register"); },
  "auth-login": () => {
    const p = state.pendingAction || {};
    const role = PAGE.loginRole?.(p) || "worker";
    closeModal(); setRole(role);
    toast("Вы вошли", `${ROLES[role].name}, ${ROLES[role].label.toLowerCase()}`);
    PAGE.afterLogin?.(p);
    state.pendingAction = null;
  },
  "auth-register": () => { closeModal(); soon("/register"); },
  close: closeModal,
  "close-bg": closeModal,
  proto: () => { state.protoOpen = !state.protoOpen; state.pagesOpen = false; renderProto(); },
  pages: () => { state.pagesOpen = !state.pagesOpen; state.protoOpen = false; renderProto(); },
  "page-go": () => { state.pagesOpen = false; renderProto(); },
  role: (el) => { state.protoOpen = false; setRole(el.dataset.role); },
};

document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#!"]');
  if (link) { e.preventDefault(); closeDrawer(); closeNav(); soon(link.getAttribute("href").slice(2)); return; }
  const el = e.target.closest("[data-act]");
  if (!e.target.closest(".nav-item")) closeNav();
  if (ddOpen && !e.target.closest(".dd-pop") && !ddOpen.el.contains(e.target)) closeDD();
  if (!e.target.closest(".proto") && (state.protoOpen || state.pagesOpen)) { state.protoOpen = false; state.pagesOpen = false; renderProto(); }
  if (!el) return;
  if ((el.classList.contains("backdrop") || el.classList.contains("drawer-wrap")) && e.target !== el) return;
  const act = el.dataset.act, fn = PAGE.actions?.[act] || SHARED_ACTIONS[act];
  fn?.(el, e, el.dataset.id);
});

window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#!")) return;
  PAGE.onRoute?.();
  closeModal(); render(); window.scrollTo(0, 0);
});

/* ---------- Запуск: вызвать в конце скрипта страницы ---------- */
function start() {
  document.documentElement.dataset.theme = state.theme;
  renderFooter();
  PAGE.onRoute?.();
  render();
}
