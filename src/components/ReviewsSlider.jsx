import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { client, urlFor } from "../sanityClient";

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

  // Авто-прокрутка кожні 6 секунд (тільки якщо відгуків більше одного)
  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  // Поки завантажується або немає відгуків — секцію не показуємо
  if (isLoading) return null;
  if (reviews.length === 0) return null;

  const next = () => setIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  const current = reviews[index];

  return (
    <section className="pt-0 pb-12 px-4 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* ЗАГОЛОВОК */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-orange-500/40" />
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xl sm:text-2xl font-black text-center text-white uppercase tracking-[0.25em] italic"
          >
            Фідбек <span className="text-orange-500">Покупців</span>
          </motion.h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-orange-500/40" />
        </div>

        <div className="relative">
          {/* КАРТКА ВІДГУКУ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row items-stretch border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-md"
            >
              {/* Зображення */}
              <div className="w-full lg:w-[55%] h-[350px] sm:h-[450px] relative overflow-hidden">
                <img
                  src={current.imageUrl}
                  alt={current.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 font-mono text-[10px] text-white/30 tracking-widest uppercase">
                  LOG_REF: {(current._id || "").slice(-6).toUpperCase()}
                </div>
              </div>

              {/* Текст */}
              <div className="w-full lg:w-[45%] p-8 sm:p-10 flex flex-col justify-center relative">
                <Quote className="absolute top-6 right-6 text-orange-500/10 w-16 h-16" />

                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < current.rating ? "#f97316" : "none"}
                      className={i < current.rating ? "text-orange-500" : "text-white/5"}
                    />
                  ))}
                </div>

                <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-10 italic">
                  "{current.message}"
                </p>

                <div className="mt-auto border-l-2 border-orange-500 pl-4">
                  <h4 className="text-white font-black text-sm uppercase tracking-widest">
                    {current.name}
                  </h4>
                  <p className="text-orange-500/60 text-[10px] uppercase font-bold tracking-widest mt-1">
                    Verified Status: Active
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* КНОПКИ НАВІГАЦІЇ ПО ЦЕНТРУ */}
          {reviews.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-orange-500 text-white transition-all border border-white/10 hover:border-orange-500 active:scale-90"
                aria-label="Previous review"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Індикатор прогресу */}
              <div className="flex gap-1.5">
                {reviews.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-orange-500" : "w-1.5 bg-white/20"}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-orange-500 text-white transition-all border border-white/10 hover:border-orange-500 active:scale-90"
                aria-label="Next review"
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
