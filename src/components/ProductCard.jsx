// src/components/ProductCard.jsx
import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import ImageWithPlaceholder from "./ImageWithPlaceholder";

const ProductCard = memo(function ProductCard({ product, onAddToCart, onBuy }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [buyFlash, setBuyFlash] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  useEffect(() => {
    if (!buyFlash) return;
    const t = setTimeout(() => setBuyFlash(false), 600);
    return () => clearTimeout(t);
  }, [buyFlash]);

  const isPopular =
    product?.popular === true ||
    product?.isPopular === true ||
    product?.tags?.includes?.("popular") ||
    product?.badges?.includes?.("popular");

  const subtitle = useMemo(() => {
    if (!product) return "";
    if (product.subtitle) return product.subtitle;
    if (product.category === "pistols") return "+ кулі";
    if (product.category === "rifles") return "+ Оптика та кулі";
    return "";
  }, [product]);

  const formattedPrice = useMemo(() => {
    if (!product) return "";
    return new Intl.NumberFormat("uk-UA", {
      maximumFractionDigits: 0,
    }).format(Number(product.price) || 0);
  }, [product]);

  if (!product) return null;

  const go = () => navigate(`/product/${product.id}`);
  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") && go())}
      aria-label={`Перейти до товару ${product.title}`}
      className="group border border-gray-200 rounded-2xl overflow-hidden 
                 bg-white hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]
                 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Фото */}
      <div className="relative bg-gray-50 overflow-hidden aspect-[4/3] flex items-center justify-center">
        <ImageWithPlaceholder
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.05]"
        />

        {isPopular && (
          <span
            className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full
                       bg-gradient-to-r from-orange-500 to-pink-500
                       text-white shadow-lg ring-1 ring-white/20 backdrop-blur
                       px-2.5 py-0.5 text-[12px] font-semibold select-none"
          >
            <Flame className="h-3.5 w-3.5" />
            Популярний
          </span>
        )}

        {added && (
          <span
            className="absolute left-1/2 bottom-3 -translate-x-1/2
                       bg-emerald-600 text-white text-xs font-semibold
                       px-3 py-1.5 rounded-full shadow-lg animate-fadeInUp"
          >
            ✅ Додано в кошик
          </span>
        )}
      </div>

      {/* Текст + CTA */}
      <div className="flex-1 p-4 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-lg font-semibold text-gray-900 text-center md:text-left 
                     leading-snug hover:text-blue-700 hover:underline underline-offset-2"
        >
          {product.title}
        </Link>

        {/* Subtitle з анімацією */}
        {subtitle && (
          <p
            className="text-sm font-semibold text-center md:text-left
                       text-red-600 mt-1 mb-3 select-none animate-subtlePulse"
          >
            {subtitle}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <div className="text-red-600 font-extrabold text-2xl text-center md:text-left">
            {formattedPrice} ₴
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            {/* В кошик */}
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onAddToCart?.(product);
                setAdded(true);
              }}
              className="h-11 w-full rounded-xl bg-gradient-to-r from-gray-900 to-black 
                         text-white font-semibold shadow-md hover:from-gray-800 hover:to-black/90 
                         active:scale-[0.98] transition flex items-center justify-center"
            >
              🛒 В кошик
            </button>

            {/* Купити зараз */}
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onBuy?.(product);
                setBuyFlash(true);
              }}
              className={`h-11 w-full rounded-xl border border-gray-300 
                         text-white font-semibold transition flex items-center justify-center 
                         relative overflow-hidden active:scale-[0.98] ${
                           buyFlash ? "animate-buyFlash" : "hover:bg-gray-100"
                         }`}
            >
              Купити зараз
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
