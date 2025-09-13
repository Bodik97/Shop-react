// src/components/PopularSlider.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export default function PopularSlider({
  products = [],
  onAddToCart,
  onBuy,
  title = "Популярні товари",
}) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const EPS = 2; // допуск на округлення

  // Список популярних; якщо немає — фолбек на всі товари
  const list = useMemo(() => {
    const popular = (products || [])
      .filter(
        (p) =>
          p?.popular === true ||
          p?.isPopular === true ||
          p?.tags?.includes?.("popular") ||
          p?.badges?.includes?.("popular")
      )
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    return popular.length ? popular : products;
  }, [products]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const sl = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(sl > EPS);
    setCanRight(sl < max - EPS);
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

  // Центр/початок при побудові списку
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
    updateArrows();
  }, [list.length, updateArrows]);

  // onScroll + wheel горизонтально + ресайз
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // wheel → горизонт
    const onWheel = (e) => {
      // дозволяємо вертикальний скрол, якщо користувач затиснув Shift (звична поведінка)
      if (!e.shiftKey) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY || e.deltaX, behavior: "auto" });
      }
    };

    // ResizeObserver для актуальних стрілок
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [updateArrows]);

  if (!list.length) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scrollByStep(-1)}
            disabled={!canLeft}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
              ${canLeft ? "bg-white hover:bg-gray-50" : "invisible"}`}
            aria-label="Попередні"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={!canRight}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition
              ${canRight ? "bg-white hover:bg-gray-50" : "invisible"}`}
            aria-label="Наступні"
          >
            ›
          </button>
        </div>
      </div>

      <div className="relative">
        {/* лівий/правий градієнт підказка */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10 rounded-l-2xl ${
            canLeft ? "opacity-100" : "opacity-0"
          } transition-opacity`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10 rounded-r-2xl ${
            canRight ? "opacity-100" : "opacity-0"
          } transition-opacity`}
        />

        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={title}
          onScroll={updateArrows}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" && canLeft) scrollByStep(-1);
            if (e.key === "ArrowRight" && canRight) scrollByStep(1);
          }}
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

        {/* мобільні стрілки поверх, зникають на краях */}
        <button
          onClick={() => scrollByStep(-1)}
          className={`sm:hidden absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white shadow
                      flex items-center justify-center z-20 transition ${
                        canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
          aria-label="Попередні"
        >
          ‹
        </button>
        <button
          onClick={() => scrollByStep(1)}
          className={`sm:hidden absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white shadow
                      flex items-center justify-center z-20 transition ${
                        canRight ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
          aria-label="Наступні"
        >
          ›
        </button>
      </div>
    </section>
  );
}
