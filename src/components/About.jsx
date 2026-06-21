// src/pages/About.jsx
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Wrench, Zap, ShieldCheck, CreditCard, ArrowDown } from "lucide-react";
import ReviewsSlider from "../components/ReviewsSlider";
import FaqSection from "./FaqSection";

/* ——— main page ——— */
export default function About() {
  return (
    <main className="bg-white text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-stone-50 via-surface to-stone-200">
        <div className="relative z-10 max-w-5xl mx-auto text-center py-14 sm:py-20 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink"
          >
            Профі у спорядженні
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-ink-soft text-[15px] sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Ми перевіряємо кожен товар, налаштовуємо перед відправкою і супроводжуємо клієнта після покупки.
          </motion.p>

          <div className="mt-10 flex justify-center">
            <CTAButton to="/catalog">Перейти в каталог</CTAButton>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ amount: 0.3 }}
        className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4"
      >
        <Feature title="Передпродажне налаштування" icon={<Wrench className="w-6 h-6 text-trust" />} />
        <Feature title="Відправка день у день" icon={<Zap className="w-6 h-6 text-trust" />} />
        <Feature title="Гарантія та підтримка" icon={<ShieldCheck className="w-6 h-6 text-trust" />} />
        <Feature title="Зручна оплата" icon={<CreditCard className="w-6 h-6 text-trust" />} />
      </motion.section>

      {/* CONTACT BUTTON після FEATURES */}
      <div className="flex justify-center mt-10 mb-4">
        <CTAButton to="/contact" variant="outline">
          Зв’язатись з менеджером
        </CTAButton>
      </div>

      {/* PURCHASE STEPS */}
      <StepsCarousel />

      {/* REVIEWS SLIDER */}
      <div className="mt-16">
        <ReviewsSlider />
      </div>

      {/* FAQ */}
      <FaqSection />
    </main>
  );
}

/* ——— CTA button (accent / outline) ——— */
function CTAButton({ to, children, variant = "accent" }) {
  const styles =
    variant === "outline"
      ? "border-2 border-ink text-ink hover:bg-ink hover:text-white"
      : "bg-accent text-white hover:brightness-95";
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center h-12 px-8 rounded-lg font-display font-semibold transition active:scale-95 ${styles}`}
    >
      {children}
    </Link>
  );
}

/* ——— UI components ——— */
function Feature({ title, icon }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="p-5 rounded-2xl bg-white border border-line text-center shadow-sm hover:shadow-md transition"
    >
      <span className="mx-auto grid place-items-center w-12 h-12 rounded-xl bg-green-100 mb-3">
        {icon}
      </span>
      <p className="font-display font-semibold text-ink text-sm sm:text-base">{title}</p>
    </motion.div>
  );
}

function StepsCarousel() {
  return (
    <section className="max-w-6xl mx-auto mt-16 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-ink">Як проходить покупка</h2>
      <div className="flex flex-col items-center gap-5">
        <Step num="1" title="Оформлення" text="Натисніть «Оформити», заповніть дані для замовлення." />
        <ArrowAll />
        <Step num="2" title="Підтвердження" text="Менеджер зв’язується, уточнює доставку та оплату." />
        <ArrowAll />
        <Step num="3" title="Отримання" text="Відправка Новою Поштою, отримання у відділенні." />
      </div>
    </section>
  );
}

function Step({ num, title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl border border-line bg-white p-5 text-center shadow-sm"
    >
      <div className="mx-auto grid place-items-center w-9 h-9 rounded-full bg-accent text-white text-base font-bold mb-2">
        {num}
      </div>
      <h3 className="font-display text-base font-semibold mb-1 text-ink">{title}</h3>
      <p className="text-ink-soft text-[14px] leading-relaxed">{text}</p>
    </motion.div>
  );
}

function ArrowAll() {
  return <ArrowDown className="w-7 h-7 text-accent/50" aria-hidden="true" />;
}
