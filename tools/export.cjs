/* Сборщик автономных HTML-файлов для прототипа СОУС.
   Запуск из корня репозитория:
     node tools/export.cjs
   Результат:
     docs/export/sous-all.html        — весь проект в одном HTML-файле
     docs/export/pages/<name>.html    — отдельный автономный HTML для каждой страницы */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");
const OUT = path.join(DOCS, "export");

const SKIP_DIRS = new Set(["shared", "assets", "export"]);

const logoPath = path.join(DOCS, "assets", "logo.png");
const logoDataUri = fs.existsSync(logoPath)
  ? "data:image/png;base64," + fs.readFileSync(logoPath).toString("base64")
  : "";

const sharedCss = fs.readFileSync(path.join(DOCS, "shared", "sous.css"), "utf8");
const pagesJs = fs.readFileSync(path.join(DOCS, "shared", "pages.js"), "utf8");
const sousJs = fs.readFileSync(path.join(DOCS, "shared", "sous.js"), "utf8");

function inlinePage(pageDir, html) {
  let out = html;

  // Inline shared CSS
  out = out.replace(
    /<link\s+rel="stylesheet"\s+href="\.\.\/shared\/sous\.css(?:\?v=[^"]*)?"\s*>/,
    () => `<style>\n${sharedCss}\n</style>`
  );

  // Inline local designs.css if present
  const designsPath = path.join(DOCS, pageDir, "designs.css");
  if (fs.existsSync(designsPath)) {
    const designsCss = fs.readFileSync(designsPath, "utf8");
    out = out.replace(
      /<link\s+rel="stylesheet"\s+href="designs\.css(?:\?v=[^"]*)?"\s*>/,
      () => `<style>\n${designsCss}\n</style>`
    );
  }

  // Inline shared JS (escape </script> safely)
  const safeScript = (code) => `<script>\n${code.replace(/<\/script>/gi, "<\\/script>")}\n</script>`;
  out = out.replace(
    /<script\s+src="\.\.\/shared\/pages\.js(?:\?v=[^"]*)?"\s*><\/script>/,
    () => safeScript(pagesJs)
  );
  out = out.replace(
    /<script\s+src="\.\.\/shared\/sous\.js(?:\?v=[^"]*)?"\s*><\/script>/,
    () => safeScript(sousJs)
  );

  // Inline logo.png
  if (logoDataUri) {
    out = out.replaceAll("../assets/logo.png", logoDataUri);
  }

  return out;
}

fs.mkdirSync(OUT, { recursive: true });

const pageDirs = fs
  .readdirSync(DOCS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !SKIP_DIRS.has(d.name))
  .map((d) => d.name)
  .filter((name) => fs.existsSync(path.join(DOCS, name, "index.html")))
  .sort();

const bundledPages = {};

for (const dir of pageDirs) {
  const raw = fs.readFileSync(path.join(DOCS, dir, "index.html"), "utf8");
  const standalone = inlinePage(dir, raw);

  // Inject parent-navigation bridge for sous-all.html
  const bridge = `<script>
(function(){
  if (window.parent === window) return;
  document.addEventListener("click", function(e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.startsWith("#/")) {
      e.preventDefault();
      e.stopPropagation();
      window.__SOUS_HASH__ = href;
      try { location.hash = href; } catch {}
      if (typeof PAGE !== "undefined") {
        PAGE.onRoute && PAGE.onRoute();
        if (typeof closeModal === "function") closeModal();
        if (typeof render === "function") render();
        window.scrollTo(0, 0);
      }
      return;
    }
    var m = href.match(/^\\.\\.\\/([a-z0-9-]+)\\/(?:#(.*))?$/i);
    if (m) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: "sous-nav", page: m[1], hash: m[2] ? "#" + m[2] : "#/" }, "*");
    }
  }, true);
})();
</script>`;
  bundledPages[dir] = standalone.replace(/<\/body>/i, `${bridge}\n<` + `/body>`);
}

const allHtml = `<!doctype html>
<html lang="ru" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>СОУС · Единый прототип</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #080402; overflow: hidden; }
  #frame { display: block; width: 100%; height: 100%; border: 0; }
</style>
</head>
<body>
<iframe id="frame" title="Прототип СОУС"></iframe>
<script>
const PAGES = ${JSON.stringify(bundledPages).replace(/<\/script>/gi, "<\\/script>")};
const frame = document.getElementById("frame");

function openPage(name, hash) {
  const key = PAGES[name] ? name : "vacancies";
  const targetHash = hash || "#/";
  const inject = '<script>window.__SOUS_HASH__=' + JSON.stringify(targetHash) + ';try{location.hash=' + JSON.stringify(targetHash) + ';}catch(e){}<\\/script>';
  frame.srcdoc = PAGES[key].replace("<head>", "<head>" + inject);
}

window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "sous-nav") {
    openPage(e.data.page, e.data.hash || "#/");
  }
});

openPage("vacancies", "#/");
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(OUT, "sous-all.html"), allHtml, "utf8");
console.log(`Exported ${pageDirs.length} pages into docs/export/sous-all.html`);
