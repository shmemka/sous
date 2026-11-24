import { CITIES, HERO_IMAGES } from "./data.mjs";

export const esc = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>',
  store: '<path d="M3 9l2-5h14l2 5M5 13v8h14v-8M9 21v-6h6v6M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
  ticket: '<path d="M3 9V5h18v4a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6ZM13 5v14"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  graduation: '<path d="m2 10 10-5 10 5-10 5L2 10ZM6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>',
  chats: '<path d="M21 11a7 7 0 0 1-7 7H9l-5 3v-6a7 7 0 0 1-1-4 7 7 0 0 1 7-7h4a7 7 0 0 1 7 7Z"/><path d="M8 8h8M8 12h5"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6ZM9 3v15M15 6v15"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="m18 6-12 12M6 6l12 12"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A11 11 0 0 1 12 4c6 0 10 8 10 8a17 17 0 0 1-2 3M6.6 6.6C3.7 8.6 2 12 2 12s4 8 10 8a10 10 0 0 0 4-.8"/>',
  upload: '<path d="M12 16V3M7 8l5-5 5 5M4 15v5h16v-5"/>',
  download: '<path d="M12 3v13M7 11l5 5 5-5M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  flag: '<path d="M5 22V4M5 4h12l-2 5 2 5H5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5M6.1 8a7 7 0 0 1 11.7-1L20 12M4 12l2.3 5a7 7 0 0 0 11.7-1"/>',
  qr: '<rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><path d="M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2zM11 11h2v2h-2z"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="4"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h6"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L3 18l3 3 9.3-9.3a4 4 0 0 0 5-5L18 9l-2.4-2.4 2.3-2.3a4 4 0 0 0-3.2 2Z"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  bot: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  "bell-off": '<path d="m2 2 20 20M8.5 8.5A6 6 0 0 1 18 8c0 7 3 7 3 9H9M6.3 6.3C6.1 7 6 7.5 6 8c0 7-3 7-3 9h4M10 21h4"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
};

export const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
export const badge = (text, tone = "") => `<span class="badge ${tone}">${text}</span>`;
export const btn = (label, { action = "", path = "", modal = "", iconName = "", cls = "", attrs = "" } = {}) => {
  const data = path ? `data-path="${path}"` : modal ? `data-modal="${modal}"` : action ? `data-action="${action}"` : "";
  const type = attrs.includes('type="submit"') ? "submit" : "button";
  const otherAttrs = attrs.replace('type="submit"', "").trim();
  const accessibleName = !label && !otherAttrs.includes("aria-label") ? `aria-label="${action || modal || path || "Действие"}"` : "";
  return `<button type="${type}" class="btn ${cls}" ${data} ${accessibleName} ${otherAttrs}>${iconName ? icon(iconName) : ""}<span>${label}</span></button>`;
};
export const linkBtn = (label, path, { iconName = "", cls = "" } = {}) => `<a class="btn ${cls}" href="#${path}" data-path="${path}">${iconName ? icon(iconName) : ""}<span>${label}</span></a>`;
export const tabs = (items, active, action = "tab") => `<div class="tabs-scroll"><div class="tabs" role="tablist">${items.map(([key, label, count]) => `<button type="button" role="tab" data-action="${action}" data-tab="${key}" aria-selected="${key === active}">${label}${count !== undefined ? `<span class="cnt">${count}</span>` : ""}</button>`).join("")}</div></div>`;
export const select = (options, value, attrs = "") => `<select class="select" ${attrs}>${options.map((item) => { const [v, l] = Array.isArray(item) ? item : [item, item]; return `<option value="${esc(v)}" ${v === value ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
let fieldSequence = 0;
export const field = (label, control, { full = false, hint = "" } = {}) => {
  const id = `field-${++fieldSequence}`;
  let html = control.trim().replace(/<(input|select|textarea)\b/, `<$1 id="${id}"`);
  if (!/\bname=/.test(html)) html = html.replace(/<(input|select|textarea)\b/, `<$1 name="${id}"`);
  if (label.includes("*") && !/\brequired\b/.test(html)) html = html.replace(/<(input|select|textarea)\b/, `<$1 required aria-required="true"`);
  if (hint) html = html.replace(/<(input|select|textarea)\b/, `<$1 aria-describedby="${id}-hint"`);
  return `<div class="fl ${full ? "full" : ""}"><label for="${id}">${label}</label>${html}${hint ? `<span class="hint" id="${id}-hint">${hint}</span>` : ""}</div>`;
};
export const input = (label, { placeholder = "", value = "", type = "text", full = false, attrs = "", hint = "" } = {}) => field(label, `<input class="input" type="${type}" placeholder="${esc(placeholder)}" value="${esc(value)}" ${attrs}>`, { full, hint });
export const textarea = (label, { placeholder = "", value = "", full = true, attrs = "" } = {}) => field(label, `<textarea class="textarea" placeholder="${esc(placeholder)}" ${attrs}>${esc(value)}</textarea>`, { full });
export const avatar = (text, cls = "") => `<span class="avatar ${cls}" aria-hidden="true">${esc(text)}</span>`;

export function statsLine(stats = []) {
  return `<ul class="stats-line">${stats.map(([value, label, accent]) => `<li><b class="${accent ? "accent" : ""}">${value}</b><span>${label}</span></li>`).join("")}</ul>`;
}

export function hero({ section = "", title, lead = "", stats = [], image = "06", tabsHtml = "", actions = "", search = false, back = "", compact = false }) {
  const heroClass = image ? "hero photo" : "pagehead";
  const style = image ? `style="--hero-art:url('/public/images/heroes/${image}-dark.webp')"` : "";
  return `<section class="${heroClass}" ${style} data-hero-image="${image}"><div class="wrap ${compact ? "hero-inner compact" : "hero-inner"}">
    ${back || tabsHtml || actions ? `<div class="hero-top">${back || tabsHtml || "<span></span>"}<div class="row">${actions}</div></div>` : ""}
    ${section ? `<div class="eyebrow">${section}</div>` : ""}<h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}
    ${search ? `<form class="searchbar" data-action="search"><div class="sb-field sb-q">${icon("search")}<input name="q" aria-label="Поиск" placeholder="Должность, услуга или компания" value=""></div><div class="sb-field sb-city">${icon("pin")}${select(CITIES, CITIES[0], 'name="city" aria-label="Город"')}</div>${btn("Найти", { cls: "primary", attrs: 'type="submit"' })}</form>` : ""}
    ${statsLine(stats)}
  </div></section>`;
}

export function filters({ city = "Все города", categories = ["Полировка", "Химчистка", "Керамика", "PPF"], salary = true } = {}) {
  return `<aside class="filters" aria-label="Фильтры"><div class="filters-head"><h2>Фильтры</h2><button class="linkbtn" data-action="reset-filters">Сбросить</button></div>
    <fieldset class="fsec"><legend>Город</legend>${select(CITIES, city, 'data-action="filter-city" aria-label="Фильтр по городу"')}</fieldset>
    <fieldset class="fsec"><legend>Специализация</legend><div class="check-list">${categories.map((item, i) => `<label class="check"><input class="cb" type="checkbox" data-action="category" value="${item}"><span>${item}</span><span class="c">${12 - i * 2}</span></label>`).join("")}</div></fieldset>
    ${salary ? `<fieldset class="fsec"><legend>Условия</legend><label class="check"><input class="cb" type="checkbox"><span>Документы проверены</span></label><label class="check"><input class="cb" type="checkbox"><span>С предложением цены</span></label></fieldset>` : ""}
  </aside>`;
}

export function cards(items, type = "vacancies") {
  if (!items.length) return emptyState("Ничего не найдено", "Измените запрос или сбросьте фильтры.", "reset-filters");
  return `<div class="list">${items.map((item, index) => `<article class="v-card" data-item-id="${type}:${item.id}" data-salary="${item.salary.replace(/\D/g, "")}" data-page="${Math.floor(index / 10) + 1}" ${index >= 10 ? "hidden" : ""}><span class="logo-tile">${esc(item.company.split(" ").map((part) => part[0]).join("").slice(0, 2))}</span><div class="v-main">
    <div class="row mb-1">${item.tags.map((tag, i) => badge(esc(tag), i === 0 && tag === "Срочно" ? "danger" : i === 0 ? "ok" : "")).join("")}</div>
    <h2 class="v-title"><a href="#/${type}/${item.id}" data-path="/${type}/${item.id}">${esc(item.title)}</a></h2><div class="company"><span class="name">${esc(item.company)}</span>${badge("Проверено", "ok")}</div>
    <div class="meta"><span class="mi">${icon("pin", "sm")}${esc(item.city)}</span><span class="mi">${icon("clock", "sm")}${esc(item.schedule)}</span><span>${esc(item.experience)}</span></div><div class="bens">${esc(item.description)}</div></div>
    <div class="v-side"><div class="money">${esc(item.salary)}<small>${type === "specialists" ? "ожидания" : type === "gigs" ? "за смену" : type === "promos" ? "выгода" : "предложение"}</small></div><div class="actions">
      ${btn("", { action: "favorite", iconName: "heart", cls: "sm icon-only ghost", attrs: `aria-label="В избранное" data-id="${type}:${item.id}"` })}
      ${linkBtn(type === "specialists" || type === "suppliers" || type === "companies" ? "Открыть" : type === "promos" ? "Активировать" : "Подробнее", `/${type}/${item.id}`, { cls: "sm secondary" })}
    </div></div></article>`).join("")}</div>`;
}

export function catalogPage({ section, title, lead, type, items, activeTab = "all", tabsItems = [["all", "Все"]], stats = [], createLabel = "", createModal = "", filtersConfig = {} }) {
  const pages = Math.ceil(items.length / 10);
  return `${hero({ section, title, lead, image: HERO_IMAGES[type] || "06", stats, tabsHtml: tabs(tabsItems, activeTab), actions: createLabel ? btn(createLabel, { modal: createModal, iconName: "plus", cls: "primary" }) : "", search: true })}
    <div class="wrap catalog">${filters(filtersConfig)}<section class="results"><div class="toolbar"><p class="results-count">Найдено <strong>${items.length}</strong></p>${btn("Фильтры", { action: "filters", iconName: "filter", cls: "sm secondary filters-toggle" })}<div class="toolbar-right">${select([["date", "Сначала новые"], ["rating", "По рейтингу"], ["salary", "По предложению"]], "date", 'data-action="sort" aria-label="Сортировка"')}</div></div>${cards(items, type)}${pages > 1 ? `<div class="row mt-3" style="justify-content:center">${Array.from({ length: pages }, (_, i) => btn(String(i + 1), { action: "page", cls: `sm ${i === 0 ? "primary" : "ghost"}`, attrs: `data-page="${i + 1}"` })).join("")}</div>` : ""}</section></div>${footer()}`;
}

export function detailPage({ back, backPath, section, title, subtitle, stats = [], badges = [], actions = "", content = "", rail = "" }) {
  return `<div class="wrap"><div class="detail-hero"><a class="breadcrumbs" href="#${backPath}" data-path="${backPath}">${icon("back", "sm")} ${back}</a><div class="eyebrow">${section}</div><h1 class="pagehead h1">${title}</h1><p class="lead">${subtitle}</p><div class="row">${badges.map((item) => badge(item)).join("")}</div><div class="detail-stats">${stats.map(([value, label, accent]) => `<div class="detail-stat"><b class="${accent ? "price" : ""}">${value}</b><span>${label}</span></div>`).join("")}</div>${actions ? `<div class="row mt-3">${actions}</div>` : ""}</div><div class="detail-grid"><div class="stack">${content}</div><aside class="rail">${rail}</aside></div></div>${footer()}`;
}

export function sectionCard(title, body, { number = "", actions = "", cls = "" } = {}) {
  return `<section class="card ${cls}"><div class="section-head"><h2>${number ? `<span class="section-num">${number}</span>` : ""}${title}</h2>${actions}</div>${body}</section>`;
}

export function infoItem(iconName, label, value) {
  return `<div class="info-item">${icon(iconName)}<div><span>${label}</span><b>${value}</b></div></div>`;
}

export function emptyState(title, description, action = "", actionLabel = "Сбросить фильтры") {
  return `<div class="empty">${icon("search")}<h3>${title}</h3><p>${description}</p>${action ? `<div class="acts">${btn(actionLabel, { action, cls: "secondary" })}</div>` : ""}</div>`;
}

export function stateView(state, title = "этого раздела") {
  if (state === "loading") return `<div class="wrap section stack"><div class="skeleton" style="height:44px;width:42%"></div><div class="skeleton card-skel"></div><div class="skeleton card-skel"></div><div class="skeleton card-skel"></div></div>`;
  if (state === "empty") return `<div class="wrap section">${emptyState("Здесь пока пусто", `Для ${title} ещё нет данных. В рабочем интерфейсе здесь будет понятный следующий шаг.`, "reset-state", "Вернуться к демонстрации")}</div>`;
  if (state === "error") return `<div class="wrap section"><div class="empty">${icon("alert")}<h3>Не удалось загрузить данные</h3><p>Проверьте соединение и попробуйте ещё раз. Фильтры и введённые данные сохранятся.</p><div class="acts">${btn("Повторить", { action: "reset-state", cls: "primary", iconName: "refresh" })}</div></div></div>`;
  if (state === "forbidden") return `<div class="wrap section"><div class="empty">${icon("lock")}<h3>Доступ ограничен</h3><p>Этот раздел доступен только пользователю с подходящей ролью и правами. Смените роль в панели прототипа или вернитесь в каталог.</p><div class="acts">${btn("Выбрать роль", { action: "prototype", cls: "primary" })}</div></div></div>`;
  return "";
}

export function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export function footer() {
  return `<footer class="footer"><div class="wrap"><a class="logo" href="#/" data-path="/"><img src="/public/logo.png" alt=""><span>СОУС</span></a><span>Работа, клиенты, закупки и обучение в единой профессиональной среде.</span><div class="row"><a href="#/contacts" data-path="/contacts">Контакты</a><a href="#/terms" data-path="/terms">Оферта</a><a href="#/privacy" data-path="/privacy">Приватность</a></div></div></footer>`;
}

export function toastMarkup(title, message, error = false) {
  return `<div class="toast ${error ? "error" : ""}"><div><b>${title}</b><span>${message}</span></div><button data-action="close-toast" aria-label="Закрыть">${icon("x", "sm")}</button></div>`;
}
