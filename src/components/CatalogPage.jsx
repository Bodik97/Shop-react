// src/components/CategoryPage.jsx
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products, categories } from "../data/products";

export default function CategoryPage({ onAddToCart, onBuy }) {
  const { id } = useParams();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");

  const isAll = !id || id === "all";
  const cat = categories.find((c) => String(c.id) === String(id));
  const title = isAll ? "Каталог товарів" : (cat?.name ?? id);

  const base = useMemo(
    () => (isAll ? products : products.filter((p) => p.category === id)),
    [isAll, id]
  );

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return base;
    return base.filter(
      (p) => p.title.toLowerCase().includes(term) || String(p.price).includes(term)
    );
  }, [base, term]);

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
      {/* Хлібні крихти */}
      <nav className="text-sm text-white/60 mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-white/80">{title}</span>
      </nav>

      {/* Заголовок + сортування */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="text-white font-extrabold text-3xl md:text-4xl">{title}</h1>

        {/* Mobile: select */}
        <select
          value={sort}
          onChange={(e)=>setSort(e.target.value)}
          className="sm:hidden w-full rounded-xl border px-3 py-2 text-sm bg-white text-gray-900"
        >
          <option value="default">Без сортування</option>
          <option value="price-asc">Ціна ↑</option>
          <option value="price-desc">Ціна ↓</option>
          <option value="popular">Популярні</option>
          <option value="new">Нові</option>
        </select>

        {/* Desktop: кнопки */}
        <div className="hidden sm:flex flex-wrap gap-2">
          {[
            { id: "default",    label: "🔄 Без сортування" },
            { id: "price-asc",  label: "⬆️ Ціна" },
            { id: "price-desc", label: "⬇️ Ціна" },
            { id: "popular",    label: "⭐ Популярні" },
            { id: "new",        label: "🆕 Нові" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={()=>setSort(opt.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow
                ${sort===opt.id
                  ? "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white"
                  : "bg-white/90 text-gray-900 hover:bg-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Категорії: горизонтальний скрол на мобі */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none mb-4">
        <div className="inline-flex gap-2 whitespace-nowrap">
          <Link
            to="/category/all"
            className={`px-3 py-1.5 rounded-full text-sm font-medium
              ${isAll
                ? "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white"
                : "bg-white/90 text-gray-900 hover:bg-white"}`}
          >
            Всі
          </Link>
          {categories.map(c=>{
            const active = !isAll && id===c.id;
            return (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium
                  ${active
                    ? "bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white"
                    : "bg-white/90 text-gray-900 hover:bg-white"}`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Пошук */}
      <div className="flex items-center gap-2 border rounded-2xl px-3 py-2 w-full sm:w-80 bg-white mb-4 text-black">
        <input
          type="search"
          placeholder="Пошук…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1"
        />
        {q && (
          <button onClick={()=>setQ("")} className="text-xs text-gray-600 hover:text-gray-900">
            Очистити
          </button>
        )}
      </div>

      {/* Лічильник */}
      <div className="text-sm text-white/90 mb-4">
        Знайдено: <span className="font-semibold">{items.length}</span>
      </div>

      {/* Товари */}
      {items.length ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map(p=>(
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onBuy={onBuy} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white/90 p-6 text-center text-gray-700">
          Нічого не знайдено за запитом “{q}”.
          <div>
            <button
              onClick={()=>setQ("")}
              className="mt-3 inline-flex h-10 px-4 rounded-2xl border font-semibold hover:bg-gray-50"
            >
              Скинути пошук
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
