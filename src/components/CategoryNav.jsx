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
  // складаємо картинку категорії з першого товару цієї категорії
  const catsWithImages = useMemo(() => {
    return categories.map(cat => {
      const p = products.find(pr => pr.category === cat.id);
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

    let speed = 0.4;
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

  return (
    <section
      className="py-6 rounded-2xl overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow mb-4">Категорії</h2>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {catsWithImages.concat(catsWithImages).map((cat, i) => (
              <CategoryCard key={`${cat.id}-${i}`} cat={cat} />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#00000055] to-transparent rounded-l-2xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#00000055] to-transparent rounded-r-2xl" />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  const [src, setSrc] = useState(cat.image || FALLBACK_IMG);
  return (
    <div className="flex-shrink-0 w-64 sm:w-72 md:w-80">
      <Link
        to={`/category/${cat.id}`}
        className="group block rounded-xl bg-white/95 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
      >
        <div className="relative h-36 bg-gray-100">
          <img
            src={src}
            alt={cat.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setSrc(FALLBACK_IMG)}
          />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-800">{cat.name}</h3>
          <p className="text-xs text-gray-500">Перейти →</p>
        </div>
      </Link>
    </div>
  );
}
