// src/components/ProductCard.jsx
import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart, onBuy }) {
  const navigate = useNavigate();
  if (!product) return null;

  const goToProduct = () => navigate(`/product/${product.id}`);

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToProduct}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goToProduct()}
      className="group border rounded-xl overflow-hidden bg-white hover:shadow-lg transition cursor-pointer h-full flex flex-col"
    >
      {/* Клікабельне зображення */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
        />
      </div>

      {/* Контент картки (також клікабельний фон) */}
      <div className="flex-1 p-3 flex flex-col">
        <Link
          to={`/product/${product.id}`}
          className="font-semibold line-clamp-2 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {product.title}
        </Link>

        <div className="mt-2 text-blue-600 font-bold">
          {new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(product.price)} ₴
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-50"
            onClick={(e) => {
              stop(e);
              onAddToCart?.(product);
            }}
          >
            В кошик
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={(e) => {
              stop(e);
              onBuy?.(product);
            }}
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
}
