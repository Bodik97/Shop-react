// src/components/ProductPage.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";
import { ShoppingCart } from "lucide-react";
import ModalBuy from "./ModalBuy";


const Badge = ({ children, variant = "blue", className = "" }) => {
  const styles =
    variant === "green"
      ? "bg-green-50 text-green-700"
      : variant === "popular"
      ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-sm"
      : "bg-blue-50 text-blue-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}>
      {variant === "popular" ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
            <path fill="currentColor" d="M13.5 2s1 2 .5 3.5S11 7 11 9s1.5 3 3 3 3-1 3-3 2-3.5 2-3.5S21 9 21 12.5 17.9 21 12 21 3 16.6 3 12.5 5.5 7 9 6c0 0-.5 1.5 0 2.5S11 10 11 8.5 12 2 13.5 2Z" />
          </svg>
          Популярний
        </>
      ) : (
        children
      )}
    </span>
  );
};

export default function ProductPage() {
  const { addToCart } = useCart();
  const [buyProduct, setBuyProduct] = useState(null); 
  const { id } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => products.find((p) => String(p.id) === String(id)), [id]);

  const isPopular = !!(
    product?.popular ||
    product?.isPopular ||
    product?.badges?.includes?.("popular") ||
    product?.tags?.includes?.("popular") ||
    product?.meta?.popular
  );

  const imgs = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.imgs) && product.imgs.length) return product.imgs.filter(Boolean);
    return [product.image].filter(Boolean);
  }, [product]);

  const [idx, setIdx] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // скидаємо вибрані аддони при зміні товару
  useEffect(() => {
    setSelectedAddons([]);
  }, [product?.id]);

  const clampIndex = useCallback((i) => (imgs.length ? (i + imgs.length) % imgs.length : 0), [imgs.length]);
  const prev = useCallback(() => setIdx((i) => clampIndex(i - 1)), [clampIndex]);
  const next = useCallback(() => setIdx((i) => clampIndex(i + 1)), [clampIndex]);

  // fullscreen + zoom
  const [openFS, setOpenFS] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const swipeStartX = useRef(0);
  const pinchStart = useRef({ dist: 0, scale: 1 });

  const clampOffset = (x, y, s) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxX = (vw * (s - 1)) / 2;
    const maxY = (vh * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const zoomAt = useCallback(
    (next, cx, cy) => {
      const ns = Math.max(1, Math.min(4, next));
      setOffset((o) => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const px = cx - vw / 2 - o.x;
        const py = cy - vh / 2 - o.y;
        const k = 1 - ns / scale;
        return clampOffset(o.x + px * k, o.y + py * k, ns);
      });
      setScale(ns);
      if (ns === 1) setOffset({ x: 0, y: 0 });
    },
    [scale]
  );

  const openFull = () => { setOpenFS(true); setScale(1); setOffset({ x: 0, y: 0 }); };
  const onWheelFS = (e) => zoomAt(scale - Math.sign(e.deltaY) * 0.25, e.clientX, e.clientY);
  const onDoubleClickFS = (e) => zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);

  useEffect(() => {
    if (!openFS) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setOpenFS(false);
      if (e.key === "+") zoomAt(scale + 0.5, innerWidth / 2, innerHeight / 2);
      if (e.key === "-") zoomAt(scale - 0.5, innerWidth / 2, innerHeight / 2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFS, prev, next, scale, zoomAt]);

  // toast
  const [flashCart, setFlashCart] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  // drag & pinch
  const startDrag = (clientX, clientY) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };
  const doDrag = (clientX, clientY) => {
    if (!dragging.current || scale === 1) return;
    setOffset(clampOffset(clientX - dragStart.current.x, clientY - dragStart.current.y, scale));
  };
  const endDrag = () => (dragging.current = false);

  const onFSPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale };
    } else if (scale > 1) startDrag(e.clientX, e.clientY);
  };
  const onFSPointerMove = (e) => {
    const map = pointers.current;
    if (map.has(e.pointerId)) map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2) {
      const [a, b] = [...map.values()];
      const factor = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinchStart.current.dist || 1);
      const next = Math.max(1, Math.min(4, (pinchStart.current.scale || 1) * factor));
      zoomAt(next, (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (dragging.current) {
      doDrag(e.clientX, e.clientY);
    }
  };
  const onFSPointerUp = (e) => { pointers.current.delete(e.pointerId); endDrag(); };

  const features = product?.features || [];
  const specs = product?.specs || {};
  const inBox = product?.inBox || [];
  const warranty = product?.warranty;
  const addons = product?.addons ?? [];

  const addonsTotal = useMemo(
    () => (product?.addons ?? [])
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0),
    [product?.addons, selectedAddons]
  );

  const finalPrice = (Number(product?.price) || 0) + addonsTotal;

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    
    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
      {!product ? (
        <>
          <nav className="text-xs sm:text-sm text-gray-200 mb-4">
            <Link to="/" className="hover:underline">Головна</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-200">Товар</span>
          </nav>
          <p className="text-black">Товар не знайдено.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 border rounded-lg !text-white">← Назад</button>
        </>
      ) : (
        <>
        <Helmet>
            <script type="application/ld+json">{`
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "${product.title}",
                "image": "${product.image}",
                "description": "Пневматичний товар для спорту та дозвілля.",
                "brand": { "@type": "Brand", "name": "${product.brand}" },
                "offers": {
                  "@type": "Offer",
                  "url": "https://airsoft-ua.com/accessories/${product.id}",
                  "priceCurrency": "UAH",
                  "price": "${product.price}",
                  "availability": "https://schema.org/InStock"
                }
              }
            `}</script>
          </Helmet>
          {/* toast */}
          {flashCart && (
            <div role="status" aria-live="polite" className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] select-none animate-slideUpFade">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold px-3 py-1.5 shadow-lg ring-1 ring-emerald-700/30">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                </svg>
                Додано в кошик
              </span>
            </div>
          )}

          {/* хлібні крихти */}
          <nav className="text-xs sm:text-sm text-gray-100 mb-4">
            <Link to="/" className=" !text-gray-400 hover:underline">Головна</Link>
            <span className="mx-1">/</span>
            <Link to={`/category/${product.category}`} className="!text-gray-400 hover:underline ">Категорія</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-200 line-clamp-1">{product.title}</span>
          </nav>

          <div className="header-flex">
            <button 
              onClick={() => navigate(-1)} 
              className="
                w-full sm:w-auto h-11 px-4
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-black !text-white font-semibold
                hover:bg-gray-800 active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-blue-600
                transition
              "
              aria-label="Назад"
            >
              ← Назад
            </button>
            <h1 className="header-title">
              {product.title}
            </h1>
          </div>

          {/* контент */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-12 flex flex-wrap items-center justify-center sm:justify-end gap-2 px-2 sm:px-0 mb-2">
              {isPopular && <Badge variant="popular" />}
              <Badge variant="green">В наявності</Badge>
            </div>
          {/* --- Галерея --- */}
            <section
              className="lg:col-span-7"
              role="region"
              aria-roledescription="carousel"
              aria-label="Галерея товару"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") prev();
                if (e.key === "ArrowRight") next();
              }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg min-w-0">
                <img
                  src={imgs[idx]}
                  alt={product.title}
                  className="w-full aspect-[16/9] object-contain select-none cursor-zoom-in bg-white"
                  onClick={openFull}
                  onPointerDown={(e) => (swipeStartX.current = e.clientX)}
                  onPointerUp={(e) => {
                    const dx = e.clientX - swipeStartX.current;
                    if (Math.abs(dx) > 36) (dx > 0 ? prev() : next());
                  }}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  sizes="(min-width:1024px) 720px, 100vw"
                  draggable={false}
                />

                {/* кнопки навігації */}
                {imgs.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Попереднє фото"
                      className="absolute left-3 bottom-2 h-12 w-12 flex items-center justify-center
                                rounded-full bg-black/60 shadow-lg ring-1 ring-black/30 hover:bg-black/70 hover:scale-105
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
                    >
                      <svg viewBox="0 0 18 18" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="12 4 6 9 12 14" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={next}
                      aria-label="Наступне фото"
                      className="absolute right-3 bottom-2 h-12 w-12 flex items-center justify-center
                                rounded-full bg-black/60 shadow-lg ring-1 ring-black/30 hover:bg-black/70 hover:scale-105
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
                    >
                      <svg viewBox="0 0 18 18" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 4 12 9 6 14" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* індикатори */}
              {imgs.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Слайди">
                  {imgs.map((_, i) => {
                    const selected = i === idx;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-label={`Слайд ${i + 1} з ${imgs.length}`}
                        onClick={() => setIdx(i)}
                        className={`h-2 w-2 rounded-full transition ${selected ? "bg-blue-600 ring-2 ring-blue-300 scale-110" : "bg-gray-400 hover:bg-gray-500"}`}
                      />
                    );
                  })}
                </div>
              )}
            </section>


            {/* сайдбар */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-20 space-y-4 min-w-0">
                <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
                  {/* Ціна */}
                  <div className="text-gray-600 text-sm md:text-base mb-1">Ціна</div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-2xl md:text-3xl font-extrabold text-red-600">
                        {formatUAH(finalPrice)}
                      </div>

                      {/* Стара ціна (якщо знижка) */}
                      {Number(product.oldPrice) > Number(product.price) && (
                        <>
                          <div className="text-lg text-gray-400 line-through tabular-nums">
                            {formatUAH(product.oldPrice)}
                          </div>
                          <span className="inline-flex items-center rounded-full
                                          bg-red-600 text-white shadow-md ring-2 ring-white
                                          px-2.5 py-0.5 text-xs font-extrabold tabular-nums">
                            −{Math.round((1 - product.price / product.oldPrice) * 100)}%
                          </span>
                        </>
                      )}

                      {addonsTotal > 0 && (
                        <div className="text-sm text-gray-500 w-full">
                          (товар {formatUAH(product.price)} + додатки {formatUAH(addonsTotal)})
                        </div>
                      )}
                    </div>

                  {/* Опис подарунка під ціною */}
                  {product.giftText && (
                    <div className="mt-3 sm:mt-4">
                      {/* чорний↔білий↔чорний бордер з “згинами” з обох боків */}
                      <div className="relative group rounded-2xl p-[2px] overflow-hidden
                                      bg-[linear-gradient(90deg,#0a0a0a,rgba(255,255,255,0.95),#0a0a0a)]">
                        {/* лівий згин */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -top-8 -left-10 h-28 w-28 rounded-full
                                    bg-[conic-gradient(at_70%_55%,white,rgba(255,255,255,0.25)_35%,transparent_70%)]
                                    mix-blend-screen opacity-80 blur-[2px]"
                        />
                        {/* правий згин */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -top-8 -right-10 h-28 w-28 rounded-full
                                    bg-[conic-gradient(at_30%_55%,white,rgba(255,255,255,0.25)_35%,transparent_70%)]
                                    mix-blend-screen opacity-80 blur-[2px]"
                        />

                        {/* внутрішній фон */}
                        <div className="relative rounded-2xl px-4 py-3 bg-gradient-to-br from-white via-white to-neutral-100 ring-1 ring-black/5 text-center">
                          {/* легке затемнення по діагоналі + шиммер при ховері */}
                          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_100%_0%,rgba(0,0,0,0.07),transparent_60%)]" />
                          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_100%,rgba(0,0,0,0.06),transparent_60%)]" />
                          <span aria-hidden className="pointer-events-none absolute -left-16 top-0 h-full w-12 rotate-12 bg-white/45 opacity-0 group-hover:opacity-100 group-hover:translate-x-[195%] transition-all duration-700 ease-out" />

                          {/* верхній ряд: червона пульсуюча крапка + 2 рядки тексту по центру */}
                          <div className="relative z-10 flex items-start justify-center gap-2">
                            {/* маленька пульсуюча червона крапка */}
                            <span className="relative mt-1.5 h-1.5 w-1.5 shrink-0">
                              <span className="absolute inset-0 rounded-full bg-red-500/60 animate-ping" />
                              <span className="relative block h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)] ring-1 ring-red-500/40" />
                            </span>

                            <div className="text-neutral-900">
                              <div className="text-[13px] sm:text-sm font-semibold leading-tight">
                                {product.giftText.line1
                                  ?? product.giftText.text?.split("|")[0]?.trim()
                                  ?? product.giftText.text}
                              </div>
                              <div className="mt-0.5 text-[12px] sm:text-[13px] text-neutral-700">
                                {product.giftText.line2
                                  ?? product.giftText.text?.split("|")[1]?.trim()
                                  ?? product.giftText.sub}
                              </div>
                            </div>
                          </div>

                          {/* нижній ряд: іконка + “У подарунок” по центру */}
                          {/* <div className="relative z-10 mt-2 flex justify-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10
                                            bg-gradient-to-br from-white to-neutral-100 px-2.5 py-1
                                            text-[11px] sm:text-xs font-semibold text-neutral-900 shadow">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                                <path fill="currentColor" d="M20 7h-2.6a3 3 0 1 0-5.4-2 3 3 0 1 0-5.4 2H4a1 1 0 0 0-1 1v3h9V8h2v3h9V8a1 1 0 0 0-1-1Zm-9-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM3 13v6a2 2 0 0 0 2 2h6v-8H3Zm10 0v8h6a2 2 0 0 0 2-2v-6h-8Z"/>
                                </svg>
                              У подарунок
                            </span>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Блок аддонів */}
                  {addons.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-900 mb-2">
                        Доповніть замовлення:
                      </div>
                      <div className="space-y-2">
                        {addons.map((addon) => {
                          const isChecked = selectedAddons.includes(addon.id);
                          return (
                            <label
                              key={addon.id}
                              htmlFor={`addon-${addon.id}`}
                              className={`flex items-center justify-between gap-3 rounded-xl border-2 p-3 cursor-pointer transition
                                ${isChecked
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  id={`addon-${addon.id}`}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAddon(addon.id)}
                                  className="h-5 w-5 rounded accent-blue-600 shrink-0"
                                />
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {addon.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                                +{formatUAH(addon.price)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* Кнопки */}
                  <div className="mt-4 grid grid-cols-1 gap-3 min-w-0">
                    <button
                      className="w-full h-12 md:h-14 rounded-xl bg-blue-600 !text-white font-semibold
                                text-base md:text-lg hover:bg-blue-700 active:scale-[0.99] transition
                                whitespace-nowrap"
                      onClick={() => {
                        const chosenAddons = addons.filter((a) => selectedAddons.includes(a.id));
                        setBuyProduct({ ...product, addons: chosenAddons });
                      }}
                      aria-label="Купити зараз"
                    >
                      Купити зараз
                    </button>

                    <button
                      className="
                        w-full h-12 md:h-14
                        inline-flex items-center justify-center gap-2
                        rounded-xl
                        bg-gradient-to-r from-gray-900 to-black
                        !text-white font-semibold text-base md:text-lg
                        shadow-md
                        hover:from-gray-800 hover:to-black/90
                        active:scale-[0.99]
                        transition whitespace-nowrap
                      "
                      onClick={() => {
                        const chosenAddons = addons.filter((a) => selectedAddons.includes(a.id));
                        const item = {
                          ...product,
                          giftText: product.giftText?.text || product.giftText || null,
                          addons: chosenAddons,
                        };
                        addToCart(item);
                        setFlashCart(true);
                        if (timerRef.current) clearTimeout(timerRef.current);
                        timerRef.current = setTimeout(() => setFlashCart(false), 2200);
                      }}
                      aria-label="Додати в кошик"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Додати в кошик
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          

          {/* фулскрін */}
          {openFS && (
          <div
            className="fixed inset-0 z-50 bg-white"
            style={{ touchAction: "none" }}
            onWheel={onWheelFS}
            onDoubleClick={onDoubleClickFS}
            onPointerDown={onFSPointerDown}
            onPointerMove={onFSPointerMove}
            onPointerUp={onFSPointerUp}
            onPointerCancel={onFSPointerUp}
          >
            {/* верхня панель */}
            <div
              className="absolute top-0 inset-x-0 p-6 flex items-center justify-between text-white bg-white/80 backdrop-blur-sm shadow text-center z-20 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label="Попереднє фото"
                  type="button"
                >
                  ‹
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label="Наступне фото"
                  type="button"
                >
                  ›
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const cx = window.innerWidth / 2;
                    const cy = window.innerHeight / 2;
                    zoomAt(Math.min(scale + 0.5, 5), cx, cy);
                  }}
                  className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white text-xl"
                  type="button"
                >
                  +
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    const cx = window.innerWidth / 2;
                    const cy = window.innerHeight / 2;
                    zoomAt(Math.max(scale - 0.5, 1), cx, cy);
                  }}
                  className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white text-xl"
                  type="button"
                >
                  −
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setScale(1);
                    setOffset({ x: 0, y: 0 });
                    setOpenFS(false);
                  }}
                  className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white text-xl"
                  type="button"
                  aria-label="Закрити перегляд"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* картинка */}
            <img
              src={imgs[idx]}
              alt={product.title}
              draggable={false}
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
              className="absolute top-1/2 left-1/2 select-none will-change-transform z-10"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                maxWidth: "80%",
                maxHeight: "80%",
                cursor: scale > 1 ? "grab" : "zoom-in",
              }}
            />

            {/* підпис */}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-center text-lg font-semibold py-3 z-20 pointer-events-none">
              {product.title}
            </div>
          </div>
)}



          {/* контентні блоки */}
          <div className="mt-10 md:mt-8 space-y-6 md:space-y-8">
            {product.description && (
              <section className="bg-white/90 border-zinc-900 border-4 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Опис</h2>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">{product.description}</p>
              </section>
            )}

            {features.length > 0 && (
              <section className="bg-white/90 border-zinc-100 border-4 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Переваги</h3>
                <ul className="space-y-2 text-sm md:text-base">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-[7px] h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-gray-800">{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!!Object.keys(specs).length && (
              <section className="bg-white/90 border-zinc-900 border-4 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Характеристики</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 md:gap-y-3 text-sm md:text-base">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-gray-500">{k}</dt>
                      <dd className="text-gray-900 font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {(inBox.length > 0 || warranty) && (
              <section className="bg-white/90 border-zinc-900 border-4 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm ">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Комплектація та гарантія</h3>
                {inBox.length > 0 && (
                  <ul className="list-disc pl-5 md:pl-6 text-gray-800 space-y-1 text-sm md:text-base">
                    {inBox.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                )}
                {warranty && <p className="mt-3 text-gray-700 text-sm md:text-base">{warranty}</p>}
              </section>
            )}
          </div>
        </>
      )}

      {/* Модалка "Купити зараз" */}
      {buyProduct && (
        <ModalBuy
          open
          product={buyProduct}
          onClose={() => setBuyProduct(null)}
        />
      )}
    </main>
  );
}