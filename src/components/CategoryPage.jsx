// src/components/CategoryPage.jsx
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products, categories } from "../data/products";

export default function CategoryPage({ onAddToCart, onBuy }) {
  const { id } = useParams();
  const [q, setQ] = useState("");

  const isAll = id === "all";
  const cat = categories.find((c) => String(c.id) === String(id));
  const catName = isAll ? "Всі товари" : (cat?.name ?? id);

  const base = useMemo(
    () => (isAll ? products : products.filter((p) => p.category === id)),
    [isAll, id]
  );

  const t = q.trim().toLowerCase();
  const items = useMemo(() => {
    if (!t) return base;
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        String(p.price).includes(t)
    );
  }, [base, t]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
  
      <nav className="text-sm text-gray-500 mb-3">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">{catName}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
       <h1
          className="mx-auto max-w-[92vw] px-3 text-center text-white font-extrabold mb-6
                    text-[20px] sm:text-3xl md:text-4xl leading-snug"
        >
          {/* мобільно: окремий рядок */}
          <span className="sm:hidden block text-white/70 text-sm mb-1">Категорія</span>
          {/* ≥640px: в один рядок з двокрапкою */}
          <span className="hidden sm:inline text-white/80">Категорія: </span>

          <span className="hyphens-auto break-words" lang="uk">{catName}</span>
        </h1>
        {/* Пошук */}
        <div className="flex text-black items-center gap-2 border rounded-2xl px-3 py-2 w-full sm:w-80 bg-white">
          <input
          id="search-input"            // 👈 унікальний id
          name="search"                // 👈 name, щоб працювало автозаповнення
          type="search"
          placeholder="Пошук…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1"
          aria-label="Пошук у категорії"
        />

          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs text-white hover:text-gray-700"
            >
              Очистити
            </button>
          )}
        </div>
      </div>

      {/* Лічильник */}
      <div className="text-sm text-white mb-4">
        Знайдено: <span className="font-medium">{items.length}</span>
      </div>

      {/* Результати */}
      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onBuy={onBuy}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-6 text-center">
          <p className="text-gray-600">
            Нічого не знайдено за запитом “{q}”.
          </p>
          <button
            onClick={() => setQ("")}
            className="mt-3 inline-flex h-10 px-4 rounded-2xl border font-semibold hover:bg-gray-50"
          >
            Скинути пошук
          </button>
        </div>
      )}
    </main>
  );
}
