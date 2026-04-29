/* /api/sitemap.js — динамічна карта сайту для Google */
/* eslint-env node */

import { createClient } from "@sanity/client";

const SITE_URL = "https://airsoft-ua.com";

const sanity = createClient({
  projectId: "xzcx3aim",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/catalog", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
];

const CATEGORIES = [
  "air_rifles",
  "psp-rifles",
  "flobers",
  "pnevmo-pistols",
  "start-pistols",
  "pepper-sprays",
];

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export default async function handler(req, res) {
  try {
    const products = await sanity.fetch(
      `*[_type == "product"]{ "id": _id, _updatedAt }`
    );

    const now = new Date().toISOString();

    const urls = [
      ...STATIC_PAGES.map(
        ({ path, priority, changefreq }) =>
          `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
      ),
      ...CATEGORIES.map(
        (cat) =>
          `  <url>
    <loc>${SITE_URL}/category/${cat}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
      ),
      ...products.map((p) => {
        const lastmod = p._updatedAt
          ? new Date(p._updatedAt).toISOString()
          : now;
        return `  <url>
    <loc>${SITE_URL}/product/${escapeXml(p.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }),
    ].join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // Vercel CDN кешує на 1 годину; stale-while-revalidate віддає старий поки оновиться
    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[sitemap] error:", err);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error generating sitemap");
  }
}
