// src/components/CategoryNav.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { categories, products } from "../data/products";
import bgImage from "../img/background-img.png";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'>
  <rect width='100%' height='100%' fill='#e5e7eb'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-family='sans-serif' font-size='14'>
    Немає зображення
  </text></svg>`);

export default function CategoryNav() {
  const catsWithImages = useMemo(() => {
    return categories.map((cat) => {
      const p = products.find((pr) => pr.category === cat.id);
      return { ...cat, image: p?.image || FALLBACK_IMG };
    });
  }, []);

  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let speed = 0.5;
    const loop = () => {
      if (!paused) {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollTo({ left: 0, behavior: "auto" });
        } else {
          el.scrollLeft += speed;
        }
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [paused]);

  const scrollByViewport = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  return (
    <section
      className="relative py-8 sm:py-10 rounded-2xl overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* темний оверлей для контрасту */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Заголовок по центру, білий + світіння */}
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          Категорії
          <span
            aria-hidden
            className="block mx-auto mt-2 h-[3px] w-28 rounded-full bg-white/80 blur-[1px]"
          />
        </h2>

        <div className="relative">
          {/* стрілки прокрутки */}
          <button
            type="button"
            onClick={() => scrollByViewport(-1)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-xl bg-white/90 hover:bg-white shadow"
            aria-label="Назад"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByViewport(1)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-xl bg-white/90 hover:bg-white shadow"
            aria-label="Вперед"
          >
            ›
          </button>

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2 snap-x snap-mandatory"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {catsWithImages.concat(catsWithImages).map((cat, i) => (
              <CategoryCard key={`${cat.id}-${i}`} cat={cat} />
            ))}
          </div>

          {/* градієнтні шторки */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  const [src, setSrc] = useState(cat.image || FALLBACK_IMG);
  return (
    <div className="flex-shrink-0 w-56 sm:w-64 md:w-72 snap-start">
      <Link
        to={`/category/${cat.id}`}
        className="group block rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition overflow-hidden"
      >
        {/* фіксований формат зображення для рівних карток */}
        <div className="relative aspect-[16/9] bg-gray-100">
          <img
            src={src}
            alt={cat.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setSrc(FALLBACK_IMG)}
          />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
        <div className="p-4">
          <h3 className="text-[15px] font-semibold text-gray-900">{cat.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 relative">
              {/* мобільний пінг-підказка */}
              <span className="relative mr-1 md:hidden inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>

              <span className="font-medium text-gray-700">Перейти</span>

              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 opacity-80 transition-transform md:group-hover:translate-x-0.5
                          motion-safe:animate-pulse md:motion-safe:animate-none"
                aria-hidden="true"
              >
                <path fill="currentColor" d="M10 6l6 6-6 6v-4H4v-4h6V6z" />
              </svg>

              {/* підкреслення, що з’являється на ховері (десктоп) */}
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 right-0 h-px bg-gray-300 opacity-0
                          md:group-hover:opacity-100 transition-opacity"
              />
            </span>
          </p>

        </div>
      </Link>
    </div>
  );
}
