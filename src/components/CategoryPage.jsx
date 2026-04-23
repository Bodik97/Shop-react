// src/components/CategoryPage.jsx
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import ProductCard from "./ProductCard";
import { products, categories } from "../data/products";

export default function CategoryPage({ onAddToCart, onBuy }) {
  const { id } = useParams();

  // ✅ працює і на /catalog, і на /category/all
  const isAll = !id || id === "all";

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");

  const cat = categories.find((c) => String(c.id) === String(id));
  const catName = isAll ? "Всі товари" : (cat?.name ?? id);

  // базовий список
  const base = useMemo(
    () => (isAll ? products : products.filter((p) => p.category === id)),
    [isAll, id]
  );

  // пошук
  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return base;
    return base.filter(
      (p) => p.title.toLowerCase().includes(term) || String(p.price).includes(term)
    );
  }, [base, term]);

  // ✅ сортування
  const items = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-asc":  return list.sort((a,b)=>(a.price||0)-(b.price||0));
      case "price-desc": return list.sort((a,b)=>(b.price||0)-(a.price||0));
      case "popular":    return list.sort((a,b)=>(b.popularityScore||0)-(a.popularityScore||0));
      case "new":        return list.sort((a,b)=>(b.id||0)-(a.id||0));
      default:           return list;
    }
  }, [filtered, sort]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Категорія пневматики",
            "description": "Пневматичні товари для спорту та дозвілля.",
            "url": "https://airsoft-ua.com/catalog"
          }
        `}</script>
      </Helmet>

      {/* Хлібні крихти */}
      <nav className="text-sm text-white mb-3">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-white">{catName}</span>
      </nav>

      {/* Заголовок + сортування справа */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="mx-auto sm:mx-0 text-center sm:text-left text-white font-extrabold
                       text-[20px] sm:text-3xl md:text-4xl">
          
          <span className="hyphens-auto break-words" lang="uk">{catName}</span>
        </h1>

        {/* mobile: select, desktop: кнопки */}
        <select
          id="sort-select"
          name="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="sm:hidden w-full rounded-xl border px-3 py-2 text-sm text-white bg-white"
          aria-label="Сортування товарів"
        >
          <option value="default">Без сортування</option>
          <option value="price-asc">Від дешевих ↑</option>
          <option value="price-desc">Від дорогих ↓</option>
          <option value="popular">Популярні</option>
          <option value="new">Нові</option>
        </select>


        <div className="mt-4 hidden sm:flex flex-wrap gap-2">
            {[
              { id: "default", label: "Без сортування" },
              { id: "price-asc", label: "⬆ Дешеві" },
              { id: "price-desc", label: "⬇ Дорогі" },
              { id: "popular", label: "⭐ Популярні" },
              { id: "new", label: "🆕 Нові" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-semibold shadow transition
                  !text-white
                  ${sort === opt.id
                    ? "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500"
                    : "bg-black/30 ring-1 ring-white/20 hover:bg-black/40"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>

      </div>
       {/* Лічильник */}
      <div className="text-sm text-white mb-4">
        Знайдено: <span className="font-medium">{items.length}</span>
      </div>
      {/* Пошук */}
      <div className="flex text-black items-center gap-2 border rounded-2xl px-3 py-2 w-full sm:w-80 bg-white mb-4">
        <input
          id="search-input"
          name="search"
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
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            Очистити
          </button>
        )}
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
          <p className="text-gray-600">Нічого не знайдено за запитом “{q}”.</p>
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
