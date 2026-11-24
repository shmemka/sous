import { ADMIN_TABS, MODAL_GROUPS, NAV, ROLES, ROUTE_GROUPS } from "./data.mjs";
import { avatar, badge, btn, emptyState, esc, filters, icon, stateView, toastMarkup } from "./components.mjs";
import { renderPage } from "./pages.mjs";
import { renderModal } from "./modals.mjs?v=20261116";
import { chatInfoContent } from "./chat-pages.mjs";
import { CALC_PRESETS } from "./tools-pages.mjs";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clone = (value) => JSON.parse(JSON.stringify(value));
const initialMessages = [
  { channel: "detailing", author: "Александр Волков", text: "Какой состав лучше взять для матового кузова?", time: "14:20", mine: false },
  { channel: "detailing", author: "Shine&Go", text: "Используем отдельную линейку без воска и глянца. Главное — не менять исходную фактуру.", time: "14:24", mine: false },
  { channel: "ppf", author: "АвтоПрофи", text: "Добавили новый разбор установки на заднюю дверь в учебный центр.", time: "13:48", mine: false },
  { channel: "business", author: "Ирина Рогоцкая", text: "На этой неделе открылась закупка микрофибры, можно присоединиться.", time: "12:12", mine: false },
  { channel: "jobs", author: "CleanLab", text: "Нужен мойщик на подмену в субботу, детали в подработках.", time: "11:30", mine: false },
];
const initialDirect = [
  { conversation: "mike", text: "Добрый день! Готов обсудить смену в субботу.", time: "14:10", mine: false },
  { conversation: "mike", text: "Здравствуйте! Отправлю детали и адрес в ответном сообщении.", time: "14:12", mine: true },
  { conversation: "mike", text: "Готов выйти на смену.", time: "14:14", mine: false },
  { conversation: "shine", text: "Отправили условия закупки и актуальный прайс.", time: "13:42", mine: false },
  { conversation: "ivan", text: "Спасибо за работу! Всё отлично.", time: "Вчера", mine: false },
];

const state = {
  path: "/", theme: localStorage.getItem("sous-prototype-theme") || "dark", role: "employer", uiState: "normal",
  dashboardTab: "overview", adminTab: "moderation", feedTab: "all", trainingTab: "courses", notificationsTab: "all",
  scanMode: "camera", scanResult: false, calcMode: "single", analyticsCity: "Москва", analyticsDistrict: "Все районы",
  calcBody: "crossover", calcZones: new Set(["hood", "roof", "doors", "bumpers", "fenders", "glass"]),
  calcProducts: new Set(["active-foam", "second-phase-shampoo", "crystal-glass"]), calcRates: {}, calcRatio: "1:8", calcEquipment: "foam_kit",
  calcPeriod: "month", fleetProduct: "active-foam",
  fleetDaily: { sedan: 4, hatchback: 2, crossover: 6, suv: 3, coupe: 0, wagon: 1, minivan: 0, pickup: 0 },
  fleetRates: { sedan: 320, hatchback: 290, crossover: 380, suv: 440, coupe: 300, wagon: 350, minivan: 420, pickup: 500 },
  mapCity: "Все города", mapCategory: "all", mapQuery: "", mapSelected: "company-002", mapZoom: 1, mapView: "map", mapVerified: false, mapDetailClosed: false,
  chatChannel: "detailing", conversation: "mike", chatListOpen: false, chatMessages: clone(initialMessages), directMessages: clone(initialDirect),
  authStep: "phone", registerRole: "employer", registerStep: "role", registerDraft: { name: "", phone: "+7 (999) 521-22-51", email: "", password: "" }, registerProfile: {}, resumeStep: "who", routePanel: false, protoOpen: false, modal: null,
  favorites: new Set(["vacancies:vac-022", "gigs:gig-016"]), notificationsReadAll: false, myPromoTab: "active",
  modalReturnFocus: null, viewReady: false,
  chatThreadOpen: false, chatInfoOpen: true, chatSearchOpen: false, replyTo: null,
  attachmentDraft: null, voiceRecording: false, editingMessage: null,
  messageOverrides: {}, deletedMessageIds: new Set(),
  profileTab: "resume", followedProfiles: new Set(), revealedContacts: new Set(),
};

let adminTarget = null;

const aliases = {
  "/resumes": "/specialists", "/resume/resume-001": "/specialists/worker-001", "/profile": "/dashboard",
  "/payments": "/dashboard", "/dashboard/billing": "/dashboard",
};
function currentPath() {
  const raw = location.hash.slice(1).split("?")[0] || "/";
  return aliases[raw] || raw;
}
function syncQuery() {
  const query = new URLSearchParams(location.hash.split("?")[1] || "");
  if (query.has("tab")) state.dashboardTab = query.get("tab");
}
function navigate(path) {
  closeModal();
  closeDrawers();
  state.protoOpen = false;
  state.routePanel = false;
  if (path === "/profile" || path === "/payments" || path === "/dashboard/billing") state.dashboardTab = path === "/profile" ? "profile" : "payments";
  const next = aliases[path] || path;
  if (location.hash.slice(1).split("?")[0] === next) {
    state.path = next;
    render();
  } else {
    location.hash = next;
  }
}
window.addEventListener("hashchange", () => {
  state.protoOpen = false;
  state.routePanel = false;
  const previousPath = state.path;
  state.path = currentPath();
  if (previousPath !== state.path && (state.path.startsWith("/profile/") || state.path.startsWith("/specialists/") || state.path.startsWith("/companies/") || state.path.startsWith("/suppliers/"))) state.profileTab = "resume";
  syncQuery();
  state.uiState = "normal";
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
});

function headerMarkup() {
  if (state.path.startsWith("/admin")) return "";
  const active = (href) => href === "/vacancies" ? ["/vacancies", "/specialists"].some((path) => state.path.startsWith(path)) : state.path === href || (href !== "/" && state.path.startsWith(`${href}/`));
  return `<div class="header-shell"><div class="header-brand"><button class="btn ghost icon-only route-toggle" data-action="routes" aria-label="Карта экранов">${icon("grid")}</button><a class="logo" href="#/" data-path="/"><img src="/public/logo.png" alt="СОУС"><span>СОУС</span></a><div class="header-actions">
    <button class="btn secondary theme-toggle" data-action="theme" aria-label="Переключить тему">${icon(state.theme === "dark" ? "sun" : "moon")}<span class="theme-label">${state.theme === "dark" ? "Светлая" : "Тёмная"}</span></button>
    <button class="btn secondary icon-only menu-toggle" data-action="mobile-menu" aria-label="Открыть меню">${icon("menu")}</button>
    <a class="btn ghost icon-only" href="#/notifications" data-path="/notifications" aria-label="Уведомления">${icon("bell")}</a>
    <a class="btn primary desktop-action" href="#/login" data-path="/login">Войти</a><a class="btn secondary desktop-action" href="#/register" data-path="/register">Регистрация</a>
    <a class="btn ghost icon-only" href="#/dashboard" data-path="/dashboard" aria-label="Личный кабинет">${icon("user")}</a>
  </div></div><nav class="navrow" aria-label="Основные разделы">${NAV.slice(0, 6).map(([href, label]) => `<button class="${active(href) ? "active" : ""}" data-path="${href}">${label}</button>`).join("")}</nav><nav class="navrow navrow2" aria-label="Дополнительные разделы">${NAV.slice(6).map(([href, label]) => `<button class="${active(href) ? "active" : ""}" data-path="${href}">${label}</button>`).join("")}</nav></div>`;
}

function routePanelMarkup() {
  return `<div class="row between"><div><h2>Карта экранов</h2><p class="hint">52 маршрута · ${MODAL_GROUPS.reduce((sum, group) => sum + group[1].length, 0)} модальных сценариев</p></div>${btn("", { action: "routes", cls: "sm icon-only ghost", iconName: "x" })}</div>${ROUTE_GROUPS.map((group, i) => `<details ${i < 2 ? "open" : ""}><summary>${group.title} · ${group.routes.length}</summary>${group.routes.map(([path, title]) => `<a class="${state.path === path ? "active" : ""}" href="#${path}" data-path="${path}"><span>${title}</span></a>`).join("")}</details>`).join("")}<details><summary>Все модальные сценарии</summary>${MODAL_GROUPS.map(([title, modals]) => `<div class="mt-1"><b class="small">${title}</b>${modals.map((modal) => `<a href="#" data-modal="${modal}">${modal}</a>`).join("")}</div>`).join("")}</details>`;
}

function prototypeMarkup() {
  return `<div class="proto"><button class="proto-toggle" data-action="prototype">Прототип · ${ROLES[state.role].label}</button>${state.protoOpen ? `<section class="proto-panel"><h3>Роль и состояние интерфейса</h3><p>Служебная панель только для проверки. В продуктивный интерфейс не входит.</p><div class="proto-row"><span>Роль пользователя</span><div class="seg opt-row">${Object.entries(ROLES).map(([id, role]) => `<button class="btn sm ${state.role === id ? "primary" : "secondary"}" data-action="role" data-role="${id}">${role.label}</button>`).join("")}</div></div><div class="proto-row"><span>Состояние страницы</span><div class="seg opt-row">${["normal", "loading", "empty", "error", "forbidden"].map((value) => `<button class="btn sm ${state.uiState === value ? "primary" : "secondary"}" data-action="state" data-state="${value}">${{ normal: "Обычное", loading: "Загрузка", empty: "Пусто", error: "Ошибка", forbidden: "Нет доступа" }[value]}</button>`).join("")}</div></div><div class="proto-row"><span>Быстрые переходы</span><div class="row">${btn("Кабинет", { path: "/dashboard", cls: "sm secondary" })}${btn("Админка", { path: "/admin", cls: "sm secondary" })}${btn("Модалки", { action: "routes", cls: "sm secondary" })}</div></div></section>` : ""}</div>`;
}

function renderDom() {
  state.path = currentPath();
  document.body.classList.toggle("messenger-active", state.path === "/chats" || state.path === "/messages");
  document.body.classList.toggle("auth-active", ["/login", "/login/employee", "/register"].includes(state.path));
  document.documentElement.dataset.theme = state.theme;
  $("#site-header").innerHTML = headerMarkup();
  $("#route-panel").innerHTML = routePanelMarkup();
  $("#route-panel").classList.toggle("open", state.routePanel);
  $("#route-panel").hidden = !state.routePanel;
  const content = state.uiState === "normal" ? renderPage(state) : stateView(state.uiState, state.path);
  $("#app").innerHTML = content;
  $$('[data-action="favorite"][data-id]').forEach((favorite) => {
    const active = state.favorites.has(favorite.dataset.id);
    favorite.classList.toggle("active", active);
    favorite.setAttribute("aria-pressed", String(active));
  });
  $("#prototype-tools").innerHTML = prototypeMarkup();
  $$('[data-hero-image]').forEach((hero) => {
    const id = hero.dataset.heroImage;
    hero.style.setProperty("--hero-art", `url('/public/images/heroes/${id}-${state.theme}.webp')`);
  });
  document.title = `${$("h1")?.textContent || "СОУС"} — дизайн-прототип`;
  $$(".skeleton").forEach((node) => node.setAttribute("aria-hidden", "true"));
  setupHomeReveal();
}

function render() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!state.viewReady || reducedMotion || typeof document.startViewTransition !== "function") {
    renderDom();
  } else {
    state.transition?.skipTransition();
    state.transition = document.startViewTransition(renderDom);
  }
  state.viewReady = true;
}

function setupHomeReveal() {
  setupHomeReveal.observer?.disconnect();
  const sections = $$(".home-section");
  if (!sections.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  setupHomeReveal.observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        setupHomeReveal.observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04, rootMargin: "0px 0px -24px" });
  sections.forEach((section) => {
    section.classList.add("home-observe");
    setupHomeReveal.observer.observe(section);
  });
}

function toast(title, message, error = false) {
  const node = document.createElement("div");
  node.innerHTML = toastMarkup(title, message, error);
  const toastNode = node.firstElementChild;
  $("#toast-root").append(toastNode);
  setTimeout(() => {
    toastNode.classList.add("toast-out");
    setTimeout(() => toastNode.remove(), 180);
  }, 4500);
}
function setBackgroundInert(value) {
  ["#site-header", "#app", "#prototype-tools", "#route-panel"].forEach((selector) => {
    const node = $(selector);
    if (node) node.inert = value;
  });
}
function openModal(kind) {
  state.modalReturnFocus = document.activeElement;
  state.modal = kind;
  $("#modal-root").innerHTML = renderModal(kind);
  document.body.classList.add("scroll-lock");
  setBackgroundInert(true);
  setTimeout(() => $("#modal-root .modal .x")?.focus(), 0);
}
function closeModal() {
  state.modal = null;
  $("#modal-root").innerHTML = "";
  document.body.classList.remove("scroll-lock");
  setBackgroundInert(false);
  if (state.modalReturnFocus?.isConnected) state.modalReturnFocus.focus();
  state.modalReturnFocus = null;
}
function closeDrawers() {
  $("#drawer-root").innerHTML = "";
  state.routePanel = false;
  $("#route-panel")?.classList.remove("open");
  if ($("#route-panel")) $("#route-panel").hidden = true;
  setBackgroundInert(false);
  if (state.drawerReturnFocus?.isConnected) state.drawerReturnFocus.focus();
  state.drawerReturnFocus = null;
}
function openDrawer(markup) {
  state.drawerReturnFocus = document.activeElement;
  $("#drawer-root").innerHTML = markup;
  document.body.classList.add("scroll-lock");
  setBackgroundInert(true);
  setTimeout(() => $("#drawer-root .drawer button")?.focus(), 0);
}
function openFilters() {
  openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Фильтры"><div class="drawer-head row between"><h2>Фильтры</h2>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body">${filters()}</div><div class="drawer-foot row">${btn("Сбросить", { action: "reset-filters", cls: "secondary grow" })}${btn("Показать результаты", { action: "close-drawer", cls: "primary grow" })}</div></aside></div>`);
}
function openMobileMenu() {
  const role = ROLES[state.role];
  const groups = [
    ["Работа и услуги", [["/vacancies", "Вакансии и резюме", "briefcase", "Работа и проверенные специалисты"], ["/gigs", "Подработки и подмены", "zap", "Разовые смены рядом"], ["/orders", "Заявки автовладельцев", "clipboard", "Услуги по запросу клиента"]]],
    ["Бизнес и выгода", [["/suppliers", "Маркетплейс поставщиков", "store", "Товары и коллективные закупки"], ["/promos", "Кешбэк и акции", "ticket", "Скидки и персональные QR"], ["/calculator", "Калькулятор расхода", "calculator", "Материалы без перерасхода"], ["/analytics", "ГеоАналитика", "bot", "Спрос и конкуренты по районам"]]],
    ["Сообщество и обучение", [["/feed", "Лента и автоновости", "edit", "Опыт и новости индустрии"], ["/chats", "Профессиональные чаты", "chats", "Каналы по специализациям"], ["/messages", "Личные сообщения", "message", "Диалоги по работе и заказам"], ["/training", "Учебный центр", "graduation", "Курсы и сертификаты"], ["/events", "Мероприятия", "calendar", "Форумы и встречи"], ["/sous-map", "СОУС Карты", "map", "Компании и услуги на карте"]]],
  ];
  const active = (path) => state.path === path || (path !== "/" && state.path.startsWith(`${path}/`));
  openDrawer(`<div class="backdrop mobile-menu-backdrop" data-action="close-drawer"><aside class="drawer mobile-menu" role="dialog" aria-modal="true" aria-label="Меню платформы"><div class="mobile-menu-head"><a class="logo" href="#/" data-path="/"><img src="/public/logo.png" alt=""><span>СОУС</span></a>${btn("", { action: "close-drawer", cls: "icon-only secondary", iconName: "x", attrs: 'aria-label="Закрыть меню"' })}</div><div class="mobile-menu-account">${avatar(role.initials)}<div><b>${role.name}</b><span>${role.label} · документы проверены</span></div><button data-path="/dashboard" aria-label="Открыть кабинет">${icon("chevron")}</button></div><div class="mobile-menu-search">${icon("search")}<input type="search" placeholder="Найти раздел или функцию" aria-label="Поиск по меню" data-action="nav-search"></div><div class="mobile-menu-body">${groups.map(([label, items]) => `<section class="mobile-menu-group" data-nav-group><h2>${label}</h2><nav>${items.map(([path, title, ico, description]) => `<button data-path="${path}" data-nav-item class="${active(path) ? "active" : ""}"><span class="mobile-menu-icon">${icon(ico)}</span><span><b>${title}</b><small>${description}</small></span>${path === "/messages" ? '<i class="menu-unread">2</i>' : icon("chevron", "sm")}</button>`).join("")}</nav></section>`).join("")}<div class="mobile-menu-empty" data-nav-empty hidden>Ничего не найдено. Попробуйте другое название.</div></div><div class="mobile-menu-foot"><button data-action="theme">${icon(state.theme === "dark" ? "sun" : "moon")}<span>${state.theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span></button><button data-path="/notifications">${icon("bell")}<span>Уведомления</span><i class="menu-unread">2</i></button><button class="mobile-menu-login" data-path="/dashboard">Открыть личный кабинет ${icon("chevron", "sm")}</button></div></aside></div>`);
}
function submitModal() {
  const form = $("#active-modal-form");
  if (form && !form.reportValidity()) return;
  const submit = $("#modal-root [data-action='modal-submit']");
  if (!submit || submit.disabled) return;
  submit.disabled = true;
  const old = submit.innerHTML;
  submit.innerHTML = "Сохраняем…";
  setTimeout(() => {
    const completed = state.modal;
    closeModal();
    if (completed === "message.new") {
      state.conversation = "mike";
      navigate("/messages");
    }
    if (completed === "admin.decision") {
      adminTarget?.remove();
      adminTarget = null;
      updateAdminSelection();
    }
    const confirmations = {
      "admin.report-reply": ["Ответ отправлен", "Сообщение добавлено в историю жалобы."],
      "admin.decision": ["Решение сохранено", "Жалоба закрыта, результат записан в журнал."],
      "admin.report-restriction": ["Публикация ограничена", "Причина сохранена, ответственный получит уведомление."],
    };
    const confirmation = confirmations[completed] || ["Готово", `${completed || "Действие"}: данные сохранены в демонстрационном режиме.`];
    toast(...confirmation);
    if (submit) submit.innerHTML = old;
  }, 550);
}
function setCardVisibility(predicate) {
  let visible = 0;
  $$(".v-card").forEach((card) => {
    const matches = predicate(card);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  const count = $(".results-count strong");
  if (count) count.textContent = visible;
  $("#filtered-empty")?.remove();
  if (!visible && $(".results")) $(".results").insertAdjacentHTML("beforeend", emptyState("Ничего не найдено", "Попробуйте другую вкладку или сбросьте фильтры.", "reset-filters"));
  return visible;
}
function filterCatalog(form) {
  const data = new FormData(form);
  const query = String(data.get("q") || "").trim().toLocaleLowerCase("ru");
  const city = String(data.get("city") || $("[data-action='filter-city']")?.value || "Все города");
  const categories = $$("[data-action='category']:checked").map((input) => input.value.toLocaleLowerCase("ru"));
  const visible = setCardVisibility((card) => {
    const text = card.textContent.toLocaleLowerCase("ru");
    return (!query || text.includes(query)) && (city === "Все города" || text.includes(city.toLocaleLowerCase("ru"))) && (!categories.length || categories.some((category) => text.includes(category)));
  });
  toast("Фильтры применены", `${visible} результатов${city !== "Все города" ? ` · ${city}` : ""}.`);
}
function sortCatalog(el) {
  const list = $(".list");
  if (!list) return;
  const cards = $$(".v-card", list);
  cards.sort((a, b) => {
    if (el.value === "salary") return Number(b.dataset.salary || 0) - Number(a.dataset.salary || 0);
    if (el.value === "rating") return b.textContent.localeCompare(a.textContent, "ru", { numeric: true });
    return Number(a.dataset.itemId.localeCompare(b.dataset.itemId, "en", { numeric: true }));
  }).forEach((card) => list.append(card));
  toast("Сортировка изменена", "Карточки перестроены по выбранному параметру.");
}
function tabCatalog(el) {
  const key = el.dataset.tab;
  $$('[role="tab"]').forEach((tab) => tab.setAttribute("aria-selected", String(tab === el)));
  if (state.path === "/vacancies" && key === "specialists") return navigate("/specialists");
  if (state.path === "/gigs" && key === "executors") return navigate("/specialists");
  if (state.path === "/suppliers" && key === "requests") return navigate("/supply-requests");
  if (state.path === "/promos/my") {
    state.myPromoTab = key;
    return render();
  }
  if (state.path === "/gigs" && key === "urgent") return setCardVisibility((card) => card.textContent.includes("Срочно"));
  if (state.path === "/orders" && key === "urgent") return setCardVisibility((card) => card.textContent.includes("Срочно"));
  if (state.path === "/orders" && key === "premium") return setCardVisibility((card) => Number(card.dataset.salary || 0) >= 50000);
  if (state.path === "/suppliers" && key === "purchases") return setCardVisibility((card) => card.dataset.itemId.startsWith("suppliers:purchase-"));
  if (state.path === "/suppliers" && key === "all") return setCardVisibility(() => true);
  if (state.path === "/promos" && key === "cashback") return setCardVisibility((card) => card.textContent.toLocaleLowerCase("ru").includes("кешбэк"));
  if (state.path === "/promos" && key === "qr") return setCardVisibility((card) => card.textContent.includes("QR"));
  return setCardVisibility(() => true);
}
function paginate(el) {
  const page = Number(el.dataset.page || 1);
  $$(".v-card").forEach((card) => { card.hidden = Number(card.dataset.page) !== page; });
  $$('[data-action="page"]').forEach((button) => {
    button.classList.toggle("primary", button === el);
    button.classList.toggle("ghost", button !== el);
  });
  $(".results")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function recalculate() {
  const volume = Number($("[data-action='calc-volume']")?.value.replace(/\D/g, "") || 480);
  const ratio = $("[data-action='calc-ratio']:checked")?.value || "1:10";
  const divisor = Number(ratio.split(":")[1]) + 1;
  const concentrate = volume / divisor;
  const pricePerLitre = Number($("[data-action='calc-price']")?.value.replace(/\D/g, "") || 1250);
  const litres = $("#calc-litres");
  if (litres) litres.textContent = `${concentrate.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} мл`;
  const values = $$(".calc-result .info-item b");
  if (values[0]) values[0].textContent = `${volume.toLocaleString("ru-RU")} мл`;
  if (values[1]) values[1].textContent = `${(concentrate * pricePerLitre / 1000).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  if (values[2]) values[2].textContent = ratio;
}
function sendMessage(form, direct = false) {
  const data = new FormData(form);
  const text = String(data.get("text") || "").trim();
  if (!text && !state.attachmentDraft) return toast("Введите сообщение", "Пустое сообщение не отправлено.", true);
  const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (state.editingMessage) {
    const id = state.editingMessage.id;
    const message = [...state.chatMessages, ...state.directMessages].find((item) => item.id === id);
    if (message) { message.text = esc(text); message.edited = true; }
    else state.messageOverrides[id] = { text: esc(text), edited: true };
    toast("Сообщение изменено", "Новая версия уже видна в переписке.");
  } else {
    const item = {
      id: `msg-${Date.now()}`, text: esc(text), time: now, mine: true, author: "Вы", read: false,
      ...(state.replyTo ? { reply: { author: state.replyTo.author || "Участник", text: state.replyTo.text } } : {}),
      ...(state.attachmentDraft?.type === "image" || state.attachmentDraft?.type === "work" ? { image: true } : state.attachmentDraft ? { file: { name: state.attachmentDraft.name, meta: "Документ · готов к отправке" } } : {}),
    };
    if (direct) state.directMessages.push({ ...item, conversation: data.get("conversation") });
    else state.chatMessages.push({ ...item, channel: data.get("channel") });
  }
  state.editingMessage = null;
  state.replyTo = null;
  state.attachmentDraft = null;
  render();
  setTimeout(() => { const feed = $("#chat-feed"); if (feed) feed.scrollTop = feed.scrollHeight; }, 0);
}
function findMessage(id) {
  const stored = [...state.chatMessages, ...state.directMessages].find((message) => message.id === id);
  const dom = document.querySelector(`[data-message-id="${id}"]`);
  return {
    id, text: dom?.dataset.messageText || "Сообщение", mine: dom?.dataset.own === "true",
    ...stored, ...state.messageOverrides[id],
  };
}
function openMessageMenu(id) {
  const message = findMessage(id);
  openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Действия с сообщением"><div class="drawer-head row between"><div><h2>Сообщение</h2><p class="hint">Выберите действие</p></div>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body"><div class="callout mb-2">${esc(message.text)}</div><nav class="dash-nav"><button data-action="reply-message" data-message="${id}">${icon("message")} Ответить</button><button data-action="pin-message" data-message="${id}">${icon("bookmark")} Закрепить</button><button data-action="copy-message" data-message="${id}">${icon("file")} Копировать текст</button>${message.mine ? `<button data-action="edit-message" data-message="${id}">${icon("edit")} Изменить</button><button data-action="delete-message" data-message="${id}">${icon("trash")} Удалить</button>` : `<button data-modal="report.create">${icon("flag")} Пожаловаться</button>`}</nav></div></aside></div>`);
}
function openAttachMenu() {
  openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Прикрепить файл"><div class="drawer-head row between"><h2>Прикрепить</h2>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body"><nav class="dash-nav"><button data-action="attach-type" data-type="image">${icon("image")} Фото или видео</button><button data-action="attach-type" data-type="file">${icon("file")} Документ или PDF</button><button data-action="attach-type" data-type="work">${icon("briefcase")} Пример работы из портфолио</button></nav></div></aside></div>`);
}
function openEmojiPicker() {
  const emojis = ["👍", "❤️", "🔥", "👏", "😄", "🎉", "🤝", "✅", "👀", "💡", "🙏", "😮"];
  openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Выбрать эмодзи"><div class="drawer-head row between"><h2>Эмодзи</h2>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body"><div class="grid4">${emojis.map((emoji) => `<button class="btn secondary" style="font-size:24px" data-action="emoji-pick" data-emoji="${emoji}" aria-label="${emoji}">${emoji}</button>`).join("")}</div></div></aside></div>`);
}
function openThreadMenu() {
  openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Действия с перепиской"><div class="drawer-head row between"><h2>Переписка</h2>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body"><nav class="dash-nav"><button data-action="thread-mark-read">${icon("check")} Отметить прочитанным</button><button data-action="chat-mute">${icon("bell")} Отключить уведомления</button><button data-action="download">${icon("download")} Экспортировать историю</button><button data-modal="report.create">${icon("flag")} Пожаловаться</button></nav></div></aside></div>`);
}
function openChatInfo() {
  const type = state.path === "/chats" ? "channels" : "direct";
  if (window.matchMedia("(max-width: 1100px)").matches) {
    openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Информация о переписке"><div class="drawer-head row between"><h2>Подробнее</h2>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body">${chatInfoContent(state, type)}</div></aside></div>`);
  } else {
    state.chatInfoOpen = !state.chatInfoOpen;
    render();
  }
}

function filterAdminRows() {
  const query = $$('[data-action="admin-search"]').map((input) => input.value.trim()).filter(Boolean).at(-1)?.toLocaleLowerCase("ru") || "";
  const status = $("[data-action='admin-status']")?.value || "all";
  $$('[data-admin-row]').forEach((row) => {
    const queryMismatch = !!query && !(row.dataset.search || row.textContent).toLocaleLowerCase("ru").includes(query);
    const statusMismatch = status !== "all" && row.dataset.status !== status && !(status === "active" && row.dataset.status === "review");
    row.hidden = queryMismatch || statusMismatch;
  });
}
function updateAdminSelection() {
  const selected = $$('[data-action="admin-select"]:checked').length;
  const bar = $("#admin-bulk");
  if (bar) bar.hidden = selected === 0;
  const count = $("#admin-selected-count");
  if (count) count.textContent = String(selected);
}

const actions = {
  routes: () => { state.routePanel = !state.routePanel; state.protoOpen = false; render(); },
  prototype: () => { state.protoOpen = !state.protoOpen; render(); },
  theme: () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("sous-prototype-theme", state.theme);
    render();
    const menuTheme = $(".mobile-menu-foot [data-action='theme']");
    if (menuTheme) menuTheme.innerHTML = `${icon(state.theme === "dark" ? "sun" : "moon")}<span>${state.theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>`;
  },
  role: (el) => { state.role = el.dataset.role; state.dashboardTab = "overview"; render(); toast("Роль изменена", `Кабинет: ${ROLES[state.role].label}.`); },
  state: (el) => { state.uiState = el.dataset.state; state.protoOpen = false; render(); window.scrollTo(0, 0); },
  "reset-state": () => { state.uiState = "normal"; render(); },
  "mobile-menu": openMobileMenu,
  "close-drawer": (el, event) => { if (!el.classList.contains("backdrop") || event.target === el) { closeDrawers(); document.body.classList.remove("scroll-lock"); } },
  filters: openFilters,
  "modal-close": closeModal,
  "modal-submit": submitModal,
  backdrop: (el, event) => { if (event.target === el) closeModal(); },
  "reset-filters": () => { closeDrawers(); render(); toast("Фильтры сброшены", "Показаны все доступные варианты."); },
  tab: tabCatalog,
  sort: sortCatalog,
  page: paginate,
  search: () => {
    const input = $(".admin-content .toolbar input");
    const role = $(".admin-content .toolbar select")?.value || "Все роли";
    const query = String(input?.value || "").trim().toLocaleLowerCase("ru");
    $$(".admin-content tbody tr").forEach((row) => {
      row.hidden = (query && !row.textContent.toLocaleLowerCase("ru").includes(query)) || (role !== "Все роли" && !row.textContent.includes(role));
    });
  },
  favorite: (el) => {
    const id = el.dataset.id || `${state.path.split("/")[1]}:${state.path.split("/")[2]}`;
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    const active = state.favorites.has(id);
    el.classList.toggle("active", active);
    el.setAttribute("aria-pressed", String(active));
    toast(active ? "Добавлено в избранное" : "Удалено из избранного", active ? "Элемент доступен в кабинете клиента." : "Элемент удалён из сохранённого списка.");
  },
  like: (el) => {
    const active = el.classList.toggle("active");
    const count = el.textContent.match(/\d+/);
    if (count) {
      const next = Math.max(0, Number(count[0]) + (active ? 1 : -1));
      Array.from(el.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => { node.textContent = ` ${next}`; });
    }
  },
  share: async () => { try { await navigator.clipboard.writeText(location.href); } catch {} toast("Ссылка скопирована", "Можно отправить её коллегам."); },
  "post-menu": () => openModal("confirm.delete"),
  "dashboard-tab": (el) => { state.dashboardTab = el.dataset.tab; render(); },
  "management-filter": (el) => {
    $$(".management-filters button").forEach((button) => button.classList.toggle("active", button === el));
    const query = $(".management-search input")?.value.trim().toLocaleLowerCase("ru") || "";
    $$('[data-management-item]').forEach((item) => {
      const statusMismatch = el.dataset.filter !== "all" && item.dataset.status !== el.dataset.filter;
      item.hidden = statusMismatch || (!!query && !item.textContent.toLocaleLowerCase("ru").includes(query));
    });
  },
  "duplicate-item": () => toast("Черновик создан", "Публикация продублирована и готова к редактированию."),
  "management-menu": () => toast("Управление публикацией", "Доступны пауза, продление и архивирование."),
  "review-rules": () => toast("Проверенные отзывы", "Отзыв можно оставить только после подтверждённого заказа."),
  "home-roles": (el) => {
    const list = $(".home-role-list");
    const expanded = list?.classList.toggle("show-all");
    el.setAttribute("aria-expanded", String(!!expanded));
    const label = $("span", el);
    if (label) label.textContent = expanded ? "Показать только основную роль" : "Показать все пять ролей";
  },
  "home-manifesto": (el) => {
    const copy = $(".home-manifesto-copy");
    const expanded = copy?.classList.toggle("expanded");
    el.setAttribute("aria-expanded", String(!!expanded));
    const label = $("span", el);
    if (label) label.textContent = expanded ? "Свернуть манифест" : "Читать манифест полностью";
  },
  "profile-tab": (el) => { state.profileTab = el.dataset.tab; render(); },
  "profile-follow": (el) => {
    const id = el.dataset.profile;
    if (state.followedProfiles.has(id)) state.followedProfiles.delete(id); else state.followedProfiles.add(id);
    render();
    toast(state.followedProfiles.has(id) ? "Вы подписаны" : "Подписка отменена", state.followedProfiles.has(id) ? "Новые публикации появятся в вашей ленте." : "Профиль удалён из ваших подписок.");
  },
  "contact-reveal": (el) => {
    const id = el.dataset.profile;
    if (state.revealedContacts.has(id)) state.revealedContacts.delete(id); else state.revealedContacts.add(id);
    render();
  },
  "scroll-terms": () => { $(".promo-steps")?.scrollIntoView({ behavior: "smooth", block: "center" }); },
  "mobile-detail-action": () => {
    if (state.path === "/promos/promo-001") return navigate("/promos/cashback/promo-001");
    if (state.path.startsWith("/promos/")) return openModal("promo.qr");
    if (state.path.startsWith("/vacancies/")) return openModal("vacancy.apply");
    if (state.path.startsWith("/gigs/")) return openModal("gig.apply");
    return openModal("order.apply");
  },
  "admin-open": (el) => {
    const row = el.closest("[data-admin-row]");
    adminTarget = row;
    const cells = row ? $$("td", row).filter((cell) => cell.dataset.label && !["Выбрать", "Действия"].includes(cell.dataset.label)) : [];
    const name = row?.dataset.name || row?.querySelector(".admin-person-cell b, .admin-queue-copy b")?.textContent || cells[0]?.textContent.trim() || "Объект";
    const status = row?.dataset.status || "active";
    const statusBadge = row?.querySelector('td[data-label="Статус"] .badge, .admin-queue-copy .badge');
    const statusText = statusBadge?.textContent.trim() || (status === "pending" ? "На проверке" : status === "done" ? "Завершено" : "Активно");
    const tone = ["danger", "warn", "ok", "info"].find((item) => statusBadge?.classList.contains(item)) || (status === "pending" ? "warn" : "ok");
    const details = cells.length ? cells.map((cell) => {
      const content = cell.cloneNode(true);
      $$("button, a, input", content).forEach((node) => node.remove());
      return `<div class="callout admin-detail-cell"><small>${esc(cell.dataset.label)}</small><div>${content.innerHTML}</div></div>`;
    }).join("") : `<div class="callout">${esc(row?.querySelector(".admin-queue-copy p")?.textContent || "Объект ожидает действия модератора.")}</div>`;
    const isReport = state.path === "/admin/reports" || (state.path === "/admin" && state.adminTab === "reports");
    const primaryAction = status === "pending" || (isReport && status !== "done") ? btn(isReport ? "Отметить решённой" : "Подтвердить объект", { action: "admin-approve", cls: "primary block", iconName: "check", attrs: isReport ? 'data-result="resolved"' : "" }) : "";
    openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Карточка объекта"><div class="drawer-head row between"><div><h2>${esc(name)}</h2><p class="hint">Данные и действия модератора</p></div>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x", attrs: 'aria-label="Закрыть карточку"' })}</div><div class="drawer-body"><div class="row mb-2">${badge(statusText, tone)}<span class="hint">Изменения записываются в журнал</span></div><div class="stack">${details}</div><div class="divider"></div><div class="stack">${primaryAction}${btn(isReport ? "Ответить отправителю" : "Написать ответственному", { modal: isReport ? "admin.report-reply" : "message.new", cls: "secondary block", iconName: "message" })}${btn(isReport ? "Добавить решение" : "Изменить данные", { modal: isReport ? "admin.decision" : "admin.review", cls: "secondary block", iconName: "edit" })}${btn(isReport ? "Ограничить публикацию" : "Заблокировать", { modal: isReport ? "admin.report-restriction" : "admin.ban", cls: "ghost block danger-text", iconName: "lock" })}</div></div></aside></div>`);
  },
  "admin-tab": (el) => { state.adminTab = el.dataset.tab; if (state.path !== "/admin") navigate("/admin"); else render(); },
  "admin-menu": () => $("#admin-shell")?.classList.toggle("nav-open"),
  "admin-status": filterAdminRows,
  "admin-reset-filters": () => {
    $$('[data-action="admin-search"]').forEach((input) => { input.value = ""; });
    const status = $("[data-action='admin-status']"); if (status) status.value = "all";
    filterAdminRows();
  },
  "admin-select": updateAdminSelection,
  "admin-select-all": (el) => { $$('[data-admin-row]:not([hidden]) [data-action="admin-select"]').forEach((input) => { input.checked = el.checked; }); updateAdminSelection(); },
  "admin-clear-selection": () => { $$('[data-action="admin-select"], [data-action="admin-select-all"]').forEach((input) => { input.checked = false; }); updateAdminSelection(); },
  "admin-approve": (el) => {
    const row = el.closest("[data-admin-row]") || adminTarget;
    const resolved = el.dataset.result === "resolved";
    row?.remove();
    adminTarget = null;
    closeDrawers();
    document.body.classList.remove("scroll-lock");
    updateAdminSelection();
    toast(resolved ? "Жалоба решена" : "Объект подтверждён", "Решение записано в журнал, список обновлён.");
  },
  "admin-bulk-approve": () => {
    const selected = $$('[data-action="admin-select"]:checked');
    selected.forEach((input) => input.closest("[data-admin-row]")?.remove());
    const resolved = state.path === "/admin/reports" || (state.path === "/admin" && state.adminTab === "reports");
    updateAdminSelection();
    toast(resolved ? "Жалобы отмечены решёнными" : "Выбранные объекты подтверждены", `Обработано: ${selected.length}.`);
  },
  "admin-page-prev": () => toast("Вы на первой странице", "Предыдущих записей нет."),
  "admin-page-next": () => toast("Следующая страница", "В демонстрации показаны основные записи раздела."),
  "admin-notifications": () => openDrawer(`<div class="backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Уведомления администратора"><div class="drawer-head row between"><div><h2>Уведомления</h2><p class="hint">События, требующие внимания</p></div>${btn("", { action: "close-drawer", cls: "sm icon-only ghost", iconName: "x" })}</div><div class="drawer-body"><div class="stack">${[["Новая срочная жалоба", "Вакансия «Детейлер» · 12 минут назад", "danger"], ["Запрос прав на компанию", "Детейлинг Партнёр · 24 минуты назад", "warn"], ["Система работает стабильно", "Инцидентов за последние сутки нет", "ok"]].map(([title, text, tone]) => `<button class="card" data-action="close-drawer"><div class="row">${badge(tone === "danger" ? "Срочно" : tone === "warn" ? "Нужно проверить" : "Система", tone)}<span class="hint">Сейчас</span></div><h3 class="mt-2">${title}</h3><p class="small muted mb-0">${text}</p></button>`).join("")}</div></div></aside></div>`),
  "feed-tab": (el) => { state.feedTab = el.dataset.tab; render(); },
  "training-tab": (el) => { state.trainingTab = el.dataset.tab; render(); },
  "notifications-tab": (el) => { state.notificationsTab = el.dataset.tab; render(); },
  "scan-mode": (el) => { state.scanMode = el.dataset.tab; state.scanResult = false; render(); },
  "scan-reset": () => { state.scanResult = false; state.scanMode = "camera"; render(); },
  "camera-start": () => { toast("Камера активна", "Наведите рамку на QR. Через секунду покажем результат."); setTimeout(() => { state.scanResult = true; render(); }, 900); },
  "calc-mode": (el) => { state.calcMode = el.dataset.mode; render(); },
  "calc-body": (el) => { state.calcBody = el.dataset.body; render(); },
  "calc-zone": (el) => { if (state.calcZones.has(el.value)) state.calcZones.delete(el.value); else state.calcZones.add(el.value); render(); },
  "calc-product": (el) => { if (state.calcProducts.has(el.value)) state.calcProducts.delete(el.value); else state.calcProducts.add(el.value); render(); },
  "calc-rate": (el) => { state.calcRates[el.dataset.product] = Math.max(0, Number(el.value) || 0); render(); },
  "calc-ratio": (el) => { state.calcRatio = `1:${Math.max(1, Number(el.value) || 1)}`; render(); },
  "calc-equipment": (el) => { state.calcEquipment = el.dataset.equipment; state.calcRatio = el.dataset.ratio; render(); },
  "calc-period": (el) => { state.calcPeriod = el.dataset.period; render(); },
  "calc-fleet-product": (el) => { state.fleetProduct = el.value; render(); },
  "calc-fleet-daily": (el) => { state.fleetDaily[el.dataset.body] = Math.max(0, Number(el.value) || 0); render(); },
  "calc-fleet-rate": (el) => { state.fleetRates[el.dataset.body] = Math.max(0, Number(el.value) || 0); render(); },
  "calc-preset": (el) => {
    const preset = CALC_PRESETS[el.dataset.preset];
    if (!preset) return;
    state.calcBody = preset.body; state.calcZones = new Set(preset.zones); state.calcProducts = new Set(preset.products);
    render(); toast("Шаблон применён", `${preset.name}: кузов, зоны и продукты обновлены.`);
  },
  "calc-reset": () => {
    state.calcBody = "crossover"; state.calcZones = new Set(["hood", "roof", "doors", "bumpers", "fenders", "glass"]);
    state.calcProducts = new Set(["active-foam", "second-phase-shampoo", "crystal-glass"]); state.calcRates = {}; state.calcRatio = "1:8"; state.calcEquipment = "foam_kit";
    render(); toast("Расчёт сброшен", "Восстановлены стартовые значения.");
  },
  "calc-summary": () => $("#calc-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
  "map-city": (el) => { state.mapCity = el.value; state.mapDetailClosed = false; render(); },
  "map-category": (el) => { state.mapCategory = el.dataset.category; state.mapDetailClosed = false; render(); },
  "map-verified": () => { state.mapVerified = !state.mapVerified; render(); },
  "map-select": (el) => { state.mapSelected = el.dataset.company; state.mapDetailClosed = false; state.mapView = "map"; render(); },
  "map-view": (el) => { state.mapView = el.dataset.view; render(); },
  "map-locate": () => { state.mapCity = "Москва"; state.mapDetailClosed = false; render(); toast("Показаны точки рядом", "Выбрана Москва. Точный радиус можно уточнить после доступа к геолокации."); },
  "map-reset": () => { state.mapCity = "Все города"; state.mapCategory = "all"; state.mapQuery = ""; state.mapVerified = false; state.mapZoom = 1; state.mapDetailClosed = false; render(); },
  "map-zoom-in": () => { state.mapZoom = Math.min(1.8, state.mapZoom + .2); render(); },
  "map-zoom-out": () => { state.mapZoom = Math.max(1, state.mapZoom - .2); render(); },
  "map-reset-zoom": () => { state.mapZoom = 1; render(); },
  "map-close-detail": () => { state.mapDetailClosed = true; render(); },
  "map-phone": (el) => { const id = `map:${el.dataset.company}`; if (state.revealedContacts.has(id)) state.revealedContacts.delete(id); else state.revealedContacts.add(id); render(); },
  "map-route": async (el) => { try { await navigator.clipboard.writeText(el.dataset.address); } catch {} toast("Адрес готов для маршрута", `${el.dataset.address} · скопирован в буфер обмена.`); },
  "analytics-city": (el) => { state.analyticsCity = el.value; render(); },
  "analytics-district": (el) => { state.analyticsDistrict = el.dataset.district || el.value; toast("Срез обновлён", `${state.analyticsCity} · ${state.analyticsDistrict}.`); },
  "chat-channel": (el) => { state.chatChannel = el.dataset.channel; state.chatThreadOpen = true; state.chatSearchOpen = false; render(); },
  conversation: (el) => { state.conversation = el.dataset.conversation; state.chatThreadOpen = true; state.chatSearchOpen = false; render(); },
  "chat-back": () => { state.chatThreadOpen = false; render(); },
  "chat-info": openChatInfo,
  "thread-menu": openThreadMenu,
  "channel-create": () => openModal("channel.create"),
  "new-dialog": () => openModal("message.new"),
  "chat-filter": (el) => {
    const filter = el.dataset.filter;
    $$(".messenger-filters button").forEach((button) => { button.classList.toggle("active", button === el); button.setAttribute("aria-selected", String(button === el)); });
    $$(".messenger-item").forEach((item) => { item.hidden = filter === "unread" ? Number(item.dataset.unread) === 0 : filter === "muted" ? item.dataset.muted !== "true" : false; });
  },
  "chat-search": (el) => {
    const query = el.value.trim().toLocaleLowerCase("ru");
    $$(".messenger-item").forEach((item) => { item.hidden = !!query && !item.textContent.toLocaleLowerCase("ru").includes(query); });
  },
  "thread-search-open": () => { closeDrawers(); state.chatSearchOpen = true; render(); setTimeout(() => $(".thread-search input")?.focus(), 0); },
  "chat-search-close": () => { state.chatSearchOpen = false; render(); },
  "thread-search": (el) => {
    const query = el.value.trim().toLocaleLowerCase("ru");
    let count = 0;
    $$(".chat-message").forEach((message) => {
      const matches = !query || message.dataset.messageText.toLocaleLowerCase("ru").includes(query);
      message.hidden = !matches;
      if (matches) count += 1;
    });
    if ($("#thread-search-count")) $("#thread-search-count").textContent = query ? `${count} совпадений` : "Все сообщения";
  },
  "message-menu": (el) => openMessageMenu(el.dataset.message),
  react: (el) => {
    const active = el.classList.toggle("active");
    const counter = $("b", el);
    if (counter) counter.textContent = Math.max(0, Number(counter.textContent) + (active ? 1 : -1));
  },
  "pinned-jump": (el) => { const target = document.getElementById(el.dataset.message); target?.scrollIntoView({ behavior: "smooth", block: "center" }); target?.classList.add("highlight"); setTimeout(() => target?.classList.remove("highlight"), 1200); },
  "reply-jump": () => toast("Исходное сообщение", "Прокрутили к сообщению, на которое был дан ответ."),
  "load-older": () => {
    const item = { id: `older-${Date.now()}`, author: "СОУС", initials: "С", text: "Более ранняя часть истории загружена. Сохраняем позицию чтения и контекст.", time: "12:12", mine: false };
    if (state.path === "/chats") state.chatMessages.unshift({ ...item, channel: state.chatChannel });
    else state.directMessages.unshift({ ...item, conversation: state.conversation });
    render();
    toast("История загружена", "Более ранние сообщения добавлены без сброса переписки.");
  },
  "reply-message": (el) => { state.replyTo = findMessage(el.dataset.message); closeDrawers(); render(); setTimeout(() => $(".chat-composer textarea")?.focus(), 0); },
  "reply-cancel": () => { state.replyTo = null; render(); },
  "pin-message": (el) => { closeDrawers(); toast("Сообщение закреплено", "Оно доступно в верхней панели переписки."); },
  "copy-message": async (el) => { try { await navigator.clipboard.writeText(findMessage(el.dataset.message).text); } catch {} closeDrawers(); toast("Текст скопирован", "Сообщение скопировано в буфер обмена."); },
  "edit-message": (el) => {
    const message = findMessage(el.dataset.message);
    state.editingMessage = message;
    closeDrawers(); render();
    const input = $(".chat-composer textarea");
    if (input) { input.value = message.text; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); }
  },
  "delete-message": (el) => {
    const id = el.dataset.message;
    state.chatMessages = state.chatMessages.filter((message) => message.id !== id);
    state.directMessages = state.directMessages.filter((message) => message.id !== id);
    state.deletedMessageIds.add(id);
    closeDrawers(); render(); toast("Сообщение удалено", "В переписке показано обновлённое состояние.");
  },
  "attach-menu": openAttachMenu,
  "attach-type": (el) => {
    const type = el.dataset.type;
    state.attachmentDraft = { type, name: type === "image" ? "Фото результата.jpg" : type === "work" ? "Работа из портфолио.jpg" : "Документ.pdf" };
    closeDrawers(); render(); toast("Вложение готово", "Проверьте его перед отправкой.");
  },
  "attachment-cancel": () => { state.attachmentDraft = null; render(); },
  "emoji-open": openEmojiPicker,
  "emoji-pick": (el) => { closeDrawers(); const input = $(".chat-composer textarea"); if (input) { input.value += el.dataset.emoji; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); } },
  "voice-record": () => { state.voiceRecording = true; render(); },
  "voice-cancel": () => { state.voiceRecording = false; render(); },
  "voice-stop": () => {
    const item = { id: `voice-${Date.now()}`, text: "", voice: "00:05", time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), mine: true, author: "Вы", read: false };
    if (state.path === "/chats") state.chatMessages.push({ ...item, channel: state.chatChannel });
    else state.directMessages.push({ ...item, conversation: state.conversation });
    state.voiceRecording = false; render(); toast("Голосовое отправлено", "Длительность: 5 секунд.");
  },
  "voice-play": (el) => { el.classList.toggle("playing"); },
  "info-tab": (el) => {
    const root = el.closest(".chat-info-content");
    $$(".chat-info-tabs button", root).forEach((button) => button.classList.toggle("active", button === el));
    $$("[data-info-panel]", root).forEach((panel) => { panel.hidden = panel.dataset.infoPanel !== el.dataset.info; });
  },
  "request-access": (el) => { el.disabled = true; el.querySelector("span").textContent = "Запрос отправлен"; toast("Запрос отправлен", "Модератор проверит вашу роль и доступ."); },
  "thread-mark-read": () => { closeDrawers(); toast("Переписка прочитана", "Счётчик непрочитанных обновлён."); },
  attach: () => toast("Файл прикреплён", "В прототипе добавлен демонстрационный документ."),
  "user-menu": () => openModal("confirm.delete"),
  "push-toggle": (el) => { el.querySelector("span").textContent = el.querySelector("span").textContent.includes("включены") ? "Push выключены" : "Push включены"; },
  "read-all": () => { state.notificationsReadAll = true; state.notificationsTab = "all"; render(); toast("Все прочитано", "Непрочитанных уведомлений больше нет."); },
  notification: (el) => navigate({ vacancy: "/vacancies/vac-022", message: "/messages", promo: "/promos/my", training: "/training" }[el.dataset.type] || "/notifications"),
  "event-register": (el) => { const labels = $$('[data-action="event-register"] span'); labels.forEach((span) => { span.textContent = "Вы записаны — отменить запись"; }); el.classList.remove("primary"); toast("Вы записаны", "Подтверждение и напоминание отправлены."); },
  "choose-supplier": (el) => { el.className = "btn secondary"; el.querySelector("span").textContent = "Выбран"; toast("Поставщик выбран", "Запрос отмечен как выполненный."); },
  unblock: (el) => { el.closest(".card").remove(); toast("Пользователь разблокирован", "Он снова может писать вам и видеть публикации."); },
  refresh: () => toast("Данные обновлены", "Показана актуальная информация."),
  print: () => window.print(),
  external: () => toast("Внешняя ссылка", "В рабочей версии откроется новая вкладка сообщества."),
  play: () => toast("Видео запущено", "Демонстрация видеоплеера учебного центра."),
  download: () => toast("Файл подготовлен", "Скачивание начнётся в рабочей версии."),
  "gallery-prev": () => toast("Фото 6 из 6", "Включён циклический просмотр галереи."),
  "gallery-next": () => toast("Фото 2 из 6", "Следующая фотография."),
  "map-select": (el) => { closeModal(); render(); toast("Город выбран", `${el.dataset.city}: маркеры и каталог обновлены.`); },
  "map-reset": () => toast("Ракурс восстановлен", "Показаны все компании на карте."),
  "resume-step": (el) => { state.resumeStep = el.dataset.step; render(); },
  "resume-prev": () => { const steps = ["who", "where", "terms", "portfolio", "contacts"]; state.resumeStep = steps[Math.max(0, steps.indexOf(state.resumeStep) - 1)]; render(); },
  "resume-next": () => { const steps = ["who", "where", "terms", "portfolio", "contacts"]; state.resumeStep = steps[Math.min(4, steps.indexOf(state.resumeStep) + 1)]; render(); toast("Сохранено", "Изменения резюме сохранены автоматически."); },
  "auth-step": (el) => { state.authStep = el.dataset.step; render(); },
  "register-role": (el) => { state.registerRole = el.dataset.role || el.value; render(); },
  "register-next": () => { state.registerStep = "account"; render(); },
  "register-back": (el) => { state.registerStep = { verify: "profile", profile: "account", account: "role" }[el.dataset.step] || "role"; render(); },
  "register-edit-role": () => { state.registerStep = "role"; render(); },
  "register-edit-account": () => { state.registerStep = "account"; render(); },
  "password-toggle": (el) => {
    const input = $(el.dataset.target || "#register-password");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    el.setAttribute("aria-label", input.type === "password" ? "Показать пароль" : "Скрыть пароль");
    el.innerHTML = icon(input.type === "password" ? "eye" : "eyeoff");
  },
  "resend-code": () => toast("Код отправлен", "Новый код: 1234."),
  "close-toast": (el) => el.closest(".toast")?.remove(),
  "promo-reissue": () => toast("QR перевыпущен", "Новый токен действует следующие 24 часа."),
  "share-qr": () => openModal("promo.qr"),
  "reset-state": () => { state.uiState = "normal"; render(); },
  approve: () => toast("Документы подтверждены", "Пользователь получил уведомление."),
  comment: () => toast("Комментарии", "Открыта ветка комментариев публикации."),
  "post-input": () => openModal("post.create"),
};

document.addEventListener("click", (event) => {
  const pathLink = event.target.closest("[data-path]");
  if (pathLink) {
    event.preventDefault();
    navigate(pathLink.dataset.path);
    return;
  }
  const modalLink = event.target.closest("[data-modal]");
  if (modalLink) {
    event.preventDefault();
    closeDrawers();
    openModal(modalLink.dataset.modal);
    return;
  }
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "search" && el.tagName === "FORM") return;
  if (["sort", "filter-city", "category", "calc-ratio", "calc-volume", "calc-price", "calc-zone", "analytics-city", "analytics-district"].includes(action) && ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) return;
  if (actions[action]) {
    if (!["FORM", "INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) event.preventDefault();
    actions[action](el, event);
  }
  if (action === "category") filterCatalog($(".searchbar") || document.createElement("form"));
});

document.addEventListener("change", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "registration-document") {
    const file = el.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { el.value = ""; return toast("Файл слишком большой", "Максимальный размер — 10 МБ.", true); }
    const card = el.closest(".registration-document");
    card?.classList.add("has-file");
    const hint = card?.querySelector("small");
    if (hint) hint.textContent = `${file.name} · ${(file.size / 1024 / 1024).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} МБ`;
    const actionLabel = card?.querySelector("i");
    if (actionLabel) actionLabel.textContent = "Заменить";
    return;
  }
  if (actions[action] && !["role", "state", "register-role"].includes(action)) actions[action](el, event);
  if (action === "filter-city") filterCatalog($(".searchbar"));
  if (action === "calc-input") recalculate();
});

document.addEventListener("input", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "chat-search" || action === "thread-search") actions[action](el, event);
  if (action === "management-search") {
    const query = el.value.trim().toLocaleLowerCase("ru");
    const filter = $(".management-filters button.active")?.dataset.filter || "all";
    $$('[data-management-item]').forEach((item) => {
      const statusMismatch = filter !== "all" && item.dataset.status !== filter;
      item.hidden = statusMismatch || (!!query && !item.textContent.toLocaleLowerCase("ru").includes(query));
    });
  }
  if (action === "register-password") {
    state.registerDraft.password = el.value;
    const checks = [el.value.length >= 8, /[a-zа-я]/.test(el.value) && /[A-ZА-Я]/.test(el.value), /\d/.test(el.value), /[^A-Za-zА-Яа-я0-9]/.test(el.value)];
    const level = checks.filter(Boolean).length;
    const meter = $("[data-password-strength]");
    if (meter) meter.dataset.level = String(level);
    const hint = $("[data-password-hint]");
    if (hint) hint.textContent = ["Используйте буквы, цифры и символ. Не повторяйте пароль от других сервисов.", "Добавьте длину, цифры и разный регистр букв.", "Добавьте цифру или символ для усиления.", "Хороший пароль. Добавьте символ для максимальной надёжности.", "Надёжный пароль."][level];
  }
  if (action === "admin-search") {
    $$('[data-action="admin-search"]').forEach((input) => { if (input !== el) input.value = el.value; });
    filterAdminRows();
  }
  if (action === "map-search") {
    state.mapQuery = el.value;
    const query = el.value.trim().toLocaleLowerCase("ru");
    let visible = 0;
    $$('[data-map-item]').forEach((item) => {
      item.hidden = !!query && !item.dataset.search.toLocaleLowerCase("ru").includes(query);
      if (!item.hidden) visible += 1;
    });
    $$('[data-map-pin]').forEach((pin) => { pin.hidden = !!query && !pin.dataset.search.toLocaleLowerCase("ru").includes(query); });
    const count = $("#map-result-count b");
    if (count) count.textContent = String(visible);
    const listCount = $("#map-list-count");
    if (listCount) listCount.textContent = String(visible);
  }
  if (action === "nav-search") {
    const query = el.value.trim().toLocaleLowerCase("ru");
    let visible = 0;
    $$('[data-nav-item]').forEach((item) => {
      item.hidden = !!query && !item.textContent.toLocaleLowerCase("ru").includes(query);
      if (!item.hidden) visible += 1;
    });
    $$('[data-nav-group]').forEach((group) => { group.hidden = !$$('[data-nav-item]:not([hidden])', group).length; });
    const empty = $("[data-nav-empty]");
    if (empty) empty.hidden = visible > 0;
  }
  if (action === "composer-input") {
    const form = el.closest("[data-composer]");
    form?.classList.toggle("has-text", !!el.value.trim() || !!state.attachmentDraft);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  event.preventDefault();
  if (form.matches(".searchbar")) return filterCatalog(form);
  const kind = form.dataset.form;
  if (!kind) return;
  const data = new FormData(form);
  switch (kind) {
    case "chat.send": return sendMessage(form, false);
    case "message.send": return sendMessage(form, true);
    case "auth.login": state.authStep = "code"; return render();
    case "auth.code": state.authStep = "phone"; toast("Вы вошли", "Устройство подтверждено."); return navigate("/dashboard");
    case "auth.forgot": state.authStep = "phone"; render(); return toast("Инструкция отправлена", "Проверьте СМС или почту для восстановления.");
    case "employee.phone": state.authStep = "code"; return render();
    case "employee.code": state.authStep = "phone"; toast("Кабинет компании открыт", "Вы вошли как сотрудник Shine&Go."); return navigate("/dashboard");
    case "register.account":
      if (!form.reportValidity()) return;
      state.registerDraft = { name: String(data.get("name") || ""), phone: String(data.get("phone") || ""), email: String(data.get("email") || ""), password: String(data.get("password") || "") };
      state.registerStep = "profile"; render(); return;
    case "register.profile":
      if (!form.reportValidity()) return;
      state.registerProfile = Object.fromEntries(data.entries());
      state.registerStep = "verify"; render(); return toast("Код отправлен", "Профиль сохранён. В демонстрации используйте 1234.");
    case "register.verify":
      if (String(data.get("code") || "") !== "1234") return toast("Неверный код", "Введите 1234 для демонстрационного сценария.", true);
      state.role = state.registerRole; state.dashboardTab = "overview"; state.registerStep = "success"; render(); return;
    case "auth.register": state.role = String(data.get("role") || state.registerRole); state.registerRole = state.role; state.dashboardTab = "overview"; toast("Аккаунт создан", `Добро пожаловать, роль: ${ROLES[state.role].label}.`); return navigate("/dashboard");
    case "resume.create": state.registerRole = "worker"; return navigate("/register");
    case "supply-request.create": toast("Запрос опубликован", "Поставщики получили уведомление."); return navigate("/supply-requests/request-001");
    case "purchase.create": toast("Закупка создана", "Теперь студии могут присоединиться."); return navigate("/suppliers");
    case "scan.manual": state.scanResult = true; return render();
    case "certificate.verify": return navigate(`/training/certificate/${String(data.get("cert") || "UC-2026-001").toUpperCase()}`);
    case "analytics.chat": toast("AI отвечает", "Для вашего района рекомендуем средний чек 12 400 ₽ и акцент на химчистку."); return;
    case "contact.send": return toast("Сообщение отправлено", "Команда поддержки ответит в течение рабочего дня.");
    case "newsletter": return toast("Вы подписаны", "Новости индустрии будут приходить на указанный email.");
    case "cashback.receipt": return toast("Чек отправлен", "Проверка займёт до трёх рабочих дней.");
    case "profile.save": return toast("Профиль сохранён", "Изменения уже видны в вашем кабинете.");
    default: return toast("Форма отправлена", `${kind}: данные сохранены в демонстрационном режиме.`);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && event.target.matches('[data-action="composer-input"]')) {
    event.preventDefault();
    event.target.form?.requestSubmit();
    return;
  }
  if (event.key === "Escape") {
    if (state.modal) closeModal();
    else closeDrawers();
    document.body.classList.remove("scroll-lock");
    return;
  }
  if (event.key !== "Tab" || (!state.modal && !$("#drawer-root .drawer"))) return;
  const container = state.modal ? $("#modal-root .modal") : $("#drawer-root .drawer");
  if (!container) return;
  const focusable = $$("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])", container)
    .filter((node) => node.getClientRects().length > 0 && node.getAttribute("aria-hidden") !== "true");
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
});

state.path = currentPath();
syncQuery();
render();
