/* /api/order.js */
/* eslint-env node */

export default async function handler(req, res) {
  // ---------- utils ----------
  const PROD = process.env.NODE_ENV === "production";
  const nowIso = () => new Date().toISOString();
  const uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const reqId = String(req.headers["x-request-id"] || uuid()).slice(0, 36);
  const started = Date.now();
  const log = (level, msg, extra = {}) =>
    console[level](`[order] ${msg}`, { reqId, t: nowIso(), ...extra });

  const sendJson = (status, payload) => {
    res.setHeader("X-Request-ID", reqId);
    return res.status(status).json({ requestId: reqId, ...payload });
  };

  const safeStr = (v, max = 1000) => String(v ?? "").slice(0, max).trim();
  const esc = (s) =>
    String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  // ---------- CORS ----------
  const ALLOW_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", PROD ? ALLOW_ORIGIN : "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return sendJson(200, { ok: true });
  if (req.method !== "POST") return sendJson(405, { ok: false, code: "ONLY_POST" });

  // ---------- env ----------
  const TOKEN =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.VITE_BOT_TOKEN ||
    "";
  const CHAT =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.VITE_CHAT_ID ||
    "";
  const CHAT_BACKUP = process.env.TELEGRAM_CHAT_ID_BACKUP || "";

  if (!TOKEN || !CHAT) {
    log("error", "env-missing");
    return sendJson(200, {
      ok: false,
      code: "ENV_MISSING",
      warnings: ["TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are missing"],
    });
  }

  // ---------- client info ----------
  const xf = req.headers["x-forwarded-for"];
  const ipRaw = Array.isArray(xf) ? xf[0] : safeStr(xf);
  const clientIp = (ipRaw.split(",")[0] || "").trim() || "unknown";
  const ua = safeStr(req.headers["user-agent"], 300);

  // ---------- body size limit + parse ----------
  const MAX = 128 * 1024; // 128KB
  let b = {};
  if (req.body && typeof req.body === "object") {
    b = req.body;
  } else {
    try {
      let raw = "";
      await new Promise((resolve, reject) => {
        req.on("data", (c) => {
          raw += c;
          if (raw.length > MAX) raw = raw.slice(0, MAX);
        });
        req.on("end", resolve);
        req.on("error", reject);
      });
      b = raw ? JSON.parse(raw) : {};
    } catch (err) {
      log("error", "invalid-json", { err: safeStr(err?.message, 200) });
      await sendLeadMinimal({
        reason: "INVALID_JSON",
        n: "",
        p: "",
        c: "",
        err: safeStr(err?.message, 200),
      });
      return sendJson(200, { ok: false, code: "INVALID_JSON", warnings: ["Minimal lead sent"], error: "invalid_json" });
    }
  }

  // ---------- extract ----------
  const type = (safeStr(b.type || b.form || "", 40) || "").toLowerCase(); // "consult" => Консультація
  const isConsult = type === "consult" || type === "консультація";

  const name = safeStr(b.name || b.customer?.name, 120);
  const phoneRaw = safeStr(b.phone || b.customer?.phone, 40);
  const email = safeStr(b.email || b.customer?.email, 120);
  const comment = safeStr(b.comment || b.message, 1000);
  const orderId = safeStr(b.orderId || b.id, 80);

  const deliveryRaw = safeStr(b.delivery, 40).toLowerCase();
  const delivery =
    deliveryRaw === "nova" || deliveryRaw === "novaposta"
      ? "Нова Пошта"
      : safeStr(b.delivery, 40) || "-";
  const region = safeStr(b.region, 80);
  const city = safeStr(b.city, 120);
  const branch = safeStr(b.branch, 120);

  const items = Array.isArray(b.cart)
    ? b.cart
    : Array.isArray(b.order?.items)
    ? b.order.items
    : [];

  const subtotal = Number(b?.amounts?.subtotal ?? b?.order?.subtotal) || 0;
  const discount = Math.max(0, Number(b?.amounts?.discount ?? b?.order?.discount) || 0);
  const shipping = Math.max(0, Number(b?.amounts?.shipping ?? b?.order?.shipping) || 0);
  const total =
    Number(b?.amounts?.total ?? b?.order?.total) ||
    (subtotal ? Math.max(0, subtotal - discount + shipping) : 0);

  // ---------- validation + anti-spam ----------
  const phone = phoneRaw.replace(/[^\d+]/g, "").slice(0, 18);
  const validStr = (s, max) => !!s && s.length <= max;
  const warnings = [];

  const honey = safeStr(b.website || b.url || b.link || "", 60);
  if (honey) warnings.push("Honeypot filled");

  const RL_WINDOW_MS = 60_000;
  const RL_MAX = 12;
  globalThis.__rl = globalThis.__rl || new Map();
  const bucket = globalThis.__rl.get(clientIp) || { from: Date.now(), n: 0 };
  if (Date.now() - bucket.from > RL_WINDOW_MS) {
    bucket.from = Date.now();
    bucket.n = 0;
  }
  bucket.n++;
  globalThis.__rl.set(clientIp, bucket);
  if (bucket.n > RL_MAX) warnings.push("Rate-limited");

  if (!validStr(name, 80)) warnings.push("Invalid name");
  if (!validStr(phone, 18) || phone.length < 10) warnings.push("Invalid phone");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) warnings.push("Invalid email");

  // ---------- message builder ----------
  const fmtUAH = (n) =>
    new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";
  const created = new Date();

  const lines = [];
  if (isConsult) {
    lines.push(`<b>🆕 Консультація</b> | ${created.toLocaleString("uk-UA")}`);
  } else {
    lines.push(`<b>🆕 Замовлення</b> | ${created.toLocaleString("uk-UA")}`);
  }
  lines.push(`ID: <code>${esc(reqId)}</code>`);
  if (!isConsult && orderId) lines.push(`<b>#${esc(orderId)}</b>`);
  lines.push("────────────");
  lines.push(`👤 Ім’я: <b>${esc(name || "—")}</b>`);
  lines.push(`📞 Телефон: <b>${esc(phone || phoneRaw || "—")}</b>`);
  if (email) lines.push(`✉️ Email: <b>${esc(email)}</b>`);

  if (!isConsult) {
    lines.push("────────────");
    lines.push("<b>🚚 Доставка</b>");
    lines.push(`Служба: <b>${esc(delivery)}</b>`);
    if (region) lines.push(`Область: <b>${esc(region)}</b>`);
    if (city) lines.push(`Місто: <b>${esc(city)}</b>`);
    if (branch) lines.push(`Відділення: <b>${esc(branch)}</b>`);

    if (Array.isArray(items) && items.length) {
      lines.push("────────────");
      lines.push("<b>🧾 Товари</b>");
      items.forEach((it, i) => {
        const qty = Math.max(1, Number(it?.qty) || 1);
        const price = Math.max(0, Number(it?.price) || 0);
        const title = esc(safeStr(it?.title || "Товар", 140));
        lines.push(`${i + 1}. ${title} — ${qty} × ${fmtUAH(price)} = ${fmtUAH(price * qty)}`);
        if (it?.giftText) lines.push(`🎁 ${esc(safeStr(it.giftText, 200))}`);
      });
    }

    lines.push("────────────");
    if (discount) lines.push(`Знижка: <b>−${fmtUAH(discount)}</b>`);
    lines.push(`Доставка: <b>${shipping ? fmtUAH(shipping) : "Безкоштовно"}</b>`);
    if (total) lines.push(`💰 Разом: <b>${fmtUAH(total)}</b>`);
  }

  if (comment) {
    lines.push("────────────");
    lines.push(isConsult ? "<b>📝 Запит</b>" : "<b>📝 Коментар</b>");
    lines.push(esc(comment));
  }

  if (warnings.length) {
    lines.push("────────────");
    lines.push("<b>⚠️ Стан</b>");
    lines.push(esc(warnings.join("; ")));
  }

  const fullText = lines.join("\n");
  const cut4096 = (s) => (s.length <= 4096 ? s : s.slice(0, 4090) + " …");

  // ---------- telegram ----------
  async function tgSend(text, chatId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          chat_id: chatId,
          text: cut4096(text),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      clearTimeout(timer);
      const data = await r.json().catch(() => null);
      return r.ok && data?.ok;
    } catch (err) {
      clearTimeout(timer);
      log("error", "tg-send-ex", { err: safeStr(err?.message, 200) });
      return false;
    }
  }

  const backoff = (ms) => new Promise((r) => setTimeout(r, ms));

  async function sendLeadMinimal({ reason, n = "", p = "", c = "", err = "" }) {
    const minimal =
      `🧩 Lead(min)\n` +
      `ID: ${reqId}\n` +
      `Time: ${nowIso()}\n` +
      `IP: ${clientIp}\n` +
      `UA: ${ua}\n` +
      `Reason: ${reason}\n` +
      `Name: ${n || "—"}\n` +
      `Phone: ${p || "—"}\n` +
      (c ? `City: ${c}\n` : "") +
      (err ? `Error: ${esc(err)}\n` : "");
    const ok1 = await tgSend(minimal, CHAT);
    const ok2 = CHAT_BACKUP ? await tgSend(minimal, CHAT_BACKUP) : true;
    return ok1 && ok2;
  }

  // ---------- send flow ----------
  let delivered = false;
  let phase = "main";
  if (warnings.length || !name || !phone) phase = "degraded";

  try {
    if (phase === "main") {
      delivered = await tgSend(fullText, CHAT);
      if (delivered && CHAT_BACKUP) await tgSend(fullText, CHAT_BACKUP);
      if (!delivered) {
        await backoff(600);
        delivered = await tgSend(fullText, CHAT);
      }
    }
    if (!delivered || phase === "degraded") {
      const okMin = await sendLeadMinimal({
        reason: phase === "degraded" ? "DEGRADED" : "SEND_FAIL",
        n: name,
        p: phone || phoneRaw,
        c: city,
      });
      delivered = okMin || delivered;
    }
  } catch (err) {
    log("error", "send-exception", { err: safeStr(err?.message, 200) });
    const okMin = await sendLeadMinimal({
      reason: "EXCEPTION",
      n: name,
      p: phone || phoneRaw,
      c: city,
      err: safeStr(err?.message, 200),
    });
    delivered = okMin || delivered;
  }

  log("log", "done", { delivered, phase, ip: clientIp, ms: Date.now() - started });

  // ---------- unified response ----------
  return sendJson(200, {
    ok: true,
    delivered,
    phase,
    warnings: warnings.length ? warnings : undefined,
  });
}
