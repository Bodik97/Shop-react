// src/components/Contact.jsx
import { useState, useRef } from "react";
import { Phone, Mail, Clock, MapPin, Send, ShieldCheck, MessageSquare, Headphones } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

/** Допоміжні */
const digits = (s) => String(s || "").replace(/\D+/g, "");
const asE164UA = (s) => {
  let d = digits(s);
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9);
  const pretty = d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})?/, (_, a, b, c, d4) => [a, b, c, d4].filter(Boolean).join(" "));
  return "+380 " + pretty.trimEnd();
};

export default function Contact() {
  // const PHONE_DISPLAY = "+38 (096) 000-00-00";
  // const PHONE_TEL = "+380960000000";
  const EMAIL = "support@airsoft.shop";
  const HOURS = "Пн–Пт 10:00–19:00, Сб 11:00–16:00";
  const ADDRESS_LINES = [
    "Київ, вул. Бориспільська, 9 (Дарницький р-н)",
    "Київ, вул. Новокостянтинівська, 2А (Подільський р-н)",
  ];

  /** Стан форми */
  const [form, setForm] = useState({ name: "", phone: "+380 ", message: "", website: "" });
  const [err, setErr] = useState({ name: "", phone: "", message: "" });
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef(null);

  /** Валідація */
  const validate = () => {
    const e = { name: "", phone: "", message: "" };
    if (form.name.trim().length < 2) e.name = "Вкажіть ім’я від 2 символів.";
    const d = digits(form.phone);
    if (!(d.length === 12 && d.startsWith("380"))) e.phone = "Телефон у форматі +380XXXXXXXXX.";
    if (form.message.trim().length < 3) e.message = "Короткий коментар обов’язковий.";
    setErr(e);
    const bad = Object.values(e).some(Boolean);
    if (bad) setNotice({ type: "error", text: "Перевірте виділені поля і спробуйте ще раз." });
    else setNotice({ type: "", text: "" });
    return !bad;
  };

  /** Сабміт */
  const submitConsult = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setNotice({ type: "", text: "" });
    if (hideTimer.current) clearTimeout(hideTimer.current);

    const payload = {
      type: "consult",
      name: form.name.trim(),
      phone: "+380" + digits(form.phone).slice(-9),
      comment: form.message.trim(),
      website: form.website, // honeypot
    };

    try {
      const r = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => null);
      if (j?.ok) {
        setForm({ name: "", phone: "+380 ", message: "", website: "" });
        setErr({ name: "", phone: "", message: "" });
        setNotice({ type: "success", text: "Форму прийнято. Очікуйте дзвінка від менеджера." });
        hideTimer.current = setTimeout(() => setNotice({ type: "", text: "" }), 3000);
      } else {
        setNotice({ type: "error", text: "Не вдалося надіслати. Спробуйте пізніше." });
      }
    } catch {
      setNotice({ type: "error", text: "Мережева помилка. Спробуйте знову." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-slate-100">
      {/* HERO */}
      <section className="relative isolate max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold text-gray-700 bg-white/80 backdrop-blur-sm shadow-sm">
            <Headphones className="h-4 w-4" />
            Центр підтримки клієнтів
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900
                       text-[clamp(26px,5vw,46px)] leading-[1.15]"
          >
            Ми поруч, коли вам потрібна допомога
          </motion.h1>

          <p className="mt-3 max-w-2xl text-gray-600 text-sm sm:text-base leading-relaxed">
            Консультанти AirSoft на зв’язку щодня — допомагаємо підібрати спорядження, перевіряємо на складі й швидко
            оформлюємо доставку.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* <InfoCard
          icon={<Phone className="h-5 w-5 text-slate-900" />}
          label="Телефон"
          value={<a className="hover:text-blue-600" href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>}
        /> */}
        <InfoCard
          icon={<Mail className="h-5 w-5 text-slate-900" />}
          label="Email"
          value={<a className="hover:text-blue-600" href={`mailto:${EMAIL}`}>{EMAIL}</a>}
        />
        <InfoCard icon={<Clock className="h-5 w-5 text-slate-900" />} label="Графік" value={HOURS} />
        <InfoCard icon={<MapPin className="h-5 w-5 text-slate-900" />} label="Адреса" value={ADDRESS_LINES} />
      </section>

      {/* FORM */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mt-12 mb-8 px-4 sm:px-6"
      >
        <div className="rounded-3xl border bg-white shadow-lg overflow-hidden">
          <div className="p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-slate-900">Залиште заявку 📩</h3>
              <p className="mt-2 text-gray-600 text-sm sm:text-base">
                Напишіть, що вас цікавить — і наш менеджер зв’яжеться з вами найближчим часом.
              </p>
            </div>
                          {/* бейдж під формою */}
              {notice.text ? (
                <div className="pt-3">
                  <Banner type={notice.type}>{notice.text}</Banner>
                </div>
              ) : null}

            <form onSubmit={submitConsult} className="flex-1 w-full max-w-md space-y-4">
{/* honeypot */}
              <input
                type="text"
                id="website"
                name="website"
                value={form.website}
                onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

{/* Ім’я */}
              <label htmlFor="name" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Ім’я</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className={`w-full rounded-xl border p-3 text-[15px] text-slate-900 placeholder-slate-400 bg-white
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none
                              ${err.name ? "border-red-400" : "border-gray-300"}`}
                  placeholder="Ваше ім’я"
                  autoComplete="name"
                  aria-invalid={!!err.name}
                  aria-describedby={err.name ? "err-name" : undefined}
                  required
                />
                {err.name && <div id="err-name" className="mt-1 text-xs text-red-600">{err.name}</div>}
              </label>

{/* Телефон */}
              <label htmlFor="phone" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Телефон</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onFocus={() => {
                    if (!form.phone.trim()) setForm((s) => ({ ...s, phone: "+380 " }));
                  }}
                  onChange={(e) => setForm((s) => ({ ...s, phone: asE164UA(e.target.value) }))}
                  className={`w-full rounded-xl border p-3 text-[15px] text-slate-900 placeholder-slate-400 bg-white
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none
                              ${err.phone ? "border-red-400" : "border-gray-300"}`}
                  placeholder="+380 __ ___ __ __"
                  autoComplete="tel"
                  aria-invalid={!!err.phone}
                  aria-describedby={err.phone ? "err-phone" : undefined}
                  required
                />
                <div className="mt-1 text-xs text-slate-500">Формат: +380 12 345 67 89</div>
                {err.phone && <div id="err-phone" className="mt-1 text-xs text-red-600">{err.phone}</div>}
              </label>
{/* Коментар */}
              <label htmlFor="message" className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Коментар</span>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                  className={`w-full rounded-xl border p-3 text-[15px] text-slate-900 placeholder-slate-400 bg-white
                              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none resize-y
                              ${err.message ? "border-red-400" : "border-gray-300"}`}
                  placeholder="Коротко опишіть запит"
                  aria-invalid={!!err.message}
                  aria-describedby={err.message ? "err-message" : undefined}
                  required
                />
                {err.message && <div id="err-message" className="mt-1 text-xs text-red-600">{err.message}</div>}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3
                          hover:from-blue-500 hover:to-indigo-500 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Надсилаємо…" : "Відправити"}
              </button>
            </form>

          </div>
        </div>
      </motion.section>

      {/* WHY CHOOSE US */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        {[
          { icon: <ShieldCheck className="h-6 w-6 text-blue-600" />, title: "Гарантія та безпечність", desc: "14 днів на обмін, сертифікований товар." },
          { icon: <Send className="h-6 w-6 text-blue-600" />, title: "Відправка день у день", desc: "Замовлення до 15:00 відправляємо цього ж дня." },
          { icon: <MessageSquare className="h-6 w-6 text-blue-600" />, title: "Живий контакт", desc: "Реальні менеджери, швидкий зв’язок без ботів." },
        ].map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -3 }}
            className="rounded-2xl border bg-white p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-center">{f.icon}</div>
            <h4 className="mt-3 font-semibold text-slate-900 text-sm sm:text-base">{f.title}</h4>
            <p className="mt-1 text-gray-500 text-[13px] sm:text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* MAP */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16"
      >
        <div className="relative overflow-hidden rounded-3xl border shadow-md">
          <iframe
            title="Мапа"
            src="https://maps.google.com/maps?q=Kyiv&t=&z=12&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[280px] sm:h-[340px] md:h-[420px]"
            loading="lazy"
          />
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl shadow px-4 py-3">
            <p className="text-[13px] sm:text-sm font-semibold text-slate-900">Ми поруч 👋</p>
            <p className="text-[12px] text-gray-600">Зручно дістатись Новою Поштою або авто</p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

/** Підкомпоненти */
function InfoCard({ icon, label, value }) {
  const isArray = Array.isArray(value);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border bg-white p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition"
    >
      <div className="mx-auto grid place-items-center h-10 w-10 rounded-xl bg-gray-100">{icon}</div>
      <div className="mt-2 text-[12px] sm:text-sm text-gray-500">{label}</div>
      {isArray ? (
        <ul className="mt-1 space-y-1 font-semibold text-gray-900 text-sm sm:text-base">
          {value.map((line, idx) => (
            <li key={`${label}-${idx}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 font-semibold text-gray-900 text-sm sm:text-base break-words">{value}</div>
      )}
    </motion.div>
  );
}

function Banner({ type = "info", children }) {
  const color =
    type === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : type === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-slate-50 text-slate-800 border-slate-200";
  return (
    <div role="status" aria-live="polite" className={`rounded-xl border px-3 py-2 text-sm ${color}`}>
      {children}
    </div>
  );
}
