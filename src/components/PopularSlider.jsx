// src/components/PopularSlider.jsx
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function PopularSlider({
  products = [],
  onBuy,
  onOrder,

}) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const getStep = () => {
    const el = trackRef.current;
    if (!el) return 0;
    const first = el.querySelector("[data-slide]");
    // gap-4 => 16px; крок = ширина картки + gap
    return first ? first.getBoundingClientRect().width + 16 : Math.round(el.clientWidth * 0.9);
  };

  const scrollByStep = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getStep(), behavior: "smooth" });
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!products.length) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        

        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByStep(-1)}
            disabled={!canLeft}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
              ${canLeft ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"}`}
            aria-label="Попередні"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={!canRight}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
              ${canRight ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"}`}
            aria-label="Наступні"
          >
            ›
          </button>
        </div>
      </div>

      {/* Трек слайдера */}
      <div
        ref={trackRef}
        className="flex gap-4 px-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-slide
            className="
              snap-start flex-none max-w-none
              basis-full                       /* 1 картка на мобільному */
              sm:basis-[calc((100%-1rem)/2)]   /* 2 на sm (gap-4 = 1rem) */
              md:basis-[calc((100%-2rem)/3)]   /* 3 на md */
              lg:basis-[calc((100%-3rem)/4)]   /* 4 на lg+ */
            "
          >
            <ProductCard product={p} onBuy={onBuy} onOrder={onOrder} />
          </div>
        ))}
      </div>

      {/* Мобільні кнопки поверх країв */}
      <div className="sm:hidden">
        {canLeft && (
          <button
            onClick={() => scrollByStep(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow flex items-center justify-center"
            aria-label="Попередні"
          >
            ‹
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scrollByStep(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow flex items-center justify-center"
            aria-label="Наступні"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}
