/* eslint-env node */
// /api/telegram.js — Vercel serverless, ESM-стиль
export default async function handler(req, res) {
  // CORS мінімум
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: "Set BOT_TOKEN and CHAT_ID in env" });

  // читаємо тіло
  let body = {};
  try {
    body = typeof req.body === "object" && req.body
      ? req.body
      : JSON.parse(await new Promise((r, j) => {
          let raw = "";
          req.on("data", c => (raw += c));
          req.on("end", () => r(raw));
          req.on("error", j);
        }));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { name = "", phone = "", email = "", comment = "", delivery = "", city = "", branch = "", order } = body;

  const orderLines = Array.isArray(order?.items)
    ? order.items.map((it, i) => `${i + 1}) ${it.title} × ${it.qty} = ${it.lineTotal}₴`).join("\n")
    : "";

  const text =
    `Нова заявка\n` +
    `Ім'я: ${name}\n` +
    `Телефон: ${phone}\n` +
    (email ? `Email: ${email}\n` : "") +
    (delivery ? `Доставка: ${delivery}\n` : "") +
    (city ? `Місто: ${city}\n` : "") +
    (branch ? `Адреса/відділення: ${branch}\n` : "") +
    (comment ? `Коментар: ${comment}\n` : "") +
    (orderLines ? `\nТовари:\n${orderLines}\n` : "") +
    (order?.total != null ? `Разом: ${order.total}₴` : "");

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await tg.json();
    if (!data.ok) return res.status(502).json({ error: "Telegram error", detail: data });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Network error", detail: String(e) });
  }
}
