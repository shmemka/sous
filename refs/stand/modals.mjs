import { CITIES, ROLES, SUPPLIERS, VACANCIES } from "./data.mjs";
import { avatar, badge, btn, field, icon, infoItem, input, linkBtn, select, table, textarea } from "./components.mjs";

const closeBtn = () => btn("", { action: "modal-close", cls: "sm icon-only ghost x", iconName: "x", attrs: 'aria-label="Закрыть"' });
const frame = (title, subtitle, body, { size = "", footer = "", noDefaultFooter = false } = {}) => `<div class="backdrop" data-action="backdrop"><section class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="m-head"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ""}</div>${closeBtn()}</header><div class="m-body">${body}</div>${noDefaultFooter ? "" : `<footer class="m-foot">${footer || `<span class="note">Поля со звёздочкой обязательны</span>${btn("Отмена", { action: "modal-close", cls: "secondary" })}${btn("Подтвердить", { action: "modal-submit", cls: "primary" })}`}</footer>`}</section></div>`;
const form = (kind, fields) => `<form class="form-grid" data-form="${kind}" id="active-modal-form">${fields}</form>`;
const successFooter = (label = "Готово") => `<span class="note">Действие выполнено в демонстрационном режиме</span>${btn(label, { action: "modal-close", cls: "primary" })}`;

const FORMS = {
  "channel.create": {
    title: "Создать канал", subtitle: "Название, тематика и доступ по ролям", size: "lg", submit: "Создать канал",
    body: () => form("channel.create", `${input("Название канала *", { full: true, value: "Матовые покрытия" })}${input("Короткое описание *", { full: true, value: "Материалы, техника и уход без изменения фактуры" })}${field("Доступ", select(["Все роли", "Только специалисты", "Только работодатели", "По приглашению"], "Все роли"))}${field("Тип канала", select(["Обсуждение", "Новости", "Вопросы и ответы"], "Обсуждение"))}${textarea("Правила канала", { value: "Делимся опытом по теме, уважаем коллег, не публикуем персональные данные." })}<div class="full callout">После создания канал отправится на модерацию. Права доступа можно изменить позже.</div>`),
  },
  "vacancy.create": {
    title: "Создать вакансию", subtitle: "После публикации вакансию увидят подходящие специалисты", size: "lg", submit: "Опубликовать вакансию",
    body: () => form("vacancy.create", `${input("Название должности *", { value: "Детейлер-полировщик", full: true })}${field("Филиал *", select(["Центральный", "Северный"], "Центральный"))}${field("График", select(["Полный день", "Сменный", "Подработка"], "Полный день"))}${input("Зарплата от, ₽ *", { type: "number", value: "80000" })}${input("Зарплата до, ₽", { type: "number", value: "120000" })}${input("Опыт", { value: "От 1 года" })}${field("Занятость", select(["Полная", "Частичная", "Проектная"], "Полная"))}${textarea("Описание обязанностей *", { value: "Полировка кузова и фар, подготовка автомобиля к защитным покрытиям." })}${textarea("Требования и условия", { value: "Опыт от года, аккуратность, знание химии. Официальное оформление и премии." })}`),
  },
  "gig.create": {
    title: "Опубликовать подработку", subtitle: "Укажите задачу, время и честную ставку", size: "lg", submit: "Опубликовать подработку",
    body: () => form("gig.create", `${input("Что нужно сделать *", { value: "Мойщик на одну смену", full: true })}${field("Тип работ", select(["Мойка", "Полировка", "Химчистка", "PPF"], "Мойка"))}${input("Город *", { value: "Москва" })}${input("Начало смены *", { type: "datetime-local", value: "2026-11-16T09:00" })}${input("Длительность, часов *", { type: "number", value: "8" })}${input("Оплата за смену, ₽ *", { type: "number", value: "2500" })}${input("Минимальная ставка, ₽", { type: "number", value: "2200" })}${textarea("Описание задачи *", { value: "Комплексная мойка и уборка салона по регламенту студии." })}${textarea("Требования и что взять с собой", { value: "Опыт базовой мойки. Форма и химия предоставляются." })}`),
  },
  "order.create": {
    title: "Опубликовать заявку", subtitle: "Исполнители предложат цену и сроки", size: "lg", submit: "Опубликовать заявку",
    body: () => form("order.create", `${field("Услуга *", select(["Химчистка салона", "Полировка", "Керамика", "PPF", "Мойка"], "Химчистка салона"))}${input("Автомобиль *", { value: "Toyota RAV4, 2023" })}${input("Бюджет до, ₽", { type: "number", value: "18000" })}${input("Желаемая дата", { type: "date", value: "2026-11-20" })}${input("Город *", { value: "Москва" })}${input("Район", { value: "Центральный" })}${textarea("Опишите задачу *", { value: "Нужна глубокая химчистка салона и антибактериальная обработка после перевозки животных." })}${field("Фото и видео автомобиля", `<input class="input" type="file" multiple accept="image/*,video/*">`, { full: true })}`),
  },
  "purchase.create": {
    title: "Создать коллективную закупку", subtitle: "Настройте товар и условия участия", size: "lg", submit: "Создать закупку",
    body: () => form("purchase.create", `${input("Товар *", { value: "Полировальная паста Koch Chemie", full: true })}${field("Поставщик", select(SUPPLIERS.map((s) => s.title), SUPPLIERS[0].title))}${input("Цена за единицу, ₽ *", { type: "number", value: "1850" })}${input("Общий объём *", { type: "number", value: "20" })}${input("Минимум от участника *", { type: "number", value: "1" })}${input("Заявки до", { type: "date", value: "2026-11-20" })}${textarea("Условия доставки", { value: "Доставка до студии в Москве включена." })}`),
  },
  "supply-request.create": {
    title: "Новая заявка на закупку", subtitle: "Поставщики предложат условия", size: "lg", submit: "Опубликовать запрос",
    body: () => form("supply-request.create", `${input("Товар или материал *", { full: true, value: "Полировальная паста Koch Chemie" })}${input("Количество *", { type: "number", value: "20" })}${field("Единица", select(["шт", "л", "уп", "кг"], "л"))}${field("Город *", select(CITIES.slice(1), "Москва"))}${input("Желаемая цена", { value: "до 1 900 ₽" })}${input("Нужно до", { type: "date", value: "2026-11-20" })}${textarea("Описание и требования", { value: "Доставка или самовывоз, нужен оригинал с документами." })}`),
  },
  "promo.create": {
    title: "Создать акцию", subtitle: "Настройте выгоду и правила активации", size: "lg", submit: "Опубликовать акцию",
    body: () => form("promo.create", `${input("Название акции *", { value: "Скидка 20% на керамику", full: true })}${field("Механика", select(["Скидка по QR", "Растущий кешбэк"], "Скидка по QR"))}${input("Размер выгоды *", { value: "20%" })}${input("Действует до", { type: "date", value: "2026-12-15" })}${input("Лимит активаций", { type: "number", value: "100" })}${input("Город", { value: "Москва" })}${textarea("Условия акции *", { value: "Скидка на комплекс полировки и керамического покрытия кузова." })}`),
  },
  "post.create": {
    title: "Новая публикация", subtitle: "Новость, опыт или объявление для сообщества", size: "lg", submit: "Опубликовать",
    body: () => form("post.create", `${input("Заголовок *", { full: true, placeholder: "Главная тема публикации" })}${field("Тип", select(["Новость", "Опыт", "Обучение", "Объявление"], "Опыт"))}${field("Кто увидит", select(["Все пользователи", "Подписчики"], "Все пользователи"))}${textarea("Текст *", { placeholder: "Поделитесь полезным опытом или новостью" })}${field("Фото и видео", `<input class="input" type="file" multiple accept="image/*,video/*">`, { full: true })}`),
  },
  "work.create": {
    title: "Добавить пример работы", subtitle: "Покажите процесс и результат", submit: "Добавить в портфолио",
    body: () => form("work.create", `${input("Название работы *", { full: true, value: "Полировка и керамика BMW X5" })}${field("Тип услуги", select(["Полировка", "PPF", "Химчистка", "Керамика"], "Полировка"))}${input("Автомобиль", { value: "BMW X5" })}${textarea("Что было сделано", { value: "Локальная полировка и керамическое покрытие в два слоя." })}${field("Фото или видео *", `<input class="input" type="file" multiple accept="image/*,video/*">`, { full: true })}`),
  },
  "vacancy.apply": {
    title: "Отклик на вакансию", subtitle: "Работодатель получит ваше резюме и сообщение", submit: "Отправить отклик",
    body: () => `<div class="card flat mb-2"><div class="post-head">${avatar("МС", "lg")}<div><b>Михаил Соколов</b><div class="hint">Детейлер · Опыт 6 лет · Резюме заполнено на 82%</div></div></div></div>${form("vacancy.apply", `${textarea("Сопроводительное сообщение", { value: "Добрый день! Имею опыт полировки и PPF более шести лет. Готов прийти на тестовый день." })}<div class="full check"><input class="cb" type="checkbox" checked required><span>Приложить актуальное резюме и портфолио</span></div>`)}`,
  },
  "gig.apply": {
    title: "Отклик на подработку", subtitle: "Предложение уйдёт заказчику в личные сообщения", submit: "Отправить предложение",
    body: () => form("gig.apply", `${input("Ваша ставка за смену, ₽", { type: "number", value: "2500" })}${input("Можете выйти к", { type: "datetime-local", value: "2026-11-16T09:00" })}${textarea("Сообщение заказчику", { value: "Готов выйти к началу смены. Есть опыт комплексной мойки по регламенту." })}`),
  },
  "order.apply": {
    title: "Предложить услуги", subtitle: "Клиент сравнит цену, опыт и условия", submit: "Отправить предложение",
    body: () => form("order.apply", `${input("Стоимость работ, ₽ *", { type: "number", value: "16000" })}${input("Можем выполнить", { value: "18 ноября, за 1 день" })}${textarea("Что входит и почему вы", { value: "Полная химчистка салона, антибактериальная обработка и озонирование. Покажу фото до/после." })}`),
  },
  "purchase.join": {
    title: "Присоединиться к закупке", subtitle: "Koch Chemie Россия · Полировальная паста", submit: "Подтвердить участие",
    body: () => form("purchase.join", `${input("Количество, литров *", { type: "number", value: "2" })}${input("Город доставки", { value: "Москва" })}<div class="full card flat"><div class="row between"><span>2 литра × 1 850 ₽</span><b>3 700 ₽</b></div><p class="hint mb-0">Оплата после подтверждения поставщика.</p></div>${textarea("Комментарий поставщику", { placeholder: "Адрес и пожелания к доставке" })}`),
  },
  "supply-request.respond": {
    title: "Предложение поставщика", subtitle: "Создадим закупку после выбора вашего предложения", size: "lg", submit: "Отправить предложение",
    body: () => form("supply-request.respond", `${input("Цена за литр, ₽ *", { type: "number", value: "1820" })}${input("Доступно, литров *", { type: "number", value: "20" })}${input("Доставка, дней", { type: "number", value: "2" })}${input("Минимум от участника", { type: "number", value: "1" })}${textarea("Условия предложения", { value: "Оригинал, документы, доставка до студии включена." })}`),
  },
  "course.enroll": {
    title: "Запись на курс", subtitle: "Мастер детейлинга · 5 дней · 45 000 ₽", submit: "Отправить заявку",
    body: () => form("course.enroll", `${field("Город и дата", select(["Москва · 23–27 ноября", "Казань · 7–11 декабря"], "Москва · 23–27 ноября"), { full: true })}${input("Имя и фамилия *", { value: "Михаил Соколов" })}${input("Телефон *", { value: "+7 (999) 521-22-51" })}${textarea("Опыт и цель обучения", { value: "Есть базовый опыт, хочу подтвердить квалификацию и систематизировать знания." })}<div class="full callout">Предоплата не требуется. Координатор свяжется для подтверждения места.</div>`),
  },
  "event.speaker": {
    title: "Заявка на выступление", subtitle: "Форум СОУС · 1 октября · Санкт-Петербург", submit: "Подать заявку",
    body: () => form("event.speaker", `${input("Тема выступления *", { full: true, value: "Как студии выстроить поток заявок без агрегаторов" })}${input("Спикер и компания *", { value: "Ирина Рогоцкая · СОУС" })}${input("Длительность", { value: "20 минут" })}${textarea("О чём расскажете *", { value: "Практика работы с прямыми заявками, репутацией и локальным сообществом." })}`),
  },
  "specialist.invite": {
    title: "Пригласить на вакансию", subtitle: "Михаил Соколов получит приглашение в личные сообщения", submit: "Отправить приглашение",
    body: () => form("specialist.invite", `${field("Вакансия *", select(VACANCIES.map((v) => v.title), VACANCIES[0].title), { full: true })}${textarea("Сообщение специалисту", { value: "Заинтересовал ваш опыт. Приглашаю обсудить работу в нашей студии." })}`),
  },
  "cashback.receipt": {
    title: "Чек на кешбэк", subtitle: "Отправим на проверку администратору", submit: "Отправить чек",
    body: () => form("cashback.receipt", `${input("Дата услуги *", { type: "date", value: "2026-11-15" })}${input("Сумма чека, ₽ *", { type: "number", value: "8500" })}${field("Фото или PDF чека *", `<input class="input" type="file" accept="image/*,.pdf">`, { full: true })}<div class="full callout">Выплата после проверки на телефон СБП +7 (999) •••-22-51.</div>`),
  },
  "calculator.save": {
    title: "Сохранить шаблон расчёта", subtitle: "Сохраним параметры в вашем кабинете", submit: "Сохранить шаблон",
    body: () => form("calculator.save", `${input("Название шаблона *", { full: true, value: "Кроссовер · Комплексная мойка" })}${textarea("Комментарий", { value: "Koch Chemie Green Star · 1:10 · пенный комплект" })}`),
  },
  "team.invite": {
    title: "Пригласить сотрудника", subtitle: "Он войдёт по номеру телефона и коду из СМС", submit: "Отправить приглашение",
    body: () => form("team.invite", `${input("Телефон сотрудника *", { full: true, type: "tel", placeholder: "+7 (9__) ___-__-__" })}${field("Роль", select(["Администратор", "Старший мастер", "Мастер", "Мойщик"], "Мастер"))}${field("Филиал", select(["Центральный", "Северный"], "Центральный"))}`),
  },
  "team.edit": {
    title: "Права сотрудника", subtitle: "Анна Смирнова · Центральный филиал", submit: "Сохранить права",
    body: () => form("team.edit", `${field("Роль", select(["Администратор", "Старший мастер", "Мастер", "Мойщик"], "Администратор"))}${field("Филиал", select(["Центральный", "Северный"], "Центральный"))}<div class="full"><label class="check"><input class="cb" type="checkbox" checked><span>Создание и редактирование публикаций</span></label><label class="check"><input class="cb" type="checkbox" checked><span>Управление откликами</span></label><label class="check"><input class="cb" type="checkbox"><span>Управление оплатой</span></label></div>`),
  },
  "team.roles": {
    title: "Роли и разрешения", subtitle: "Единые правила для всех сотрудников", size: "lg", submit: "Сохранить роли",
    body: () => table(["Разрешение", "Администратор", "Старший мастер", "Мастер"], [["Публикации", badge("Полный", "ok"), badge("Создание", "info"), badge("Свои")], ["Отклики", badge("Полный", "ok"), badge("Назначение", "info"), badge("Просмотр")], ["Команда", badge("Полный", "ok"), badge("—"), badge("—")], ["Оплата", badge("Полный", "ok"), badge("—"), badge("—")]]),
  },
  "branch.create": {
    title: "Филиал компании", subtitle: "Адрес, команда и зона работы", submit: "Сохранить филиал",
    body: () => form("branch.create", `${input("Название филиала *", { value: "Центральный" })}${input("Город *", { value: "Москва" })}${input("Адрес *", { full: true, value: "Тверская, 12" })}${input("Телефон", { value: "+7 (999) 521-22-51" })}${input("Координаты", { placeholder: "55.7558, 37.6173" })}${field("Статус", select(["Активен", "На паузе"], "Активен"))}`),
  },
  "review.reply": {
    title: "Ответ на отзыв", subtitle: "Ответ будет виден публично под отзывом", submit: "Опубликовать ответ",
    body: () => `<div class="callout mb-2">«Всё прошло отлично: быстро согласовали дату, аккуратно выполнили работу и показали результат.»</div>${form("review.reply", textarea("Ваш ответ *", { value: "Спасибо за доверие! Будем рады видеть вас снова." }))}`,
  },
  "message.new": {
    title: "Новый диалог", subtitle: "Найдите пользователя или компанию", submit: "Начать диалог",
    body: () => form("message.new", `${input("Получатель *", { full: true, value: "Михаил Соколов" })}<div class="full card flat"><div class="post-head">${avatar("МС")}<div><b>Михаил Соколов</b><div class="hint">Детейлер · Москва · Документы проверены</div></div></div></div>${textarea("Сообщение *", { value: "Добрый день! Хочу обсудить сотрудничество." })}`),
  },
  "admin.ban": {
    title: "Заблокировать пользователя", subtitle: "Доступ к аккаунту будет ограничен", submit: "Заблокировать",
    body: () => `<div class="callout danger mb-2"><b>Михаил Соколов</b><p class="small mb-0">Специалист · Москва</p></div>${form("admin.ban", textarea("Причина блокировки *", { placeholder: "Укажите причину для журнала модерации" }))}`,
  },
  "admin.role": {
    title: "Изменить роль", subtitle: "Права пользователя изменятся после сохранения", submit: "Сохранить роль",
    body: () => form("admin.role", `${field("Новая роль", select(Object.values(ROLES).map((role) => role.label), "Специалист"), { full: true })}<div class="full callout warn">Проверьте связанные публикации и доступы перед сменой роли.</div>`),
  },
  "admin.subscription": {
    title: "Управление подпиской", subtitle: "Shine&Go · Работодатель", submit: "Сохранить подписку",
    body: () => form("admin.subscription", `${field("Продлить на", select(["1 месяц", "3 месяца", "6 месяцев", "12 месяцев"], "1 месяц"), { full: true })}${field("Статус", select(["Активна", "Приостановлена", "Без подписки"], "Активна"))}`),
  },
  "admin.review": {
    title: "Редактировать отзыв", subtitle: "Изменения попадут в журнал модерации", submit: "Сохранить отзыв",
    body: () => form("admin.review", `${field("Оценка", select(["10 / 10", "8 / 10", "6 / 10", "4 / 10", "2 / 10"], "10 / 10"), { full: true })}${textarea("Текст отзыва", { value: "Всё прошло отлично: быстро согласовали дату и выполнили работу." })}`),
  },
  "admin.report-reply": {
    title: "Ответ отправителю", subtitle: "Сообщение будет связано с этой жалобой", submit: "Отправить ответ",
    body: () => form("admin.report-reply", `${field("Получатель", input("", { value: "Отправитель жалобы", attrs: "readonly" }), { full: true })}${textarea("Сообщение *", { value: "Здравствуйте! Мы проверяем вашу жалобу. Спасибо, что сообщили о проблеме.", attrs: "required" })}`),
  },
  "admin.decision": {
    title: "Решение по жалобе", subtitle: "Итог и комментарий сохранятся в журнале модерации", submit: "Сохранить решение",
    body: () => form("admin.decision", `${field("Итог рассмотрения", select(["Нарушение подтверждено", "Нарушение не найдено", "Нужны дополнительные сведения"], "Нарушение подтверждено"), { full: true })}${textarea("Комментарий модератора *", { placeholder: "Укажите, что проверено и какое решение принято", attrs: "required" })}`),
  },
  "admin.report-restriction": {
    title: "Ограничить публикацию", subtitle: "Объект скроется из каталога до завершения проверки", submit: "Ограничить публикацию",
    body: () => form("admin.report-restriction", `<div class="full callout warn">Пользователь увидит причину ограничения и сможет обратиться в поддержку.</div>${textarea("Причина *", { placeholder: "Укажите нарушение для журнала и уведомления", attrs: "required" })}`),
  },
  "admin.recheck": {
    title: "Повторная проверка", subtitle: "Запросим документы и комментарий", submit: "Отправить на проверку",
    body: () => form("admin.recheck", `${input("Компания или пользователь", { full: true, value: "Детейлинг Партнёр" })}${textarea("Комментарий заявителю", { value: "Подтвердите документы компании и связь телефона с руководителем." })}`),
  },
  "admin.promo": {
    title: "Промокод администратора", subtitle: "Создание и настройка акции", size: "lg", submit: "Сохранить промокод",
    body: () => FORMS["promo.create"].body(),
  },
  "admin.cashback": {
    title: "Кампания кешбэка", subtitle: "Старт, максимум и правила роста", submit: "Сохранить кампанию",
    body: () => form("admin.cashback", `${input("Стартовая сумма, ₽", { type: "number", value: "1000" })}${input("Максимум, ₽", { type: "number", value: "3000" })}${input("Шаг роста, ₽", { type: "number", value: "50" })}${input("Лимит участников", { type: "number", value: "100" })}${textarea("Условия проверки чеков", { value: "Проверка вручную в течение трёх рабочих дней." })}`),
  },
  "admin.training": {
    title: "Категории обучения", subtitle: "Управление структурой теории", submit: "Сохранить структуру",
    body: () => form("admin.training", `${input("Название категории", { value: "Полировка" })}${input("Порядок", { type: "number", value: "1" })}${field("Статус", select(["Опубликовано", "Скрыто"], "Опубликовано"))}${textarea("Описание", { value: "Материалы по подготовке и полировке кузова." })}`),
  },
};

function specialModal(kind) {
  if (kind === "promo.details") return frame("Условия акции", "Активируйте перед посещением партнёра", `<h3>Скидка 20% на керамику</h3><p class="prose">Скидка на комплекс полировки и керамического покрытия кузова. Покажите QR сотруднику до оплаты.</p><div class="info-list">${infoItem("calendar", "Срок", "До 15 декабря")}${infoItem("pin", "Город", "Казань")}${infoItem("store", "Партнёр", "Shine&Go")}</div>`, { footer: `${btn("Все акции", { action: "modal-close", cls: "secondary" })}${btn("Активировать", { action: "modal-submit", cls: "primary" })}` });
  if (kind === "promo.qr") return frame("Покажите QR сотруднику", "Скидка 20% на керамику · Shine&Go", `<div class="qr" aria-label="QR промокода"></div><div style="text-align:center"><b>SOUS-2026-8F42</b><p class="hint">Действует ещё 18 часов. Не сканируйте код самостоятельно.</p></div>`, { noDefaultFooter: true });
  if (kind === "training.material") return frame("Химчистка кожи: безопасная работа", "Видео · 18 минут + памятка PDF", `<div class="scan-frame" style="aspect-ratio:16/9">${btn("", { action: "play", cls: "icon-only primary lg", iconName: "play", attrs: 'aria-label="Воспроизвести"' })}</div><div class="prose mt-2"><p>Разбираем типы кожи, выбор химии, мягкие инструменты и финишную защиту без пересушивания.</p></div>${btn("Скачать памятку PDF", { action: "download", cls: "secondary", iconName: "download" })}`, { noDefaultFooter: true });
  if (kind === "analytics.report") return frame("Отчёт AI по району", "Москва · Центральный · сформирован на данных платформы", `<div class="callout ok mb-2"><b>Главная возможность</b><p class="small mb-0">Спрос на химчистку растёт быстрее предложения: +18% за две недели.</p></div><div class="grid2"><div class="kpi"><b>248</b><span>заявок</span></div><div class="kpi"><b>86</b><span>конкурентов</span></div></div><h3 class="mt-3">Пять шагов</h3><ol class="prose"><li>Усилить предложение химчистки в каталоге.</li><li>Проверить цену: рынок вырос на 6%.</li><li>Открыть две подменные смены на выходные.</li><li>Подготовить запасы к пику в апреле.</li><li>Запустить акцию на озонирование — конкурентов нет.</li></ol>`, { footer: `${btn("Закрыть", { action: "modal-close", cls: "secondary" })}${btn("Скачать отчёт", { action: "download", cls: "primary", iconName: "download" })}` });
  if (kind === "analytics.chat") return frame("AI-аналитик", "Отвечает на основе данных Москвы и Центрального района", `<div class="chat-messages" style="height:320px;border:1px solid var(--border-divider);border-radius:12px"><div class="message"><b>AI-аналитик</b><br>Спрос на химчистку вырос на 18%. Средний чек 12 000 ₽, а активных конкурентов всего 7.<time>Только что</time></div></div><form class="chat-compose" data-form="analytics.chat" style="padding:12px 0 0"><input class="input grow" name="text" placeholder="Например, какую цену поставить?"><button class="btn primary icon-only" type="submit">${icon("send")}</button></form>`, { noDefaultFooter: true });
  if (kind === "map.city") return frame("Выбрать город", "Карта сразу перенесёт вас к компаниям", `<input class="input mb-2" placeholder="Поиск города…">${CITIES.slice(1).map((city, i) => `<button class="chat-item" data-action="map-select" data-city="${city}">${icon("pin")}<div class="grow"><b>${city}</b><p>${[32, 24, 18, 12][i]} компаний</p></div>${icon("chevron")}</button>`).join("")}${btn("Вся Россия", { action: "map-select", cls: "ghost block mt-2", attrs: 'data-city="Все города"' })}`, { noDefaultFooter: true });
  if (kind === "map.company") return frame("Shine&Go", "Детейлинг-студия · Документы проверены", `<div class="info-list">${infoItem("pin", "Адрес", "Казань, Центральный район")}${infoItem("star", "Рейтинг", "9,8 / 10 · 42 отзыва")}${infoItem("wrench", "Услуги", "PPF, полировка, керамика")}${infoItem("phone", "Телефон", "+7 (999) 521-22-51")}</div><div class="row mt-3">${linkBtn("Открыть профиль", "/companies/company-001", { cls: "primary grow" })}${linkBtn("На карте", "/companies/directory/directory-001", { cls: "secondary grow" })}</div>`, { noDefaultFooter: true });
  if (kind === "gallery.view") return frame("Фото работы", "Полировка и керамическое покрытие · BMW X5", `<div style="aspect-ratio:16/10;border-radius:14px;background:url('/public/images/heroes/04-dark.webp') center/cover"></div><div class="row between mt-2">${btn("Предыдущее", { action: "gallery-prev", cls: "ghost", iconName: "back" })}<span class="hint">1 / 6</span>${btn("Следующее", { action: "gallery-next", cls: "ghost", iconName: "chevron" })}</div>`, { size: "xl", noDefaultFooter: true });
  if (kind === "tariff.compare") return frame("Выберите тариф", "Все основные функции доступны на любом тарифе", `<div class="grid3">${[["Базовый", "0 ₽", ["Профиль и публикации", "Отклики и сообщения"]], ["Профессиональный", "2 990 ₽", ["Приоритет в каталоге", "ГеоАналитика", "Продвижение акций"]], ["Команда", "5 990 ₽", ["Всё из Pro", "До 10 сотрудников", "Отчёты по филиалам"]]].map(([name, price, features], i) => `<section class="card ${i === 1 ? "" : "flat"}" style="${i === 1 ? "border-color:var(--color-primary-500)" : ""}"><h3>${name}</h3><div class="money" style="text-align:left">${price}<small>/ месяц</small></div><ul class="prose">${features.map((feature) => `<li>${feature}</li>`).join("")}</ul>${btn(i === 1 ? "Текущий тариф" : "Выбрать", { action: i === 1 ? "modal-close" : "modal-submit", cls: i === 1 ? "secondary block" : "primary block" })}</section>`).join("")}</div>`, { size: "xl", noDefaultFooter: true });
  if (kind === "share.profile") return frame("Поделиться профилем", "Ссылка откроет публичную версию без личных настроек", `<div class="callout mono">https://coyc.pro/profile/worker-001</div><div class="row mt-2">${btn("Скопировать ссылку", { action: "share", cls: "primary grow", iconName: "share" })}${btn("QR", { action: "share-qr", cls: "secondary", iconName: "qr" })}</div>`, { noDefaultFooter: true });
  if (kind === "admin.user") return frame("Карточка пользователя", "Shine&Go · Работодатель · Казань", `<div class="post-head">${avatar("SG", "xl")}<div><h3>Shine&Go</h3>${badge("На проверке", "warn")}</div></div><div class="detail-meta grid2 mt-3">${infoItem("phone", "Телефон", "+7 (999) 521-22-51")}${infoItem("mail", "Email", "hello@shinego.ru")}${infoItem("calendar", "Регистрация", "12 марта 2026")}${infoItem("briefcase", "Публикации", "12 вакансий")}</div><div class="row mt-2">${btn("Подтвердить документы", { action: "modal-submit", cls: "primary", iconName: "shield" })}${btn("Подписка", { modal: "admin.subscription", cls: "secondary" })}${btn("Заблокировать", { modal: "admin.ban", cls: "danger" })}</div>`, { noDefaultFooter: true });
  if (kind === "report.create") return frame("Пожаловаться", "Модератор проверит объект и примет решение", form("report.create", `${field("Причина", select(["Спам", "Недостоверная информация", "Нарушение правил", "Другое"], "Недостоверная информация"), { full: true })}${textarea("Комментарий *", { placeholder: "Опишите проблему и добавьте детали для модератора" })}`));
  if (kind === "auth.required") return frame("Нужен аккаунт", "Войдите или зарегистрируйтесь, чтобы продолжить", `<p class="prose">Действие сохранится и будет доступно после входа. Гостевой черновик не потеряется.</p><div class="row">${linkBtn("Войти", "/login", { cls: "primary grow" })}${linkBtn("Регистрация", "/register", { cls: "secondary grow" })}</div>`, { noDefaultFooter: true });
  if (kind === "form.success") return frame("Готово", "Изменения сохранены", `<div class="success-state empty" style="border:0">${icon("check")}<h3>Действие выполнено</h3><p>Данные обновлены. Можно продолжить работу.</p></div>`, { footer: successFooter() });
  if (kind === "promo.my") return frame("Мои промокоды", "Активированные акции и QR-коды", `<p class="prose">Здесь хранятся все ваши активации и сроки действия QR.</p>${linkBtn("Открыть мои промокоды", "/promos/my", { cls: "primary block" })}`, { noDefaultFooter: true });
  if (kind === "resume.create") return frame("Создать резюме", "Начните с основной информации", `<p class="prose">Ответы сохранятся и перенесутся в полный конструктор резюме.</p>${linkBtn("Начать", "/resume/new", { cls: "primary block" })}`, { noDefaultFooter: true });
  if (["confirm.delete", "confirm.pause", "confirm.duplicate"].includes(kind)) {
    const title = kind === "confirm.delete" ? "Подтвердите удаление" : kind === "confirm.pause" ? "Поставить на паузу?" : "Дублировать объект?";
    return frame(title, "Проверьте действие перед подтверждением", `<div class="callout ${kind === "confirm.delete" ? "danger" : "warn"}"><b>Детейлер-полировщик</b><p class="small mb-0">${kind === "confirm.delete" ? "Восстановить объект после удаления будет нельзя." : "Текущие данные сохранятся."}</p></div>`, { footer: `${btn("Отмена", { action: "modal-close", cls: "secondary" })}${btn("Подтвердить", { action: "modal-submit", cls: kind === "confirm.delete" ? "danger" : "primary" })}` });
  }
  return null;
}

export function renderModal(kind) {
  if (FORMS[kind]) {
    const config = FORMS[kind];
    return frame(config.title, config.subtitle, config.body(), { size: config.size, footer: `<span class="note">Поля со звёздочкой обязательны</span>${btn("Отмена", { action: "modal-close", cls: "secondary" })}${btn(config.submit, { action: "modal-submit", cls: "primary" })}` });
  }
  return specialModal(kind) || frame("Экран действия", kind, `<p class="prose">Действие доступно в интерактивном прототипе.</p>`);
}
