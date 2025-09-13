/* eslint-env node */

// Дозволені origins (необов’язково)
const ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || "";
  if (ORIGINS.length && ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!ORIGINS.length) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET")     return res.status(200).json({ ok: true, endpoint: "/api/telegram" });
  if (req.method !== "POST")    return res.status(405).json({ ok: false, error: "Only POST" });

  // Env з потрібними назвами
  const TOKEN = process.env.VITE_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
  const CHAT  = process.env.VITE_CHAT_ID  || process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT) {
    return res.status(500).json({ ok: false, error: "Missing VITE_BOT_TOKEN/VITE_CHAT_ID" });
  }

  // Body (auto-parse у Vercel, fallback вручну)
  let b = req.body;
  if (!b || typeof b !== "object") {
    try {
      const raw = await new Promise((resolve, reject) => {
        let s = "";
        req.on("data", c => (s += c));
        req.on("end", () => resolve(s));
        req.on("error", reject);
      });
      b = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  // Utils
  const esc = (s = "") => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const fmtUAH = n => new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";
  const block = (title, rows) => [`<b>${title}</b>`, ...rows.filter(Boolean)].join("\n");
  const sep = "────────────";

  // Required
  const name  = (b.customer?.name  || b.name  || "").trim();
  const phone = (b.customer?.phone || b.phone || "").trim();
  if (!name || !phone) return res.status(400).json({ ok: false, error: "name and phone required" });

  // Optional
  const email   = (b.customer?.email || b.email || "").trim();
  const comment = (b.comment || "").trim();
  const region  = (b.delivery?.region || b.region || "").trim();
  const city    = (b.delivery?.city   || b.city   || "").trim();
  const branch  = (b.delivery?.branch || b.branch || "").trim();
  const shipping = b.shipping || {};

  // Items
  let items = [];
  if (b.product) {
    const price = Math.max(0, Number(b.product.price) || 0);
    items = [{ title: String(b.product.title ?? "Товар"), qty: 1, price, lineTotal: price }];
  } else if (Array.isArray(b.cart)) {
    items = b.cart.map(i => {
      const qty = Math.max(1, Number(i.qty) || 1);
      const price = Math.max(0, Number(i.price) || 0);
      return { title: String(i.title ?? "Товар"), qty, price, lineTotal: price * qty };
    });
  } else if (Array.isArray(b.order?.items)) {
    items = b.order.items.map(i => {
      const qty = Math.max(1, Number(i.qty) || 1);
      const price = Math.max(0, Number(i.price) || 0);
      const lt = Number(i.lineTotal);
      return { title: String(i.title ?? "Товар"), qty, price, lineTotal: Math.max(0, isNaN(lt) ? price * qty : lt) };
    });
  }

  // Amounts
  const subtotal = Number(b?.amounts?.subtotal || b?.order?.subtotal) || items.reduce((s, i) => s + i.lineTotal, 0);
  const discount = Math.max(0, Number(b?.amounts?.discount || b?.order?.discount) || 0);
  const shippingCost = Math.max(0, Number(b?.amounts?.shipping || b?.order?.shipping) || 0);
  const total = Number(b?.amounts?.total || b?.order?.total) || Math.max(0, subtotal - discount + shippingCost);
  const mode  = String(b?.source || b?.order?.mode || (items.length > 1 ? "cart" : "single"));

  // Message
  const dt = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv", hour12: false });

  const clientBlock = block("👤 Клієнт", [
    `Ім'я: ${esc(name)}`,
    `Телефон: ${esc(phone)}`,
    email && `Email: ${esc(email)}`
  ]);

  const deliveryBlock = block("🚚 Доставка", [
    shipping.label && `Спосіб: ${esc(shipping.label)}`,
    region && `Область: ${esc(region)}`,
    city && `Місто: ${esc(city)}`,
    branch && `Відділення/адреса: ${esc(branch)}`
  ]);

  const itemsBlock = items.length
    ? block("🧾 Товари", items.map((p, i) =>
        `${i + 1}. ${esc(p.title)} — ${p.qty} × ${fmtUAH(p.price)} = ${fmtUAH(p.lineTotal)}`
      ))
    : null;

  const totalBlock = block("💳 Підсумок", [
    `Сума товарів: ${fmtUAH(subtotal)}`,
    discount > 0 && `Знижка: −${fmtUAH(discount)}`,
    `Доставка: ${shippingCost ? fmtUAH(shippingCost) : "Безкоштовно"}`,
    `Разом: <b>${fmtUAH(total)}</b>`
  ]);

  const commentBlock = comment ? block("📝 Коментар", [esc(comment)]) : null;

  const metaBlock = block("ℹ️ Дані замовлення", [
    `Режим: ${esc(mode)}`,
    `Дата: ${dt}`
  ]);

  const text = [
    `<b>🆕 Нове замовлення</b>`,
    sep,
    clientBlock,
    sep,
    deliveryBlock,
    itemsBlock ? sep : null,
    itemsBlock,
    sep,
    totalBlock,
    commentBlock ? sep : null,
    commentBlock,
    sep,
    metaBlock
  ].filter(Boolean).join("\n");

  try {
    // 10s timeout + 1 retry на 429
async function sendToTelegram({ TOKEN, CHAT, text }) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const body = { chat_id: CHAT, text, parse_mode: "HTML", disable_web_page_preview: true };

  const call = async () => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      // Telegram інколи повертає 200 із ok:false
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }
      if (!data?.ok) {
        const ra = data?.parameters?.retry_after;
        if (data?.error_code === 429 && ra) {
          return { rateLimited: true, retryAfter: ra };
        }
        throw new Error(data?.description || "Telegram error");
      }
      return { ok: true };
    } finally {
      clearTimeout(t);
    }
  };

  const r1 = await call();
  if (r1?.rateLimited) {
    await new Promise(r => setTimeout(r, (r1.retryAfter || 1) * 1000));
    return await call();
  }
  return r1;
}

// Виклик у хендлері
const r = await sendToTelegram({ TOKEN, CHAT, text });
if (!r?.ok) return res.status(502).json({ ok: false, error: "telegram error" });
return res.status(200).json({ ok: true });


    if (!tg?.ok) return res.status(502).json({ ok: false, error: tg?.description || "telegram error" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
