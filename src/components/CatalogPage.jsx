import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
// Додав ChevronUp для кнопки розгортання
import { ArrowUpDown, ChevronDown, ChevronUp, SlidersHorizontal, Loader2 } from "lucide-react";
import { client } from "../sanityClient";

const categories = [
  { 
    id: "air_rifles", 
    name: "Пневматичні гвинтівки", 
    description: "У цій групі Ви можете знайти безліч пневматичних гвинтівок для активного відпочинку та розваги, або підібрати чудовий подарунок близькій Вам людині. У групі представлена продукція різних світових брендів, різних моделей, на будь-який смак і гаманець. Ну а якщо Ви не знайшли в каталозі нашого сайту то, що хотіли, Ви завжди можете замовити товар, що Вас цікавить оформивши заявку на сайті нашої компанії або по телефону." 
  },
  { 
    id: "psp-rifles", 
    name: "ПСП гвинтівки", 
    description: "Гвинтівки PCP - пневматичні гвинтівки із попереднім закачуванням повітря. Висока точність та потужність для професійної стрільби."
  },
  { 
    id: "flobers", 
    name: "Револьвери флобера", 
    description: "У цій групі Ви знайдете багато револьверів під патрон флоберт, для активного відпочинку і розваг, або оберіть чудовий подарунок близькій Вам людині. У групі представлена продукція різних світових брендів, різні моделі, на будь-який смак і крок. Ну а якщо Ви не знайшли в каталозі нашого сайта те, що хотіли, Ви завжди можете замовити той, хто вас цікавить оформив заявку на сайті нашої компанії або по телефону." 
  },
  { 
    id: "pnevmo-pistols", 
    name: "Пневматичні пістолети", 
    description: "У цій групі товарів Ви можете знайти безліч пневматичних пістолетів для активного відпочинку та розваги, або підібрати відмінний подарунок близькій Вам людині. У групі представлена ​​продукція різних світових брендів, різних моделей, на будь-який смак і гаманець."
  },
  { 
    id: "start-pistols", 
    name: "Стартові пістолети", 
    description: "У цій групі Ви знайдете безліч стартових пістолетів, для активного відпочинку та розваги, або підібрати відмінний подарунок близькій Вам людині. У групі представлена ​​продукція різних світових брендів, різних моделей, на будь-який смак і гаманець." 
  },
  { 
    id: "pepper-sprays", 
    name: "Перцеві балончики", 
    description: "У цій групі Ви знайдете безліч перцевих балончиків для активного відпочинку та розваги, або підібрати відмінний подарунок близькій Вам людині. У групі представлена ​​продукція різних світових брендів, різних моделей, на будь-який смак і гаманець." 
  }
];

export default function CategoryPage() {
  const { id } = useParams();

  const [sanityProducts, setSanityProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const [showSortMobile, setShowSortMobile] = useState(false);
  
  // --- НОВИЙ СТЕЙТ ДЛЯ РОЗГОРТАННЯ ТЕКСТУ ---
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortWrapRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = `*[_type == "product"] {
          _id, "id": _id, _createdAt, title, price, oldPrice, category, order, popular, giftBadge, giftText, stock, "mainImageUrl": mainImage.asset->url
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
    window.scrollTo(0, 0);
    // Згортати текст при зміні категорії
    setIsExpanded(false);
  }, [id]);

  const isAll = !id || id === "all";
  const cat = categories.find((c) => String(c.id) === String(id));
  const pageTitle = isAll ? "Каталог товарів" : (cat?.name ?? id);
  const categoryDescription = isAll 
    ? "У нашому каталозі представлено повний асортимент товарів для стрільби та активного відпочинку. Обирайте найкраще спорядження від перевірених брендів." 
    : cat?.description;

  const base = useMemo(
    () => (isAll ? sanityProducts : sanityProducts.filter((p) => p.category === id)),
    [isAll, id, sanityProducts]
  );

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return base;
    return base.filter((p) => p.title?.toLowerCase().includes(term) || String(p.price).includes(term));
  }, [base, term]);

  const items = useMemo(() => {
    const list = [...filtered];
    const byNewest = (a, b) => new Date(b._createdAt) - new Date(a._createdAt);
    // Пріоритет `order` має сенс лише в межах однієї категорії,
    // інакше товари з order=1 з різних категорій сплутуються.
    const byCategoryOrder = (a, b) => {
      const ao = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
      const bo = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return byNewest(a, b);
    };
    switch (sort) {
      case "price-asc":  return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc": return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "new":        return list.sort(byNewest);
      default:           return isAll ? list.sort(byNewest) : list.sort(byCategoryOrder);
    }
  }, [filtered, sort, isAll]);

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
    { id: "default",    label: "За замовчуванням" },
    { id: "price-asc",  label: "Ціна — від дешевих" },
    { id: "price-desc", label: "Ціна — від дорогих" },
    { id: "new",        label: "Нові надходження" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-white animate-pulse">Завантаження...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <nav className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <span className="text-white">{pageTitle}</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl mb-3">
          {pageTitle}
        </h1>
        
        {/* БЛОК ОПИСУ З КНОПКОЮ РОЗГОРТАННЯ */}
        {categoryDescription && (
  /* Прибираємо h-30 (фіксована висота заважає тексту розгортатися) */
          <div className="max-w-3xl"> 
            <div className={`text-white/70 text-sm sm:text-base leading-relaxed border-l-2 border-orange-500 pl-4 py-1 transition-all duration-300 
              ${isExpanded ? "line-clamp-none" : "line-clamp-4" /* ЗМІНИЛИ ТУТ на 4 рядки */}`}>
              {categoryDescription}
            </div>

            {/* Збільшуємо поріг, наприклад до 500 символів, щоб кнопка була доречною */}
            {categoryDescription.length > 200 && ( 
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 ml-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
              >
                {isExpanded ? (
                  <>Згорнути <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Показати все <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        {/* МОБІЛЬНЕ СОРТУВАННЯ */}
        <div ref={sortWrapRef} className="relative sm:hidden w-full z-[60]">
          <button
            onClick={() => setShowSortMobile(!showSortMobile)}
            className="w-full h-12 rounded-xl border bg-white px-4 flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-3 text-gray-900">
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-sm font-medium">{sortOptions.find(o => o.id === sort)?.label}</span>
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

      <div className="flex items-center gap-2 border border-white/20 rounded-2xl px-4 py-3 w-full sm:w-80 bg-white shadow-sm mb-6">
        <input
          type="search"
          placeholder="Пошук моделі..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="outline-none bg-transparent text-sm flex-1 text-gray-900"
        />
      </div>

      <div className="text-sm text-white/70 mb-6">
        Знайдено результатів: <span className="font-bold text-white">{items.length}</span>
      </div>

      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-12 text-center backdrop-blur-sm">
          <p className="text-white/70 text-base sm:text-lg">За запитом "{q}" нічого не знайдено.</p>
        </div>
      )}
    </main>
  );
}