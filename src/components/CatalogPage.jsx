// src/components/CategoryPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { products, categories } from "../data/products";
import { ArrowUpDown, ChevronDown, SlidersHorizontal } from "lucide-react";

export default function CategoryPage({ onAddToCart, onBuy }) {
  const { id } = useParams();

  // --- state ---
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [showSortMobile, setShowSortMobile] = useState(false);
  const sortWrapRef = useRef(null);

  // --- derive ---
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
      case "price-asc":  return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc": return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "popular":    return list.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
      case "new":        return list.sort((a, b) => (b.id || 0) - (a.id || 0));
      default:           return list;
    }
  }, [filtered, sort]);

  const sortOptions = [
    { id: "default",    label: "Без сортування" },
    { id: "price-asc",  label: "Ціна — від дешевих" },
    { id: "price-desc", label: "Ціна — від дорогих" },
    { id: "popular",    label: "Популярні" },
    { id: "new",        label: "Нові надходження" },
  ];
  const sortLabels = Object.fromEntries(sortOptions.map(o => [o.id, o.label]));

  // --- close mobile dropdown on outside / Esc ---
  useEffect(() => {
    if (!showSortMobile) return;
    const onDocClick = (e) => {
      if (!sortWrapRef.current) return;
      if (!sortWrapRef.current.contains(e.target)) setShowSortMobile(false);
    };
    const onKey = (e) => e.key === "Escape" && setShowSortMobile(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [showSortMobile]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Хлібні крихти */}
      <nav className="text-sm text-white/70 mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-white">{title}</span>
      </nav>

      {/* Заголовок + сортування */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="!text-gray-900 font-extrabold text-3xl md:text-4xl">{title}</h1>
        
        {/* MOBILE: “комбобокс” замість select */}
        <div ref={sortWrapRef} className="relative sm:hidden w-full z-[60]">
          <label className="block text-[13px] text-black mb-1">Сортування</label>

          <button
            type="button"
            onClick={() => setShowSortMobile(v => !v)}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={showSortMobile}
            aria-controls="sortMenuMobile"
            className={`w-full h-12 rounded-xl border bg-white px-4 flex items-center justify-between shadow-sm
                        ${showSortMobile ? "ring-2 ring-blue-500" : "hover:bg-gray-50"}`}
          >
            <span className="flex items-center gap-3 !text-gray-900">
              <SlidersHorizontal className="h-5 w-5 !text-gray-900" />
              <span className="text-[14px]">
                {sortLabels[sort] || "Без сортування"}
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${showSortMobile ? "rotate-180" : ""}`} />
          </button>

          {showSortMobile && (
            <div
              id="sortMenuMobile"
              role="listbox"
              className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-lg p-2"
            >
              {sortOptions.map(opt => (
                <button
                  key={opt.id}
                  role="option"
                  aria-selected={sort === opt.id}
                  onClick={() => { setSort(opt.id); setShowSortMobile(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm
                              ${sort === opt.id ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-900"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <p className="mt-2 text-[12px] text-white/80">Торкніться, щоб відсортувати товари.</p>
        </div>

        {/* DESKTOP: кнопки */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
            Сортування:
          </div>
          <div role="group" aria-label="Опції сортування" className="flex flex-wrap gap-2">
            {[
              { id: "default",    label: "Без сортування",   title: "Початковий порядок" },
              { id: "price-asc",  label: "Ціна ↑",           title: "Від дешевих до дорогих" },
              { id: "price-desc", label: "Ціна ↓",           title: "Від дорогих до дешевих" },
              { id: "popular",    label: "Популярні",        title: "Найпопулярніші першими" },
              { id: "new",        label: "Нові",             title: "Нові надходження" },
            ].map(opt => {
              const active = sort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSort(opt.id)}
                  aria-pressed={active}
                  title={opt.title}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition shadow-sm
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                              ${active
                                ? "bg-white text-gray-900 ring-2 ring-white/70"
                                : "bg-white/85 text-gray-900 hover:bg-white"}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Категорії (горизонтальний скрол на мобі) */}
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
          {categories.map(c => {
            const active = !isAll && id === c.id;
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
          id="search"
          name="search"
          type="search"
          placeholder="Пошук…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
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
          {items.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onBuy={onBuy} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white/90 p-6 text-center text-gray-700">
          Нічого не знайдено за запитом “{q}”.
          <div>
            <button
              onClick={() => setQ("")}
              className="mt-3 inline-flex h-10 px-4 rounded-2xl border font-semibold hover:bg-gray-50"
            >
              Скинути пошук
            </button>
          </div>
        </div>
      )}
      {/* прихований select для уникнення помилки валідації */}
      
    </main>
  );
}
