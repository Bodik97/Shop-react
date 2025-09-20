import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import ImageWithPlaceholder from "./ImageWithPlaceholder";

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
      className="group border rounded-xl overflow-hidden bg-gray-100 hover:shadow-lg transition cursor-pointer h-full flex flex-col"
      aria-label={product.title}
    >
      {/* Фото */}
      <div className="relative bg-gray-100 overflow-hidden rounded-t-xl aspect-[4/3] pt-[10px]">
        <ImageWithPlaceholder
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain transition group-hover:scale-[1.03]"
        />

        {isPopular && (
          <span
            className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full
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
            className="absolute left-2 bottom-2 inline-flex items-center gap-1.5 rounded-full
                       bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs
                       font-semibold px-3 py-1.5 shadow-lg ring-1 ring-emerald-700/30 animate-slideUpFade"
          >
            ✅ Додано в кошик
          </span>
        )}
      </div>

      {/* Текст + CTA */}
      <div className="flex-1 p-3 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="flex items-center mt-0.5 mb-0.5 text-[16px] md:text-[19px]
                     leading-tight md:leading-snug line-clamp-2 min-h-[2.2rem] md:min-h-[3rem]
                     text-center md:text-left font-semibold tracking-tight text-gray-900
                     hover:text-blue-700 hover:underline hover:decoration-2 hover:underline-offset-2
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {product.title}
        </Link>

        <div className="mt-1 mb-4 flex items-center gap-2">
          <div className="text-red-600 font-extrabold text-3xl sm:text-xl">
            {new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(product.price) || 0)} ₴
          </div>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            onClick={(e) => {
              stop(e);
              onAddToCart?.(product);
              setAdded(true);
            }}
          >
            В кошик
          </button>

          <button
            type="button"
            className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuy?.(product);
            }}
          >
            Купити
          </button>
        </div>
      </div>
    </article>
  );
}
