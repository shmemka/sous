import { HOME } from "./home-content.mjs";
import { avatar, badge, btn, icon, linkBtn } from "./components.mjs";

const imagePanel = (image, title, cls = "") => `<div class="home-image ${cls}" data-hero-image="${image}" style="--hero-art:url('/public/images/heroes/${image}-dark.webp')" role="img" aria-label="${title}"></div>`;
const sectionTitle = (eyebrow, title, description = "") => `<header class="home-section-head"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${description ? `<p>${description}</p>` : ""}</header>`;
const checkList = (items) => `<ul class="home-checks">${items.map((item) => `<li>${icon("check", "sm")}<span>${item}</span></li>`).join("")}</ul>`;

function homeHero() {
  const h = HOME.hero;
  return `<section class="home-hero" data-hero-image="01" style="--hero-art:url('/public/images/heroes/01-dark.webp')"><div class="wrap home-hero-inner"><div class="home-hero-copy"><div class="eyebrow">${h.eyebrow}</div><div class="home-hero-brand">СОУС</div><h1>${h.title}</h1><p class="home-hero-support">${h.subtitle}</p><div class="row">${linkBtn(h.primary, "/register", { cls: "primary lg", iconName: "chevron" })}</div><nav class="home-quick-tasks" aria-label="Популярные задачи"><a href="#/vacancies" data-path="/vacancies">${icon("briefcase", "sm")}<span>Найти работу</span></a><a href="#/orders" data-path="/orders">${icon("clipboard", "sm")}<span>Создать заявку</span></a><a href="#/promos" data-path="/promos">${icon("ticket", "sm")}<span>Получить выгоду</span></a><a href="#/sous-map" data-path="/sous-map">${icon("map", "sm")}<span>Открыть карту</span></a></nav></div></div></section>`;
}

function gatewaySection() {
  return `<section class="home-section" id="gateway"><div class="wrap">${sectionTitle("С чего начать", "Выберите свою задачу", "Откройте нужный сценарий: откликнуться на работу, найти клиента, закупить материалы или получить бонусы.")}<div class="home-gateway-grid">${HOME.gateway.map((role) => `<details class="home-gateway-card" name="gateway"><summary><span class="logo-tile">${icon(role.icon, "lg")}</span><span class="grow"><b>${role.title}</b><span>${role.needs[0]}</span></span><span class="gateway-plus">${icon("plus")}</span></summary><div class="gateway-content">${checkList(role.needs)}<div class="gateway-actions">${role.actions.map(([label, path]) => `<a href="#${path}" data-path="${path}">${icon("chevron", "sm")}<span>${label}</span></a>`).join("")}</div></div></details>`).join("")}</div></div></section>`;
}

function tasksSection() {
  return `<section class="home-section home-band"><div class="wrap"><div class="home-split"><div>${sectionTitle("Единая экосистема индустрии Автоуслуг", "Вся работа — в одном окне", HOME.hero.description)}${imagePanel("02", "Платформа СОУС — работа и специалисты")}</div><div class="home-task-grid">${HOME.hero.bullets.map((bullet, index) => `<article class="home-task"><span>${String(index + 1).padStart(2, "0")}</span><p>${bullet}</p></article>`).join("")}</div></div></div></section>`;
}

function principlesSection() {
  return `<section class="home-section"><div class="wrap">${sectionTitle("Принципы платформы СОУС", "Доверие строится на правилах")}<div class="home-split reverse"><div class="home-principles-grid">${HOME.principles.map((principle, index) => `<article class="home-principle"><span>${String(index + 1).padStart(2, "0")}</span><p>${principle}</p></article>`).join("")}</div>${imagePanel("06", "Проверенные компании и специалисты")}</div></div></section>`;
}

function partnersSection() {
  return `<section class="home-partners"><div class="wrap"><div class="eyebrow">Отраслевые партнёры и организации</div><div class="home-partners-grid">${HOME.partners.map((partner) => `<article><span class="logo-tile">${icon("shield", "lg")}</span><p>${partner}</p></article>`).join("")}</div></div></section>`;
}

function statsSection() {
  return `<section class="home-section home-band"><div class="wrap"><div class="home-split">${imagePanel("07", "Аналитика и показатели сообщества")}<div>${sectionTitle("Цифры сообщества", "Измеримый масштаб участников", "Актуальные показатели по состоянию на I квартал 2026 года. Данные обновляются ежемесячно и публикуются в открытых аналитических отчётах платформы.")}<div class="home-stats-grid">${HOME.stats.map(([value, label], index) => `<div class="home-stat"><small>${String(index + 1).padStart(2, "0")}</small><strong>${value}</strong><span>${label}</span></div>`).join("")}</div></div></div></div></section>`;
}

function manifestoSection() {
  return `<section class="home-section"><div class="wrap"><div class="home-manifesto"><div>${sectionTitle("Манифест СОУС · 2026", HOME.manifesto.title)}<div class="home-manifesto-copy">${HOME.manifesto.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div><button class="home-more home-manifesto-more" data-action="home-manifesto" aria-expanded="false"><span>Читать манифест полностью</span>${icon("plus", "sm")}</button><div class="home-manifesto-meta">${HOME.manifesto.meta.map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`).join("")}</div></div>${imagePanel("13", "Профессиональное сообщество Автоуслуг")}</div></div></section>`;
}

function rolesSection() {
  return `<section class="home-section home-roles"><div class="wrap">${sectionTitle("Роли участников платформы", "Пять статусов — единая инфраструктура", HOME.rolesIntro)}<div class="home-role-list">${HOME.roles.map((role, index) => `<article class="home-role" id="role-${role.id}"><div class="home-role-copy"><div class="home-role-number">${String(index + 1).padStart(2, "0")}</div><div class="eyebrow">${role.subtitle}</div><h3>${role.name}</h3><p>${role.description}</p>${imagePanel(role.image, role.name)}</div><div class="home-role-panel">${checkList(role.bullets)}<div class="home-role-foot"><div><small>В цифрах</small><strong>${role.stat[0]}</strong><span>${role.stat[1]}</span></div>${linkBtn("Узнать подробнее", role.href, { cls: "ghost", iconName: "chevron" })}</div></div></article>`).join("")}</div><button class="home-more home-roles-more" data-action="home-roles" aria-expanded="false"><span>Показать все пять ролей</span>${icon("plus", "sm")}</button></div></section>`;
}

function capabilitiesSection() {
  return `<section class="home-section home-band"><div class="wrap">${sectionTitle("Возможности платформы", "Десять функциональных направлений — в одном профессиональном контуре", "Инструментарий покрывает весь операционный цикл сервисного предприятия: от подбора кадров и снабжения до аналитики, юридического сопровождения и внешней коммуникации.")}<div class="home-capabilities-grid">${HOME.capabilities.map(([id, ico, title, description, path], index) => `<a class="home-capability" href="#${path}" data-path="${path}" id="capability-${id}"><span class="logo-tile">${icon(ico)}</span><small>${String(index + 1).padStart(2, "0")}</small><h3>${title}</h3><p>${description}</p><span class="home-link">Открыть раздел ${icon("chevron", "sm")}</span></a>`).join("")}</div></div></section>`;
}

function testimonialsSection() {
  return `<section class="home-section"><div class="wrap">${sectionTitle("Отзывы наших пользователей", "Практический опыт резидентов сообщества", "Директора сервисных предприятий, мастера, поставщики и клиенты делятся результатами работы на платформе за последние двенадцать месяцев.")}<div class="home-testimonials-grid">${HOME.testimonials.map(([name, meta, quote], index) => `<article class="home-testimonial"><header><span class="avatar photo-avatar"><img src="/public/images/avatars/${["alexander", "anna", "mikhail", "dmitry", "olga", "ivan"][index]}.jpg" alt="" loading="lazy"></span><div><b>${name}</b><span>${meta}</span></div></header><blockquote>«${quote}»</blockquote></article>`).join("")}</div></div></section>`;
}

function onboardingSection() {
  return `<section class="home-section home-band"><div class="wrap"><div class="home-split"><div>${sectionTitle("Порядок вступления", "Четыре регламентированных шага до полного доступа", "Процедура вступления в сообщество унифицирована для всех категорий участников и занимает от одного до трёх рабочих дней в зависимости от полноты представленного документального пакета.")}${imagePanel("01", "Подключение к платформе СОУС")}</div><div class="home-onboarding-list">${HOME.onboarding.map(([number, title, description]) => `<article><span>${number}</span><div><h3>${title}</h3><p>${description}</p></div></article>`).join("")}</div></div></div></section>`;
}

function faqSection() {
  return `<section class="home-section" id="faq"><div class="wrap"><div class="home-faq-grid"><div>${sectionTitle("Частые вопросы", "Регламенты, правила и процедуры сообщества")}<div class="home-faq-list">${HOME.faq.map(([question, answer], index) => `<details name="home-faq" ${index === 0 ? "open" : ""}><summary><span>${String(index + 1).padStart(2, "0")}</span><b>${question}</b><span>${icon("plus")}</span></summary><p>${answer}</p></details>`).join("")}</div></div><aside class="home-faq-aside"><h3>Не нашли ответ?</h3><p>В разделе собраны ответы на типовые вопросы резидентов и кандидатов. Направьте запрос на почту или через форму обратной связи.</p><a href="mailto:myAutoClan@yandex.ru">myAutoClan@yandex.ru</a>${linkBtn("Форма обратной связи", "/contacts", { cls: "secondary block mt-2", iconName: "message" })}</aside></div></div></section>`;
}

function closingSection() {
  return `<section class="home-section"><div class="wrap"><div class="home-closing" data-hero-image="01" style="--hero-art:url('/public/images/heroes/01-dark.webp')"><div class="eyebrow">${HOME.closing.eyebrow}</div><h2>${HOME.closing.title}</h2><p>${HOME.closing.description}</p><div class="row">${linkBtn(HOME.closing.primary, "/register", { cls: "primary lg", iconName: "chevron" })}${linkBtn(HOME.closing.secondary, "/contacts", { cls: "secondary lg", iconName: "users" })}</div></div></div></section>`;
}

function homeFooter() {
  return `<footer class="home-footer" id="contact"><div class="wrap"><div class="home-footer-grid"><div><a class="logo" href="#/" data-path="/"><img src="/public/logo.png" alt=""><span>СОУС</span></a><p>Работа, клиенты, закупки и обучение в единой профессиональной среде автоиндустрии.</p></div><div><b>Разделы</b><nav><a href="#/vacancies" data-path="/vacancies">Вакансии и резюме</a><a href="#/gigs" data-path="/gigs">Подработки</a><a href="#/orders" data-path="/orders">Заявки</a><a href="#/suppliers" data-path="/suppliers">Поставщики</a><a href="#/training" data-path="/training">Учебный центр</a><a href="#/feed" data-path="/feed">Сообщество</a></nav></div><div><b>Новости индустрии</b><form class="home-subscribe" data-form="newsletter"><input class="input" name="email" type="email" required placeholder="Email для подписки" aria-label="Email для подписки">${btn("Подписаться", { cls: "primary", attrs: 'type="submit"' })}</form><p class="hint">Подписываясь, вы соглашаетесь на обработку персональных данных и с Политикой обработки персональных данных.</p></div></div><div class="home-footer-bottom"><span>+7 (999) 521-22-51 · myAutoClan@yandex.ru</span><span>© 2026 СОУС — coyc.pro</span></div></div></footer>`;
}

export function completeHomePage() {
  return `${homeHero()}${gatewaySection()}${tasksSection()}${principlesSection()}${partnersSection()}${statsSection()}${manifestoSection()}${rolesSection()}${capabilitiesSection()}${testimonialsSection()}${onboardingSection()}${faqSection()}${closingSection()}${homeFooter()}`;
}
