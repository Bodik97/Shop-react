// src/components/Contact.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Headphones,
  Mail,
  Clock,
  MapPin,
  ShieldCheck,
  Send,
  MessageSquare,
} from "lucide-react";

export default function Contact() {
  const EMAIL = "support@airsoft.shop";
  const HOURS = "Пн–Пт 10:00–19:00, Сб 11:00–16:00";
  const ADDRESS_LINES = ["Україна, Харківська область, м. Харків"];


  return (
    <main className="relative overflow-hidden bg-white">
      {/* HERO */}
      <section className="relative isolate max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(234,88,12,0.10)_0%,transparent_70%)]" />
        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink bg-white shadow-sm">
            <Headphones className="h-4 w-4 text-accent" />
            Центр підтримки клієнтів
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 font-display font-bold text-ink text-[clamp(26px,5vw,46px)] leading-[1.15]"
          >
            Ми поруч, коли вам потрібна допомога
          </motion.h1>

          <p className="mt-3 max-w-2xl text-ink-soft text-sm sm:text-base leading-relaxed">
            Консультанти AirSoft на зв’язку щодня — допомагаємо підібрати спорядження, перевіряємо на складі й швидко
            оформлюємо доставку.
          </p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* <InfoCard
          icon={<Phone className="h-5 w-5 text-slate-900" />}
          label="Телефон"
          value={<a className="hover:text-blue-600" href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>}
        /> */}
        <InfoCard
          icon={<Mail className="h-5 w-5 text-ink" />}
          label="Email"
          value={<a className="hover:text-accent transition" href={`mailto:${EMAIL}`}>{EMAIL}</a>}
        />
        <InfoCard icon={<Clock className="h-5 w-5 text-ink" />} label="Графік" value={HOURS} />
        <InfoCard icon={<MapPin className="h-5 w-5 text-ink" />} label="Адреса" value={ADDRESS_LINES} />
      </section> 

      {/* WHY CHOOSE US */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
      >
        {[
          { icon: <ShieldCheck className="h-6 w-6 text-accent" />, title: "Гарантія та безпечність", desc: "14 днів на обмін, сертифікований товар." },
          { icon: <Send className="h-6 w-6 text-accent" />, title: "Відправка день у день", desc: "Замовлення до 15:00 відправляємо цього ж дня." },
          { icon: <MessageSquare className="h-6 w-6 text-accent" />, title: "Живий контакт", desc: "Реальні менеджери, швидкий зв’язок без ботів." },
        ].map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-line bg-white p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-center">{f.icon}</div>
            <h4 className="mt-3 font-display font-semibold text-ink text-sm sm:text-base">{f.title}</h4>
            <p className="mt-1 text-ink-soft text-[13px] sm:text-sm">{f.desc}</p>
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
        <div className="relative overflow-hidden rounded-3xl border border-line shadow-md">
          <iframe
            title="Мапа"
            src="https://maps.google.com/maps?q=Kharkiv&t=&z=12&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[280px] sm:h-[340px] md:h-[420px]"
            loading="lazy"
          />
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl shadow px-4 py-3">
            <p className="text-[13px] sm:text-sm font-semibold text-ink">Ми поруч 👋</p>
            <p className="text-[12px] text-ink-soft">Зручно дістатись Новою Поштою або авто</p>
          </div>
        </div>
      </motion.section>
    </main>
  );
};

/** Підкомпоненти */
function InfoCard({ icon, label, value }) {
  const isArray = Array.isArray(value);
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-line bg-white p-4 sm:p-5 text-center shadow-sm hover:shadow-md transition"
    >
      <div className="mx-auto grid place-items-center h-10 w-10 rounded-xl bg-surface">{icon}</div>
      <div className="mt-2 text-[12px] sm:text-sm text-ink-soft">{label}</div>
      {isArray ? (
        <ul className="mt-1 space-y-1 font-semibold text-ink text-sm sm:text-base">
          {value.map((line, idx) => (
            <li key={`${label}-${idx}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 font-semibold text-ink text-sm sm:text-base break-words">{value}</div>
      )}
    </motion.div>
  );
}

