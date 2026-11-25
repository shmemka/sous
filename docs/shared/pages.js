/* Карта экранов СОУС: все страницы, которые нужно задизайнить.
   Статусы: "done" готово, "wip" в работе, "todo" не начато.
   href: адрес готового экрана в этом прототипе (относительно папки docs/<страница>/). */
window.SOUS_PAGES = [
  { title: "Главная и сообщество", pages: [
    { path: "/", title: "Главная" },
    { path: "/feed", title: "Лента и автоновости" },
    { path: "/events", title: "Мероприятия" },
    { path: "/chats", title: "Тематические чаты" },
    { path: "/messages", title: "Личные сообщения" },
    { path: "/notifications", title: "Уведомления" },
  ]},
  { title: "Работа и специалисты", pages: [
    { path: "/vacancies", title: "Вакансии и резюме", status: "done", href: "../vacancies/#/" },
    { path: "/vacancies/:id", title: "Детальная вакансии", status: "done", href: "../vacancies/#/v/vac-022" },
    { path: "/specialists", title: "Каталог специалистов", status: "done", href: "../specialists/#/" },
    { path: "/specialists/:id", title: "Профиль и резюме специалиста", status: "done", href: "../specialists/#/v/worker-001" },
    { path: "/gigs", title: "Подработки и подмены", status: "done", href: "../gigs/#/" },
    { path: "/gigs/:id", title: "Детальная подработки", status: "done", href: "../gigs/#/v/gig-016" },
    { path: "/orders", title: "Заявки автовладельцев" },
    { path: "/orders/:id", title: "Детальная заявки" },
    { path: "/resume/new", title: "Создание резюме", status: "done", href: "../resume/#/new" },
    { path: "/resume/:id/edit", title: "Редактор резюме", status: "done", href: "../resume/#/edit" },
    { path: "/resume/:id", title: "Публичное резюме (redirect)", status: "done", href: "../specialists/#/v/worker-001", note: "Ведёт в профиль специалиста" },
    { path: "/resumes", title: "Каталог резюме (redirect)", status: "done", href: "../specialists/#/", note: "Ведёт в каталог специалистов" },
  ]},
  { title: "Компании и закупки", pages: [
    { path: "/companies", title: "Каталог компаний" },
    { path: "/companies/:id", title: "Профиль компании" },
    { path: "/companies/directory/:id", title: "Компания из открытого каталога" },
    { path: "/suppliers", title: "Поставщики и закупки" },
    { path: "/suppliers/:id", title: "Профиль поставщика" },
    { path: "/supply-requests", title: "Заявки на закупку" },
    { path: "/supply-requests/new", title: "Новая заявка на закупку" },
    { path: "/supply-requests/:id", title: "Тендер по заявке" },
    { path: "/purchases/new", title: "Новая коллективная закупка" },
  ]},
  { title: "Акции и инструменты", pages: [
    { path: "/promos", title: "Кешбэк и акции" },
    { path: "/promos/my", title: "Мои промокоды" },
    { path: "/promos/scan", title: "Сканер партнёра" },
    { path: "/promos/cashback/:id", title: "Программа кешбэка" },
    { path: "/calculator", title: "Калькулятор расхода" },
    { path: "/training", title: "Учебный центр" },
    { path: "/training/certificate/:id", title: "Проверка сертификата" },
    { path: "/analytics", title: "ГеоАналитика" },
    { path: "/analytics/guide", title: "Инструкция по аналитике" },
    { path: "/sous-map", title: "СОУС Карты" },
  ]},
  { title: "Личный кабинет", pages: [
    { path: "/dashboard", title: "Кабинет по ролям" },
    { path: "/dashboard/blocked", title: "Заблокированные пользователи" },
    { path: "/dashboard/billing", title: "Подписка (redirect)" },
    { path: "/dashboard/billing/history", title: "История платежей" },
    { path: "/profile", title: "Мой профиль (redirect)" },
    { path: "/profile/:id", title: "Публичный профиль" },
    { path: "/payments", title: "Платежи (redirect)" },
    { path: "/payments/success", title: "Успешная оплата" },
    { path: "/payments/fail", title: "Ошибка оплаты" },
    { path: "/payments/stub-pay/:id", title: "Тестовая оплата" },
  ]},
  { title: "Вход и регистрация", pages: [
    { path: "/login", title: "Вход по телефону" },
    { path: "/login/employee", title: "Вход сотрудника компании" },
    { path: "/register", title: "Регистрация по ролям" },
  ]},
  { title: "Администрирование", pages: [
    { path: "/admin", title: "Админ-панель (19 разделов)" },
    { path: "/admin/reports", title: "Жалобы пользователей" },
  ]},
  { title: "Информация и документы", pages: [
    { path: "/contacts", title: "Контакты" },
    { path: "/terms", title: "Пользовательское соглашение" },
    { path: "/privacy", title: "Политика персональных данных" },
    { path: "/consent", title: "Согласие на обработку данных" },
  ]},
];

/* Найти страницу по пути вида /companies/company-001 */
window.SOUS_FIND_PAGE = function (path) {
  const clean = (path || "/").split("?")[0].replace(/\/+$/, "") || "/";
  for (const group of window.SOUS_PAGES) {
    for (const page of group.pages) {
      const re = new RegExp("^" + page.path.replace(/:[^/]+/g, "[^/]+") + "$");
      if (re.test(clean)) return page;
    }
  }
  return null;
};
