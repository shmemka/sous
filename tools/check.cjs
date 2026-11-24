/* Проверка страницы прототипа: скриншоты десктопа и мобилки, ошибки консоли, горизонтальная прокрутка.
   Запуск из корня репозитория:
     node tools/check.cjs <папка-страницы> [адрес1 адрес2 ...] [--out <папка>] [--light] [--role <роль>]
   Пример:
     node tools/check.cjs vacancies "#/" "#/v/vac-022" --out /tmp/shots
   Без адресов проверяется "#/". Скриншоты: <out>/<папка>-<n>-desktop.png и -mobile.png (масштаб 1, для проверки). */
const { chromium, devices } = require("playwright");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const out = opt("--out") || path.join(process.cwd(), ".shots");
const role = opt("--role") || "guest";
const light = flag("--light");
const [page, ...routes] = args;
if (!page) { console.error("Укажите папку страницы, например: node tools/check.cjs vacancies"); process.exit(1); }
const file = path.join(process.cwd(), "docs", page, "index.html");
if (!fs.existsSync(file)) { console.error("Нет файла " + file); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const targets = routes.length ? routes : ["#/"];
  let failed = false;
  for (const [mode, ctx] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["mobile", { ...devices["iPhone 13"], deviceScaleFactor: 1 }]]) {
    const p = await browser.newPage(ctx);
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await p.addInitScript(([r, t]) => { try { localStorage.setItem("sous-role", r); localStorage.setItem("sous-theme", t); } catch {} }, [role, light ? "light" : "dark"]);
    for (const [i, r] of targets.entries()) {
      await p.goto("file://" + file + r);
      await p.waitForTimeout(900);
      const shot = path.join(out, `${page}-${i + 1}-${mode}.png`);
      await p.screenshot({ path: shot, fullPage: mode === "desktop" });
      const overflow = await p.evaluate(() => [...document.querySelectorAll("body *")]
        .filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed"; })
        .slice(0, 3).map((e) => e.className || e.tagName));
      const dashes = await p.evaluate(() => (document.body.innerText.match(/—/g) || []).length + (document.title.includes("—") ? 1 : 0));
      const selects = await p.evaluate(() => document.querySelectorAll("select").length);
      console.log(`${mode} ${r}: ${shot}`);
      if (overflow.length) { failed = true; console.log("  выходит за край экрана:", overflow.join(", ")); }
      if (dashes) { failed = true; console.log("  длинных тире в тексте:", dashes); }
      if (selects) { failed = true; console.log("  системных <select>:", selects); }
    }
    if (errors.length) { failed = true; console.log(`  ошибки (${mode}):`, errors); }
    await p.close();
  }
  await browser.close();
  console.log(failed ? "ЕСТЬ ЗАМЕЧАНИЯ" : "OK");
  process.exit(failed ? 1 : 0);
})();
