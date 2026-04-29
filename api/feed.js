/* /api/feed.js — YML 2.0 фід для Hotline / Prom / Hotsale тощо */
/* eslint-env node */

import { createClient } from "@sanity/client";

const SITE_URL = "https://airsoft-ua.com";
const SHOP_NAME = "AirSoft-UA";

const sanity = createClient({
  projectId: "xzcx3aim",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

// Категорії — ID мають бути стабільні (не міняй порядок), бо агрегатори за ними мапляться.
const CATEGORIES = [
  { id: 1, name: "Пневматичні гвинтівки", value: "air_rifles" },
  { id: 2, name: "PCP гвинтівки", value: "psp-rifles" },
  { id: 3, name: "Револьвери флобера", value: "flobers" },
  { id: 4, name: "Пневматичні пістолети", value: "pnevmo-pistols" },
  { id: 5, name: "Стартові пістолети", value: "start-pistols" },
  { id: 6, name: "Перцеві балончики", value: "pepper-sprays" },
];

const CATEGORY_BY_VALUE = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.id])
);

const escapeXml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdata = (s) => `<![CDATA[${String(s ?? "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const formatYmlDate = (d) => {
  // YML формат: "YYYY-MM-DD HH:mm"
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default async function handler(req, res) {
  try {
    const products = await sanity.fetch(
      `*[_type == "product" && defined(price)]{
        "id": _id,
        "slug": slug.current,
        title,
        description,
        price,
        oldPrice,
        category,
        stock,
        "mainImageUrl": mainImage.asset->url,
        "images": images[].asset->url
      }`
    );

    const offers = products
      .filter((p) => p.title && Number(p.price) > 0)
      .map((p) => {
        const slugOrId = p.slug || p.id;
        const url = `${SITE_URL}/product/${slugOrId}`;
        const categoryId = CATEGORY_BY_VALUE[p.category] || "";
        const inStock = p.stock == null || Number(p.stock) > 0;
        const allImages = [p.mainImageUrl, ...(p.images || [])].filter(Boolean);

        const pictureTags = allImages
          .slice(0, 10) // YML рекомендує до 10 фото на товар
          .map((u) => `      <picture>${escapeXml(u)}</picture>`)
          .join("\n");

        const oldPriceTag =
          Number(p.oldPrice) > Number(p.price)
            ? `\n      <oldprice>${Number(p.oldPrice)}</oldprice>`
            : "";

        const categoryTag = categoryId
          ? `\n      <categoryId>${categoryId}</categoryId>`
          : "";

        const descriptionTag = p.description
          ? `\n      <description>${cdata(p.description)}</description>`
          : "";

        return `    <offer id="${escapeXml(p.id)}" available="${inStock}">
      <url>${escapeXml(url)}</url>
      <price>${Number(p.price)}</price>${oldPriceTag}
      <currencyId>UAH</currencyId>${categoryTag}
${pictureTags}
      <name>${escapeXml(p.title)}</name>${descriptionTag}
    </offer>`;
      })
      .join("\n");

    const categoriesXml = CATEGORIES.map(
      (c) => `      <category id="${c.id}">${escapeXml(c.name)}</category>`
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${formatYmlDate(new Date())}">
  <shop>
    <name>${escapeXml(SHOP_NAME)}</name>
    <company>${escapeXml(SHOP_NAME)}</company>
    <url>${SITE_URL}</url>
    <currencies>
      <currency id="UAH" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offers}
    </offers>
  </shop>
</yml_catalog>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res.status(200).send(xml);
  } catch (err) {
    console.error("[feed] error:", err);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error generating feed");
  }
}
