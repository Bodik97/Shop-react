// src/pages/About.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ReviewsSlider from "../components/ReviewsSlider";
import Faq from "./Faq";

/* ——— main page ——— */
export default function About() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-slate-950 text-white">
      {/* BACKGROUND */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-400 to-blue-950"
      />

      {/* HERO */}
      <section className="relative z-10 max-w-5xl mx-auto text-center py-14 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white"
        >
          Профі у спорядженні
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white/80 text-[15px] sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Ми перевіряємо кожен товар, налаштовуємо перед відправкою і супроводжуємо клієнта після покупки.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row justify-center gap-7"
        >
          <AnimatedButton to="/" adaptiveBorder>
            Перейти в каталог
          </AnimatedButton>
        </motion.div>
      </section>

      {/* FEATURES */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ amount: 0.3 }}
        className="relative z-10 max-w-6xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-4"
      >
        <Feature title="Передпродажне налаштування" icon="🛠️" />
        <Feature title="Відправка день у день" icon="⚡" />
        <Feature title="Гарантія та підтримка" icon="🛡️" />
        <Feature title="Зручна оплата" icon="💳" />
      </motion.section>

      {/* CONTACT BUTTON після FEATURES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex justify-center mt-10 mb-10"
      >
        <AnimatedButton to="/contact" color="outline" adaptiveBorder>
          Зв’язатись з менеджером
        </AnimatedButton>
      </motion.div>

      {/* PURCHASE STEPS */}
      <StepsCarousel />

      {/* REVIEWS SLIDER */}
      <div className="relative z-10 mt-16">
        <ReviewsSlider />
      </div>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3 }}
        className="relative z-10 max-w-4xl mx-auto mt-16 mb-20 bg-white rounded-2xl p-6 text-black shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Питання та відповіді</h2>
        <div className="divide-y divide-gray-200">
          <Faq q="Як швидко ви відправляєте?" a="До 15:00 — того ж дня." />
          <Faq q="Що з гарантією?" a="14 днів на обмін або повернення, гарантія від виробника." />
          <Faq q="Чи допоможете підібрати?" a="Так, напишіть у Telegram або форму Контакти." />
        </div>
      </motion.section>
    </main>
  );
}

/* ——— Adaptive animated button ——— */
function AnimatedButton({ to, children, color = "blue", adaptiveBorder = false }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const isOutline = color === "outline";

  const base = isOutline
    ? "border border-white/60 hover:bg-white/10"
    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500";

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const border = Math.min(4, Math.max(2, Math.round(size.w / 300)));

  return (
    <div className="relative inline-block">
      {adaptiveBorder && size.w > 0 && (
        <motion.div
          className="absolute rounded-2xl border border-blue-200 pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: size.w + border * 2,
            height: size.h + border * 2,
            transform: "translate(-50%, -50%)",
            zIndex: 0,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            borderWidth: [border, border + 1, border],
            boxShadow: [
              `0 0 ${border * 2}px rgba(59,130,246,0.3)`,
              `0 0 ${border * 4}px rgba(59,130,246,0.6)`,
              `0 0 ${border * 2}px rgba(59,130,246,0.3)`,
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative z-10">
        <Link
          ref={ref}
          to={to}
          className={`inline-flex items-center justify-center h-11 px-8 rounded-2xl font-semibold text-white transition ${base}`}
        >
          {children}
        </Link>
      </motion.div>
    </div>
  );
}

/* ——— UI components ——— */
function Feature({ title, icon }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-center">
      <p className="font-medium text-slate-100 text-sm sm:text-base">{title}</p>
      <div className="mt-2 text-2xl sm:text-3xl">{icon}</div>
    </motion.div>
  );
}

function StepsCarousel() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto mt-16 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Як проходить покупка</h2>
      <div className="flex flex-col items-center gap-6">
        <Step
          num="1"
          title="Оформлення"
          text="Натисніть «Оформити», заповніть дані для замовлення."
        />
        <ArrowAll />
        <Step
          num="2"
          title="Підтвердження"
          text="Менеджер зв’язується, уточнює доставку та оплату."
        />
        <ArrowAll />
        <Step
          num="3"
          title="Отримання"
          text="Відправка Новою Поштою, отримання у відділенні."
        />
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
      className="snap-center flex-shrink-0 w-64 sm:w-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center"
    >
      <div className="text-blue-400 text-xl font-bold mb-1">{num}</div>
      <h3 className="text-base font-semibold mb-1 text-white">{title}</h3>
      <p className="text-slate-300 text-[14px] leading-relaxed">{text}</p>
    </motion.div>
  );
}

function ArrowAll() {
  return (
    <motion.div
      className="flex items-center justify-center text-blue-500 text-3xl sm:text-4xl"
      animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      ↓
    </motion.div>
  );
}