/* /api/telegram.js */
/* eslint-env node */

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json({ ok: true });
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Only POST" });

  // ENV
  const TOKEN = process.env.VITE_BOT_TOKEN || "";
  const CHAT  = process.env.VITE_CHAT_ID   || "";
  if (!TOKEN || !CHAT) return res.status(500).json({ ok: false, error: "Missing VITE_BOT_TOKEN or VITE_CHAT_ID" });

  // Body (fallback)
  let b = req.body;
  if (!b || typeof b !== "object") {
    try {
      const raw = await new Promise((r, j) => { let s=""; req.on("data", c=>s+=c); req.on("end", ()=>r(s)); req.on("error", j); });
      b = raw ? JSON.parse(raw) : {};
    } catch { return res.status(400).json({ ok: false, error: "Invalid JSON" }); }
  }

  // Основні поля
  const name    = String(b.name || b.customer?.name || "").trim();
  const phone   = String(b.phone || b.customer?.phone || "").trim();
  const email   = String(b.email || b.customer?.email || "").trim();
  const comment = String(b.comment || "").trim();
  if (!name || !phone) return res.status(400).json({ ok: false, error: "name and phone required" });

  // Доставка (від NovaPoshta блоку)
  const deliveryRaw = String(b.delivery || "").toLowerCase();
  const delivery = deliveryRaw === "nova" || deliveryRaw === "novaposta" ? "Нова Пошта" : (b.delivery || "-");
  const region  = String(b.region || "").trim();
  const city    = String(b.city   || "").trim();
  const branch  = String(b.branch || "").trim();

  // Товари
  const items = Array.isArray(b.cart) ? b.cart : Array.isArray(b.order?.items) ? b.order.items : [];
  const fmt = n => new Intl.NumberFormat("uk-UA",{ maximumFractionDigits:0 }).format(Number(n)||0) + " ₴";
  const esc = s => String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");

  const created = b.createdAt ? new Date(b.createdAt) : new Date();

  const lines = [];
  lines.push(`<b>🆕 Нова заявка</b>   <i>${created.toLocaleString("uk-UA")}</i>`);
  lines.push("────────────");
  lines.push(`Ім'я: <b>${esc(name)}</b>`);
  lines.push(`Телефон: <b>${esc(phone)}</b>`);
  if (email) lines.push(`Email: <b>${esc(email)}</b>`);

  // Доставка
  lines.push("────────────");
  lines.push("<b>🚚 Доставка</b>");
  lines.push(`Служба: <b>${esc(delivery)}</b>`);
  if (region) lines.push(`Область: <b>${esc(region)}</b>`);
  if (city)   lines.push(`Місто: <b>${esc(city)}</b>`);
  if (branch) lines.push(`Відділення/Адреса: <b>${esc(branch)}</b>`);

  // Товари
  if (items.length) {
    lines.push("────────────");
    lines.push("<b>🧾 Товари</b>");
    items.forEach((it,i)=> {
      const qty   = Math.max(1, Number(it.qty)||1);
      const price = Math.max(0, Number(it.price)||0);
      lines.push(`${i+1}. ${esc(it.title||"Товар")} — ${qty} × ${fmt(price)} = ${fmt(price*qty)}`);
    });
  }

  // Суми
  const subtotal = Number(b?.amounts?.subtotal || b?.order?.subtotal) || 0;
  const discount = Math.max(0, Number(b?.amounts?.discount || b?.order?.discount) || 0);
  const shipping = Math.max(0, Number(b?.amounts?.shipping || b?.order?.shipping) || 0);
  const total    = Number(b?.amounts?.total || b?.order?.total) || (subtotal ? Math.max(0, subtotal - discount + shipping) : 0);

  lines.push("────────────");
  if (subtotal) lines.push(`Сума товарів: <b>${fmt(subtotal)}</b>`);
  if (discount) lines.push(`Знижка: <b>−${fmt(discount)}</b>`);
  lines.push(`Доставка: <b>${shipping ? fmt(shipping) : "Безкоштовно"}</b>`);
  if (total) lines.push(`💰 Разом: <b>${fmt(total)}</b>`);
  if (comment) { lines.push("────────────"); lines.push("<b>📝 Коментар</b>"); lines.push(esc(comment)); }

  const text = lines.join("\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode: "HTML", disable_web_page_preview: true })
    });
    const data = await r.json().catch(()=>null);
    if (!r.ok || !data?.ok) return res.status(502).json({ ok:false, error: data?.description || `HTTP ${r.status}` });
    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error: String(e?.message||e) });
  }
}
