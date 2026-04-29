/* /api/share.js — серверний рендер мета-тегів для соціальних ботів.
 *
 * Telegram/Facebook/Twitter не виконують JS — для них наш SPA повертає лише
 * шаблонний index.html без per-product мета-тегів. Ця функція тягне товар з
 * Sanity і повертає повноцінний HTML з правильними OG/Twitter тегами + посилання
 * на динамічну OG-картинку.
 *
 * Маршрутизується через vercel.json з фільтром по User-Agent.
 */
/* eslint-env node */

export const config = { runtime: "edge" };

const SITE_URL = "https://airsoft-ua.com";
const SANITY_PROJECT_ID = "xzcx3aim";
const SANITY_API_VERSION = "v2024-01-01";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(
    Number(n) || 0
  ) + " ₴";

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

async function fetchProduct(slugOrId) {
  const groq = `*[_type=="product" && (slug.current==$idOrSlug || _id==$idOrSlug)][0]{
    title, price, oldPrice, description, stock,
    "img": mainImage.asset->url,
    "slug": slug.current,
    "id": _id
  }`;
  const url = new URL(
    `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VERSION}/data/query/production`
  );
  url.searchParams.set("query", groq);
  url.searchParams.set("$idOrSlug", JSON.stringify(slugOrId));

  const r = await fetch(url.toString());
  if (!r.ok) return null;
  const data = await r.json();
  return data?.result || null;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return new Response("Missing slug", { status: 400 });

    const product = await fetchProduct(slug);
    if (!product) {
      return new Response("Not found", { status: 404 });
    }

    const productSlug = product.slug || product.id || slug;
    const productUrl = `${SITE_URL}/product/${productSlug}`;
    const priceStr = formatUAH(product.price);
    const ogTitle = `${product.title} — ${priceStr}`;
    const description = product.description?.trim()
      ? product.description.replace(/\s+/g, " ").slice(0, 160)
      : `${product.title} — купити в Україні. Ціна ${priceStr}. Швидка доставка, гарантія, оплата при отриманні.`;

    // Динамічна OG-картинка з логотипом, ціною, фото
    const ogImage = `${SITE_URL}/api/og?slug=${encodeURIComponent(productSlug)}`;

    const html = `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(ogTitle)} | AirSoft-UA</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(productUrl)}">

<meta property="og:type" content="product">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(productUrl)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(product.title)}">
<meta property="og:site_name" content="AirSoft-UA">
<meta property="og:locale" content="uk_UA">

<meta property="product:price:amount" content="${Number(product.price) || 0}">
<meta property="product:price:currency" content="UAH">
<meta property="product:availability" content="${
      product.stock == null || Number(product.stock) > 0 ? "in stock" : "out of stock"
    }">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">
<meta name="twitter:image:alt" content="${escapeHtml(product.title)}">
</head>
<body>
<h1>${escapeHtml(product.title)}</h1>
${product.description ? `<p>${escapeHtml(product.description)}</p>` : ""}
<p><strong>Ціна:</strong> ${escapeHtml(priceStr)}</p>
<p><a href="${escapeHtml(productUrl)}">Купити на airsoft-ua.com</a></p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control":
          "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[share] error:", err);
    return new Response("Error", { status: 500 });
  }
}
