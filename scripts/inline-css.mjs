/* scripts/inline-css.mjs — інлайнить зібраний CSS у пререндерені HTML.
 *
 * CSS-бандл малий (~12KB gzip), тож вигідніше вшити його <style> у <head>,
 * ніж тягнути окремим render-blocking запитом. Прибирає блокування першого
 * рендеру (краще FCP/LCP на мобайлі).
 *
 * Запускається після prerender (див. npm run build).
 */
/* eslint-env node */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const ASSETS = join(DIST, "assets");

// Зчитуємо весь зібраний CSS (ім'я файлу → вміст).
const cssMap = {};
for (const f of readdirSync(ASSETS)) {
  if (f.endsWith(".css")) cssMap[f] = readFileSync(join(ASSETS, f), "utf8");
}
if (!Object.keys(cssMap).length) {
  console.log("[inline-css] CSS не знайдено — пропускаємо");
  process.exit(0);
}

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
})(DIST);

// Замінюємо <link rel="stylesheet" href="/assets/xxx.css"> на <style>…</style>.
const LINK_RE = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]*\/assets\/[^"]+\.css)"[^>]*>/g;

let count = 0;
for (const file of htmlFiles) {
  let html = readFileSync(file, "utf8");
  let changed = false;
  html = html.replace(LINK_RE, (m, href) => {
    const name = href.split("/").pop();
    const css = cssMap[name];
    if (!css) return m;
    changed = true;
    return `<style>${css}</style>`;
  });
  if (changed) {
    writeFileSync(file, html);
    count++;
  }
}
console.log(`[inline-css] CSS вшито у ${count} HTML-сторінок`);
