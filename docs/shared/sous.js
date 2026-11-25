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

/* ---------- Иконки: Tabler Icons (tabler.io/icons, MIT), outline, сетка 24, обводка 2.6 (1.75 px при 16 px) ---------- */
const ICONS = {
  search: '<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>', // search
  pin: '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"/>', // map-pin
  clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>', // clock
  briefcase: '<path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9"/><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"/><path d="M12 12l0 .01"/><path d="M3 13a20 20 0 0 0 18 0"/>', // briefcase
  heart: '<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/>', // heart
  badge: '<path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"/><path d="M9 12l2 2l4 -4"/>', // rosette-discount-check
  down: '<path d="M6 9l6 6l6 -6"/>', // chevron-down
  back: '<path d="M15 6l-6 6l6 6"/>', // chevron-left
  right: '<path d="M9 6l6 6l-6 6"/>', // chevron-right
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>', // x
  sliders: '<path d="M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 6l8 0"/><path d="M16 6l4 0"/><path d="M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 12l2 0"/><path d="M10 12l10 0"/><path d="M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M4 18l11 0"/><path d="M19 18l1 0"/>', // adjustments-horizontal
  plus: '<path d="M12 5l0 14"/><path d="M5 12l14 0"/>', // plus
  sun: '<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>', // sun
  moon: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/>', // moon
  bell: '<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/>', // bell
  message: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12"/>', // message
  menu: '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>', // menu-2
  check: '<path d="M5 12l5 5l10 -10"/>', // check
  dot: '<path fill="currentColor" stroke="none" d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z"/>', // point (filled)
  info: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 9h.01"/><path d="M11 12h1v4h1"/>', // info-circle
  flag: '<path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9"/><path d="M5 21v-7"/>', // flag
  send: '<path d="M10 14l11 -11"/><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"/>', // send
  users: '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>', // users
  edit: '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>', // pencil
  zap: '<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"/>', // bolt
  calendar: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/>', // calendar
  star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245"/>', // star
  award: '<path d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"/><path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889"/><path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"/>', // award
  image: '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>', // photo
  phone: '<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>', // phone
  circle: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>', // circle
  done: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>', // circle-check
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>', // trash
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>', // upload
  camera: '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>', // camera
  pages: '<path d="M15 3v4a1 1 0 0 0 1 1h4"/><path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2"/><path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2"/>', // files
};
const icon = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;

/* Отметка проверки в карточке списка: иконка с подсказкой вместо слова «Проверена» */
const VERIFIED = {
  company: ["Компания проверена", "Модерация СОУС сверила документы компании с данными ЕГРЮЛ"],
  person: ["Документы проверены", "Модерация СОУС проверила документы специалиста"],
  cert: ["Подлинность подтверждена", "Сертификат выдан Учебным центром СОУС, номер есть в реестре"],
};
function verifiedMark(kind = "company") {
  const [title, text] = VERIFIED[kind];
  return `<span class="v-mark" tabindex="0" aria-label="${title}. ${text}">${icon("badge", "lg")}<span class="tip" role="tooltip" aria-hidden="true"><b>${title}</b>${text}</span></span>`;
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
  pop.innerHTML = opts.map(([v, l, sub]) => `<button type="button" class="dd-opt" role="option" data-act="dd-opt" data-v="${esc(v)}" aria-selected="${v === el.dataset.value}"><span>${esc(l)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>${icon("check")}</button>`).join("");
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
  const w = ddOpen.dp ? pop.offsetWidth : Math.max(r.width, 200), below = window.innerHeight - r.bottom;
  if (!ddOpen.dp) pop.style.minWidth = w + "px";
  pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
  const up = below < (ddOpen.dp ? pop.offsetHeight + 12 : Math.min(pop.offsetHeight + 12, 240)) && r.top > below;
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

/* ---------- Кастомный выбор даты: datePick({ key, name, value, min, max }) ----------
   Значение в скрытом поле в формате ГГГГ-ММ-ДД, на кнопке «Чт, 26 ноября».
   Окно календаря живёт в той же системе, что и dd: позиция, закрытие кликом мимо, Esc. */
const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseDate = (v) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (v, n) => { const d = parseDate(v); d.setDate(d.getDate() + n); return isoDate(d); };
function dateLabel(v) {
  const d = parseDate(v), wd = d.toLocaleDateString("ru-RU", { weekday: "short" });
  const opts = { day: "numeric", month: "long" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return `${wd[0].toUpperCase()}${wd.slice(1)}, ${d.toLocaleDateString("ru-RU", opts).replace(" г.", "")}`;
}
function datePick({ key, name = key, value, min = "", max = "", label = "" }) {
  return `<div class="dd dp" data-dp="${key}" data-value="${value}" data-min="${min}" data-max="${max}">
    <input type="hidden" name="${name}" value="${value}">
    <button type="button" class="dd-btn" data-act="dp" aria-haspopup="dialog" aria-expanded="false"${label ? ` aria-label="${label}"` : ""}>${icon("calendar", "lg")}<span class="dd-val">${dateLabel(value)}</span>${icon("down", "chev")}</button>
  </div>`;
}
function openDP(el) {
  closeDD();
  const pop = document.createElement("div");
  pop.className = "dd-pop dp-pop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Выбор даты");
  document.body.appendChild(pop);
  el.classList.add("open"); $(".dd-btn", el).setAttribute("aria-expanded", "true");
  ddOpen = { el, pop, dp: true, focus: el.dataset.value };
  renderDP();
  placeDD();
}
const dpAllowed = (el, v) => (!el.dataset.min || v >= el.dataset.min) && (!el.dataset.max || v <= el.dataset.max);
function renderDP(keepFocus) {
  const { el, pop, focus } = ddOpen, f = parseDate(focus), today = isoDate(new Date());
  const first = new Date(f.getFullYear(), f.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  const prevEnd = isoDate(new Date(f.getFullYear(), f.getMonth(), 0)), nextStart = isoDate(new Date(f.getFullYear(), f.getMonth() + 1, 1));
  let cells = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const v = isoDate(d), out = d.getMonth() !== f.getMonth(), ok = dpAllowed(el, v);
    cells += `<button type="button" class="dp-day${out ? " out" : ""}${v === today ? " today" : ""}" data-act="dp-day" data-v="${v}" tabindex="${v === focus ? 0 : -1}" aria-selected="${v === el.dataset.value}" aria-label="${dateLabel(v)}"${ok ? "" : " disabled"}>${d.getDate()}</button>`;
  }
  const tomorrow = addDays(today, 1);
  const quick = [[today, "Сегодня"], [tomorrow, "Завтра"]].filter(([v]) => dpAllowed(el, v));
  pop.innerHTML = `<div class="dp-head"><b>${MONTHS[f.getMonth()][0].toUpperCase()}${MONTHS[f.getMonth()].slice(1)} ${f.getFullYear()}</b>
      <button type="button" class="btn sm ghost icon-only" data-act="dp-month" data-v="-1" aria-label="Предыдущий месяц"${dpAllowed(el, prevEnd) ? "" : " disabled"}>${icon("back")}</button>
      <button type="button" class="btn sm ghost icon-only" data-act="dp-month" data-v="1" aria-label="Следующий месяц"${dpAllowed(el, nextStart) ? "" : " disabled"}>${icon("right")}</button></div>
    <div class="dp-grid">${WEEKDAYS.map((w, i) => `<span class="dp-wd${i > 4 ? " we" : ""}">${w}</span>`).join("")}${cells}</div>
    ${quick.length ? `<div class="dp-quick">${quick.map(([v, l]) => `<button type="button" class="btn sm" data-act="dp-day" data-v="${v}">${l}</button>`).join("")}</div>` : ""}`;
  if (keepFocus) $(`.dp-day[data-v="${focus}"]`, pop)?.focus();
}
function moveDP(v) {
  if (!dpAllowed(ddOpen.el, v)) return;
  ddOpen.focus = v; renderDP(true);
}
function setDP(el, v) { el.dataset.value = v; $("input", el).value = v; $(".dd-val", el).textContent = dateLabel(v); }
function pickDP(v) {
  const { el } = ddOpen; const key = el.dataset.dp;
  closeDD(); $(".dd-btn", el).focus();
  if (!PAGE.onDD?.(key, v, el)) setDP(el, v);
}
function dpKey(e) {
  const f = ddOpen.focus, step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
  if (step) { e.preventDefault(); moveDP(addDays(f, step)); return true; }
  if (e.key === "PageUp" || e.key === "PageDown") {
    e.preventDefault(); const d = parseDate(f); d.setMonth(d.getMonth() + (e.key === "PageUp" ? -1 : 1)); moveDP(isoDate(d)); return true;
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("dp-day")) { e.preventDefault(); pickDP(e.target.dataset.v); return true; }
  return false;
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
      <button class="btn ghost icon-only" data-act="theme" aria-label="Светлая тема">${icon("sun", "lg")}</button>
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
    <div class="pp-head"><h3>Страницы</h3><p class="num">Готово ${done} из ${all.length}, в работе ${wip}</p>
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
    <button class="proto-btn" data-act="proto" aria-expanded="${state.protoOpen}">Роль: ${ROLES[state.role].label}${icon("down")}</button>
  </div>`;
  const list = $(".pp-list"), here = $(".pp-row.here");
  if (list && here) list.scrollTop = here.offsetTop - list.offsetTop - list.clientHeight / 2 + here.offsetHeight / 2;
}

/* ---------- Рендер ---------- */
function render() { renderHeader(); renderProto(); PAGE.render(); }
function setRole(role) { state.role = role; write("sous-role", role); render(); }

/* ---------- События ---------- */
document.addEventListener("keydown", (e) => {
  if (ddOpen?.dp) {
    if (dpKey(e)) return;
    if (e.key === "Escape") { const b = $(".dd-btn", ddOpen.el); closeDD(); b.focus(); return; }
  } else if (ddOpen) {
    const opts = $$(".dd-opt", ddOpen.pop), i = opts.findIndex((o) => o.classList.contains("active"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = opts[(i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length];
      opts.forEach((o) => o.classList.remove("active")); n.classList.add("active"); n.scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); pickDD(opts[i].dataset.v); return; }
    if (e.key === "Escape" || e.key === "Tab") { const b = $(".dd-btn", ddOpen.el); closeDD(); if (e.key === "Escape") { b.focus(); return; } }
  } else if (e.key === "ArrowDown" && e.target.classList?.contains("dd-btn")) {
    e.preventDefault(); const box = e.target.closest(".dd");
    if (box.classList.contains("dp")) { openDP(box); $(`.dp-day[tabindex="0"]`, ddOpen.pop)?.focus(); } else openDD(box);
    return;
  }
  if (e.key === "Escape") { closeModal(); closeDrawer(); closeNav(); }
});

const SHARED_ACTIONS = {
  dd: (el) => { const box = el.closest(".dd"); ddOpen?.el === box ? closeDD() : openDD(box); },
  "dd-opt": (el) => pickDD(el.dataset.v),
  dp: (el) => { const box = el.closest(".dd"); ddOpen?.el === box ? closeDD() : openDP(box); },
  "dp-day": (el) => pickDP(el.dataset.v),
  "dp-month": (el) => { const d = parseDate(ddOpen.focus); d.setDate(1); d.setMonth(d.getMonth() + Number(el.dataset.v)); const v = isoDate(d); ddOpen.focus = dpAllowed(ddOpen.el, v) ? v : ddOpen.el.dataset.min; renderDP(); },
  nav: (el) => { const item = el.closest(".nav-item"); const open = !item.classList.contains("open"); closeNav(); if (open) { item.classList.add("open"); el.setAttribute("aria-expanded", "true"); } },
  /* Светлая тема пока не прорабатывается: кнопка есть, но только сообщает об этом */
  theme: () => toast("Светлая тема ещё в работе", "Пока прототип показываем только в тёмной теме", "info"),
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
  renderFooter();
  PAGE.onRoute?.();
  render();
}
