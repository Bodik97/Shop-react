export default function ProductCard({ product, onAddToCart, onBuy }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden h-full flex flex-col">
      <div className="h-48 bg-gray-100 overflow-hidden">
        <img src={product.image} alt={product.title}
             className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
        <p className="text-xl font-bold text-blue-600">{new Intl.NumberFormat("uk-UA").format(product.price)} ₴</p>

        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            Додати в кошик
          </button>
          <button
            onClick={() => onBuy(product)}
            className="flex-1 rounded-lg border border-blue-600 text-blue-600 py-2 text-sm font-medium hover:bg-blue-50 transition"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
}
