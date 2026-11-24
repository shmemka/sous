import { ADMIN_TABS, ORDERS, PROMOS, VACANCIES } from "./data.mjs";
import { avatar, badge, btn, esc, field, icon, input, linkBtn, select, textarea } from "./components.mjs";

const GROUPS = [
  ["Контроль", [["moderation", "Обзор и модерация", "shield", 7], ["directory-claims", "Права на компании", "store", 2], ["reports", "Жалобы", "flag", 3]]],
  ["Пользователи и контент", [["users", "Пользователи", "users"], ["vacancies", "Вакансии", "briefcase"], ["orders", "Заявки", "clipboard"], ["posts", "Публикации", "edit"], ["reviews", "Отзывы", "star"], ["channels", "Каналы", "chats"], ["events", "Мероприятия", "calendar"]]],
  ["Инструменты", [["promos", "Промокоды", "ticket"], ["training", "Обучение", "graduation"], ["analytics", "Аналитика", "bot"], ["finance", "Финансы", "card"]]],
  ["Коммуникация", [["support", "Поддержка", "message", 2], ["feedback", "Обратная связь", "info"], ["broadcast", "Рассылки", "send"], ["create-post", "Создать пост", "plus"]]],
  ["Система", [["audit", "Журнал действий", "file"]]],
];
const LABELS = Object.fromEntries(ADMIN_TABS);
const initials = (name) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const adminSearchText = (value) => esc(String(value || "").replace(/<[^>]*>/g, ""));
const statusBadge = (status) => badge(status, ["Активен", "Проверен", "Активна", "Опубликовано", "Оплачено", "Решено", "Открыт", "Открыта"].includes(status) ? "ok" : ["Жалобы", "Заблокирован", "Отклонено", "Открытая"].includes(status) ? "danger" : ["На проверке", "Ожидает", "В работе", "Запрос прав", "Новое"].includes(status) ? "warn" : "info");

function adminPanelFrame(title, body, { description = "", actions = "", cls = "" } = {}) {
  return `<section class="admin-pro-panel ${cls}"><header class="admin-pro-panel-head"><div><h2>${title}</h2>${description ? `<p>${description}</p>` : ""}</div>${actions ? `<div class="admin-pro-panel-actions">${actions}</div>` : ""}</header>${body}</section>`;
}

function adminMetrics() {
  return `<div class="admin-pro-metrics">${[["2 840", "Пользователей", "+46 за неделю", "users"], ["7", "На модерации", "2 срочных", "shield"], ["3", "Открытые жалобы", "−2 за сутки", "flag"], ["99,96%", "Доступность", "30 дней без инцидентов", "zap"]].map(([value, label, note, ico], index) => `<article><div><span class="admin-metric-icon">${icon(ico)}</span><span class="admin-metric-note ${index === 2 ? "good" : ""}">${note}</span></div><strong>${value}</strong><span>${label}</span></article>`).join("")}</div>`;
}

const QUEUE = [
  { id: "q1", name: "Shine&Go", type: "Компания · документы", city: "Казань", time: "12 мин", risk: "Срочно", status: "pending", text: "Новая регистрация работодателя. Выписка ЕГРЮЛ и контакты готовы к проверке." },
  { id: "q2", name: "Детейлинг Партнёр", type: "Права на компанию", city: "Москва", time: "24 мин", risk: "Документы", status: "pending", text: "Запрос на управление открытой карточкой компании из каталога." },
  { id: "q3", name: "Александр Волков", type: "Сертификат специалиста", city: "Казань", time: "41 мин", risk: "Обычная", status: "review", text: "Сертификат химчистки PRO загружен для подтверждения квалификации." },
  { id: "q4", name: "Вакансия «Детейлер»", type: "Жалоба на зарплату", city: "Москва", time: "1 ч", risk: "Жалоба", status: "urgent", text: "Пользователь считает условия оплаты недостоверными. Нужен разбор модератора." },
  { id: "q5", name: "Microfiber Pro", type: "Новая коллективная закупка", city: "Казань", time: "2 ч", risk: "Обычная", status: "review", text: "Проверка цены, объёма и условий доставки перед публикацией." },
];

function queue() {
  return `<div class="admin-queue">${QUEUE.map((item) => `<article class="admin-queue-item" data-admin-row data-admin-card data-status="${item.status}" data-search="${item.name} ${item.type} ${item.city}"><label class="admin-select-control"><input type="checkbox" data-action="admin-select" aria-label="Выбрать ${item.name}"></label><span class="admin-queue-avatar">${initials(item.name)}</span><div class="admin-queue-copy"><div class="row"><b>${item.name}</b>${item.status === "urgent" ? badge("Срочно", "danger") : ""}</div><span>${item.type} · ${item.city}</span><p>${item.text}</p></div><div class="admin-queue-meta"><time>${item.time}</time><span>${item.risk}</span></div><div class="admin-queue-actions">${btn("Открыть", { action: "admin-open", cls: "sm secondary" })}${btn("Подтвердить", { action: "admin-approve", cls: "sm primary", iconName: "check" })}</div></article>`).join("")}</div>`;
}

function activity() {
  return `<div class="admin-activity">${[["14:32", "Ирина подтвердила документы", "CleanLab · компания", "ok"], ["14:18", "Изменён отзыв после жалобы", "Отзыв #248", "info"], ["13:56", "Скрыта спам-публикация", "Автоматическая защита", "danger"], ["13:40", "Новая точка на карте", "Detail House · Екатеринбург", "ok"]].map(([time, title, meta, tone]) => `<div><time>${time}</time><i class="${tone}"></i><span><b>${title}</b><small>${meta}</small></span></div>`).join("")}</div>`;
}

function moderationOverview() {
  return `${adminMetrics()}<div class="admin-pro-workspace"><div class="admin-pro-main">${adminPanelFrame("Очередь модерации", `${adminToolbar("Имя, компания или тип объекта…")}${queue()}`, { description: "Сначала срочные и те, что ждут дольше всего", actions: linkBtn("Открыть все объекты", "/admin", { cls: "secondary sm", iconName: "chevron" }) })}</div><aside class="admin-pro-rail">${adminPanelFrame("Состояние системы", `<div class="admin-system-status"><span><i></i> Все системы работают</span><small>Проверено только что</small></div><div class="admin-system-list">${[["API и база данных", "42 мс"], ["Сообщения", "Онлайн"], ["Платежи", "Онлайн"], ["Хранилище файлов", "78% свободно"]].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join("")}</div>${btn("Открыть журнал", { action: "admin-tab", cls: "ghost block", iconName: "file", attrs: 'data-tab="audit"' })}`)}${adminPanelFrame("Последние действия", activity(), { actions: `<span class="hint">Сегодня</span>` })}${adminPanelFrame("Быстрые действия", `<div class="admin-quick-actions">${btn("Новая публикация", { modal: "post.create", cls: "secondary block", iconName: "plus" })}${btn("Создать рассылку", { action: "admin-tab", cls: "secondary block", iconName: "send", attrs: 'data-tab="broadcast"' })}${btn("Экспортировать отчёт", { action: "download", cls: "secondary block", iconName: "download" })}</div>`)}</aside></div>`;
}

function adminToolbar(placeholder = "Поиск по текущему разделу…", selectable = true) {
  return `<div class="admin-pro-toolbar"><label class="admin-pro-search">${icon("search")}<input type="search" placeholder="${placeholder}" aria-label="Поиск в разделе" data-action="admin-search"></label>${select([["all", "Все статусы"], ["pending", "На проверке"], ["active", "Активные"], ["urgent", "Срочные"], ["done", "Завершённые"]], "all", 'data-action="admin-status" aria-label="Фильтр по статусу"')}${btn("Сбросить", { action: "admin-reset-filters", cls: "ghost sm", iconName: "refresh" })}</div>${selectable ? `<div class="admin-bulk-bar" id="admin-bulk" hidden><span>Выбрано: <b id="admin-selected-count">0</b></span>${btn("Подтвердить выбранные", { action: "admin-bulk-approve", cls: "sm primary", iconName: "check" })}${btn("Снять выбор", { action: "admin-clear-selection", cls: "sm ghost" })}</div>` : ""}`;
}

function adminTable(headers, rows, selectable = false) {
  const selectionHead = selectable ? `<th><input type="checkbox" data-action="admin-select-all" aria-label="Выбрать все строки"></th>` : "";
  return `<div class="admin-table-wrap"><table class="admin-pro-table${selectable ? " has-selection" : ""}"><thead><tr>${selectionHead}${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row, index) => `<tr data-admin-row data-status="${row.status || "active"}" data-name="${esc(row.name || "")}" data-search="${adminSearchText(row.search)}">${selectable ? `<td data-label="Выбрать"><input type="checkbox" data-action="admin-select" aria-label="Выбрать строку ${index + 1}"></td>` : ""}${row.cells.map((cell, cellIndex) => `<td data-label="${headers[cellIndex]}">${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function personCell(name, meta) {
  return `<div class="admin-person-cell">${avatar(initials(name))}<span><b>${name}</b><small>${meta}</small></span></div>`;
}

const openButton = (label = "Открыть") => btn(label, { action: "admin-open", cls: "sm secondary" });
const editButton = () => btn("Изменить", { modal: "admin.review", cls: "sm secondary" });

function usersTable(claims = false) {
  const rows = [
    { cells: [personCell("Shine&Go", "+7 (999) 521-22-51"), "Работодатель", "Казань", "12.11.2026", statusBadge("На проверке"), `<div class="actions">${openButton()}${btn("Подтвердить", { action: "admin-approve", cls: "sm primary" })}</div>`], status: "pending", search: "Shine&Go работодатель Казань" },
    { cells: [personCell("Михаил Соколов", "mike@example.ru"), "Специалист", "Москва", "08.11.2026", statusBadge("Проверен"), `<div class="actions">${openButton()}${btn("Роль", { modal: "admin.role", cls: "sm secondary" })}</div>`], status: "active", search: "Михаил Соколов специалист Москва" },
    { cells: [personCell("Детейлинг Партнёр", "partner@example.ru"), "Партнёр", "Москва", "05.11.2026", statusBadge("Запрос прав"), `<div class="actions">${openButton()}${btn("Проверить", { modal: "admin.recheck", cls: "sm secondary" })}</div>`], status: "pending", search: "Детейлинг Партнёр Москва" },
    { cells: [personCell("Иван Михайлов", "ivan@example.ru"), "Клиент", "Москва", "01.11.2026", statusBadge("Активен"), openButton()], status: "active", search: "Иван Михайлов клиент Москва" },
    { cells: [personCell("Спам Аккаунт", "Нет контактов"), "Клиент", "—", "28.10.2026", statusBadge("Заблокирован"), btn("Разбор", { modal: "admin.ban", cls: "sm secondary" })], status: "done", search: "Спам Аккаунт заблокирован" },
  ];
  return adminTable(["Пользователь", "Роль", "Город", "Регистрация", "Статус", "Действия"], rows, true);
}

function contentTable(active) {
  if (active === "users" || active === "directory-claims" || active === "moderation") return usersTable(active === "directory-claims");
  if (active === "vacancies") return adminTable(["Вакансия", "Компания", "Город", "Отклики", "Статус", ""], VACANCIES.map((item, index) => ({ cells: [item.title, item.company, item.city, 12 - index * 3, statusBadge("Активна"), linkBtn("Открыть", `/vacancies/${item.id}`, { cls: "sm secondary" })], search: `${item.title} ${item.company} ${item.city}` })));
  if (active === "orders") return adminTable(["Заявка", "Клиент", "Бюджет", "Отклики", "Статус", ""], ORDERS.map((item, index) => ({ cells: [item.title, item.company, item.salary, item.experience, statusBadge("Открыта"), linkBtn("Открыть", `/orders/${item.id}`, { cls: "sm secondary" })], search: `${item.title} ${item.company}` })));
  if (active === "promos") return adminTable(["Акция", "Партнёр", "Выгода", "Активации", "Статус", ""], PROMOS.map((item, index) => ({ cells: [item.title, item.company, item.salary, 142 - index * 34, statusBadge("Активна"), btn("Настроить", { modal: "admin.promo", cls: "sm secondary" })], search: `${item.title} ${item.company}` })));
  if (active === "reviews") return adminTable(["Автор", "Объект", "Оценка", "Текст", "Статус", ""], [["Иван Михайлов", "Shine&Go", "10 / 10", "Всё отлично, рекомендую.", statusBadge("Опубликовано"), editButton()], ["Анна Смирнова", "Михаил Соколов", "4 / 10", "Нужно уточнить детали.", statusBadge("На проверке"), editButton()], ["Ольга Смирнова", "АвтоПрофи", "9 / 10", "Понятная смета и хороший результат.", statusBadge("Опубликовано"), editButton()]].map((cells) => ({ cells: cells.map(String), search: cells.join(" "), status: String(cells[4]).includes("На проверке") ? "pending" : "active" })));
  if (active === "channels") return adminTable(["Канал", "Участники", "Сообщения", "Активность", "Доступ", ""], [["Детейлинг · общий", "1 248", "18 420", "86 онлайн", statusBadge("Открыт"), openButton("Настроить")], ["PPF и защита", "486", "6 240", "32 онлайн", statusBadge("Открыт"), openButton("Настроить")], ["Директорский клуб", "142", "4 812", "12 онлайн", badge("Закрыт", "warn"), openButton("Настроить")]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") })));
  if (active === "support") return adminTable(["Пользователь", "Тема", "Обновлено", "Ответственный", "Статус", ""], [["Иван Михайлов", "Не приходит код", "12 минут назад", "Не назначен", statusBadge("Новое"), linkBtn("Открыть диалог", "/messages", { cls: "sm primary" })], ["Shine&Go", "Вопрос по закупке", "1 час назад", "Ирина Р.", statusBadge("В работе"), linkBtn("Открыть диалог", "/messages", { cls: "sm secondary" })], ["Анна Смирнова", "Как добавить сертификат", "Вчера", "Ирина Р.", statusBadge("Решено"), linkBtn("Открыть", "/messages", { cls: "sm secondary" })]].map((cells) => ({ cells: cells.map(String), search: cells.join(" "), status: String(cells[4]).includes("Новое") ? "urgent" : "active" })));
  if (active === "reports") return adminTable(["Объект", "Причина", "Отправитель", "Дата", "Статус", ""], [["Вакансия «Детейлер»", "Недостоверная зарплата", "Иван М.", "14.11.2026", statusBadge("Новое"), openButton("Рассмотреть")], ["Комментарий", "Нарушение правил общения", "Ольга С.", "13.11.2026", statusBadge("В работе"), openButton("Рассмотреть")], ["Профиль компании", "Контактные данные", "Сергей П.", "11.11.2026", statusBadge("Решено"), openButton()]].map((cells) => ({ cells: cells.map(String), search: cells.join(" "), status: String(cells[4]).includes("Решено") ? "done" : "urgent" })), true);
  if (active === "feedback") return adminTable(["Дата", "Пользователь", "Предложение", "Раздел", "Статус", ""], [["14.11.2026", "Иван М.", "Добавьте фильтр по району", "Карта", statusBadge("Новое"), openButton()], ["13.11.2026", "Shine&Go", "Нужен экспорт отчёта", "Аналитика", statusBadge("В работе"), openButton()]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") })));
  if (active === "posts") return adminTable(["Заголовок", "Автор", "Тип", "Опубликовано", "Статус", ""], [["Запустили практический курс PPF", "АвтоПрофи", "Обучение", "14.11.2026", statusBadge("Опубликовано"), linkBtn("Открыть", "/feed", { cls: "sm secondary" })], ["Закупка химии перед сезоном", "Shine&Go", "Бизнес", "13.11.2026", statusBadge("Опубликовано"), linkBtn("Открыть", "/feed", { cls: "sm secondary" })], ["Новые материалы по химчистке кожи", "Учебный центр", "Материал", "12.11.2026", statusBadge("Опубликовано"), linkBtn("Открыть", "/feed", { cls: "sm secondary" })]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") })));
  if (active === "events") return adminTable(["Событие", "Дата", "Город", "Участники", "Статус", ""], [["Форум СОУС", "01.12.2026", "Санкт-Петербург", "248", statusBadge("Опубликовано"), editButton()], ["Практикум PPF", "18.11.2026", "Казань", "32", statusBadge("Новое"), editButton()]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") })));
  if (active === "audit") return adminTable(["Время", "Пользователь", "Действие", "Объект", "Результат", "IP"], [["14:32", "Ирина Р.", "Подтверждение документов", "Shine&Go", statusBadge("Успешно"), "127.0.0.1"], ["14:18", "Модератор", "Изменение отзыва", "Отзыв #248", statusBadge("Успешно"), "127.0.0.1"], ["13:56", "Ирина Р.", "Скрытие публикации", "Спам-публикация", statusBadge("Успешно"), "127.0.0.1"], ["13:42", "Система", "Вход пользователя", "Михаил Соколов", statusBadge("Успешно"), "127.0.0.1"]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") })));
  return adminTable(["Объект", "Тип", "Обновлено", "Статус", ""], []);
}

function analyticsPanel(finance = false) {
  const metrics = finance ? [["186 400 ₽", "Оборот за месяц", "+18%"], ["24 860 ₽", "Подписки", "82 активных"], ["96%", "Успешных платежей", "4 возврата"], ["1 240 ₽", "Средний чек", "+6%"]] : [["2 840", "Пользователей", "+12%"], ["1 248", "Событий в день", "+18%"], ["38%", "Конверсия в контакт", "+6%"], ["4", "Активных города", "86 компаний"]];
  return `<div class="admin-pro-metrics">${metrics.map(([value, label, note]) => `<article><span class="admin-metric-note good">${note}</span><strong>${value}</strong><span>${label}</span></article>`).join("")}</div><div class="admin-analytics-grid">${adminPanelFrame(finance ? "Доходы по неделям" : "Активность платформы", `<div class="admin-chart"><div class="admin-chart-lines"></div><div>${[42, 58, 47, 73, 66, 89, 94, 78, 100, 86].map((height, index) => `<span><i style="height:${height}%"></i><small>${index + 5} нояб.</small></span>`).join("")}</div></div>`, { description: "Последние 10 дней · обновлено только что", actions: btn("Скачать отчёт", { action: "download", cls: "sm secondary", iconName: "download" }) })}${adminPanelFrame("Ключевые показатели", `<div class="admin-insights">${[["Вакансии", "486 откликов", "+18%"], ["Заявки", "1 248 заказов", "+32%"], ["Закупки", "86 закупок", "−24% цены"], ["Акции", "142 активации", "+24%"]].map(([label, value, trend]) => `<div><span>${label}</span><b>${value}</b><small>${trend}</small></div>`).join("")}</div>`)}</div>`;
}

function trainingPanel() {
  return `<div class="admin-training-grid">${[["Категории и программы", "6 курсов · 18 материалов", "admin.training"], ["Группы и участники", "248 выпускников · 32 активных", "course.enroll"], ["Сертификаты", "Проверка и выдача документов", "admin.training"]].map(([title, text, modal]) => `<button data-modal="${modal}"><span>${icon("graduation", "lg")}</span><h3>${title}</h3><p>${text}</p>${icon("chevron")}</button>`).join("")}</div>${adminPanelFrame("Активные курсы", adminTable(["Курс", "Город", "Участники", "Выпускники", "Статус", ""], [["Мастер детейлинга", "Москва", "24", "186", statusBadge("Активна"), editButton()], ["Установка PPF", "Казань", "18", "94", statusBadge("Активна"), editButton()], ["Химчистка PRO", "Санкт-Петербург", "12", "68", statusBadge("Активна"), editButton()]].map((cells) => ({ cells: cells.map(String), search: cells.join(" ") }))))}`;
}

function createPostPanel() {
  return adminPanelFrame("Новая публикация", `<form class="form-grid" data-form="post.create">${input("Заголовок *", { full: true, value: "Новые стандарты качества в детейлинге", attrs: "required" })}${field("Тип", select(["Новость", "Материал", "Объявление"], "Новость"))}${field("Доступ", select(["Все пользователи", "Подписчики", "Только компании"], "Все пользователи"))}${textarea("Текст публикации *", { value: "Расскажите сообществу о новости, инструменте или практическом опыте.", attrs: "required" })}<div class="full callout">Перед публикацией проверьте заголовок, аудиторию и отсутствие персональных данных.</div><div class="full row end">${btn("Опубликовать", { cls: "primary", iconName: "send", attrs: 'type="submit"' })}</div></form>`, { description: "Новость появится в общей ленте после публикации" });
}

function broadcastPanel() {
  return adminPanelFrame("Новая рассылка", `<form class="form-grid" data-form="broadcast.send">${field("Аудитория", select(["Все пользователи", "Специалисты", "Работодатели", "Партнёры"], "Все пользователи"), { full: true })}${input("Тема *", { full: true, value: "Новые возможности личного кабинета", attrs: "required" })}${textarea("Сообщение *", { value: "Расскажите коротко, что изменилось и где найти новую функцию.", attrs: "required" })}<div class="full callout"><b>Предпросмотр</b><p class="small mb-0">Получатели: 2 840 пользователей. Отправка будет записана в журнал действий.</p></div><div class="full row end">${btn("Подготовить рассылку", { cls: "primary", iconName: "send", attrs: 'type="submit"' })}</div></form>`, { description: "Сначала проверьте текст и количество получателей" });
}

function adminContent(active) {
  if (active === "moderation") return moderationOverview();
  if (active === "analytics") return analyticsPanel();
  if (active === "finance") return analyticsPanel(true);
  if (active === "training") return trainingPanel();
  if (active === "create-post") return createPostPanel();
  if (active === "broadcast") return broadcastPanel();
  const descriptions = {
    users: "Роли, доступы, верификация и блокировки аккаунтов", "directory-claims": "Заявки на управление открытыми карточками компаний",
    vacancies: "Публикации, отклики и видимость вакансий", orders: "Клиентские задачи и предложения исполнителей", promos: "QR-акции, кешбэк и активации",
    reviews: "Отзывы после подтверждённых заказов", channels: "Доступ, участники и активность каналов", support: "Обращения пользователей и статусы ответов",
    reports: "Разбор жалоб и нарушений правил", feedback: "Предложения по улучшению платформы", posts: "Новости и публикации сообщества",
    audit: "Все важные действия администраторов и системы", events: "Форумы, встречи и регистрация участников",
  };
  return adminPanelFrame(LABELS[active] || "Раздел", `${adminToolbar(undefined, ["moderation", "users", "directory-claims", "reports"].includes(active))}${contentTable(active)}<div class="admin-table-foot"><span>Данные обновлены только что</span><div>${btn("Назад", { action: "admin-page-prev", cls: "sm ghost", iconName: "back" })}<span class="admin-page-current">1</span>${btn("Далее", { action: "admin-page-next", cls: "sm ghost", iconName: "chevron" })}</div></div>`, { description: descriptions[active] || "Управление данными и публикациями", actions: `${active === "promos" ? btn("Новая акция", { modal: "admin.promo", cls: "primary sm", iconName: "plus" }) : ""}${active === "posts" ? btn("Новая публикация", { action: "admin-tab", cls: "primary sm", iconName: "plus", attrs: 'data-tab="create-post"' }) : ""}${btn("Экспорт", { action: "download", cls: "secondary sm", iconName: "download" })}` });
}

export function adminPage(ctx, standaloneReports = false) {
  const active = standaloneReports ? "reports" : ctx.adminTab;
  const title = active === "moderation" ? "Центр управления" : LABELS[active] || "Раздел";
  return `<div class="admin-pro-shell" id="admin-shell"><aside class="admin-pro-sidebar"><div class="admin-pro-brand"><a href="#/" data-path="/">${icon("shield")}<span>СОУС<small>CONTROL</small></span></a>${btn("", { action: "admin-menu", cls: "sm icon-only ghost admin-mobile-close", iconName: "x", attrs: 'aria-label="Закрыть разделы"' })}</div><div class="admin-pro-workspace-label"><span>Рабочее пространство</span><b>Администрирование платформы</b></div><nav class="admin-pro-nav">${GROUPS.map(([label, items]) => `<div class="admin-pro-nav-group"><span>${label}</span>${items.map(([id, label, ico, count]) => `<button class="${active === id ? "active" : ""}" data-action="admin-tab" data-tab="${id}" aria-current="${active === id ? "page" : "false"}">${icon(ico)}<span>${label}</span>${count ? `<b>${count}</b>` : ""}</button>`).join("")}</div>`).join("")}</nav><div class="admin-pro-user">${avatar("ИР")}<div><b>Ирина Рогоцкая</b><span>Администратор · полный доступ</span></div>${btn("", { modal: "admin.user", cls: "sm icon-only ghost", iconName: "more", attrs: 'aria-label="Профиль администратора"' })}</div></aside><main class="admin-pro-main"><header class="admin-pro-top"><div class="admin-pro-top-left">${btn("", { action: "admin-menu", cls: "sm icon-only secondary admin-menu", iconName: "menu", attrs: 'aria-label="Открыть разделы"' })}<div><span>СОУС / ${active === "moderation" ? "Контроль" : "Разделы"}</span><h1>${title}</h1></div></div><label class="admin-global-search">${icon("search")}<input type="search" placeholder="Поиск по разделу…" aria-label="Поиск по админке" data-action="admin-search"><kbd>⌘K</kbd></label><div class="admin-pro-top-actions"><span class="admin-live"><i></i> Онлайн</span>${btn("", { action: "admin-notifications", cls: "sm icon-only ghost", iconName: "bell", attrs: 'aria-label="Уведомления администратора"' })}${btn("", { action: "theme", cls: "sm icon-only ghost", iconName: ctx.theme === "dark" ? "sun" : "moon", attrs: 'aria-label="Переключить тему"' })}${btn("Создать", { modal: "post.create", cls: "primary sm admin-create", iconName: "plus" })}${avatar("ИР")}</div></header><div class="admin-pro-content"><div class="admin-pro-context"><div><span class="workspace-kicker">Воскресенье, 15 ноября</span><p>Добрый день, Ирина. ${active === "moderation" ? "Вот что требует вашего внимания." : `Раздел «${title}» готов к работе.`}</p></div><div>${badge("Данные синхронизированы", "ok")}${btn("", { action: "refresh", cls: "sm icon-only ghost", iconName: "refresh", attrs: 'aria-label="Обновить данные"' })}</div></div>${adminContent(active)}</div></main></div>`;
}
