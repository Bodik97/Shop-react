// src/components/ProductCard.jsx
import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Truck, Clock, ShoppingCart } from "lucide-react";
import ImageWithPlaceholder from "./ImageWithPlaceholder";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";
import { urlFor } from "../sanityClient";

const ProductCard = memo(function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // auto-hide "Додано" toast
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);

  // ─── Derived data ────────────────────────────────────────────────────────
  const isPopular = product?.popular === true;

  const hasDiscount = Number(product?.oldPrice) > Number(product?.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const stock = Number(product?.stock);
  const lowStock = stock > 0 && stock <= 5;

  const subtitle = useMemo(() => {
    if (!product) return "";
    if (product.giftText) return product.giftText;
    if (product.category === "pistols") return "+ кулі";
    if (product.category === "rifles") return "+ Оптика та кулі";
    return "";
  }, [product]);

  if (!product) return null;

  const productId = product.id || product._id;

  // ─── Image Logic ─────────────────────────────────────────────────────────
  const imageUrl =
    product.mainImageUrl ||
    (product.mainImage ? urlFor(product.mainImage).width(600).url() : product.image);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const go = () => navigate(`/product/${productId}`);
  const stopPropagate = (e) => { e.preventDefault(); e.stopPropagation(); };

  const handleAddToCart = (e) => {
    stopPropagate(e);
    addToCart(product);
    setAdded(true);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") && go())}
      aria-label={`Перейти до товару ${product.title}`}
      className="
        group relative flex flex-col
        bg-white rounded-2xl overflow-hidden
        border border-gray-200
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
        active:scale-[0.99]
        cursor-pointer
      "
    >
      {/* ── Зображення + бейджі ── */}
      <div className="relative bg-gray-50 overflow-hidden aspect-[4/3] flex items-center justify-center">
        <ImageWithPlaceholder
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Бейдж "Популярний" */}
        {isPopular && (
          <span className="
            absolute top-2 left-2 z-10
            inline-flex items-center gap-1 rounded-full
            bg-gradient-to-r from-orange-500 to-pink-500
            text-white shadow-lg ring-1 ring-white/20
            px-1.5 sm:px-2.5 py-0.5
            text-[10px] sm:text-xs font-semibold
          ">
            <Flame className="h-3 w-3 shrink-0" />
            <span>Хіт</span>
          </span>
        )}

        {/* Бейдж знижки */}
        {hasDiscount && (
          <span className="
            absolute top-2 right-2 z-10
            inline-flex items-center
            rounded-full
            bg-red-600 text-white
            shadow-lg ring-2 ring-white
            px-2 sm:px-3 py-0.5 sm:py-1
            text-xs sm:text-sm font-extrabold
            animate-pulse
          ">
            −{discountPercent}%
          </span>
        )}

        {/* Toast "Додано" */}
        {added && (
          <span className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20
                      inline-flex items-center gap-1 whitespace-nowrap
                      bg-emerald-600 text-white
                      text-[11px] sm:text-xs font-semibold
                      px-2.5 sm:px-3 py-1 sm:py-1.5
                      rounded-full shadow-lg animate-fadeInUp">
            ✅ Додано
          </span>
        )}
      </div>

      {/* ── Контент ── */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 gap-1.5 sm:gap-2">
        <Link
          to={`/product/${productId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-blue-700"
        >
          {product.title}
        </Link>

        {subtitle && (
          <p className="...">
            {typeof product.description === 'object' 
              ? product.description?.text 
              : product.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
            Швидка доставка
          </span>
          {lowStock && (
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
              <Clock className="h-3.5 w-3.5" />
              Залишилось {stock} шт
            </span>
          )}
        </div>

        <div className="mt-auto pt-1.5 sm:pt-2">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-extrabold text-red-600 tabular-nums">
              {formatUAH(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through tabular-nums">
                {formatUAH(product.oldPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-2 sm:mt-3 w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 rounded-xl !bg-black !text-white font-semibold text-sm shadow-md hover:bg-gray-900 active:scale-[0.98] transition"
          >
            <ShoppingCart className="h-4 w-4" />
            В кошик
          </button>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;