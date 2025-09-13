// src/components/ProductCard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ProductCard({ product, onAddToCart, onBuy }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  if (!product) return null;

  const go = () => navigate(`/product/${product.id}`);
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isPopular =
    product.popular === true ||
    product.isPopular === true ||
    product.tags?.includes?.("popular") ||
    product.badges?.includes?.("popular");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") && go())}
      className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition cursor-pointer h-full flex flex-col"
      aria-label={product.title}
    >
      {/* Фотозона з фіксованою пропорцією */}
      <div className="relative bg-white overflow-hidden rounded-t-xl aspect-[4/3] pt-[10px]">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="absolute left-0 right-0 bottom-0 top-[20px] w-full h-full object-contain transition group-hover:scale-[1.03]"
          onClick={(e) => {
            e.stopPropagation();
            go();
          }}
        />

        {isPopular && (
          <span
            className="absolute top-2 left-2 md:-top--0.5 md:left-1 z-10
                      inline-flex items-center gap-1 rounded-full
                      bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500
                      text-white shadow-lg ring-1 ring-white/20 backdrop-blur
                      px-2 py-0.5 text-[12px] font-semibold select-none"
          >
            <Flame className="h-3 w-3" aria-hidden="true" />
            Популярний
          </span>
        )}


        {added && (
          <span
            className="absolute left-2 bottom-2 inline-flex items-center gap-1.5
                      rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500
                      text-white text-xs font-semibold px-3 py-1.5
                      shadow-lg ring-1 ring-emerald-700/30 animate-slideUpFade"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 16.17l-3.88-3.88-1.42 1.41L9 19 20.3 7.71l-1.41-1.41z"
              />
            </svg>
            Додано в кошик
          </span>
        )}
      </div>

      {/* Текст + CTA */}
      <div className="flex-1 p-3 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="flex items-center mt-0.5 mb-0.5
            text-[16px] md:text-[19px]
            leading-tight md:leading-snug
            line-clamp-2 min-h-[2.2rem] md:min-h-[3rem]
            text-center md:text-left font-semibold tracking-tight text-gray-900
            hover:text-blue-700 hover:underline hover:decoration-2 hover:underline-offset-2
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            transition-colors"



          onClick={(e) => e.stopPropagation()}
        >
          {product.title}
        </Link>

        <div className="mt-1 mb-2 text-blue-600 font-extrabold text-lg">{formatUAH(product.price)}</div>

        <div className="mt-auto flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            onClick={(e) => {
              stop(e);
              onAddToCart?.(product);
              setAdded(true);
            }}
            aria-label={`Додати ${product.title} у кошик`}
          >
            В кошик
            <span className="pointer-events-none absolute inset-0 rounded-xl sm:hidden animate-[pulse_1.2s_ease-out]" />
          </button>

          <button
            type="button"
            className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();        // блокує перехід, якщо картка загорнута в <Link>
              onBuy?.(product);           // тригер модалки
            }}
            aria-label={`Купити ${product.title}`}
          >
            Купити
          </button>

        </div>
      </div>
    </article>
  );
}
