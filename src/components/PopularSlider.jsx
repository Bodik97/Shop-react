// src/components/PopularSlider.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function PopularSlider({
  products = [],
  onAddToCart,
  onBuy,
  title = "Популярні товари",
}) {
  // hooks завжди зверху, без умовних повернень до них
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // формуємо список «популярних»
  const list = useMemo(
    () =>
      (products || [])
        .filter(
          (p) =>
            p?.popular === true ||
            p?.isPopular === true ||
            p?.tags?.includes?.("popular") ||
            p?.badges?.includes?.("popular")
        )
        .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)),
    [products]
  );

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const getStep = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const first = el.querySelector("[data-slide]");
    return first ? first.getBoundingClientRect().width + 16 : Math.round(el.clientWidth * 0.9);
  }, []);

  const scrollByStep = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el) return;
      el.scrollBy({ left: dir * getStep(), behavior: "smooth" });
    },
    [getStep]
  );

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
  }, [updateArrows]);
    const centerFirst = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const slide = el.querySelector("[data-slide]");
    if (!slide) return;
    const left = slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  }, []);

  useEffect(() => {
    centerFirst();
    updateArrows?.();
  }, [centerFirst, updateArrows, list.length]);

  

  if (!list.length) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByStep(-1)}
            disabled={!canLeft}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition ${
              canLeft ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"
            }`}
            aria-label="Попередні"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={!canRight}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition ${
              canRight ? "bg-white hover:bg-gray-50" : "bg-gray-100 opacity-60 cursor-not-allowed"
            }`}
            aria-label="Наступні"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative flex gap-4 overflow-x-auto no-scrollbar scroll-smooth
                  snap-x snap-mandatory justify-start px-0"
      >

        {list.map((p) => (
          <div
            key={p.id}
            data-slide
            className="snap-center snap-always flex-none
                      basis-full sm:basis-[calc((100%-1rem)/2)]
                      md:basis-[calc((100%-2rem)/3)]
                      lg:basis-[calc((100%-3rem)/4)]
                      flex justify-center"
          >
            <div className="w-full max-w-[420px]">
              <ProductCard product={p} onAddToCart={onAddToCart} onBuy={onBuy} />
            </div>
          </div>
        ))}

      </div>

      <div className="sm:hidden pointer-events-none">
        {canLeft && (
          <button
            onClick={() => scrollByStep(-1)}
            className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow flex items-center justify-center z-10"
            aria-label="Попередні"
          >
            ‹
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scrollByStep(1)}
            className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow flex items-center justify-center z-10"
            aria-label="Наступні"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}
