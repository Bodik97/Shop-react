import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function PopularSlider({ products = [], onBuy, onOrder, title = "Популярні товари" }) {
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

  const scrollByStep = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => updateArrows();
    el.addEventListener("scroll", updateArrows);
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
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByStep(-1)}
            disabled={!canLeft}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
                       ${canLeft ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"}`}
            aria-label="Попередні"
          >‹</button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={!canRight}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
                       ${canRight ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"}`}
            aria-label="Наступні"
          >›</button>
        </div>
      </div>

      {/* Трек слайдера */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-72 sm:w-80 md:w-80 lg:w-80"
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
          >‹</button>
        )}
        {canRight && (
          <button
            onClick={() => scrollByStep(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow flex items-center justify-center"
            aria-label="Наступні"
          >›</button>
        )}
      </div>
    </section>
  );
}
