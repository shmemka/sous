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
    ["/vacancies", "Вакансии", "Постоянная работа в студиях"],
    ["/specialists", "Специалисты", "Резюме и мастера на подработку"],
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

/* ---------- Иконки: Lucide (lucide.dev, ISC), сетка 24, обводка 2.6 (1.75 px при 16 px) ---------- */
const ICONS = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>', // search
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', // map-pin
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', // clock
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>', // briefcase
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>', // heart
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>', // shield-check
  down: '<path d="m6 9 6 6 6-6"/>', // chevron-down
  back: '<path d="m15 18-6-6 6-6"/>', // chevron-left
  right: '<path d="m9 18 6-6-6-6"/>', // chevron-right
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', // x
  sliders: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>', // sliders-horizontal
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', // plus
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', // sun
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>', // moon
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>', // bell
  message: '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>', // message-square
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>', // menu
  check: '<path d="M20 6 9 17l-5-5"/>', // check
  dot: '<circle cx="12" cy="12" r="1"/>', // dot
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', // info
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>', // flag
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>', // send
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>', // users
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>', // pencil
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>', // zap
  calendar: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>', // calendar
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>', // star
  award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>', // award
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>', // image
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>', // phone
  pages: '<path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"/><path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z"/><path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1"/>', // files
};
const icon = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* Отметка проверки в карточке списка: иконка с подсказкой вместо слова «Проверена» */
const VERIFIED = {
  company: ["Компания проверена", "Модерация СОУС сверила документы компании с данными ЕГРЮЛ"],
  person: ["Документы проверены", "Модерация СОУС проверила документы специалиста"],
};
function verifiedMark(kind = "company") {
  const [title, text] = VERIFIED[kind];
  return `<span class="v-mark" tabindex="0" aria-label="${title}. ${text}">${icon("shield", "lg")}<span class="tip" role="tooltip" aria-hidden="true"><b>${title}</b>${text}</span></span>`;
}

/* ---------- Ссылки на экраны ---------- */
/* ссылка на экран в этой же папке превращается в якорь, чтобы не перезагружать страницу */
function localHref(href) {
  const m = href.match(/^\.\.\/([^/]+)\/(#.*)$/);
  const folder = location.pathname.split("/").slice(-2, -1)[0];
  return m && m[1] === folder ? m[2] : href;
}
/* адрес пункта меню: готовый экран из pages.js или подсказка «ещё в работе» */
/* для экранов с параметром (/specialists/:id) последний сегмент ссылки заменяется на нужный id */
function pageHref(path) {
  const p = window.SOUS_FIND_PAGE(path);
  if (!p || !p.href || p.status !== "done") return STAND + path;
  const href = p.path.includes(":") ? p.href.replace(/[^/]+$/, path.split("?")[0].replace(/\/+$/, "").split("/").pop()) : p.href;
  return localHref(href);
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
