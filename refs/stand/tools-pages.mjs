import { avatar, badge, btn, esc, footer, icon, infoItem, linkBtn, select } from "./components.mjs";

const BODY_TYPES = [
  { id: "sedan", name: "Седан", area: 9.2 }, { id: "hatchback", name: "Хетчбек", area: 8.4 },
  { id: "crossover", name: "Кроссовер", area: 11 }, { id: "suv", name: "Внедорожник", area: 12.6 },
  { id: "coupe", name: "Купе", area: 8.8 }, { id: "wagon", name: "Универсал", area: 10.2 },
  { id: "minivan", name: "Минивэн", area: 13.8 }, { id: "pickup", name: "Пикап", area: 14.4 },
];
const ZONES = [
  ["hood", "Капот", "1,6 м²", 1.6, "exterior"], ["roof", "Крыша", "2,4 м²", 2.4, "exterior"],
  ["doors", "Двери", "3,2 м²", 3.2, "exterior"], ["bumpers", "Бамперы", "1,8 м²", 1.8, "exterior"],
  ["fenders", "Крылья", "1,2 м²", 1.2, "exterior"], ["glass", "Стёкла", "3 м²", 3, "exterior"],
  ["wheels", "Колёса", "4 шт.", 0, "exterior"], ["lights", "Фары", "2 шт.", 0, "exterior"],
  ["seats", "Сиденья", "5 мест", 0, "interior"], ["dashboard", "Торпедо", "1,2 м²", 1.2, "interior"],
  ["floor", "Пол и коврики", "2 м²", 2, "interior"], ["trunk", "Багажник", "1,5 м²", 1.5, "interior"],
  ["ceiling", "Потолок", "2 м²", 2, "interior"], ["doors_in", "Двери внутри", "2,4 м²", 2.4, "interior"],
];
const PRODUCTS = [
  { id: "active-foam", name: "Active Foam Pro", description: "Активная пена · 1 фаза", rate: 30, unit: "ml-per-m2", unitLabel: "мл/м²", solution: "concentrate", ratio: [1, 8], price: 420 },
  { id: "second-phase-shampoo", name: "Second Phase", description: "Ручной шампунь · 2 фаза", rate: 20, unit: "ml-per-m2", unitLabel: "мл/м²", solution: "concentrate", ratio: [1, 200], price: 390 },
  { id: "ceramic-coat", name: "Ceramic Coat Pro", description: "Керамическое покрытие", rate: 12, unit: "ml-per-m2", unitLabel: "мл/м²", solution: "ready", price: 4800 },
  { id: "crystal-glass", name: "Crystal Glass", description: "Очиститель стёкол", rate: 18, unit: "ml-per-m2", unitLabel: "мл/м²", solution: "ready", price: 380, glass: true },
  { id: "interior-cleaner", name: "Interior Cleaner", description: "Чистка салона", rate: 25, unit: "ml-per-seat", unitLabel: "мл / место", solution: "concentrate", ratio: [1, 4], price: 520 },
  { id: "iron-remover", name: "Iron Remover", description: "Удалитель металла", rate: 45, unit: "ml-per-wheel", unitLabel: "мл / колесо", solution: "ready", price: 690 },
  { id: "tar-remover", name: "Tar Remover", description: "Удалитель битума", rate: 60, unit: "ml-per-bumper", unitLabel: "мл / бампер", solution: "ready", price: 760 },
  { id: "tire-shine", name: "Tire Shine", description: "Чернитель резины", rate: 12, unit: "ml-per-wheel", unitLabel: "мл / колесо", solution: "ready", price: 540 },
  { id: "leather-care", name: "Leather Care", description: "Уход за кожей", rate: 18, unit: "ml-per-seat", unitLabel: "мл / место", solution: "ready", price: 1200 },
];
export const CALC_PRESETS = {
  wash: { name: "Быстрая мойка", body: "crossover", zones: ["hood", "roof", "doors", "bumpers", "fenders", "glass"], products: ["active-foam", "second-phase-shampoo", "crystal-glass"] },
  full: { name: "Полный комплекс", body: "crossover", zones: ["hood", "roof", "doors", "bumpers", "fenders", "glass", "wheels", "seats", "dashboard", "floor"], products: ["active-foam", "second-phase-shampoo", "crystal-glass", "iron-remover", "tire-shine", "interior-cleaner"] },
  ceramic: { name: "Детейлинг и керамика", body: "sedan", zones: ["hood", "roof", "doors", "bumpers", "fenders", "glass", "wheels"], products: ["active-foam", "second-phase-shampoo", "ceramic-coat", "iron-remover", "tar-remover"] },
  interior: { name: "Уход за салоном", body: "crossover", zones: ["seats", "dashboard", "floor", "trunk", "ceiling", "doors_in"], products: ["interior-cleaner", "leather-care"] },
};
const PERIODS = { day: ["День", 1], week: ["Неделя", 5], month: ["Месяц", 22], year: ["Год", 252] };
const number = (value, maximumFractionDigits = 1) => Number(value).toLocaleString("ru-RU", { maximumFractionDigits });
const money = (value) => `${Math.round(value).toLocaleString("ru-RU")} ₽`;

function toolHeader(eyebrow, title, description, image, actions = "") {
  return `<section class="tool-hero" data-hero-image="${image}"><div class="wrap tool-hero-inner"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="tool-hero-actions">${actions}</div>` : ""}</div></section>`;
}

function calcStep(numberValue, title, hint, body, complete = true) {
  return `<section class="calc-pro-step ${complete ? "complete" : ""}"><header><span>${numberValue}</span><div><h2>${title}</h2><p>${hint}</p></div>${complete ? icon("check", "sm") : ""}</header>${body}</section>`;
}

function selectedArea(ctx, body) {
  const external = ZONES.filter((zone) => zone[4] === "exterior" && zone[3] > 0);
  if (external.every((zone) => ctx.calcZones.has(zone[0]))) return body.area;
  return external.filter((zone) => ctx.calcZones.has(zone[0])).reduce((sum, zone) => sum + zone[3], 0);
}

function productAmount(product, rate, ctx, body) {
  if (product.unit === "ml-per-m2") {
    if (product.glass) return ctx.calcZones.has("glass") ? rate * 3 : 0;
    return rate * selectedArea(ctx, body);
  }
  if (product.unit === "ml-per-wheel") return ctx.calcZones.has("wheels") ? rate * 4 : 0;
  if (product.unit === "ml-per-bumper") return ctx.calcZones.has("bumpers") ? rate : 0;
  return ctx.calcZones.has("seats") ? rate * 5 : 0;
}

function singleResult(ctx) {
  const body = BODY_TYPES.find((item) => item.id === ctx.calcBody) || BODY_TYPES[2];
  const rows = PRODUCTS.filter((product) => ctx.calcProducts.has(product.id)).map((product) => {
    const rate = Number(ctx.calcRates[product.id] ?? product.rate);
    const ml = Math.round(productAmount(product, rate, ctx, body));
    const ratio = product.id === "active-foam" ? ctx.calcRatio.split(":").map(Number) : product.ratio || [1, 1];
    const parts = ratio[0] + ratio[1];
    const concentrateMl = product.solution === "concentrate" ? ml / Math.max(parts, 1) : ml;
    const price = concentrateMl / 1000 * product.price;
    return { product, ml, concentrateMl, price, ratio };
  });
  return {
    body, rows,
    totalMl: rows.reduce((sum, row) => sum + row.ml, 0),
    concentrateMl: rows.reduce((sum, row) => sum + row.concentrateMl, 0),
    price: rows.reduce((sum, row) => sum + row.price, 0),
  };
}

function fleetResult(ctx) {
  const product = PRODUCTS.find((item) => item.id === ctx.fleetProduct) || PRODUCTS[0];
  const days = PERIODS[ctx.calcPeriod][1];
  let totalMl = 0;
  let washes = 0;
  BODY_TYPES.forEach((body) => {
    const count = Number(ctx.fleetDaily[body.id] || 0);
    const rate = Number(ctx.fleetRates[body.id] || 0);
    totalMl += count * rate * days;
    washes += count * days;
  });
  const ratio = product.id === "active-foam" ? ctx.calcRatio.split(":").map(Number) : product.ratio || [1, 1];
  const concentrateMl = product.solution === "concentrate" ? totalMl / Math.max(ratio[0] + ratio[1], 1) : totalMl;
  return { product, days, totalMl, washes, concentrateMl, price: concentrateMl / 1000 * product.price, canisters: Math.ceil(concentrateMl / 5000) };
}

function resultCard(ctx) {
  const single = ctx.calcMode !== "fleet";
  const result = single ? singleResult(ctx) : fleetResult(ctx);
  const mainMl = single && result.rows.some((row) => row.product.solution === "ready") && !result.rows.some((row) => row.product.solution === "concentrate") ? result.totalMl : result.concentrateMl;
  const hasConcentrate = single ? result.rows.some((row) => row.product.solution === "concentrate") : result.product.solution === "concentrate";
  return `<section class="calc-pro-result" id="calc-result"><div class="calc-result-top"><span class="workspace-kicker">Расчёт готов</span>${badge(single ? result.body.name : PERIODS[ctx.calcPeriod][0], "accent")}</div><h2>${single ? "На один автомобиль" : "На весь парк"}</h2><p>${single ? `${result.body.area.toLocaleString("ru-RU")} м² · ${ctx.calcZones.size} зон · ${result.rows.length} продуктов` : `${result.washes.toLocaleString("ru-RU")} моек · ${result.days} рабочих дней`}</p><div class="calc-result-number"><strong>${mainMl >= 1000 ? number(mainMl / 1000, 2) : number(mainMl, 0)}</strong><span>${mainMl >= 1000 ? "л" : "мл"}</span></div><div class="calc-result-label">${hasConcentrate ? "концентрата" : "готового продукта"}</div><div class="calc-result-cost"><span>Ориентировочная стоимость</span><b>${money(result.price)}</b></div><div class="calc-result-breakdown">${single ? result.rows.map((row) => `<div><span><b>${row.product.name}</b><small>${row.ml} мл · ${row.product.solution === "concentrate" ? `разведение ${Array.isArray(row.ratio) ? row.ratio.join(":") : row.ratio}` : "готовый продукт"}</small></span><strong>${number(row.concentrateMl, 0)} мл</strong></div>`).join("") : `<div><span><b>Готовый раствор</b><small>На ${result.washes} моек за период</small></span><strong>${number(result.totalMl / 1000, 1)} л</strong></div><div><span><b>${result.product.name}</b><small>${result.product.solution === "concentrate" ? `Пропорция ${ctx.calcRatio}` : "Готовый продукт"}</small></span><strong>${number(result.concentrateMl / 1000, 1)} л</strong></div><div><span><b>Канистры по 5 литров</b><small>С запасом на целую упаковку</small></span><strong>${result.canisters} шт.</strong></div>`}</div><div class="calc-result-note">${icon("info", "sm")}<span>Ориентир по паспортным нормам. Корректируйте норму под технику и загрязнение.</span></div><div class="calc-result-actions">${btn("Сохранить шаблон", { modal: "calculator.save", cls: "secondary", iconName: "bookmark" })}${btn("Закупить через СОУС", { path: "/suppliers", cls: "primary", iconName: "store" })}</div><button class="calc-download" data-action="download">${icon("download", "sm")} Скачать расчёт в PDF</button></section>`;
}

function bodyGrid(ctx, fleet = false) {
  return `<div class="calc-body-grid">${BODY_TYPES.map((body) => `<button class="calc-body-card ${ctx.calcBody === body.id ? "active" : ""}" data-action="calc-body" data-body="${body.id}" aria-pressed="${ctx.calcBody === body.id}"><span class="calc-body-image"><img src="/public/images/car-bodies/${body.id}.png" alt="${body.name}" loading="lazy"></span><span><b>${body.name}</b><small>${body.area.toLocaleString("ru-RU")} м² кузова</small></span><i>${icon("check", "sm")}</i></button>`).join("")}</div>${fleet ? `<p class="calc-field-note">Изображение помогает выбрать тип при редактировании парка ниже.</p>` : ""}`;
}

function zoneGroup(ctx, group, title) {
  return `<fieldset class="calc-zone-group"><legend>${title}</legend><div class="calc-zone-grid">${ZONES.filter((zone) => zone[4] === group).map(([id, name, area]) => `<label class="calc-zone ${ctx.calcZones.has(id) ? "active" : ""}"><input type="checkbox" data-action="calc-zone" value="${id}" ${ctx.calcZones.has(id) ? "checked" : ""}><span class="calc-zone-check">${icon("check", "sm")}</span><span><b>${name}</b><small>${area}</small></span></label>`).join("")}</div></fieldset>`;
}

function productPicker(ctx) {
  return `<div class="calc-product-grid">${PRODUCTS.map((product) => {
    const active = ctx.calcProducts.has(product.id);
    const rate = ctx.calcRates[product.id] ?? product.rate;
    return `<article class="calc-product ${active ? "active" : ""}"><label class="calc-product-select"><input type="checkbox" data-action="calc-product" value="${product.id}" ${active ? "checked" : ""}><span class="calc-product-icon">${icon(product.solution === "ready" ? "shield" : "clipboard")}</span><span><b>${product.name}</b><small>${product.description}</small></span><i>${icon("check", "sm")}</i></label>${active ? `<label class="calc-rate"><span>Норма, ${product.unitLabel}</span><input type="number" min="0" step="1" value="${rate}" data-action="calc-rate" data-product="${product.id}" aria-label="Норма для ${product.name}"></label>` : ""}</article>`;
  }).join("")}</div>`;
}

function ratioControls(ctx) {
  return `<div class="calc-ratio-controls"><div><span class="calc-field-label">Оборудование</span><div class="calc-segmented">${[["foam_kit", "Пенокомплект", "1:8"], ["dosatron", "Дозатрон", "1:50"], ["pump_sprayer", "Распылитель", "1:80"]].map(([id, label, ratio]) => `<button class="${ctx.calcEquipment === id ? "active" : ""}" data-action="calc-equipment" data-equipment="${id}" data-ratio="${ratio}">${label}<small>${ratio}</small></button>`).join("")}</div></div><div><span class="calc-field-label">Пропорция продукта и воды</span><div class="calc-ratio-inputs"><input type="number" min="1" value="1" readonly aria-label="Частей продукта"><span>:</span><input type="number" min="1" value="${ctx.calcRatio.split(":")[1]}" data-action="calc-ratio" aria-label="Частей воды"></div></div></div><p class="calc-field-note">${{ foam_kit: "Пенокомплект: 1:8 в бутылке; с учётом АВД рабочая концентрация на кузове ниже.", dosatron: "Дозатрон: настройка 2%, пропорция 1:50 при прямом нанесении.", pump_sprayer: "Помповый распылитель: 1:80 без дополнительного разбавления при нанесении." }[ctx.calcEquipment]}</p>`;
}

function fleetPanel(ctx) {
  return `${calcStep("01", "Состав парка", "Укажите автомобили в рабочий день и расход готового раствора на каждый тип.", `<div class="calc-fleet-head"><span>Тип кузова</span><span>Авто / день</span><span>мл на авто</span></div><div class="calc-fleet-list">${BODY_TYPES.map((body) => `<article><div><img src="/public/images/car-bodies/${body.id}.png" alt=""><span><b>${body.name}</b><small>${body.area.toLocaleString("ru-RU")} м²</small></span></div><label><span>Авто в день</span><input type="number" min="0" value="${ctx.fleetDaily[body.id]}" data-action="calc-fleet-daily" data-body="${body.id}" aria-label="${body.name}: автомобилей в день"></label><label><span>мл на авто</span><input type="number" min="0" value="${ctx.fleetRates[body.id]}" data-action="calc-fleet-rate" data-body="${body.id}" aria-label="${body.name}: миллилитров на автомобиль"></label></article>`).join("")}</div>`)}${calcStep("02", "Продукт и период", "Рассчитаем объём закупки на выбранный рабочий период.", `<div class="calc-fleet-settings"><label><span>Продукт</span>${select(PRODUCTS.map((product) => [product.id, `${product.name} · ${product.description}`]), ctx.fleetProduct, 'data-action="calc-fleet-product" aria-label="Продукт для парка"')}</label><div><span class="calc-field-label">Период закупки</span><div class="calc-segmented">${Object.entries(PERIODS).map(([id, [label]]) => `<button class="${ctx.calcPeriod === id ? "active" : ""}" data-action="calc-period" data-period="${id}">${label}</button>`).join("")}</div></div></div>${ratioControls(ctx)}`)}`;
}

function singlePanel(ctx) {
  return `${calcStep("01", "Выберите кузов", "Площадь кузова — основа расчёта экстерьерных продуктов.", bodyGrid(ctx))}${calcStep("02", "Отметьте зоны работ", `Выбрано ${ctx.calcZones.size}. Можно сочетать экстерьер и салон.`, `${zoneGroup(ctx, "exterior", "Экстерьер")}${zoneGroup(ctx, "interior", "Интерьер")}`)}${calcStep("03", "Выберите продукты", "Норму можно изменить под вашу технологию.", productPicker(ctx))}${calcStep("04", "Настройте смешивание", "Для активной пены учитываем оборудование и пропорцию.", ratioControls(ctx))}`;
}

export function calculatorPage(ctx) {
  const single = ctx.calcMode !== "fleet";
  return `<div class="calculator-pro-page">${toolHeader("Инструменты · Расход автохимии", "Калькулятор расхода", "Рассчитайте материалы на автомобиль или парк: кузов, зоны, продукты, разведение и стоимость закупки.", "03", `${btn("Сохранённый шаблон", { modal: "calculator.save", cls: "secondary", iconName: "bookmark" })}${btn("Сбросить", { action: "calc-reset", cls: "ghost", iconName: "refresh" })}`)}<div class="wrap calc-pro-wrap"><div class="calc-mode-row"><div class="calc-mode-switch" role="tablist" aria-label="Режим расчёта"><button role="tab" class="${single ? "active" : ""}" data-action="calc-mode" data-mode="single" aria-selected="${single}">${icon("user")} Один автомобиль</button><button role="tab" class="${!single ? "active" : ""}" data-action="calc-mode" data-mode="fleet" aria-selected="${!single}">${icon("users")} Парк / студия</button></div><span>Результат обновляется автоматически</span></div>${single ? `<div class="calc-presets"><span>Начать с шаблона:</span>${Object.entries(CALC_PRESETS).map(([id, preset]) => `<button data-action="calc-preset" data-preset="${id}">${preset.name}</button>`).join("")}</div>` : `<div class="calc-presets"><span>Для парка укажите каждый тип кузова отдельно.</span></div>`}<div class="calc-pro-layout"><main class="calc-pro-form">${single ? singlePanel(ctx) : fleetPanel(ctx)}</main><aside class="calc-pro-rail">${resultCard(ctx)}<div class="calc-help"><b>Нужна помощь с нормами?</b><p>Покажите расчёт поставщику — он сможет предложить подходящий продукт и фасовку.</p>${linkBtn("Спросить у поставщиков", "/supply-requests/new", { cls: "ghost block", iconName: "message" })}</div></aside></div><button class="calc-mobile-summary" data-action="calc-summary">Показать результат ${icon("chevron", "sm")}</button></div></div>${footer()}`;
}

const MAP_COMPANIES = [
  { id: "company-001", name: "Shine&Go", branch: "Центральный филиал", city: "Казань", category: "detailing", categoryLabel: "Детейлинг", address: "ул. Пушкина, 24", rating: "9,8", reviews: 42, verified: true, open: true, hours: "09:00–21:00", x: 63, y: 32, image: "06", services: ["PPF", "Полировка", "Керамика"] },
  { id: "company-002", name: "CleanLab", branch: "Тверская", city: "Москва", category: "wash", categoryLabel: "Автомойка", address: "ул. Тверская, 12", rating: "9,4", reviews: 36, verified: true, open: true, hours: "Круглосуточно", x: 38, y: 40, image: "02", services: ["Мойка", "Химчистка", "Салон"] },
  { id: "company-003", name: "АвтоПрофи", branch: "Невский", city: "Санкт-Петербург", category: "service", categoryLabel: "Детейлинг и сервис", address: "Невский проспект, 88", rating: "9,2", reviews: 28, verified: true, open: false, hours: "Откроется завтра в 09:00", x: 51, y: 23, image: "08", services: ["Детейлинг", "Автосервис", "PDR"] },
  { id: "directory-001", name: "Детейлинг Партнёр", branch: "Центральный", city: "Москва", category: "detailing", categoryLabel: "Детейлинг", address: "ул. Арбат, 18", rating: "9,2", reviews: 19, verified: false, open: true, hours: "10:00–22:00", x: 45, y: 54, image: "04", services: ["Полировка", "Химчистка"] },
  { id: "company-004", name: "Detail House", branch: "Екатеринбург Центр", city: "Екатеринбург", category: "detailing", categoryLabel: "Детейлинг", address: "ул. Малышева, 51", rating: "9,6", reviews: 24, verified: true, open: true, hours: "09:00–20:00", x: 73, y: 58, image: "07", services: ["Керамика", "Химчистка"] },
  { id: "company-005", name: "Microfiber Pro Service", branch: "Казань Север", city: "Казань", category: "wash", categoryLabel: "Автомойка", address: "пр. Победы, 142", rating: "9,1", reviews: 16, verified: true, open: true, hours: "08:00–22:00", x: 68, y: 42, image: "02", services: ["Мойка", "Экспресс"] },
  { id: "company-006", name: "AutoCare Юг", branch: "Москва Юг", city: "Москва", category: "service", categoryLabel: "Автосервис", address: "Варшавское шоссе, 36", rating: "8,9", reviews: 21, verified: true, open: false, hours: "Откроется в 08:00", x: 32, y: 63, image: "08", services: ["Сервис", "Диагностика"] },
  { id: "company-007", name: "PPF Lab", branch: "Петроградский", city: "Санкт-Петербург", category: "detailing", categoryLabel: "PPF и защита", address: "Большой проспект ПС, 44", rating: "9,7", reviews: 31, verified: true, open: true, hours: "10:00–21:00", x: 56, y: 34, image: "06", services: ["PPF", "Защита", "Полировка"] },
];

function filteredMapCompanies(ctx) {
  const query = ctx.mapQuery.trim().toLocaleLowerCase("ru");
  return MAP_COMPANIES.filter((company) => (ctx.mapCity === "Все города" || company.city === ctx.mapCity) && (ctx.mapCategory === "all" || company.category === ctx.mapCategory) && (!ctx.mapVerified || company.verified) && (!query || `${company.name} ${company.branch} ${company.city} ${company.services.join(" ")}`.toLocaleLowerCase("ru").includes(query)));
}

function mapCompanyPath(company) {
  return company.id === "directory-001" ? "/companies/directory/directory-001" : `/companies/${company.id}`;
}

function mapCompanyDetails(ctx, company) {
  if (!company) return `<div class="map-empty-selection">${icon("map", "xl")}<h3>Выберите точку на карте</h3><p>Здесь появятся адрес, услуги, рейтинг и контакты компании.</p></div>`;
  const revealed = ctx.revealedContacts.has(`map:${company.id}`);
  return `<section class="map-company-card"><div class="map-company-image" data-hero-image="${company.image}"><span>${company.categoryLabel}</span></div><div class="map-company-body"><div class="row between"><div><div class="row">${badge(company.verified ? "Проверена" : "Открытый каталог", company.verified ? "ok" : "warn")}<span class="map-open ${company.open ? "" : "closed"}"><i></i>${company.open ? "Открыто" : "Закрыто"}</span></div><h2>${company.name}</h2><p>${company.branch} · ${company.city}</p></div><button data-action="map-close-detail" aria-label="Скрыть карточку">${icon("x")}</button></div><div class="map-company-rating"><strong>${company.rating}</strong><span class="rating">★★★★★</span><span>${company.reviews} отзывов</span></div><div class="map-company-info">${infoItem("pin", "Адрес", `${company.city}, ${company.address}`)}${infoItem("clock", "График", company.hours)}</div><div class="map-company-services">${company.services.map((service) => badge(service)).join("")}</div><div class="map-company-actions">${btn("Записаться", { modal: "order.create", cls: "primary grow", iconName: "calendar" })}${btn("Маршрут", { action: "map-route", cls: "secondary grow", iconName: "pin", attrs: `data-address="${esc(`${company.city}, ${company.address}`)}"` })}</div><div class="map-company-links">${linkBtn("Открыть профиль", mapCompanyPath(company), { cls: "ghost", iconName: "user" })}<button data-action="map-phone" data-company="${company.id}">${icon("phone", "sm")} ${revealed ? "+7 (999) 521-22-51" : "Показать телефон"}</button></div></div></section>`;
}

export function mapPage(ctx) {
  const companies = filteredMapCompanies(ctx);
  const selected = ctx.mapDetailClosed ? null : companies.find((company) => company.id === ctx.mapSelected) || companies[0] || null;
  const cities = ["Все города", ...new Set(MAP_COMPANIES.map((company) => company.city))];
  return `<div class="map-pro-page">${toolHeader("СОУС Карты · Проверенные автоуслуги", "Найдите своего специалиста на карте", "Компании, филиалы, услуги и рейтинги — выберите удобную точку и сразу свяжитесь с ней.", "10", btn("Открыть каталог", { path: "/companies", cls: "secondary", iconName: "grid" }))}<div class="wrap map-pro-wrap"><div class="map-toolbar"><label class="map-search">${icon("search")}<input type="search" value="${esc(ctx.mapQuery)}" placeholder="Компания, услуга или район" aria-label="Поиск на карте" data-action="map-search"><kbd>⌘K</kbd></label><label class="map-city-select">${icon("pin")}${select(cities, ctx.mapCity, 'data-action="map-city" aria-label="Город на карте"')}</label><button class="btn secondary" data-action="map-locate">${icon("pin")}<span>Рядом со мной</span></button><button class="btn ghost icon-only" data-action="map-reset" aria-label="Сбросить карту">${icon("refresh")}</button></div><div class="map-filter-row"><div class="map-categories">${[["all", "Все услуги"], ["detailing", "Детейлинг"], ["wash", "Автомойки"], ["service", "Автосервис"]].map(([id, label]) => `<button class="${ctx.mapCategory === id ? "active" : ""}" data-action="map-category" data-category="${id}">${label}</button>`).join("")}<button class="map-verified ${ctx.mapVerified ? "active" : ""}" data-action="map-verified" aria-pressed="${ctx.mapVerified}">${icon("shield", "sm")} Только проверенные</button></div><span class="map-result-count" id="map-result-count"><b>${companies.length}</b> ${companies.length === 1 ? "точка" : "точек"}</span></div><div class="map-view-switch"><button class="${ctx.mapView === "map" ? "active" : ""}" data-action="map-view" data-view="map">${icon("map", "sm")} Карта</button><button class="${ctx.mapView === "list" ? "active" : ""}" data-action="map-view" data-view="list">${icon("clipboard", "sm")} Список</button></div><div class="map-pro-shell ${ctx.mapView === "list" ? "show-list" : ""}"><aside class="map-results"><div class="map-results-head"><div><b>${ctx.mapCity}</b><span>Сортировка: по рейтингу</span></div>${badge(`<span id="map-list-count">${companies.length}</span>`, "accent")}</div><div class="map-results-list">${companies.length ? companies.map((company) => `<button class="map-result-card ${selected?.id === company.id ? "active" : ""}" data-action="map-select" data-company="${company.id}" data-map-item data-search="${esc(`${company.name} ${company.branch} ${company.city} ${company.address} ${company.services.join(" ")}`)}" data-city="${company.city}" data-category="${company.category}" data-verified="${company.verified}"><span class="map-result-logo">${esc(company.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2))}</span><span class="map-result-copy"><span><b>${company.name}</b>${company.verified ? icon("shield", "sm") : ""}</span><small>${company.branch} · ${company.city}</small><span class="map-result-meta"><b>${company.rating}</b> · ${company.categoryLabel}<i class="${company.open ? "open" : ""}">${company.open ? "Открыто" : "Закрыто"}</i></span></span>${icon("chevron", "sm")}</button>`).join("") : `<div class="map-no-results">${icon("search", "xl")}<h3>Ничего не найдено</h3><p>Измените запрос, город или сбросьте фильтры.</p>${btn("Сбросить фильтры", { action: "map-reset", cls: "secondary" })}</div>`}</div><div class="map-results-foot">Данные компаний обновляются владельцами и модерацией СОУС.</div></aside><section class="map-canvas-wrap"><div class="map-canvas" style="--map-zoom:${ctx.mapZoom}"><div class="map-terrain"><span class="map-water"></span><span class="map-park park-a"></span><span class="map-park park-b"></span><div class="map-streets"></div><span class="map-main-road road-one"></span><span class="map-main-road road-two"></span><span class="map-main-road road-three"></span>${["Центральный", "Северный", "Западный", "Южный"].map((name, index) => `<span class="map-district district-${index}">${name}</span>`).join("")}${companies.map((company) => `<button class="map-pro-pin ${selected?.id === company.id ? "active" : ""}" style="left:${company.x}%;top:${company.y}%" data-action="map-select" data-company="${company.id}" data-map-pin data-search="${esc(`${company.name} ${company.branch} ${company.city} ${company.address} ${company.services.join(" ")}`)}" data-city="${company.city}" data-category="${company.category}" data-verified="${company.verified}" aria-label="${esc(company.name)}, ${company.city}"><span>${icon("store", "sm")}</span><b>${esc(company.name)}</b></button>`).join("")}</div></div><div class="map-canvas-tools"><button data-action="map-zoom-in" aria-label="Приблизить">${icon("plus")}</button><button data-action="map-zoom-out" aria-label="Отдалить">−</button><button data-action="map-reset-zoom" aria-label="Вернуть масштаб">${icon("refresh")}</button></div><div class="map-attribution">СОУС Карты · схема района</div><div class="map-detail-overlay">${mapCompanyDetails(ctx, selected)}</div></section></div><div class="map-trust-row"><div>${icon("shield")}<span><b>Проверенные профили</b><small>Документы и данные компаний</small></span></div><div>${icon("star")}<span><b>Реальные отзывы</b><small>После подтверждённых заказов</small></span></div><div>${icon("message")}<span><b>Прямой контакт</b><small>Без посредников и комиссии</small></span></div></div></div></div>${footer()}`;
}
