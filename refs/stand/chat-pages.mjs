import { avatar, badge, btn, esc, icon, linkBtn } from "./components.mjs";

const CHANNELS = [
  { id: "detailing", name: "Детейлинг · общий", initials: "Д", description: "Техника, материалы и практический опыт", last: "Shine&Go: Используем отдельную линейку без воска…", time: "14:24", unread: 3, members: "1 248", online: "86", muted: false, subscribed: true, role: "Все роли" },
  { id: "ppf", name: "PPF и защита", initials: "P", description: "Плёнки, раскрой и сложная установка", last: "АвтоПрофи: Новый разбор установки на дверь", time: "13:48", unread: 1, members: "486", online: "32", muted: false, subscribed: true, role: "Все роли" },
  { id: "business", name: "Бизнес и управление", initials: "Б", description: "Цены, закупки и операционная работа", last: "Ирина: Открылась закупка микрофибры", time: "12:12", unread: 0, members: "624", online: "41", muted: true, subscribed: true, role: "Все роли" },
  { id: "jobs", name: "Работа и подмены", initials: "Р", description: "Вакансии, кандидаты и срочные смены", last: "CleanLab: Нужен мойщик на субботу", time: "11:30", unread: 4, members: "892", online: "54", muted: false, subscribed: true, role: "Все роли" },
  { id: "directors", name: "Директорский клуб", initials: "ДК", description: "Закрытое обсуждение для руководителей", last: "Дмитрий: Обсуждаем крупный тендер", time: "Вчера", unread: 0, members: "142", online: "12", muted: false, subscribed: false, locked: true, role: "Работодатели" },
  { id: "learning", name: "Учебный центр", initials: "У", description: "Курсы, материалы и ответы преподавателей", last: "Преподаватель: Разбор сертификации", time: "Вчера", unread: 0, members: "538", online: "27", muted: false, subscribed: true, role: "Все роли" },
];

const DIRECT = [
  { id: "mike", name: "Михаил Соколов", initials: "МС", role: "Специалист", city: "Москва", last: "Готов выйти на смену.", time: "14:14", unread: 0, online: true, verified: true },
  { id: "shine", name: "Shine&Go", initials: "SG", role: "Работодатель", city: "Казань", last: "Отправили условия закупки", time: "13:42", unread: 2, online: true, verified: true, typing: true },
  { id: "ivan", name: "Иван Михайлов", initials: "ИМ", role: "Клиент", city: "Москва", last: "Спасибо за работу!", time: "Вчера", unread: 0, online: false, verified: true },
  { id: "anna", name: "Анна Смирнова", initials: "АС", role: "Администратор", city: "Москва", last: "Фото результата приложила", time: "Вчера", unread: 1, online: false, verified: true },
  { id: "supply", name: "Koch Chemie Россия", initials: "KC", role: "Поставщик", city: "Москва", last: "Прайс и остатки обновлены", time: "Пн", unread: 0, online: false, verified: true },
];

const iconButton = (action, ico, label, cls = "") => btn("", { action, iconName: ico, cls: `sm icon-only ghost ${cls}`, attrs: `aria-label="${label}" title="${label}"` });
const roleBadge = (role) => badge(role, "info");

function listHeader(type) {
  return `<div class="messenger-list-head"><div class="row between"><div><h1>${type === "channels" ? "Чаты" : "Сообщения"}</h1><p>${type === "channels" ? "Профессиональные каналы" : "Личные диалоги"}</p></div>${iconButton(type === "channels" ? "channel-create" : "new-dialog", "edit", type === "channels" ? "Создать канал" : "Новый диалог", "new-chat")}</div><label class="messenger-search">${icon("search", "sm")}<input type="search" placeholder="Поиск" aria-label="Поиск в списке" data-action="chat-search" data-kind="${type}"><kbd>⌘K</kbd></label><div class="messenger-filters" role="tablist" aria-label="Фильтр списка"><button class="active" role="tab" aria-selected="true" data-action="chat-filter" data-filter="all">Все</button><button role="tab" aria-selected="false" data-action="chat-filter" data-filter="unread">Непрочитанные</button><button role="tab" aria-selected="false" data-action="chat-filter" data-filter="muted">Без звука</button></div></div>`;
}

function listItem(item, type, active) {
  const isChannel = type === "channels";
  return `<button class="messenger-item ${active === item.id ? "active" : ""}" data-action="${isChannel ? "chat-channel" : "conversation"}" data-${isChannel ? "channel" : "conversation"}="${item.id}" data-unread="${item.unread}" data-muted="${item.muted ? "true" : "false"}" data-subscribed="${item.subscribed === false ? "false" : "true"}" aria-current="${active === item.id ? "page" : "false"}"><span class="messenger-avatar">${avatar(item.initials)}${item.online ? '<i class="online-dot" aria-label="В сети"></i>' : ""}${item.locked ? `<i class="lock-dot">${icon("lock", "sm")}</i>` : ""}</span><span class="messenger-item-main"><span class="messenger-item-top"><b>${item.name}</b><time>${item.time}</time></span><span class="messenger-preview">${item.typing ? '<span class="typing-text">печатает…</span>' : esc(item.last)}</span><span class="messenger-item-bottom">${isChannel ? `<span>${item.members} участников</span>` : `<span>${item.role}${item.city ? ` · ${item.city}` : ""}</span>`}${item.muted ? icon("bell-off", "sm") : ""}${item.pinned ? icon("pin", "sm") : ""}</span></span>${item.unread ? `<span class="unread-count" aria-label="${item.unread} непрочитанных">${item.unread}</span>` : ""}</button>`;
}

function threadHeader(item, type, ctx) {
  const isChannel = type === "channels";
  return `<header class="thread-header">${iconButton("chat-back", "back", "Назад к списку", "chat-back")}<button class="thread-person" data-action="chat-info">${avatar(item.initials)}<span><b>${item.name}</b><small>${item.typing ? '<span class="typing-text">печатает…</span>' : isChannel ? `${item.members} участников · ${item.online} онлайн` : item.online ? "в сети" : "был(а) недавно"}</small></span></button><div class="thread-actions">${iconButton("thread-search-open", "search", "Поиск в переписке")}${isChannel ? iconButton("chat-info", "info", "Информация о канале") : iconButton("chat-info", "user", "Профиль и медиа")}${iconButton("thread-menu", "more", "Дополнительные действия")}</div></header>${ctx.chatSearchOpen ? `<div class="thread-search">${icon("search", "sm")}<input type="search" aria-label="Поиск по сообщениям" placeholder="Найти сообщение…" data-action="thread-search"><span class="hint" id="thread-search-count">Все сообщения</span>${iconButton("chat-search-close", "x", "Закрыть поиск")}</div>` : ""}`;
}

function pinnedBanner(ctx, type) {
  const text = type === "channels" ? "Ирина: напоминаем о правилах публикации и ответах коллегам" : "Shine&Go: адрес смены и контакт руководителя закреплены здесь";
  return `<button class="pinned-message" data-action="pinned-jump" data-message="pinned-source"><span class="pinned-icon">${icon("pin", "sm")}</span><span><b>Закреплённое сообщение</b><span>${text}</span></span><span class="pinned-next">${icon("chevron", "sm")}</span></button>`;
}

function reactionButton(emoji, count, active = false) {
  return `<button class="reaction ${active ? "active" : ""}" data-action="react" data-emoji="${emoji}" aria-label="Реакция ${emoji}"><span>${emoji}</span><b>${count}</b></button>`;
}

function messageContent(message) {
  const parts = [];
  if (message.reply) parts.push(`<button class="message-reply" data-action="reply-jump"><b>${message.reply.author}</b><span>${message.reply.text}</span></button>`);
  if (message.image) parts.push(`<button class="message-image" data-modal="gallery.view" aria-label="Открыть вложение"><img src="/public/images/heroes/04-dark.webp" alt="Фото результата работы" loading="lazy"></button>`);
  if (message.file) parts.push(`<button class="message-file" data-action="download"><span>${icon("file", "lg")}</span><span><b>${message.file.name}</b><small>${message.file.meta}</small></span>${icon("download", "sm")}</button>`);
  if (message.voice) parts.push(`<div class="voice-message"><button data-action="voice-play" aria-label="Воспроизвести голосовое">${icon("play")}</button><span class="voice-wave" aria-hidden="true">${Array.from({ length: 20 }, (_, i) => `<i style="height:${5 + (i * 7) % 18}px"></i>`).join("")}</span><time>${message.voice}</time></div>`);
  if (message.text) parts.push(`<p>${message.text}</p>`);
  return parts.join("");
}

function messageView(message, ctx, type) {
  const own = message.mine;
  return `<article class="chat-message ${own ? "mine" : ""}" id="${message.id}" data-message-id="${message.id}" data-message-text="${esc(message.text || message.file?.name || "Голосовое сообщение")}" data-own="${own ? "true" : "false"}">${!own ? avatar(message.initials || message.author?.slice(0, 1) || "С", "message-avatar") : ""}<div class="message-stack"><div class="message-bubble ${message.image ? "has-image" : ""}">${!own ? `<div class="message-author"><b>${message.author || "Участник"}</b>${message.role ? roleBadge(message.role) : ""}</div>` : ""}${messageContent(message)}<footer><time>${message.time}${message.edited ? " · изменено" : ""}</time>${own ? `<span class="read-mark" title="${message.read === false ? "Доставлено" : "Прочитано"}">${icon("check", "sm")}${message.read === false ? "" : icon("check", "sm read-second")}</span>` : ""}</footer><button class="message-more" data-action="message-menu" data-message="${message.id}" aria-label="Действия с сообщением">${icon("more", "sm")}</button></div>${message.reactions?.length ? `<div class="message-reactions">${message.reactions.map(([emoji, count, active]) => reactionButton(emoji, count, active)).join("")}</div>` : ""}</div></article>`;
}

function channelMessages(ctx, channel) {
  const base = [
    { id: "older-note", author: "СОУС", initials: "С", text: `Добро пожаловать в канал «${channel.name}». Здесь можно делиться опытом и задавать профильные вопросы.`, time: "12:30" },
    { id: "c1", author: "Александр Волков", initials: "АВ", role: "Специалист", text: "Какой состав лучше взять для матового кузова? Нужно сохранить фактуру и не добавить блеск.", time: "14:20", reactions: [["👍", 3, false], ["❤️", 1, false]] },
    { id: "pinned-source", author: "Ирина Рогоцкая", initials: "ИР", role: "Модератор", text: "Напоминаем о правилах: указывайте город и тип работ, а коммерческие предложения отправляйте через профиль компании.", time: "14:21" },
    { id: "c2", author: "Shine&Go", initials: "SG", role: "Работодатель", text: "Используем отдельную линейку без воска и глянца. Главное — не менять исходную фактуру. Могу показать нашу схему подготовки.", time: "14:24", reply: { author: "Александр Волков", text: "Какой состав лучше взять для матового кузова?" }, reactions: [["🔥", 4, true]] },
    { id: "c3", author: "АвтоПрофи", initials: "АП", role: "Работодатель", text: "", image: true, time: "14:26" },
    { id: "c4", author: "Учебный центр", initials: "УЦ", role: "Эксперт", text: "Добавили памятку по работе с матовыми покрытиями.", file: { name: "Матовые покрытия · памятка.pdf", meta: "PDF · 2,4 МБ" }, time: "14:28" },
  ];
  return [...base, ...ctx.chatMessages.filter((message) => message.channel === channel.id)]
    .filter((message) => !ctx.deletedMessageIds.has(message.id))
    .map((message) => ({ ...message, ...ctx.messageOverrides[message.id] }));
}

function directMessages(ctx, current) {
  const base = [
    { id: "d1", author: current.name, initials: current.initials, text: current.id === "shine" ? "Добрый день! Отправляю условия смены и контакт руководителя." : "Добрый день! Готов обсудить сотрудничество.", time: "14:08" },
    { id: "pinned-source", author: current.name, initials: current.initials, text: "Адрес: Москва, Тверская, 12. Начало смены в 09:00. Если нужно — могу отправить схему проезда.", file: { name: "Условия и адрес.pdf", meta: "PDF · 480 КБ" }, time: "14:09" },
    { id: "d2", author: "Вы", text: "Здравствуйте! Спасибо, посмотрел условия. Готов подтвердить выход.", time: "14:12", mine: true, read: true },
    { id: "d3", author: current.name, initials: current.initials, text: "Отлично. Вот фото рабочей зоны, чтобы вы заранее понимали условия.", image: true, time: "14:13" },
    { id: "d4", author: current.name, initials: current.initials, text: "Если удобнее, могу коротко записать детали голосом.", voice: "00:18", time: "14:14", reactions: [["👍", 1, false]] },
  ];
  return [...base, ...ctx.directMessages.filter((message) => message.conversation === current.id)]
    .filter((message) => !ctx.deletedMessageIds.has(message.id))
    .map((message) => ({ ...message, ...ctx.messageOverrides[message.id] }));
}

function composer(ctx, type, active) {
  const direct = type === "direct";
  const formKind = direct ? "message.send" : "chat.send";
  return `<div class="composer-area">${ctx.replyTo ? `<div class="reply-context">${icon("message", "sm")}<span><b>Ответ на сообщение</b><span>${esc(ctx.replyTo.text)}</span></span>${iconButton("reply-cancel", "x", "Отменить ответ")}</div>` : ""}${ctx.attachmentDraft ? `<div class="reply-context"><span class="logo-tile">${icon(ctx.attachmentDraft.type === "image" ? "image" : "file")}</span><span><b>${ctx.attachmentDraft.name}</b><span>Готово к отправке</span></span>${iconButton("attachment-cancel", "x", "Убрать вложение")}</div>` : ""}${ctx.voiceRecording ? `<div class="voice-recording"><span class="recording-dot"></span><b>Запись голосового</b><time>00:05</time><span class="hint">Говорите…</span>${iconButton("voice-cancel", "trash", "Отменить запись")}${iconButton("voice-stop", "send", "Отправить голосовое", "primary")}</div>` : ""}<form class="chat-composer ${ctx.attachmentDraft ? "has-text" : ""}" data-form="${formKind}" data-composer><input type="hidden" name="${direct ? "conversation" : "channel"}" value="${active}"><div class="composer-tools">${iconButton("attach-menu", "plus", "Прикрепить")}${iconButton("emoji-open", "smile", "Эмодзи")}</div><textarea name="text" rows="1" aria-label="Сообщение" placeholder="Написать сообщение…" data-action="composer-input"></textarea><div class="composer-send">${iconButton("voice-record", "mic", "Записать голосовое", "voice-record")}${btn("", { cls: "primary icon-only send-button", iconName: "send", attrs: 'type="submit" aria-label="Отправить сообщение"' })}</div></form><div class="composer-hint">Enter — отправить · Shift+Enter — новая строка</div></div>`;
}

export function chatInfoContent(ctx, type) {
  const isChannel = type === "channels";
  const source = isChannel ? CHANNELS : DIRECT;
  const current = source.find((item) => item.id === (isChannel ? ctx.chatChannel : ctx.conversation)) || source[0];
  return `<div class="chat-info-content"><div class="chat-info-profile">${avatar(current.initials, "xl")}<h2>${current.name}</h2><p>${isChannel ? current.description : `${current.role} · ${current.city}`}</p>${isChannel ? badge(current.locked ? current.role : "Открытый канал", current.locked ? "warn" : "ok") : badge("Документы проверены", "ok")}</div><div class="chat-info-actions">${isChannel ? `${btn("Вы подписаны", { action: "chat-subscribe", cls: "secondary block", iconName: "check" })}${btn(current.muted ? "Включить уведомления" : "Без звука", { action: "chat-mute", cls: "ghost block", iconName: "bell" })}` : `${linkBtn("Открыть профиль", "/profile/worker-001", { cls: "secondary block", iconName: "user" })}${btn("Поиск в переписке", { action: "thread-search-open", cls: "ghost block", iconName: "search" })}`}</div><div class="chat-info-tabs"><button class="active" data-action="info-tab" data-info="about">Обзор</button><button data-action="info-tab" data-info="media">Медиа</button><button data-action="info-tab" data-info="members">${isChannel ? "Участники" : "Ссылки"}</button></div><div class="chat-info-panel" data-info-panel="about">${isChannel ? `<div class="info-list"><div class="info-item">${icon("users")}<div><span>Участники</span><b>${current.members} · ${current.online} онлайн</b></div></div><div class="info-item">${icon("shield")}<div><span>Доступ</span><b>${current.role}</b></div></div><div class="info-item">${icon("message")}<div><span>Правила</span><b>Уважение, опыт и профильная тема</b></div></div></div><div class="callout mt-2">Пожалуйста, не публикуйте персональные данные и не отправляйте коммерческие предложения вне профиля.</div>` : `<div class="info-list"><div class="info-item">${icon("shield")}<div><span>Верификация</span><b>Документы проверены</b></div></div><div class="info-item">${icon("pin")}<div><span>Город</span><b>${current.city}</b></div></div><div class="info-item">${icon("clock")}<div><span>На платформе</span><b>С марта 2026</b></div></div></div>`}</div><div class="chat-info-panel" data-info-panel="media" hidden><div class="shared-media">${[2, 4, 6, 8, 9, 12].map((n) => `<button data-modal="gallery.view" style="background:url('/public/images/heroes/0${n}-dark.webp') center/cover" aria-label="Открыть медиа"></button>`).join("")}</div><p class="hint mt-2">6 фото · 3 документа · 1 голосовое</p></div><div class="chat-info-panel" data-info-panel="members" hidden>${isChannel ? ["Ирина Рогоцкая · Модератор", "Shine&Go · Работодатель", "Александр Волков · Специалист", "АвтоПрофи · Работодатель"].map((name) => `<div class="row mt-1">${avatar(name.slice(0, 1))}<span class="small grow">${name}</span>${icon("chevron", "sm")}</div>`).join("") : `<div class="stack"><div class="callout">Общий канал: Детейлинг · общий</div><div class="callout">Общий канал: Работа и подмены</div></div>`}</div><div class="chat-info-danger">${btn("Пожаловаться", { modal: "report.create", cls: "ghost block", iconName: "flag" })}${!isChannel ? btn("Заблокировать", { modal: "confirm.delete", cls: "ghost block", iconName: "lock" }) : ""}</div></div>`;
}

function messengerPage(ctx, type) {
  const isChannel = type === "channels";
  const source = isChannel ? CHANNELS : DIRECT;
  const active = isChannel ? ctx.chatChannel : ctx.conversation;
  const current = source.find((item) => item.id === active) || source[0];
  const messages = isChannel ? channelMessages(ctx, current) : directMessages(ctx, current);
  return `<div class="wrap messenger-page"><section class="messenger ${ctx.chatThreadOpen ? "thread-open" : ""} ${ctx.chatInfoOpen === false ? "info-closed" : "info-open"}" data-kind="${type}"><aside class="messenger-list">${listHeader(type)}<div class="messenger-items" role="list">${source.map((item) => listItem(item, type, active)).join("")}</div><div class="messenger-list-foot">${isChannel ? `${badge("6 каналов", "info")}<span>Ролевой доступ соблюдается</span>` : `${badge("Синхронизировано", "ok")}<span>Сообщения на всех устройствах</span>`}</div></aside><section class="messenger-thread" aria-label="Переписка: ${current.name}">${threadHeader(current, type, ctx)}${current.locked ? `<div class="access-banner">${icon("lock", "sm")}<span>Закрытый канал для работодателей. Запросите доступ, чтобы читать и писать.</span>${btn("Запросить доступ", { action: "request-access", cls: "sm primary" })}</div>` : pinnedBanner(ctx, type)}<div class="chat-feed" role="log" aria-live="polite" aria-label="Сообщения" id="chat-feed"><button class="load-older" data-action="load-older">${icon("refresh", "sm")} Загрузить более ранние сообщения</button><div class="day-divider"><span>Сегодня</span></div>${type === "direct" ? '<div class="unread-divider"><span>Непрочитанные сообщения</span></div>' : ""}${messages.map((message) => messageView(message, ctx, type)).join("")}${current.typing ? `<div class="typing-indicator">${avatar(current.initials, "message-avatar")}<span><i></i><i></i><i></i></span><small>${current.name} печатает…</small></div>` : ""}</div>${current.locked ? `<div class="disabled-composer">${icon("lock")}<span>Сначала запросите доступ к каналу.</span></div>` : composer(ctx, type, current.id)}</section><aside class="messenger-info">${chatInfoContent(ctx, type)}</aside></section></div>`;
}

export function telegramChatsPage(ctx) {
  return messengerPage(ctx, "channels");
}
export function telegramMessagesPage(ctx) {
  return messengerPage(ctx, "direct");
}
export function chatSourceItem(ctx, type) {
  const source = type === "channels" ? CHANNELS : DIRECT;
  return source.find((item) => item.id === (type === "channels" ? ctx.chatChannel : ctx.conversation)) || source[0];
}
