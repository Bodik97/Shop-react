// src/components/FaqSection.jsx
// Спільний блок "Питання та відповіді" — використовується на About і на головній.
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Faq from "./Faq";

// Єдине джерело даних: з нього рендеримо і видимий список, і FAQPage-schema,
// щоб розмітка завжди збігалася з тим, що бачить користувач.
const FAQS = [
  {
    q: "Як швидко ви відправляєте?",
    a: "Замовлення, оформлені до 15:00, відправляємо того ж дня. Доставка Новою Поштою по всій Україні зазвичай займає 1–3 дні.",
  },
  {
    q: "Якими способами можна оплатити?",
    a: "Доступна оплата при отриманні (накладений платіж) — ви платите на пошті після того, як отримали й оглянули товар. Також можлива онлайн-оплата за домовленістю.",
  },
  {
    q: "Скільки коштує доставка?",
    a: "Відправляємо Новою Поштою по всій Україні. Вартість доставки розраховується за тарифами перевізника й залежить від ваги та відділення.",
  },
  {
    q: "Що з гарантією та поверненням?",
    a: "На товар діє гарантія від виробника. Протягом 14 днів ви можете повернути або обміняти товар, якщо він не був у використанні та збережено комплектність і товарний вигляд.",
  },
  {
    q: "Чи перевіряєте товар перед відправкою?",
    a: "Так. Кожен товар ми оглядаємо й тестуємо перед відправленням, щоб ви отримали справний виріб без дефектів.",
  },
  {
    q: "Чи легальна ця продукція в Україні?",
    a: "Так. Представлені вироби перебувають у вільному цивільному обігу, не належать до вогнепальної зброї, не підлягають реєстрації та не потребують дозволів. Продаж здійснюється особам від 18 років.",
  },
  {
    q: "Чи допоможете підібрати товар?",
    a: "Звісно. Напишіть нам у Telegram, Viber або через форму на сторінці «Контакти» — менеджер підкаже оптимальний варіант під ваш запит і бюджет.",
  },
];

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export default function FaqSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ amount: 0.3 }}
      className="max-w-4xl mx-auto mt-16 mb-20 px-4"
    >
      <Helmet>
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-ink">Питання та відповіді</h2>
        <div className="divide-y divide-line">
          {FAQS.map(({ q, a }) => (
            <Faq key={q} q={q} a={a} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
