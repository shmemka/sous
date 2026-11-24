# Копия стенда: где что лежит

Исходники стенда https://sous-design-prototype.vercel.app (снято 24.11.2026). Это простые ES-модули без сборки: читать нужный кусок через `grep -n` и `sed -n`, а не файл целиком.

| Файл | Что внутри |
|---|---|
| `data.mjs` | Все данные: `NAV`, `ROUTE_GROUPS` (карта экранов), `ROLES` и вкладки кабинета по ролям, `VACANCIES`, `SPECIALISTS`, `GIGS`, `ORDERS`, `SUPPLIERS`, `COMPANIES`, `PROMOS`, `PURCHASES` |
| `pages.mjs` | `renderPage()` в конце файла: маршрут → функция. Простые экраны тут же |
| `components.mjs` | Общие блоки стенда: `hero`, `filters`, `cards`, `catalogPage`, `detailPage`, `emptyState`, `table` |
| `workspace-pages.mjs` | Кабинет по ролям, публичные профили, детальные вакансии, подработки, заявки, акции |
| `tools-pages.mjs` | Калькулятор расхода, СОУС Карты |
| `chat-pages.mjs` | Чаты и личные сообщения |
| `home.mjs`, `home-content.mjs` | Главная |
| `registration.mjs` | Вход, регистрация по ролям |
| `admin-pages.mjs` | Админ-панель |
| `modals.mjs` | Все модальные сценарии: объект с ключами вида `"vacancy.apply"`, плюс `specialModal()` для служебных |
| `app.mjs` | Роутер, шапка, мобильное меню, обработчики действий |
| `*.css` | Стили стенда (для справки: наши токены уже в `docs/shared/sous.css`) |

## Маршрут → функция

| Маршрут | Функция | Файл |
|---|---|---|
| `/` | `completeHomePage` | home.mjs |
| `/feed` | `feedPage` | pages.mjs |
| `/vacancies`, `/specialists`, `/gigs`, `/orders`, `/suppliers`, `/companies`, `/promos` | `catalogPage({...})` с параметрами прямо в `renderPage` | pages.mjs → components.mjs |
| `/vacancies/:id`, `/gigs/:id`, `/orders/:id`, `/promos/:id` | `catalogDetailPage` → `vacancyDetail`, `taskDetail`, `promoDetail` | workspace-pages.mjs |
| `/specialists/:id`, `/companies/:id`, `/suppliers/:id`, `/profile/:id` | `publicProfilePage` | workspace-pages.mjs |
| `/companies/directory/:id` | `companiesDirectoryPage` | pages.mjs |
| `/supply-requests`, `/new`, `/:id` | `supplyRequestsPage`, `newSupplyRequestPage`, `supplyRequestDetailPage` | pages.mjs |
| `/suppliers/purchase-:id` | `purchaseDetailPage` | pages.mjs |
| `/purchases/new` | `purchaseNewPage` | pages.mjs |
| `/promos/my`, `/promos/scan`, `/promos/cashback/:id` | `myPromosPage`, `scanPromoPage`, `cashbackPage` | pages.mjs |
| `/calculator` | `calculatorPage` | tools-pages.mjs |
| `/sous-map` | `mapPage` | tools-pages.mjs |
| `/training`, `/training/certificate/:id` | `trainingPage`, `certificatePage` | pages.mjs |
| `/events` | `eventsPage` | pages.mjs |
| `/analytics`, `/analytics/guide` | `analyticsPage`, `analyticsGuidePage` | pages.mjs |
| `/chats`, `/messages` | `telegramChatsPage`, `telegramMessagesPage` | chat-pages.mjs |
| `/notifications` | `notificationsPage` | pages.mjs |
| `/dashboard` | `dashboardPage` (по ролям) | workspace-pages.mjs |
| `/dashboard/blocked`, `/dashboard/billing/history` | `blockedPage`, `billingHistoryPage` | pages.mjs |
| `/resume/new`, `/resume/:id/edit` | `resumeNewPage`, `resumeEditPage` | pages.mjs |
| `/payments/success`, `/fail`, `/stub-pay/:id` | `paymentPage`, `stubPaymentPage` | pages.mjs |
| `/login`, `/login/employee`, `/register` | `loginPage`, `registrationPage` | registration.mjs |
| `/admin`, `/admin/reports` | `adminPage` | admin-pages.mjs |
| `/contacts`, `/terms`, `/privacy`, `/consent` | `contactsPage`, `legalPage` | pages.mjs |

Редиректы стенда: `/resumes` → `/specialists`, `/resume/:id` → `/specialists/:id`, `/profile` и `/dashboard/billing` → `/dashboard`, `/payments` → `/dashboard/billing/history` (см. `app.mjs`).

Карта стенда в заголовке пишет «52 маршрута», а в `ROUTE_GROUPS` перечислено 56 экранов. Источник правды для нас: `docs/shared/pages.js`.
