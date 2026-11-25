---
name: new-page
description: Сделать новую страницу прототипа СОУС по маршруту со стенда (например /new-page /gigs или /new-page /orders и /orders/:id). Переработать структуру, роли и навигацию, собрать из общих компонентов, проверить и опубликовать на GitHub Pages.
---

# Новая страница прототипа СОУС

Аргумент: маршрут(ы) стенда, например `/gigs` или `/gigs /gigs/:id`. Если пользователь назвал раздел словами, найди маршрут в `docs/shared/pages.js`.

Работай экономно: читай только нужные куски файлов (`grep -n`, `sed -n`, `Read` с `offset/limit`), не перечитывай целиком `refs/stand/*.mjs` и `docs/vacancies/index.html`.

## 1. Собрать вводные (без обхода сайтов)
1. `CLAUDE.md`, `DESIGN.md` уже описывают правила. `CONTEXT.md` читай только если нужен контекст заказа.
2. Найди экран в `refs/stand/README.md` (маршрут → функция → файл), прочитай только эту функцию и её данные в `refs/stand/data.mjs`, модалки экрана в `refs/stand/modals.mjs`.
3. Реальный функционал: раздел в `refs/coyc.md`. Если раздела там нет и сеть до coyc.pro открыта, достань строки командой из `refs/coyc.md` и **допиши раздел в `refs/coyc.md`**.
4. Если страница похожа на готовую (каталог + детальная как у вакансий), возьми за основу `docs/vacancies/index.html`: скопируй файл и замени данные, виды и `PAGE`.

## 2. Спроектировать (коротко, без отдельного согласования)
- Что убрать со стенда: дубли, общие слова, лишние плашки, второй ввод одного и того же.
- Главное действие каждой роли (гость, специалист, работодатель, автовладелец, поставщик, партнёр) и подсказка нецелевым ролям.
- Сценарий в 2 клика до ключевого действия, вход в момент действия.
- Названия по глоссарию (`docs/vacancies/README.md`, раздел «Глоссарий»). Не путать «заявку автовладельца» и «заявку на закупку».

## 3. Собрать страницу
Файл `docs/<папка>/index.html`, папка по маршруту без слэша (`/gigs` → `docs/gigs/`). Каркас:

```html
<!doctype html>
<html lang="ru" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Название · СОУС</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alumni+Sans:wght@600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../shared/sous.css?v=1">
<style>/* только стили этой страницы */</style>
</head>
<body>
<a class="sr-only" href="#app">Перейти к содержимому</a>
<header class="top" id="top"></header>
<main id="app" tabindex="-1"></main>
<footer class="footer" id="footer"></footer>
<div id="modal-root"></div>
<div id="toast-root" class="toasts" aria-live="polite"></div>
<div id="proto-root"></div>
<script src="../shared/pages.js?v=1"></script>
<script src="../shared/sous.js?v=1"></script>
<script>
/* данные страницы, Object.assign(state, {...}), виды, окна */
const PAGE = {
  section: "/gigs",                       // путь раздела для подсветки в меню
  currentPath: () => route().startsWith("/v/") ? "/gigs/:id" : "/gigs",
  render() { $("#app").innerHTML = /* вид по route() */ ""; },
  actions: { /* "имя": (el, e, id) => {} */ },
  // onDD, onRoute, authText, loginRole, afterLogin, roleHints: см. шапку sous.js
};
start();
</script>
</body>
</html>
```

Правила: компоненты и классы из `DESIGN.md`; без `<select>`, без длинных тире, без контуров; ссылки на другие экраны только `pageHref("/путь")`. Если нужен новый общий компонент или иконка, добавь в `docs/shared/sous.css` / `sous.js`, а не в страницу, и проверь, что вакансии не сломались.

## 4. Отметить статус
В `docs/shared/pages.js` у сделанных экранов поставь `status: "done"` и `href: "../<папка>/#/..."`. Меню и ссылки других страниц подхватят их сами.

## 5. Проверить
```bash
node tools/check.cjs <папка> "#/" "#/v/<id>" --out <scratchpad>/shots
```
Скрипт сам ловит ошибки консоли, выход за край экрана, длинные тире и `<select>`. Посмотри **два** скриншота: десктоп первого экрана и мобилку. Дополнительно прокликай главный сценарий в Playwright только если менял логику действий. Для другой роли: `--role employer`, светлая тема: `--light`.

## 6. Описать и опубликовать
1. `docs/<папка>/README.md` коротко: что убрали, что добавили, роли, user flow (mermaid), модалки, открытые вопросы. Формат как в `docs/vacancies/README.md`.
2. Обнови версию общих файлов во всех страницах командой из раздела «Кэш» в `CLAUDE.md` (pages.js меняется на каждой новой странице).
3. Коммит в рабочую ветку, push в неё и в `main` (`git push origin <ветка>:main`), если пользователь не просил иначе.
4. Ответ пользователю: ссылка `https://shmemka.github.io/sous/<папка>/`, 3–5 главных решений, вопросы к заказчику. Без пересказа всего README.
