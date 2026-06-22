// scripts/prerender.mjs
// Build-time пререндер: рендеримо зібраний SPA у headless-браузері й зберігаємо
// готовий HTML ключових сторінок у dist/<route>/index.html. Це дає Googlebot
// повний HTML (контент + мета + schema) без переходу на SSR-фреймворк.
//
// Безпека: якщо браузер не стартує (напр., середовище без Chromium) або падає
// окрема сторінка — деплой НЕ ламається, сайт лишається як CSR.

import http from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

const sanity = createClient({
  projectId: "xzcx3aim",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

const STATIC_ROUTES = ["/", "/catalog", "/blog", "/about", "/contact", "/privacy-policy", "/terms-of-service"];
const CATEGORY_ROUTES = [
  "air_rifles", "psp-rifles", "flobers", "pnevmo-pistols", "start-pistols", "pepper-sprays",
].map((c) => `/category/${c}`);

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".txt": "text/plain", ".xml": "application/xml",
};

// Статичний сервер для dist. Чистий shell (оригінальний index.html) тримаємо
// в пам'яті й віддаємо для всіх HTML-маршрутів — щоб React щоразу стартував
// «з нуля» й коректно роутився, навіть після перезапису dist/index.html.
async function startServer() {
  const shell = await readFile(join(DIST, "index.html"));
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const ext = extname(urlPath);
      // Реальні файли-ассети (js/css/img/шрифти) — з диска; усе інше → shell
      if (ext && ext !== ".html") {
        const filePath = join(DIST, urlPath);
        const s = await stat(filePath).catch(() => null);
        if (s?.isFile()) {
          res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
          res.end(await readFile(filePath));
          return;
        }
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(shell);
    } catch {
      res.statusCode = 500;
      res.end("error");
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, () => resolve(server)); // 0 → ОС обирає вільний порт
  });
}

// Лишаємо лише перший <title> (react-helmet-async інколи лишає дубль).
function dedupeTitle(html) {
  let kept = false;
  return html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, (m) => {
    if (!kept) { kept = true; return m; }
    return "";
  });
}

async function savePrerendered(route, html) {
  const outDir = route === "/" ? DIST : join(DIST, route);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "index.html"), dedupeTitle(html), "utf8");
}

// Запуск браузера: на Vercel/CI — Chromium під це середовище (@sparticuz),
// локально — повний puppeteer із власним Chromium.
async function launchBrowser() {
  const WEB = ["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"];
  if (process.env.VERCEL || process.env.CI) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;
    return puppeteerCore.launch({
      args: [...chromium.args, ...WEB],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      protocolTimeout: 180000,
    });
  }
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    protocolTimeout: 180000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", ...WEB],
  });
}

async function main() {
  // 1) Список товарів із Sanity (slug пріоритетний)
  let productRoutes = [];
  try {
    const products = await sanity.fetch(`*[_type == "product"]{ "slug": slug.current, "id": _id }`);
    const limit = Number(process.env.PRERENDER_PRODUCT_LIMIT) || products.length;
    productRoutes = products
      .map((p) => p.slug || p.id)
      .filter(Boolean)
      .slice(0, limit)
      .map((s) => `/product/${s}`);
  } catch (e) {
    console.warn("[prerender] не вдалося отримати товари з Sanity:", e?.message);
  }

  // 1b) Статті блогу (опубліковані)
  let postRoutes = [];
  try {
    const posts = await sanity.fetch(
      `*[_type == "post" && published == true]{ "slug": slug.current }`
    );
    postRoutes = posts.map((p) => p.slug).filter(Boolean).map((s) => `/blog/${s}`);
  } catch (e) {
    console.warn("[prerender] не вдалося отримати статті з Sanity:", e?.message);
  }

  const routes = [...STATIC_ROUTES, ...CATEGORY_ROUTES, ...productRoutes, ...postRoutes];

  // 2) Запускаємо браузер (м'яко — без падіння деплою)
  let browser;
  try {
    browser = await launchBrowser();
  } catch (e) {
    console.warn("[prerender] браузер не стартував, пропускаю пререндер (сайт лишається CSR):", e?.message);
    return;
  }

  const server = await startServer();
  const origin = `http://localhost:${server.address().port}`;
  const counters = { ok: 0, fail: 0 };

  // Домени трекерів/реклами блокуємо під час знімка (тримають з'єднання,
  // не впливають на HTML-контент і сповільнюють пререндер).
  const BLOCK = /googletagmanager|google-analytics|analytics\.google|facebook\.(net|com)|connect\.facebook|doubleclick|fbevents/i;

  async function renderRoute(route) {
    try {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (req) => (BLOCK.test(req.url()) ? req.abort() : req.continue()));
      await page.setUserAgent("Mozilla/5.0 (compatible; PrerenderBot/1.0)");
      // domcontentloaded швидкий і не «висне» на network-idle; готовність контенту
      // ловимо через waitForFunction (зник лоадер + дані з Sanity дорендерились).
      await page.goto(`${origin}${route}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page
        .waitForFunction(
          () => {
            const txt = document.body.innerText || "";
            if (txt.includes("Завантаження")) return false;
            if (document.querySelector(".animate-spin")) return false;
            return (document.querySelector("#root")?.children.length || 0) > 0;
          },
          { timeout: 12000 }
        )
        .catch(() => {});
      await new Promise((r) => setTimeout(r, 300)); // дати Helmet домалювати <head>
      const html = await page.content();
      await page.close();
      await savePrerendered(route, html);
      counters.ok++;
    } catch (e) {
      counters.fail++;
      console.warn(`[prerender] ✗ ${route}: ${e?.message}`);
    }
  }

  // Рендеримо паралельно (пул воркерів) — суттєво швидше за послідовний обхід.
  const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY) || 6;
  const queue = [...routes];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) await renderRoute(queue.shift());
    })
  );

  const { ok, fail } = counters;
  await browser.close();
  server.close();
  console.log(`[prerender] готово: ${ok} сторінок, помилок: ${fail}`);
}

main().catch((e) => {
  // Будь-яка несподівана помилка не повинна валити деплой
  console.warn("[prerender] загальна помилка, пропускаю:", e?.message);
  process.exit(0);
});
