import { useMemo, useRef, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { ArrowUpDown, ChevronDown, ChevronUp, SlidersHorizontal, Loader2 } from "lucide-react";
import { client } from "../sanityClient";
import { useScrollRestoration } from "../hooks/useScrollRestoration";

const SITE_URL = "https://airsoft-ua.com";

const categories = [
  { id: "air_rifles", name: "Пневматичні гвинтівки", description: "Широкий вибір пневматичних гвинтівок для активного відпочинку та розваг..." },
  { id: "psp-rifles", name: "PCP гвинтівки", description: "Гвинтівки PCP — це пневматика із попереднім закачуванням повітря..." },
  { id: "flobers", name: "Револьвери Флобера", description: "Револьвери під патрон Флобера для тренувальної стрільби..." },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети", description: "Пневматичні пістолети різних типів: CO2, мультикомпресійні та пружинні..." },
  { id: "start-pistols", name: "Стартові пістолети", description: "Стартові (сигнальні) пістолети для подачі звукового сигналу..." },
  { id: "pepper-sprays", name: "Перцеві балончики", description: "Ефективні та компактні засоби для самооборони..." }
];

const sortOptions = [
  { id: "default",    label: "За замовчуванням" },
  { id: "price-asc",  label: "Ціна — від дешевих" },
  { id: "price-desc", label: "Ціна — від дорогих" },
  { id: "new",        label: "Нові надходження" },
];

const fetchAllProducts = async () => {
  const query = `*[_type == "product"] {
    _id, "id": _id, "slug": slug.current, _createdAt, title, price, oldPrice, category, order, popular, giftBadge, giftText, stock, "mainImageUrl": mainImage.asset->url
  }`;
  return await client.fetch(query);
};

export default function CatalogPage() {
  const { id } = useParams();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [showSortMobile, setShowSortMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sortWrapRef = useRef(null);

  // --- REACT QUERY (Завантаження та кешування) ---
  const { data: sanityProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchAllProducts,
  });

  // Закриття опису при зміні категорії
  useEffect(() => {
    setIsExpanded(false);
  }, [id]);

  // Закриття мобільного сортування
  useEffect(() => {
    if (!showSortMobile) return;
    const onDocClick = (e) => {
      if (sortWrapRef.current && !sortWrapRef.current.contains(e.target)) setShowSortMobile(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showSortMobile]);

  // --- ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ ---
  const isAll = !id || id === "all";
  const cat = categories.find((c) => String(c.id) === String(id));
  const pageTitle = isAll ? "Каталог товарів" : (cat?.name ?? id);
  const categoryDescription = isAll ? "Повний асортимент товарів для стрільби." : cat?.description;

  const base = useMemo(
    () => (isAll ? sanityProducts : sanityProducts.filter((p) => p.category === id)),
    [isAll, id, sanityProducts]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter((p) => p.title?.toLowerCase().includes(term) || String(p.price).includes(term));
  }, [base, q]);

  const items = useMemo(() => {
    const list = [...filtered];
    const byNewest = (a, b) => new Date(b._createdAt) - new Date(a._createdAt);
    const byCategoryOrder = (a, b) => {
      const ao = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
      const bo = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return byNewest(a, b);
    };

    switch (sort) {
      case "price-asc":  return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "new":        return list.sort(byNewest);
      default:           return isAll ? list.sort(byNewest) : list.sort(byCategoryOrder);
    }
  }, [filtered, sort, isAll]);

  // --- ВІДНОВЛЕННЯ СКРОЛУ ---
  // Активуємо хук, коли дані завантажені (isLoading === false)
  useScrollRestoration({ ready: !isLoading });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">Завантаження...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Helmet>
        <title>{pageTitle} | AirSoft-UA</title>
        <meta name="description" content={categoryDescription?.slice(0, 160)} />
      </Helmet>

      <nav className="text-[10px] text-white/40 mb-4 uppercase tracking-widest">
        <Link to="/" className="hover:text-orange-500 transition-colors">Головна</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{pageTitle}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-white font-black text-3xl sm:text-5xl uppercase italic mb-4 tracking-tighter">{pageTitle}</h1>
        {categoryDescription && (
          <div className="max-w-4xl border-l-2 border-orange-500 pl-4 py-1">
            <div className={`text-white/50 text-sm sm:text-base leading-relaxed transition-all ${isExpanded ? "line-clamp-none" : "line-clamp-4"}`}>
              {categoryDescription}
            </div>
            {categoryDescription.length > 450 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-orange-500 font-black text-[10px] uppercase mt-3 flex items-center gap-1 tracking-widest">
                {isExpanded ? <>Згорнути <ChevronUp className="w-3 h-3"/></> : <>Показати все <ChevronDown className="w-3 h-3"/></>}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="bg-white rounded-xl px-4 py-2.5 w-full sm:w-80 shadow-lg">
          <input type="search" placeholder="Пошук моделі..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-gray-900 font-bold outline-none text-sm" />
        </div>

        <div ref={sortWrapRef} className="sm:hidden w-full relative z-40">
           <button onClick={() => setShowSortMobile(!showSortMobile)} className="w-full h-12 bg-white rounded-xl flex items-center justify-between px-4 text-gray-900 font-black uppercase text-xs shadow-md">
              <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> {sortOptions.find(o => o.id === sort)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortMobile ? "rotate-180" : ""}`} />
           </button>
           {showSortMobile && (
             <div className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-2xl p-2 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                {sortOptions.map(opt => (
                  <button key={opt.id} onClick={() => { setSort(opt.id); setShowSortMobile(false); }} className={`w-full text-left p-3.5 rounded-lg text-sm font-bold transition-colors ${sort === opt.id ? "bg-orange-500 text-white" : "text-gray-900 hover:bg-gray-100"}`}>{opt.label}</button>
                ))}
             </div>
           )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {sortOptions.map(opt => (
            <button key={opt.id} onClick={() => setSort(opt.id)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sort === opt.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
        {items.map(p => <ProductCard key={p._id} product={p} />)}
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-white/5 bg-white/5">
          <p className="text-white/30 font-bold uppercase tracking-widest">Нічого не знайдено</p>
        </div>
      )}
    </main>
  );
}