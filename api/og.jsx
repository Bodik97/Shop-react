/* /api/og.jsx — динамічна OG-картинка для шарингу товару */
/* eslint-env node */

import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

const SANITY_PROJECT_ID = "xzcx3aim";
const SANITY_API_VERSION = "v2024-01-01";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(
    Number(n) || 0
  ) + " ₴";

// Кириличний шрифт для тексту в OG-картинці.
// Завантажуємо ОДИН раз на холодний старт функції — далі кеш на CDN.
let robotoBoldCache = null;
const loadFont = async () => {
  if (robotoBoldCache) return robotoBoldCache;
  const r = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-cyrillic-700-normal.woff"
  );
  if (!r.ok) throw new Error(`font fetch failed: ${r.status}`);
  robotoBoldCache = await r.arrayBuffer();
  return robotoBoldCache;
};

const fetchProduct = async (slugOrId) => {
  const groq = `*[_type=="product" && (slug.current==$idOrSlug || _id==$idOrSlug)][0]{
    title,
    price,
    oldPrice,
    stock,
    "img": mainImage.asset->url
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
};

// Безпечне обрізання заголовка — якщо дуже довгий
const truncate = (s, max) => {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("id");
    if (!slug) {
      return new Response("Missing ?slug or ?id", { status: 400 });
    }

    const [product, fontData] = await Promise.all([
      fetchProduct(slug),
      loadFont(),
    ]);

    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    const hasDiscount =
      Number(product.oldPrice) > 0 &&
      Number(product.oldPrice) > Number(product.price);
    const discountPercent = hasDiscount
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;
    const inStock = product.stock == null || Number(product.stock) > 0;
    const imgUrl = product.img
      ? `${product.img}?w=600&h=600&fit=max&auto=format`
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #0a0e1a 0%, #1e293b 50%, #0a0e1a 100%)",
            padding: "48px 56px",
            color: "white",
            fontFamily: "Roboto",
          }}
        >
          {/* Header: brand + stock badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                fontWeight: 700,
                letterSpacing: "6px",
                color: "white",
              }}
            >
              AIRSOFT-UA
            </div>
            {inStock ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#10b981",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: "999px",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                ✓ В НАЯВНОСТІ
              </div>
            ) : null}
          </div>

          {/* Body: text left, image right */}
          <div
            style={{
              display: "flex",
              flex: 1,
              marginTop: "30px",
              gap: "40px",
              alignItems: "center",
            }}
          >
            {/* LEFT: title + price */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "44px",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  marginBottom: "32px",
                }}
              >
                {truncate(product.title, 90)}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "20px", flexWrap: "wrap" }}>
                <div
                  style={{
                    fontSize: "76px",
                    fontWeight: 700,
                    color: "#ef4444",
                    lineHeight: 1,
                  }}
                >
                  {formatUAH(product.price)}
                </div>
                {hasDiscount ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "30px",
                        color: "#9ca3af",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatUAH(product.oldPrice)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignSelf: "flex-start",
                        background: "#dc2626",
                        color: "white",
                        padding: "4px 14px",
                        borderRadius: "999px",
                        fontSize: "22px",
                        fontWeight: 700,
                      }}
                    >
                      −{discountPercent}%
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* RIGHT: product image card */}
            {imgUrl ? (
              <div
                style={{
                  display: "flex",
                  width: "440px",
                  height: "440px",
                  background: "white",
                  borderRadius: "24px",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                }}
              >
                <img
                  src={imgUrl}
                  width="400"
                  height="400"
                  style={{ objectFit: "contain" }}
                  alt=""
                />
              </div>
            ) : null}
          </div>

          {/* Footer: domain */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "20px",
              fontSize: "22px",
              color: "#9ca3af",
              letterSpacing: "1px",
            }}
          >
            airsoft-ua.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Roboto",
            data: fontData,
            weight: 700,
            style: "normal",
          },
        ],
        headers: {
          // Кешуємо 1 день на CDN, віддаємо stale до 30 днів поки оновлюється
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000",
        },
      }
    );
  } catch (err) {
    console.error("[og] error:", err);
    return new Response(`OG error: ${err?.message || "unknown"}`, { status: 500 });
  }
}
