/* eslint-env node */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, endpoint: "/api/telegram", method: "GET" });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: "Set BOT_TOKEN and CHAT_ID" });

  // екранування спецсимволів
  const esc = (s="") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const fmtUAH = (n) =>
    new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n)||0) + " ₴";

  let body = {};
  try {
    body = typeof req.body === "object" && req.body ? req.body : JSON.parse(await new Promise((r, j) => {
      let raw = ""; req.on("data", c => raw += c); req.on("end", () => r(raw)); req.on("error", j);
    }));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const {
    name="", phone="", email="", comment="",
    delivery="", city="", branch="", order,
    createdAt
  } = body;

  const when = createdAt ? new Date(createdAt) : new Date();
  const stamp = when.toLocaleString("uk-UA");

  const orderLines = Array.isArray(order?.items)
    ? order.items.map((it,i) => {
        const title = esc(it.title);
        const qty = Number(it.qty)||1;
        const lineTotal = Number(it.lineTotal)||((Number(it.price)||0)*qty);
        return `${i+1}) ${title} × ${qty} = <b>${fmtUAH(lineTotal)}</b>`;
      }).join("\n")
    : "";

  const GAP = "\n\u00A0\n"; // більший відступ: пустий рядок із NBSP

  const text = [
    `<b>🧾 НОВА ЗАЯВКА</b>   <i>${esc(stamp)}</i>`,

    GAP,
    `👤 <b>Клієнт:</b>`,
    `Ім’я: <b>${esc(name)}</b>`,
    `Телефон: <b>${esc(phone)}</b>`,
    email ? `Email: <b>${esc(email)}</b>` : null,

    GAP,
    `🚚 <b>Доставка:</b>`,
    `Метод: <b>${esc(delivery || "-")}</b>`,
    `Місто: <b>${esc(city || "-")}</b>`,
    `Адреса/відділення: <b>${esc(branch || "-")}</b>`,

    orderLines ? GAP + `🛒 <b>Товари:</b>\n${orderLines}` : null,

    GAP +
      [
        order?.subtotal != null ? `Сума товарів: <b>${fmtUAH(order.subtotal)}</b>` : null,
        order?.discount > 0 ? `Знижка: <b>−${fmtUAH(order.discount)}</b>` : null,
        `Доставка: <b>${order?.shipping > 0 ? fmtUAH(order.shipping) : "Безкоштовно"}</b>`,
        order?.total != null ? `💰 Разом: <b>${fmtUAH(order.total)}</b>` : null,
      ].filter(Boolean).join("\n"),

    comment ? GAP + `📝 <b>Коментар:</b>\n${esc(comment)}` : null,
  ]
    .filter(Boolean)
    .join("\n");


  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = await tg.json();
    if (!data.ok) return res.status(502).json({ error: "Telegram error", detail: data });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Network error", detail: String(e) });
  }
}
