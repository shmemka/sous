export const NAV = [
  ["/feed", "Лента и Автоновости"], ["/vacancies", "Вакансии и Резюме"],
  ["/gigs", "Подработки и Срочные подмены"], ["/orders", "Заявки Автовладельцев"],
  ["/suppliers", "Маркетплейс Поставщиков"], ["/promos", "Кешбеки и акции"],
  ["/calculator", "Калькулятор расхода"], ["/training", "Учебный центр"],
  ["/events", "Мероприятия"], ["/chats", "Чаты"], ["/messages", "Сообщения"], ["/sous-map", "СОУС Карты"],
];

export const ROUTE_GROUPS = [
  { title: "Главная и сообщество", routes: [
    ["/", "Главная"], ["/feed", "Лента и автоновости"], ["/events", "Мероприятия"],
    ["/chats", "Тематические чаты"], ["/messages", "Личные сообщения"], ["/notifications", "Уведомления"],
  ]},
  { title: "Работа и специалисты", routes: [
    ["/vacancies", "Вакансии и резюме"], ["/vacancies/vac-022", "Детальная вакансии"],
    ["/specialists", "Каталог специалистов"], ["/specialists/worker-001", "Профиль и резюме специалиста"],
    ["/gigs", "Подработки и подмены"], ["/gigs/gig-016", "Детальная подработки"],
    ["/orders", "Заявки автовладельцев"], ["/orders/order-001", "Детальная заявки"],
    ["/resume/new", "Создание резюме"], ["/resume/resume-001/edit", "Конструктор резюме"],
    ["/resume/resume-001", "Публичное резюме (redirect)"], ["/resumes", "Каталог резюме (redirect)"],
  ]},
  { title: "Компании и закупки", routes: [
    ["/companies", "Каталог компаний"], ["/companies/company-001", "Профиль компании"],
    ["/companies/directory/directory-001", "Компания из открытого каталога"],
    ["/suppliers", "Поставщики и закупки"], ["/suppliers/supplier-001", "Профиль поставщика"],
    ["/supply-requests", "Заявки на закупку"], ["/supply-requests/new", "Новая заявка на закупку"],
    ["/supply-requests/request-001", "Тендер по заявке"], ["/purchases/new", "Новая коллективная закупка"],
  ]},
  { title: "Акции и инструменты", routes: [
    ["/promos", "Кешбэк и акции"], ["/promos/my", "Мои промокоды"],
    ["/promos/scan", "Сканер партнёра"], ["/promos/cashback/promo-001", "Программа кешбэка"],
    ["/calculator", "Калькулятор расхода"], ["/training", "Учебный центр"],
    ["/training/certificate/UC-2026-001", "Проверка сертификата"],
    ["/analytics", "ГеоАналитика"], ["/analytics/guide", "Инструкция по аналитике"], ["/sous-map", "СОУС Карты"],
  ]},
  { title: "Личный кабинет", routes: [
    ["/dashboard", "Кабинет по ролям"], ["/dashboard/blocked", "Заблокированные пользователи"],
    ["/dashboard/billing", "Подписка (redirect)"], ["/dashboard/billing/history", "История платежей"],
    ["/profile", "Мой профиль (redirect)"], ["/profile/worker-001", "Публичный профиль"],
    ["/payments", "Платежи (redirect)"], ["/payments/success", "Успешная оплата"],
    ["/payments/fail", "Ошибка оплаты"], ["/payments/stub-pay/payment-001", "Тестовая оплата"],
  ]},
  { title: "Вход и регистрация", routes: [
    ["/login", "Вход по телефону"], ["/login/employee", "Вход сотрудника компании"], ["/register", "Регистрация по ролям"],
  ]},
  { title: "Администрирование", routes: [
    ["/admin", "Админ-панель · 19 разделов"], ["/admin/reports", "Жалобы пользователей"],
  ]},
  { title: "Информация и документы", routes: [
    ["/contacts", "Контакты"], ["/terms", "Пользовательское соглашение"],
    ["/privacy", "Политика персональных данных"], ["/consent", "Согласие на обработку данных"],
  ]},
];

export const ROLES = {
  employer: { label: "Работодатель", name: "Shine&Go", initials: "SG", tabs: ["overview", "vacancies", "gigs", "promos", "portfolio", "reviews", "team", "branches", "profile", "payments", "privacy"] },
  worker: { label: "Специалист", name: "Михаил Соколов", initials: "МС", tabs: ["overview", "resume", "gigs", "portfolio", "certificates", "reviews", "profile", "privacy"] },
  client: { label: "Клиент", name: "Иван Михайлов", initials: "ИМ", tabs: ["overview", "orders", "favorites", "reviews", "profile", "privacy"] },
  supplier: { label: "Поставщик", name: "Koch Chemie Россия", initials: "KC", tabs: ["overview", "purchases", "reviews", "profile", "payments", "privacy"] },
  partner: { label: "Партнёр", name: "Детейлинг Партнёр", initials: "ДП", tabs: ["overview", "promos", "analytics", "reviews", "profile", "payments", "privacy"] },
  admin: { label: "Администратор", name: "Ирина Рогоцкая", initials: "ИР", tabs: ["overview", "profile"] },
};

export const DASHBOARD_TABS = {
  overview: "Обзор", vacancies: "Вакансии", gigs: "Подработки", promos: "Акции", portfolio: "Портфолио",
  reviews: "Отзывы", team: "Команда", branches: "Филиалы", profile: "Профиль", payments: "Подписка",
  privacy: "Приватность", resume: "Резюме", certificates: "Сертификаты", orders: "Мои заявки",
  favorites: "Избранное", purchases: "Закупки", analytics: "Аналитика",
};

export const ADMIN_TABS = [
  ["moderation", "Модерация"], ["directory-claims", "Права на компании"], ["users", "Пользователи"],
  ["vacancies", "Вакансии"], ["orders", "Заявки"], ["analytics", "Аналитика"], ["channels", "Каналы"],
  ["promos", "Промокоды"], ["reviews", "Отзывы"], ["training", "Обучение"], ["finance", "Финансы"],
  ["support", "Поддержка"], ["posts", "Публикации"], ["audit", "Журнал действий"], ["reports", "Жалобы"],
  ["feedback", "Обратная связь"], ["broadcast", "Рассылки"], ["create-post", "Создать пост"], ["events", "Мероприятия"],
];

export const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Екатеринбург"];
export const HERO_IMAGES = { vacancies: "06", specialists: "06", gigs: "02", orders: "07", suppliers: "08", companies: "06", promos: "11", feed: "12", calculator: "03", training: "09", events: "04", analytics: "07", "sous-map": "10", chats: "13", messages: "14", dashboard: "01", contacts: "13", login: "01", register: "01" };

export const VACANCIES = [
  { id: "vac-022", title: "Мастер по PPF", company: "Shine&Go", city: "Казань", salary: "90 000–125 000 ₽", schedule: "Полный день", experience: "От 2 лет", tags: ["Полная занятость", "Официально"], description: "Ищем мастера по установке полиуретановой плёнки в действующую детейлинг-студию. Современное оборудование, стабильный поток клиентов и понятная система премирования." },
  { id: "vac-021", title: "Детейлер-полировщик", company: "АвтоПрофи", city: "Москва", salary: "от 110 000 ₽", schedule: "Сменный график", experience: "От 1 года", tags: ["Обучение", "Премии"], description: "Полировка кузова и фар, восстановительная и защитная обработка. Работа в профессиональной команде." },
  { id: "vac-020", title: "Мойщик автомобилей", company: "CleanLab", city: "Санкт-Петербург", salary: "65 000–80 000 ₽", schedule: "2/2", experience: "Без опыта", tags: ["Можно без опыта"], description: "Комплексная мойка, сушка и базовая уборка салона. Научим стандартам студии." },
  { id: "vac-019", title: "Химчистка салона", company: "Detail House", city: "Екатеринбург", salary: "от 95 000 ₽", schedule: "Полный день", experience: "От 1 года", tags: ["Профильный опыт"], description: "Глубокая химчистка салонов, работа с профессиональной химией и оборудованием." },
];

export const SPECIALISTS = [
  { id: "worker-001", title: "Михаил Соколов", company: "Детейлер · Полировка · PPF", city: "Москва", salary: "от 90 000 ₽", schedule: "Опыт 6 лет", experience: "Рейтинг 9,6", tags: ["Документы проверены", "Сертифицирован"], description: "Полировка, защитные составы и установка PPF. Портфолио из 38 работ, готов к командировкам." },
  { id: "worker-002", title: "Александр Волков", company: "Мастер химчистки", city: "Казань", salary: "от 75 000 ₽", schedule: "Опыт 4 года", experience: "Рейтинг 9,2", tags: ["Документы проверены"], description: "Химчистка текстиля и кожи, озонирование, работа с сложными загрязнениями." },
  { id: "worker-003", title: "Дмитрий Ким", company: "Мойщик · Подменный специалист", city: "Москва", salary: "от 2 500 ₽ / смена", schedule: "Опыт 2 года", experience: "Готов к подработке", tags: ["Выходные дни"], description: "Выезжаю на подменные смены по Москве. Быстро вливаюсь в регламент студии." },
];

export const GIGS = [
  { id: "gig-016", title: "Универсал на выходные", company: "Shine&Go", city: "Екатеринбург", salary: "9 500 ₽", schedule: "Сб–Вс · 18 часов", experience: "2 отклика", tags: ["Срочно", "Мойка + салон"], description: "Нужен универсальный детейлер на два дня: комплексная мойка, уборка салона и помощь мастерам." },
  { id: "gig-015", title: "Мойщик на смену завтра", company: "CleanLab", city: "Москва", salary: "2 500 ₽", schedule: "8 часов · 09:00", experience: "Пока никто", tags: ["Срочно", "Мойка"], description: "Подмена основного мойщика. Работа по готовому регламенту, химия и инвентарь на месте." },
  { id: "gig-014", title: "Полировщик на один автомобиль", company: "АвтоПрофи", city: "Казань", salary: "7 000 ₽", schedule: "6 часов", experience: "3 отклика", tags: ["Полировка"], description: "Локальная полировка четырёх элементов премиум-автомобиля под контролем старшего мастера." },
];

export const ORDERS = [
  { id: "order-001", title: "Антибактериальная обработка — Toyota RAV4", company: "Иван Михайлов", city: "Москва", salary: "до 18 000 ₽", schedule: "На этой неделе", experience: "1 отклик", tags: ["Химчистка", "Озонирование"], description: "После перевозки животных нужна глубокая химчистка салона и антибактериальная обработка с устранением запаха." },
  { id: "order-002", title: "Керамическое покрытие — BMW X5", company: "Ольга Смирнова", city: "Казань", salary: "35 000–50 000 ₽", schedule: "Гибкая дата", experience: "3 отклика", tags: ["Керамика", "Полировка"], description: "Нужна лёгкая подготовка лакокрасочного покрытия и нанесение керамики в два слоя." },
  { id: "order-003", title: "Полная химчистка салона — Kia Rio", company: "Сергей Петров", city: "Санкт-Петербург", salary: "до 15 000 ₽", schedule: "Выходные", experience: "Пока никто", tags: ["Химчистка"], description: "Салон после длительной эксплуатации, тканевые сиденья и потолок." },
];

export const SUPPLIERS = [
  { id: "supplier-001", title: "Koch Chemie Россия", company: "Автохимия · Документы проверены", city: "Москва", salary: "до 30%", schedule: "Мин. заказ от 50 000 ₽", experience: "Рейтинг 9,8", tags: ["Шампуни", "Полироли", "Защитные составы"], description: "Официальные поставки профессиональной автохимии для детейлинг-студий и автосервисов." },
  { id: "supplier-002", title: "Detail Equipment", company: "Оборудование · Документы проверены", city: "Санкт-Петербург", salary: "до 18%", schedule: "Доставка по РФ", experience: "Рейтинг 9,4", tags: ["Полировальники", "Пылесосы", "Лампы"], description: "Оборудование и оснащение детейлинг-студий с гарантией и сервисом." },
  { id: "supplier-003", title: "Microfiber Pro", company: "Расходные материалы", city: "Казань", salary: "до 22%", schedule: "Мин. заказ от 15 000 ₽", experience: "Рейтинг 9,1", tags: ["Микрофибра", "Аппликаторы", "Скребки"], description: "Микрофибра и расходные материалы собственного производства оптом." },
];

export const COMPANIES = [
  { id: "company-001", title: "Shine&Go", company: "Детейлинг-студия · Документы проверены", city: "Казань", salary: "9,8 / 10", schedule: "12 открытых вакансий", experience: "3 филиала", tags: ["PPF", "Полировка", "Керамика"], description: "Полный спектр детейлинг-услуг: защита кузова, полировка, керамика и химчистка." },
  { id: "company-002", title: "CleanLab", company: "Автомойка · Документы проверены", city: "Москва", salary: "9,4 / 10", schedule: "4 вакансии", experience: "2 филиала", tags: ["Мойка", "Химчистка"], description: "Городская сеть автомоек с едиными стандартами качества и обученным персоналом." },
  { id: "company-003", title: "АвтоПрофи", company: "Детейлинг и автосервис", city: "Санкт-Петербург", salary: "9,2 / 10", schedule: "7 вакансий", experience: "5 филиалов", tags: ["Детейлинг", "Автосервис"], description: "Техническое обслуживание, кузовной ремонт и детейлинг премиальных автомобилей." },
];

export const PROMOS = [
  { id: "promo-001", title: "Кешбэк до 3 000 ₽ за химчистку", company: "Детейлинг Партнёр", city: "Москва", salary: "до 3 000 ₽", schedule: "До 30 ноября", experience: "Осталось 42 активации", tags: ["Растущий кешбэк", "Химчистка"], description: "Получите услугу у партнёра, загрузите чек и получите кешбэк после проверки. Сумма растёт с каждой новой активацией." },
  { id: "promo-002", title: "Скидка 20% на керамику", company: "Shine&Go", city: "Казань", salary: "−20%", schedule: "До 15 декабря", experience: "По QR-коду", tags: ["Керамика", "QR"], description: "Скидка на комплекс полировки и керамического покрытия кузова." },
  { id: "promo-003", title: "Бесплатная диагностика ЛКП", company: "АвтоПрофи", city: "Санкт-Петербург", salary: "0 ₽", schedule: "По записи", experience: "По QR-коду", tags: ["Диагностика"], description: "Оценка состояния лакокрасочного покрытия и рекомендации по уходу." },
];

export const PURCHASES = [
  { id: "purchase-001", title: "Полировальная паста Koch Chemie, 20 л", company: "Koch Chemie Россия", city: "Москва", salary: "1 850 ₽ / л", schedule: "Собрано 14 из 20 л", experience: "До конца 4 дня", tags: ["70% собрано", "Выгода 24%"], description: "Совместная закупка полировальной пасты. Минимальный объём от студии — 1 литр." },
  { id: "purchase-002", title: "Микрофибра 40×40, упаковка 50 шт", company: "Microfiber Pro", city: "Казань", salary: "6 900 ₽ / уп.", schedule: "Собрано 32 из 50 уп.", experience: "До конца 7 дней", tags: ["64% собрано"], description: "Плотная безворсовая микрофибра для кузова и салона, разные цвета по зонам." },
];

export const MODAL_GROUPS = [
  ["Публикации", ["vacancy.create", "gig.create", "order.create", "purchase.create", "supply-request.create", "promo.create", "post.create", "work.create"]],
  ["Отклики и участие", ["vacancy.apply", "gig.apply", "order.apply", "purchase.join", "supply-request.respond", "course.enroll", "event.speaker", "specialist.invite"]],
  ["Промо и сервисы", ["promo.details", "promo.qr", "cashback.receipt", "calculator.save", "training.material", "analytics.report", "map.city", "gallery.view"]],
  ["Кабинет", ["team.invite", "team.edit", "team.roles", "branch.create", "review.reply", "tariff.compare", "share.profile", "message.new"]],
  ["Администрирование", ["admin.ban", "admin.role", "admin.subscription", "admin.review", "admin.report-reply", "admin.decision", "admin.report-restriction", "admin.user", "admin.recheck", "admin.promo", "admin.cashback", "admin.training", "channel.create"]],
  ["Системные", ["confirm.delete", "confirm.pause", "confirm.duplicate", "report.create", "auth.required", "form.success"]],
];
