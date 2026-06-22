import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { client, urlFor } from "../sanityClient";
import { sanityFmt } from "../utils/sanityImg";

const fetchReviews = async () => {
  const query = `*[_type == "review" && published == true]
    | order(order asc)[0...20] {
      _id,
      name,
      rating,
      message,
      image
    }`;
  return await client.fetch(query);
};

export default function ReviewsSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Тягнемо відгуки з Sanity. Кеш керується QueryClient у App.jsx (10 хв staleTime).
  const { data: rawReviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });

  // Лишаємо тільки відгуки з фото — слайдер задизайнений навколо великої картинки.
  const reviews = useMemo(
    () =>
      rawReviews
        .filter((r) => r?.image)
        .map((r) => ({
          ...r,
          imageUrl: urlFor(r.image).width(800).height(900).fit("crop").auto("format").url(),
        })),
    [rawReviews]
  );

  // Якщо кількість відгуків змінилась і поточний індекс вийшов за межі — скидаємо
  useEffect(() => {
    if (index >= reviews.length && reviews.length > 0) setIndex(0);
  }, [reviews.length, index]);

  // Авто-прокрутка кожні 6 секунд (пауза на hover/focus та коли відгук один)
  useEffect(() => {
    if (reviews.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length, paused]);

  // Поки завантажується або немає відгуків — секцію не показуємо
  if (isLoading) return null;
  if (reviews.length === 0) return null;

  const next = () => setIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const current = reviews[index];

  // Анімація картки з повагою до prefers-reduced-motion
  const cardMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.35 },
      };

  return (
    <section className="pt-0 pb-12 sm:pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ЗАГОЛОВОК */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent mb-2">
            Відгуки
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Що кажуть наші покупці
          </h2>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {/* КАРТКА ВІДГУКУ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              {...cardMotion}
              className="flex flex-col lg:flex-row items-stretch rounded-2xl border border-line bg-white shadow-lg overflow-hidden"
            >
              {/* Зображення */}
              <div className="w-full lg:w-[55%] h-[320px] sm:h-[440px] relative overflow-hidden bg-surface">
                <img
                  src={sanityFmt(current.imageUrl, 900)}
                  alt={`Відгук покупця — ${current.name}`}
                  width={800}
                  height={900}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Текст */}
              <div className="w-full lg:w-[45%] p-7 sm:p-10 flex flex-col justify-center relative">
                <Quote className="absolute top-6 right-6 w-14 h-14 text-accent/10" aria-hidden="true" />

                {/* Рейтинг */}
                <div className="flex gap-1 mb-5" aria-label={`Оцінка: ${current.rating} з 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < current.rating ? "#EA580C" : "none"}
                      className={i < current.rating ? "text-accent" : "text-stone-300"}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="text-base sm:text-lg text-ink-soft leading-relaxed mb-8">
                  “{current.message}”
                </p>

                <div className="mt-auto">
                  <h4 className="font-display text-ink font-bold text-base">
                    {current.name}
                  </h4>
                  <p className="flex items-center gap-1.5 text-trust text-[13px] font-semibold mt-1">
                    <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                    Підтверджений покупець
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* НАВІГАЦІЯ */}
          {reviews.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-7">
              <button
                onClick={prev}
                className="w-11 h-11 grid place-items-center rounded-full border border-line bg-white text-ink
                  hover:bg-accent hover:text-white hover:border-accent active:scale-90 transition"
                aria-label="Попередній відгук"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Індикатор прогресу */}
              <div className="flex gap-1.5">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`accent-bare h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-6 bg-accent" : "w-1.5 bg-line hover:bg-stone-300"
                    }`}
                    aria-label={`Перейти до відгуку ${i + 1}`}
                    aria-current={i === index}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-11 h-11 grid place-items-center rounded-full border border-line bg-white text-ink
                  hover:bg-accent hover:text-white hover:border-accent active:scale-90 transition"
                aria-label="Наступний відгук"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
