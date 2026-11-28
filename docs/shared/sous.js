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

/* Шапка: 4 группы по ролям и задачам + отдельная кнопка «Карта СОУС» */
const NAV = [
  ["Работа", [
    ["/vacancies", "Вакансии", "Постоянная работа в студиях"],
    ["/gigs", "Подработки", "Разовые смены и срочные подмены"],
  ]],
  ["Бизнес и база", [
    ["/companies", "Компании", "Мойки, студии и автосервисы"],
    ["/specialists", "Специалисты", "Резюме и мастера на подработку"],
    ["/suppliers", "Поставщики", "Автохимия, оборудование, расходники"],
    ["/supply-requests", "Заявки на закупку", "Поставщики предлагают цену"],
    ["/analytics", "Аналитика", "Спрос, средний чек и конкуренты"],
    ["/blacklist", "Чёрные списки", "Проверка недобросовестных контрагентов"],
  ]],
  ["Автовладельцам", [
    ["/orders", "Заявки автовладельцев", "Поиск мастера и сравнение цен"],
    ["/promos", "Кешбэк и акции", "Скидки по QR и возврат по чекам"],
  ]],
  ["Сообщество", [
    ["/feed", "Лента и автоновости", "Новости и опыт коллег"],
    ["/chats", "Чаты", "Обсуждения по специализациям"],
    ["/events", "Мероприятия", "Нетворкинги и встречи индустрии"],
    ["/training", "Учебный центр", "Курсы и сертификаты"],
    ["/calculator", "Калькулятор расхода", "Расчёт материалов под автомобиль"],
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
  bookmark: '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v16l-6 -4l-6 4z"/>', // bookmark
  badge: '<path fill="currentColor" stroke="none" d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"/>', // rosette-discount-check (filled)
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
  user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>', // user
  minus: '<path d="M5 12l14 0"/>', // minus
  circle: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>', // circle
  done: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/>', // circle-check
  trash: '<path d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>', // trash
  upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 9l5 -5l5 5"/><path d="M12 4l0 12"/>', // upload
  camera: '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>', // camera
  pages: '<path d="M15 3v4a1 1 0 0 0 1 1h4"/><path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2"/><path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2"/>', // files
  copy: '<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>', // copy
};
/* Filled-варианты Tabler: в кнопках иконки всегда залитые (CSS в sous.css, «Иконки в кнопках»).
   Линейные знаки (x, plus, check, стрелки, меню) остаются линейными: их filled-версии те же линии, только тоньше. */
const ICONS_FILLED = {
  search: '<path d="M14 3.072a8 8 0 0 1 2.32 11.834l5.387 5.387a1 1 0 0 1 -1.414 1.414l-5.388 -5.387a8 8 0 1 1 -.905 -13.249"/>', // search
  pin: '<path d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-4.243 4.242a3 3 0 0 1 -4.097 .135l-.144 -.135l-4.244 -4.243a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6"/>', // map-pin
  clock: '<path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -.993 .883l-.007 .117v5l.009 .131a1 1 0 0 0 .197 .477l.087 .1l3 3l.094 .082a1 1 0 0 0 1.226 0l.094 -.083l.083 -.094a1 1 0 0 0 0 -1.226l-.083 -.094l-2.707 -2.708v-4.585l-.007 -.117a1 1 0 0 0 -.993 -.883z"/>', // clock
  briefcase: '<path d="M22 13.478v4.522a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-4.522l.553 .277a20.999 20.999 0 0 0 18.897 -.002l.55 -.275zm-8 -11.478a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v2.242l-1.447 .724a19.002 19.002 0 0 1 -16.726 .186l-.647 -.32l-1.18 -.59v-2.242a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3h4zm-2 8a1 1 0 0 0 -1 1a1 1 0 1 0 2 .01c0 -.562 -.448 -1.01 -1 -1.01zm2 -6h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1z"/>', // briefcase
  bookmark: '<path d="M8 2h8a3 3 0 0 1 3 3v16a1 1 0 0 1 -1.55 .83L12 18.2l-5.45 3.63A1 1 0 0 1 5 21V5a3 3 0 0 1 3 -3z"/>', // bookmark
  sliders: '<path d="M17 15c1.306 0 2.418 .835 2.83 2h.17a1 1 0 0 1 0 2h-.171a3.001 3.001 0 0 1 -5.658 0h-10.171a1 1 0 0 1 0 -2h10.173c.41 -1.165 1.52 -2 2.827 -2m-9 -6c1.306 0 2.418 .835 2.83 2h9.17a1 1 0 0 1 0 2h-9.171a3.001 3.001 0 0 1 -5.658 0h-1.171a1 1 0 0 1 0 -2h1.173c.41 -1.165 1.52 -2 2.827 -2m6 -6c1.306 0 2.418 .835 2.83 2h3.17a1 1 0 0 1 0 2h-3.171a3.001 3.001 0 0 1 -5.658 0h-7.171a1 1 0 1 1 0 -2h7.173c.41 -1.165 1.52 -2 2.827 -2"/>', // adjustments-horizontal
  sun: '<path d="M12 19a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"/><path d="M18.313 16.91l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 1.218 -1.567l.102 .07z"/><path d="M7.007 16.993a1 1 0 0 1 .083 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7a1 1 0 0 1 1.414 0z"/><path d="M4 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M21 11a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"/><path d="M6.213 4.81l.094 .083l.7 .7a1 1 0 0 1 -1.32 1.497l-.094 -.083l-.7 -.7a1 1 0 0 1 1.217 -1.567l.102 .07z"/><path d="M19.107 4.893a1 1 0 0 1 .083 1.32l-.083 .094l-.7 .7a1 1 0 0 1 -1.497 -1.32l.083 -.094l.7 -.7a1 1 0 0 1 1.414 0z"/><path d="M12 2a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"/><path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z"/>', // sun
  moon: '<path d="M12 1.992a10 10 0 1 0 9.236 13.838c.341 -.82 -.476 -1.644 -1.298 -1.31a6.5 6.5 0 0 1 -6.864 -10.787l.077 -.08c.551 -.63 .113 -1.653 -.758 -1.653h-.266l-.068 -.006l-.06 -.002z"/>', // moon
  bell: '<path d="M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z"/><path d="M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004z"/>', // bell
  message: '<path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2"/>', // message
  info: '<path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"/>', // info-circle
  flag: '<path d="M4 5a1 1 0 0 1 .3 -.714a6 6 0 0 1 8.213 -.176l.351 .328a4 4 0 0 0 5.272 0l.249 -.227c.61 -.483 1.527 -.097 1.61 .676l.005 .113v9a1 1 0 0 1 -.3 .714a6 6 0 0 1 -8.213 .176l-.351 -.328a4 4 0 0 0 -5.136 -.114v6.552a1 1 0 0 1 -1.993 .117l-.007 -.117v-16z"/>', // flag
  send: '<path d="M21.864 3.549l-6.454 17.868a1.55 1.55 0 0 1 -1.41 .903a1.54 1.54 0 0 1 -1.394 -.874l-2.88 -5.759zm-1.414 -1.414l-12.139 12.138l-5.728 -2.864a1.55 1.55 0 0 1 -.903 -1.409c0 -.606 .353 -1.157 .981 -1.44z"/>', // send
  edit: '<path d="M12.085 6.5l5.415 5.415l-8.793 8.792a1 1 0 0 1 -.707 .293h-4a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 .293 -.707zm5.406 -2.698a3.828 3.828 0 0 1 1.716 6.405l-.292 .293l-5.415 -5.415l.293 -.292a3.83 3.83 0 0 1 3.698 -.991"/>', // pencil
  zap: '<path d="M13 2l.018 .001l.016 .001l.083 .005l.011 .002h.011l.038 .009l.052 .008l.016 .006l.011 .001l.029 .011l.052 .014l.019 .009l.015 .004l.028 .014l.04 .017l.021 .012l.022 .01l.023 .015l.031 .017l.034 .024l.018 .011l.013 .012l.024 .017l.038 .034l.022 .017l.008 .01l.014 .012l.036 .041l.026 .027l.006 .009c.12 .147 .196 .322 .218 .513l.001 .012l.002 .041l.004 .064v6h5a1 1 0 0 1 .868 1.497l-.06 .091l-8 11c-.568 .783 -1.808 .38 -1.808 -.588v-6h-5a1 1 0 0 1 -.868 -1.497l.06 -.091l8 -11l.01 -.013l.018 -.024l.033 -.038l.018 -.022l.009 -.008l.013 -.014l.04 -.036l.028 -.026l.008 -.006a1 1 0 0 1 .402 -.199l.011 -.001l.027 -.005l.074 -.013l.011 -.001l.041 -.002z"/>', // bolt
  calendar: '<path d="M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1zm3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16v-9.625z"/>', // calendar
  star: '<path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"/>', // star
  award: '<path d="M19.496 13.983l1.966 3.406a1.001 1.001 0 0 1 -.705 1.488l-.113 .011l-.112 -.001l-2.933 -.19l-1.303 2.636a1.001 1.001 0 0 1 -1.608 .26l-.082 -.094l-.072 -.11l-1.968 -3.407a8.994 8.994 0 0 0 6.93 -3.999z"/><path d="M11.43 17.982l-1.966 3.408a1.001 1.001 0 0 1 -1.622 .157l-.076 -.1l-.064 -.114l-1.304 -2.635l-2.931 .19a1.001 1.001 0 0 1 -1.022 -1.29l.04 -.107l.05 -.1l1.968 -3.409a8.994 8.994 0 0 0 6.927 4.001z"/><path d="M12 2l.24 .004a7 7 0 0 1 6.76 6.996l-.003 .193l-.007 .192l-.018 .245l-.026 .242l-.024 .178a6.985 6.985 0 0 1 -.317 1.268l-.116 .308l-.153 .348a7.001 7.001 0 0 1 -12.688 -.028l-.13 -.297l-.052 -.133l-.08 -.217l-.095 -.294a6.96 6.96 0 0 1 -.093 -.344l-.06 -.271l-.049 -.271l-.02 -.139l-.039 -.323l-.024 -.365l-.006 -.292a7 7 0 0 1 6.76 -6.996l.24 -.004z"/>', // award
  image: '<path d="M8.813 11.612c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.986 4.986l.094 .083a1 1 0 0 0 1.403 -1.403l-.083 -.094l-1.292 -1.293l.292 -.293l.106 -.095c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.674 4.675a4 4 0 0 1 -3.775 3.599l-.206 .005h-12a4 4 0 0 1 -3.98 -3.603l6.687 -6.69l.106 -.095zm9.187 -9.612a4 4 0 0 1 3.995 3.8l.005 .2v9.585l-3.293 -3.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-.307 .306l-2.293 -2.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-5.307 5.306v-9.585a4 4 0 0 1 3.8 -3.995l.2 -.005h12zm-2.99 5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"/>', // photo
  phone: '<path d="M9 3a1 1 0 0 1 .877 .519l.051 .11l2 5a1 1 0 0 1 -.313 1.16l-.1 .068l-1.674 1.004l.063 .103a10 10 0 0 0 3.132 3.132l.102 .062l1.005 -1.672a1 1 0 0 1 1.113 -.453l.115 .039l5 2a1 1 0 0 1 .622 .807l.007 .121v4c0 1.657 -1.343 3 -3.06 2.998c-8.579 -.521 -15.418 -7.36 -15.94 -15.998a3 3 0 0 1 2.824 -2.995l.176 -.005h4z"/>', // phone
  user: '<path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z"/><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z"/>', // user
  circle: '<path d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z"/>', // circle
  done: '<path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"/>', // circle-check
  trash: '<path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1"/><path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z"/>', // trash
  camera: '<path d="M15 3a2 2 0 0 1 1.995 1.85l.005 .15a1 1 0 0 0 .883 .993l.117 .007h1a3 3 0 0 1 2.995 2.824l.005 .176v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9a3 3 0 0 1 2.824 -2.995l.176 -.005h1a1 1 0 0 0 1 -1a2 2 0 0 1 1.85 -1.995l.15 -.005h6zm-3 7a3 3 0 0 0 -2.985 2.698l-.011 .152l-.004 .15l.004 .15a3 3 0 1 0 2.996 -3.15z"/>', // camera
  pages: '<path d="M11 2l3 .001v5.999a1 1 0 0 0 .883 .993l.117 .007h6v6a3 3 0 0 1 -3 3h-1v1a3 3 0 0 1 -3 3h-7a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3h1v-1a3 3 0 0 1 3 -3m-3 6h-1a1 1 0 0 0 -1 1v10a1 1 0 0 0 1 1h7a1 1 0 0 0 1 -1v-1h-4a3 3 0 0 1 -3 -3zm12.415 -1h-4.415v-4.415z"/>', // files
};
/* cls "line" оставляет линейную иконку и в кнопке: для значков состояния, где заливка поменяет смысл */
const icon = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS_FILLED[n] && !/\bline\b/.test(cls) ? `<g class="i-o">${ICONS[n]}</g><g class="i-f">${ICONS_FILLED[n]}</g>` : ICONS[n] || ""}</svg>`;

/* Профиль компании по названию: ссылки «Профиль компании» из вакансий и подработок */
const COMPANY_IDS = { "Shine&Go": "company-001", "CleanLab": "company-002", "АвтоПрофи": "company-003", "Detail House": "company-004", "Гараж 77": "company-005", "Wrap Lab": "company-006", "Мойка 24": "company-007" };
const companyHref = (org) => pageHref(`/companies/${COMPANY_IDS[org] || "company-001"}`);

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
  if (!p || !p.href || !["done", "review"].includes(p.status)) return STAND + path;
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
function filePick({ name = "file", accept = "", multiple = false, label = "Выбрать файл" } = {}) {
  return `<div class="file-pick" data-file-pick>
    <label class="file-pick-btn">
      <input class="sr-only" type="file" name="${esc(name)}"${accept ? ` accept="${esc(accept)}"` : ""}${multiple ? " multiple" : ""} data-fp-input>
      ${icon("upload")}
      <span class="file-pick-text" data-fp-text="${esc(label)}">${esc(label)}</span>
    </label>
    <button type="button" class="file-pick-clear" data-fp-clear hidden aria-label="Убрать файл">${icon("x")}</button>
  </div>`;
}
document.addEventListener("change", (e) => {
  const input = e.target.closest("[data-fp-input]");
  if (!input) return;
  const wrap = input.closest("[data-file-pick]");
  const text = $("[data-fp-text]", wrap), clear = $("[data-fp-clear]", wrap);
  const files = [...(input.files || [])];
  if (files.length) {
    text.textContent = files.length === 1 ? files[0].name : `${files.length} ${plural(files.length, "файл", "файла", "файлов").split(" ").slice(1).join(" ")}`;
    wrap.classList.add("has-file");
    clear.hidden = false;
  } else {
    text.textContent = text.dataset.fpText;
    wrap.classList.remove("has-file");
    clear.hidden = true;
  }
});
document.addEventListener("click", (e) => {
  const clear = e.target.closest("[data-fp-clear]");
  if (!clear) return;
  const wrap = clear.closest("[data-file-pick]");
  const input = $("[data-fp-input]", wrap), text = $("[data-fp-text]", wrap);
  input.value = "";
  text.textContent = text.dataset.fpText;
  wrap.classList.remove("has-file");
  clear.hidden = true;
});
document.addEventListener("dragover", (e) => {
  const wrap = e.target.closest("[data-file-pick]");
  if (!wrap) return;
  e.preventDefault();
  wrap.classList.add("is-drag");
});
document.addEventListener("dragleave", (e) => {
  const wrap = e.target.closest("[data-file-pick]");
  if (wrap && !wrap.contains(e.relatedTarget)) wrap.classList.remove("is-drag");
});
document.addEventListener("drop", (e) => {
  const wrap = e.target.closest("[data-file-pick]");
  if (!wrap) return;
  e.preventDefault();
  wrap.classList.remove("is-drag");
  const input = $("[data-fp-input]", wrap);
  if (e.dataTransfer?.files?.length) {
    input.files = e.dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
});

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
  const isDesignLight = Boolean(document.documentElement.dataset.vacancyDesign) && document.documentElement.dataset.theme === "light";
  const right = r === "guest"
    ? `<a class="link hide-m" href="#" data-act="login">Войти</a><button class="btn sm hide-m" data-act="register">Регистрация</button>`
    : `<a class="btn ghost icon-only hide-m" href="${pageHref("/messages")}" aria-label="Сообщения">${icon("message", "lg")}</a>
       <a class="btn ghost icon-only hide-m" href="${pageHref("/notifications")}" aria-label="Уведомления">${icon("bell", "lg")}</a>
       <a class="avatar" href="${pageHref("/dashboard")}" title="Кабинет: ${esc(user.name)}">${user.initials}</a>`;
  $("#top").innerHTML = `<div class="top-in">
    <a class="logo" href="${pageHref("/")}">${PAGE.textLogo ? "" : '<img src="../assets/logo.png" alt="">'}<span>СОУС</span></a>
    <nav class="nav" aria-label="Разделы">${NAV.map(([title, items], i) => `
      <div class="nav-item" data-nav="${i}">
        <button class="nav-btn ${i === cur ? "current" : ""}" aria-expanded="false" data-act="nav" data-i="${i}">${title}${icon("down")}</button>
        <div class="menu" role="menu">${items.map(([path, label, sub]) => `<a role="menuitem" class="${path === PAGE.section ? "here" : ""}" href="${pageHref(path)}"><b>${label}</b><span>${sub}</span></a>`).join("")}</div>
      </div>`).join("")}
      <a class="nav-map ${PAGE.section === "/sous-map" ? "current" : ""}" href="${pageHref("/sous-map")}">${icon("pin")}Карта СОУС</a>
    </nav>
    <div class="top-actions">
      <button class="btn ghost icon-only" data-act="theme" aria-label="${isDesignLight ? "Тёмная тема" : "Светлая тема"}">${icon(isDesignLight ? "moon" : "sun", "lg")}</button>
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
    <div class="drawer-head"><a class="logo" href="${pageHref("/")}">${PAGE.textLogo ? "" : '<img src="../assets/logo.png" alt="">'}<span>СОУС</span></a><button class="btn icon-only" data-act="close-drawer" aria-label="Закрыть">${icon("x", "lg")}</button></div>
    <div class="drawer-body">
      ${r === "guest" ? `<div class="grid2"><button class="btn" data-act="login">Войти</button><button class="btn primary" data-act="register">Регистрация</button></div>`
        : `<div class="grid2"><a class="btn" href="${pageHref("/messages")}">${icon("message")}Сообщения</a><a class="btn" href="${pageHref("/dashboard")}">Кабинет</a></div>`}
      ${NAV.map(([t, items]) => `<div class="m-group"><b>${t}</b>${items.map(([path, l]) => `<a href="${pageHref(path)}" class="${path === PAGE.section ? "here" : ""}">${l}${icon("right")}</a>`).join("")}</div>`).join("")}
      <div class="m-group"><b>Навигация</b><a href="${pageHref("/sous-map")}" class="${PAGE.section === "/sous-map" ? "here" : ""}">Карта СОУС${icon("right")}</a></div>
    </div></aside>`;
  document.body.appendChild(wrap);
  document.body.classList.add("lock");
}
function closeDrawer() { $(".drawer-wrap")?.remove(); document.body.classList.remove("lock"); }
function renderFooter() {
  const f = $("#footer");
  if (f) f.innerHTML = `<div class="wrap"><a class="logo" href="${pageHref("/")}">${PAGE.textLogo ? "" : '<img src="../assets/logo.png" alt="">'}<span>СОУС</span></a><span>Работа, база бизнеса, автоуслуги и сообщество СОУС</span><nav><a href="${pageHref("/contacts")}">Контакты</a><a href="${pageHref("/terms")}">Оферта</a><a href="${pageHref("/privacy")}">Приватность</a></nav></div>`;
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
const REPO = "shmemka/sous";
const issueUrl = (n) => `https://github.com/${REPO}/issues/${n}`;
async function loadIssues() {
  if (state.issuesLoading || Date.now() - (state.issuesTime || 0) < 60000) return;
  try {
    const cached = JSON.parse(sessionStorage.getItem("sous-issues") || "null");
    if (cached && Date.now() - cached.t < 60000) {
      state.issues = cached.d;
      state.issuesTime = cached.t;
      return;
    }
  } catch {}
  state.issuesLoading = true;
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=${encodeURIComponent("страница")}&state=all&per_page=100`);
    if (!response.ok) return;
    const issues = await response.json();
    state.issues = Object.fromEntries(issues.map((issue) => [
      issue.number, { closed: issue.state === "closed", comments: issue.comments }
    ]));
    state.issuesTime = Date.now();
    try { sessionStorage.setItem("sous-issues", JSON.stringify({ t: state.issuesTime, d: state.issues })); } catch {}
    if (state.pagesOpen) refreshPageStatuses();
  } catch {
    // Если GitHub недоступен, показываем статусы из карты экранов.
  } finally {
    state.issuesLoading = false;
  }
}
const pageStatus = (page) => page.status === "review" && state.issues?.[page.issue]?.closed
  ? "done" : (page.status || "todo");
const ST_LABEL = { review: "На проверке", done: "Готово", wip: "В работе", todo: "Не начато" };
const PAGE_FILTERS = [["available", "Готовые"], ["all", "Все"]];
const VACANCY_DESIGNS = [
  { id: "original-html", title: "Классика СОУС", description: "Тёплая палитра референса, верхняя навигация и сетка карточек" },
  { id: "sprint", title: "Графит и медь", description: "Матовый графит, боковые фильтры и быстрые теги специализаций" },
  { id: "redline", title: "Список и превью", description: "Компактный список слева и карточка выбранной вакансии справа" },
  { id: "ember", title: "Витрина направлений", description: "Крупная типографика, плитки специализаций и двухколоночная сетка" },
];
const currentProtoPage = () => window.SOUS_PAGES.flatMap((group) => group.pages)
  .find((page) => page.path === (PAGE.currentPath?.() || PAGE.section));
const pageAvailable = (page) => page.href && ["review", "done"].includes(pageStatus(page));
const pageSearchText = (value) => value.toLowerCase().replaceAll("ё", "е");

function vacancyDesign() {
  const [path, query] = route().split("?");
  if (PAGE.section !== "/vacancies" || path !== "/") return "";
  const id = new URLSearchParams(query).get("design");
  return VACANCY_DESIGNS.some((design) => design.id === id) ? id : "";
}

function vacancyDesignsMarkup() {
  const current = vacancyDesign();
  const onCatalog = currentProtoPage()?.path === "/vacancies";
  const href = pageHref("/vacancies");
  return `<section class="pp-designs" aria-label="Варианты дизайна вакансий">
    <h4>Вакансии</h4>
    <ul>${VACANCY_DESIGNS.map(({ id, title, description }) => `
      <li><a class="pp-design" data-act="page-go" href="${href}?design=${id}" ${id === current ? 'aria-current="true"' : ""}>
        <span class="pp-swatch pp-swatch-${id}" aria-hidden="true"></span>
        <span><b>${title}</b><small>${description}</small></span>
        ${icon(id === current ? "check" : "right")}
      </a></li>`).join("")}</ul>
    <a class="pp-issue pp-original" data-act="page-go" href="${href}" ${onCatalog && !current ? 'aria-current="true"' : ""}>Исходный вариант</a>
  </section>`;
}

function pageStatusDot(page) {
  const status = pageStatus(page);
  return `<span class="pp-status" title="${ST_LABEL[status]}"><i class="st st-${status}" aria-hidden="true"></i><span class="sr-only">${ST_LABEL[status]}</span></span>`;
}
function pageStatusLabel(page) {
  const status = pageStatus(page);
  return `<span class="pp-status"><i class="st st-${status}" aria-hidden="true"></i>${ST_LABEL[status]}</span>`;
}
function currentPageIssue(page) {
  const comments = state.issues?.[page.issue]?.comments || 0;
  return `Обсудить${comments ? ` (${comments})` : ""}`;
}
function currentPageMarkup(page) {
  if (!page) return "";
  return `<div class="pp-now" aria-label="Текущий экран">
    <div class="pp-now-info">
      <span class="pp-now-title">${esc(page.title)}</span>
      <code class="pp-route">${esc(page.path)}</code>
    </div>
    <div class="pp-now-acts">
      ${page.issue ? `<a class="pp-now-link" data-pp-issue href="${issueUrl(page.issue)}" target="_blank" rel="noopener">${currentPageIssue(page)}</a>` : ""}
      <button type="button" class="pp-now-copy" data-act="pp-copy" title="Скопировать ссылку" aria-label="Скопировать ссылку">${icon("copy")}</button>
    </div>
  </div>`;
}
function pageRow(page, isCurrent) {
  const status = pageStatus(page);
  const avail = pageAvailable(page);
  const content = `<span class="pp-row-main">
      <span class="pp-row-title">${esc(page.title)}</span>
      <code class="pp-route">${esc(page.path)}</code>
    </span>
    ${pageStatusDot(page)}`;
  if (isCurrent) return `<li class="pp-row pp-row-cur" aria-current="page">${content}</li>`;
  return avail
    ? `<li><a class="pp-row" href="${esc(localHref(page.href))}" data-act="page-go" data-path="${esc(page.path)}">${content}</a></li>`
    : `<li class="pp-row pp-unavailable">${content}</li>`;
}
function pageFilterCounts() {
  const all = window.SOUS_PAGES.flatMap((g) => g.pages);
  return {
    available: all.filter(pageAvailable).length,
    all: all.length,
  };
}
function pageListMarkup() {
  const current = currentProtoPage();
  const filter = state.pageFilter || "available";
  const query = pageSearchText(state.pageQuery || "").trim().split(/\s+/);
  const groups = window.SOUS_PAGES.map((group) => {
    const pages = group.pages.filter((page) => {
      if (filter === "available" && !pageAvailable(page)) return false;
      const text = pageSearchText(`${page.title} ${page.path}`);
      return query.every((word) => text.includes(word));
    });
    return pages.length ? `<section class="pp-group"><h4>${esc(group.title)}</h4><ul>${pages.map((p) => pageRow(p, p === current)).join("")}</ul></section>` : "";
  }).join("");
  return groups || `<p class="pp-empty" role="status">Ничего не найдено</p>`;
}
function refreshPageList() {
  const list = $(".pp-list");
  if (!list) return;
  const focusedPath = list.contains(document.activeElement) && document.activeElement.dataset.path;
  list.innerHTML = pageListMarkup();
  if (focusedPath) {
    const row = $$("[data-path]", list).find((link) => link.dataset.path === focusedPath);
    (row || $(".pp-search input"))?.focus({ preventScroll: true });
  }
}
function refreshPageStatuses() {
  const page = currentProtoPage();
  const issue = $("[data-pp-issue]");
  if (page && issue) issue.innerHTML = currentPageIssue(page);
  const counts = pageFilterCounts();
  $$("[data-act=pp-filter]").forEach((btn) => {
    const c = btn.querySelector(".pp-fcount");
    if (c && counts[btn.dataset.filter] != null) c.textContent = counts[btn.dataset.filter];
  });
  refreshPageList();
}
function pagesPanel() {
  const filter = state.pageFilter || "available";
  const hasDesign = PAGE.section === "/vacancies";
  const design = hasDesign && state.pagePanelTab === "design";
  const counts = pageFilterCounts();
  return `<section class="pages-panel" id="pages-panel" role="dialog" aria-label="Страницы и дизайн прототипа">
    <div class="pp-head">
      <div class="pp-title">
        <h3>Страницы</h3>
        ${hasDesign ? `<div class="pp-tabs" role="group" aria-label="Раздел панели">
          <button data-act="pp-tab" data-tab="pages" aria-pressed="${!design}">Экраны</button>
          <button data-act="pp-tab" data-tab="design" aria-pressed="${design}">Дизайн</button>
        </div>` : ""}
        <button class="btn sm icon-only" data-act="pages" aria-label="Закрыть страницы">${icon("x")}</button>
      </div>
      ${design ? "" : `<div class="pp-bar">
        <label class="pp-search">${icon("search")}<input type="search" aria-label="Поиск страниц" placeholder="Название или /путь" value="${esc(state.pageQuery || "")}"></label>
        <div class="pp-filters" role="group" aria-label="Какие страницы показать">
          ${PAGE_FILTERS.map(([value, label]) => `<button data-act="pp-filter" data-filter="${value}" aria-pressed="${filter === value}">${label}<span class="pp-fcount num">${counts[value]}</span></button>`).join("")}
        </div>
      </div>`}
    </div>
    <div class="pp-scroll">${design ? vacancyDesignsMarkup() : `${currentPageMarkup(currentProtoPage())}<div class="pp-list">${pageListMarkup()}</div>`}</div>
  </section>`;
}
function renderProto() {
  const hints = PAGE.roleHints || {};
  const pagesFocused = document.activeElement?.matches(".proto-pages");
  $("#proto-root").innerHTML = `<div class="proto">
    ${state.protoOpen ? `<section class="proto-panel"><h3>Роль пользователя</h3><p>Служебная панель прототипа. Показывает, как страница меняется для каждой роли</p>
      <div class="roles">${Object.entries(ROLES).map(([id, r]) => `<button data-act="role" data-role="${id}" aria-pressed="${state.role === id}">${r.label}<span>${hints[id] || ""}</span></button>`).join("")}</div></section>` : ""}
    ${state.pagesOpen ? pagesPanel() : ""}
    <button class="proto-pages" data-act="pages" aria-expanded="${state.pagesOpen}"${state.pagesOpen ? ' aria-controls="pages-panel"' : ""}>${icon("pages")}Страницы</button>
    <button class="proto-btn" data-act="proto" aria-expanded="${state.protoOpen}">Роль: ${ROLES[state.role].label}${icon("down")}</button>
  </div>`;
  if (pagesFocused) $(".proto-pages").focus({ preventScroll: true });
}
function togglePages() {
  state.pagesOpen = !state.pagesOpen;
  state.protoOpen = false;
  state.pageQuery = "";
  state.pageFilter = "available";
  if (state.pagesOpen && state.pagePanelTab !== "design") loadIssues();
  renderProto();
  $(state.pagesOpen ? ".pages-panel [data-act=pages]" : ".proto-pages")?.focus({ preventScroll: true });
}
function filterPages() {
  refreshPageList();
  const scroll = $(".pp-scroll"), list = $(".pp-list");
  if (scroll && list) scroll.scrollTop = Math.min(scroll.scrollTop, list.offsetTop);
}
document.addEventListener("input", (event) => {
  if (!event.target.matches(".pp-search input")) return;
  state.pageQuery = event.target.value;
  filterPages();
});

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
  if (e.key === "Escape") {
    if (state.pagesOpen) { togglePages(); return; }
    closeModal(); closeDrawer(); closeNav();
  }
});

const SHARED_ACTIONS = {
  dd: (el) => { const box = el.closest(".dd"); ddOpen?.el === box ? closeDD() : openDD(box); },
  "dd-opt": (el) => pickDD(el.dataset.v),
  dp: (el) => { const box = el.closest(".dd"); ddOpen?.el === box ? closeDD() : openDP(box); },
  "dp-day": (el) => pickDP(el.dataset.v),
  "dp-month": (el) => { const d = parseDate(ddOpen.focus); d.setDate(1); d.setMonth(d.getMonth() + Number(el.dataset.v)); const v = isoDate(d); ddOpen.focus = dpAllowed(ddOpen.el, v) ? v : ddOpen.el.dataset.min; renderDP(); },
  nav: (el) => { const item = el.closest(".nav-item"); const open = !item.classList.contains("open"); closeNav(); if (open) { item.classList.add("open"); el.setAttribute("aria-expanded", "true"); } },
  /* Светлая тема работает только на 4 концепциях в разделе «Дизайн» */
  theme: () => {
    const root = document.documentElement;
    if (!root.dataset.vacancyDesign) {
      toast("Светлая тема ещё в работе", "Её можно посмотреть на 4 концепциях в разделе «Страницы → Дизайн» на Вакансиях", "info");
      return;
    }
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    write("sous-design-theme", next);
    renderHeader();
  },
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
  pages: togglePages,
  "pp-tab": (el) => {
    state.pagePanelTab = el.dataset.tab;
    if (state.pagePanelTab === "pages") loadIssues();
    renderProto();
    $(".pp-tabs [aria-pressed=true]")?.focus({ preventScroll: true });
  },
  "pp-filter": (el) => {
    state.pageFilter = el.dataset.filter;
    for (const button of $$(".pp-filters button")) button.setAttribute("aria-pressed", button === el);
    filterPages();
  },
  "pp-copy": async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Ссылка скопирована", "Можно отправить коллеге или заказчику");
    } catch {
      toast("Не удалось скопировать", location.href, "info");
    }
  },
  "page-go": (el, e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    state.pagesOpen = false;
    renderProto();
    $(".proto-pages")?.focus({ preventScroll: true });
  },
  role: (el) => { state.protoOpen = false; setRole(el.dataset.role); },
};

/* В списках подсвечена одна строка: .active ходит и за стрелками, и за мышью (как в системных списках) */
document.addEventListener("mousemove", (e) => {
  const o = e.target.closest(".dd-opt,.sk-opt");
  if (!o || o.classList.contains("active")) return;
  o.closest('[role="listbox"]').querySelectorAll(".active").forEach((x) => x.classList.toggle("active", false));
  o.classList.add("active");
});
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
