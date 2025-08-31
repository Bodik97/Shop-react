// src/components/ProductCard.jsx
import { Link, useNavigate } from "react-router-dom";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ProductCard({ product, onAddToCart, onBuy }) {
  const navigate = useNavigate();
  if (!product) return null;

  const goToProduct = () => navigate(`/product/${product.id}`);

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(e) => ((e.key === "Enter" || e.key === " ") && goToProduct())}
      className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition cursor-pointer h-full flex flex-col"
      aria-label={product.title}
    >
      {/* Зображення (клікабельне) */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition"
          onClick={(e) => {
            e.stopPropagation();
            goToProduct();
          }}
        />
      </div>

      {/* Контент */}
      <div className="flex-1 p-3 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="font-semibold line-clamp-2 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {product.title}
        </Link>

        <div className="mt-2 text-blue-600 font-bold">
          {formatUAH(product.price)}
        </div>

        {/* Кнопки */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded hover:bg-gray-50"
            onClick={(e) => {
              stop(e);
              onAddToCart?.(product);
            }}
            aria-label={`Додати ${product.title} у кошик`}
          >
            В кошик
          </button>

          <button
            type="button"
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={(e) => {
              stop(e);
              onBuy?.(product);
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
