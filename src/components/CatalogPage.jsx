import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { ArrowUpDown, ChevronDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { client } from "../sanityClient"; // Клієнт Sanity

// Список категорій (залишаємо тут, щоб не було помилок імпорту)
const categories = [
  { id: "air_rifles", name: "Пневматичні гвинтівки" },
  { id: "psp-rifles", name: "ПСП гвинтівки" },
  { id: "flobers", name: "Флобери" },
  { id: "pistols", name: "Пістолети" },
  { id: "knives", name: "Ножі" },
  { id: "accessories", name: "Аксесуари" }
];

export default function CategoryPage() {
  const { id } = useParams();

  // --- Стейт ---
  const [sanityProducts, setSanityProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [showSortMobile, setShowSortMobile] = useState(false);
  const sortWrapRef = useRef(null);

  // --- Завантаження даних із Sanity ---
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Отримуємо дані. Важливо: витягуємо URL картинки через asset->url
        const query = `*[_type == "product"] {
          _id,
          "id": _id,
          _createdAt,
          title,
          price,
          oldPrice,
          category,
          popularityScore,
          popular,
          giftBadge,
          giftText,
          stock,
          mainImage,
          "mainImageUrl": mainImage.asset->url,
          videoUrl,
          "gallery": images[].asset->url
        }`;

        const data = await client.fetch(query);
        setSanityProducts(data || []);
      } catch (err) {
        console.error("Помилка завантаження товарів:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    window.scrollTo(0, 0); // Прокрутка вгору при зміні категорії
  }, [id]);

  // --- Логіка фільтрації та сортування ---
  const isAll = !id || id === "all";
  const cat = categories.find((c) => String(c.id) === String(id));
  const pageTitle = isAll ? "Каталог товарів" : (cat?.name ?? id);

  // 1. Фільтр за категорією
  const base = useMemo(
    () => (isAll ? sanityProducts : sanityProducts.filter((p) => p.category === id)),
    [isAll, id, sanityProducts]
  );

  // 2. Фільтр за пошуковим запитом
  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return base;
    return base.filter((p) => {
      const titleMatch = p.title?.toLowerCase().includes(term);
      const priceMatch = String(p.price).includes(term);
      return titleMatch || priceMatch;
    });
  }, [base, term]);

  // 3. Сортування
  const items = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "price-asc":  return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc": return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "popular":    return list.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
      case "new":        return list.sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));
      default:           return list;
    }
  }, [filtered, sort]);

  // Закриття мобільного сортування при кліку зовні
  useEffect(() => {
    if (!showSortMobile) return;
    const onDocClick = (e) => {
      if (sortWrapRef.current && !sortWrapRef.current.contains(e.target)) {
        setShowSortMobile(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showSortMobile]);

  const sortOptions = [
    { id: "default",    label: "Без сортування" },
    { id: "price-asc",  label: "Ціна — від дешевих" },
    { id: "price-desc", label: "Ціна — від дорогих" },
    { id: "popular",    label: "Популярні" },
    { id: "new",        label: "Нові надходження" },
  ];
  const currentSortLabel = sortOptions.find(o => o.id === sort)?.label;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-white animate-pulse">Завантаження товарів із Sanity...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Хлібні крихти */}
      <nav className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-white">{pageTitle}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl">{pageTitle}</h1>
        
        {/* МОБІЛЬНЕ СОРТУВАННЯ */}
        <div ref={sortWrapRef} className="relative sm:hidden w-full z-[60]">
          <button
            onClick={() => setShowSortMobile(!showSortMobile)}
            className="w-full h-12 rounded-xl border bg-white px-4 flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-3 text-gray-900">
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-sm font-medium">{currentSortLabel}</span>
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${showSortMobile ? "rotate-180" : ""}`} />
          </button>
          {showSortMobile && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl p-2 animate-in fade-in zoom-in duration-200">
              {sortOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSort(opt.id); setShowSortMobile(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                    sort === opt.id ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ДЕСКТОП СОРТУВАННЯ */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium text-white/80 flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4" /> Сортування:
          </span>
          <div className="flex gap-2">
            {sortOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  sort === opt.id 
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md" 
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Пошук */}
      <div className="flex items-center gap-2 border border-white/20 rounded-2xl px-4 py-3 w-full sm:w-80 bg-white shadow-sm mb-6">
        <input
          type="search"
          placeholder="Пошук моделі або ціни..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1 text-gray-900"
        />
        {q && <button onClick={() => setQ("")} className="text-xs text-gray-500 hover:text-gray-900">Очистити</button>}
      </div>

      <div className="text-sm text-white/70 mb-6">
        Знайдено результатів: <span className="font-bold text-white">{items.length}</span>
      </div>

      {/* Сітка товарів */}
      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-12 text-center backdrop-blur-sm">
          <p className="text-white/70 text-base sm:text-lg">За запитом "{q}" нічого не знайдено.</p>
          <button onClick={() => setQ("")} className="mt-4 text-blue-400 hover:text-blue-300 font-bold underline transition">
            Скинути пошук
          </button>
        </div>
      )}
    </main>
  );
}