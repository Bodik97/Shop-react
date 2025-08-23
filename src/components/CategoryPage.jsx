// src/components/CategoryPage.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products, categories } from "../data/products";

export default function CategoryPage({ onAddToCart, onBuy }) {
  const { id } = useParams();                 // id категорії з URL
  const [q, setQ] = useState("");             // рядок пошуку

  const catName = categories.find(c => c.id === id)?.name ?? id;

  // База: товари лише цієї категорії
  const base = products.filter(p => p.category === id);

  // Пошук: по title та price
  const t = q.trim().toLowerCase();
  const items = t
    ? base.filter(p =>
        p.title.toLowerCase().includes(t) ||
        String(p.price).includes(t)
      )
    : base;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Категорія: {catName}</h1>

      {/* Поле пошуку */}
      <div className="mt-2 mb-6 flex items-center border rounded-lg px-3 py-2">
        {/* іконку прибрав, щоб нічого не ламало */}
        <input
          type="search"
          placeholder="Пошук…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-xs text-gray-500 hover:text-gray-700 ml-2"
          >
            Очистити
          </button>
        )}
      </div>

      {/* Результати */}
      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product, i) => (
            <ProductCard
              key={`${product.id}-${i}`} // зроби id унікальними пізніше
              product={product}
              onAddToCart={onAddToCart}
              onBuy={onBuy}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Нічого не знайдено за запитом “{q}”.</p>
      )}
    </main>
  );
}
