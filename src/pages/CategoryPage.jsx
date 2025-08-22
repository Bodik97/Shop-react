import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function CategoryPage({ products, onAddToCart, onBuy }) {
  const { id } = useParams(); // отримуємо назву категорії з URL
  const items = products.filter(p => p.category === id);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Категорія: {id}</h1>

      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuy={onBuy}
            />
          ))}
        </div>
      ) : (
        <p>Товарів поки немає</p>
      )}
    </main>
  );
}
