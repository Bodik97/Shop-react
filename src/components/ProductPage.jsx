// src/components/ProductPage.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { products } from "../data/products";

/** Формат ціни */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

/** Бейджі */
const Badge = ({ children, variant = "blue", className = "" }) => {
  const styles =
    variant === "green"
      ? "bg-green-50 text-green-700"
      : variant === "popular"
      ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-sm"
      : "bg-blue-50 text-blue-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}
    >
      {variant === "popular" ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.5 2s1 2 .5 3.5S11 7 11 9s1.5 3 3 3 3-1 3-3 2-3.5 2-3.5S21 9 21 12.5 17.9 21 12 21 3 16.6 3 12.5 5.5 7 9 6c0 0-.5 1.5 0 2.5S11 10 11 8.5 12 2 13.5 2Z"
            />
          </svg>
          Популярний
        </>
      ) : (
        children
      )}
    </span>
  );
};

export default function ProductPage({ onAddToCart, onBuy }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = useMemo(
    () => products.find((p) => String(p.id) === String(id)),
    [id]
  );

  const isPopular = !!(
    product?.popular ||
    product?.isPopular ||
    product?.badges?.includes?.("popular") ||
    product?.tags?.includes?.("popular") ||
    product?.meta?.popular
  );

  // Галерея
  const imgs = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.imgs) && product.imgs.length) return product.imgs.filter(Boolean);
    return [product?.image].filter(Boolean);
  }, [product]);

  const [idx, setIdx] = useState(0);

  const clampIndex = useCallback(
    (i) => (imgs.length ? (i + imgs.length) % imgs.length : 0),
    [imgs.length]
  );
  const prev = useCallback(() => setIdx((i) => clampIndex(i - 1)), [clampIndex]);
  const next = useCallback(() => setIdx((i) => clampIndex(i + 1)), [clampIndex]);

  // Фулскрін
  const [openFS, setOpenFS] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const openFull = () => {
    setOpenFS(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const wheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale((s) => Math.min(4, Math.max(1, +(s + delta).toFixed(2))));
  };

  const startDrag = (clientX, clientY) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };
  const doDrag = (clientX, clientY) => {
    if (!dragging.current || scale === 1) return;
    setOffset({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };
  const endDrag = () => (dragging.current = false);

  // Гарячі клавіші лише у фулскріні
  useEffect(() => {
    if (!openFS) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setOpenFS(false);
      if (e.key === "+") setScale((s) => Math.min(4, s + 0.5));
      if (e.key === "-") setScale((s) => Math.max(1, s - 0.5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFS, prev, next]);

  // Toast
  const [flashCart, setFlashCart] = useState(false);
  const timerRef = useRef(null);
  const handleAddToCart = () => {
    onAddToCart?.(product);
    setFlashCart(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashCart(false), 2200);
  };
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <p className="text-gray-700">Товар не знайдено.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Назад
        </button>
      </main>
    );
  }

  const features = product.features || [];
  const specs = product.specs || {};
  const inBox = product.inBox || [];
  const warranty = product.warranty;

  // Swipe по основному зображенню
  const swipeStartX = useRef(0);
  const onPointerDown = (e) => {
    swipeStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  };
  const onPointerUp = (e) => {
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const dx = x - swipeStartX.current;
    if (Math.abs(dx) > 36) (dx > 0 ? prev() : next());
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
      {/* Toast */}
      {flashCart && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] select-none animate-slideUpFade"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold px-3 py-1.5 shadow-lg ring-1 ring-emerald-700/30">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
              />
            </svg>
            Додано в кошик
          </span>
        </div>
      )}

      <nav className="text-xs sm:text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <Link to={`/category/${product.category}`} className="hover:underline">Категорія</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 line-clamp-1">{product.title}</span>
      </nav>

      {/* Заголовок + бейджі */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-11 rounded-xl border hover:bg-gray-50 sm:w-auto sm:px-4"
        >
          ← Назад
        </button>

        <h1
          className="text-center sm:text-left font-stencil uppercase font-extrabold tracking-[0.15em] text-gray-900 leading-snug drop-shadow-sm text-[clamp(16px,2.5vw,22px)] sm:text-[clamp(18px,2.2vw,26px)] md:text-[clamp(20px,2vw,28px)]"
        >
          {product.title}
        </h1>

        <div className="flex gap-2 justify-center sm:justify-end">
          {isPopular && <Badge variant="popular" className="backdrop-blur-sm/0" />}
          <Badge variant="green">В наявності</Badge>
        </div>
      </div>

      {/* Контент */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Галерея */}
        <section
          className="lg:col-span-7"
          role="region"
          aria-roledescription="carousel"
          aria-label="Галерея товару"
          aria-live="polite"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
          }}
          tabIndex={0}
        >
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
            <img
              src={imgs[idx]}
              alt={product.title}
              className="w-full aspect-[16/9] object-contain select-none cursor-zoom-in bg-white"
              onClick={openFull}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchEnd={onPointerUp}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              sizes="(min-width:1024px) 720px, 100vw"
              draggable={false}
            />

            {imgs.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-between px-3">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Попереднє фото"
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-white text-black shadow ring-1 ring-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
                    <path
                      d="M15.5 4.5 8 12l7.5 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Наступне фото"
                  className="h-11 w-11 flex items-center justify-center rounded-full bg-white text-black shadow ring-1 ring-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
                    <path
                      d="M8.5 4.5 16 12l-7.5 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Індикатори */}
          {imgs.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Слайди">
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
                    className={`h-2.5 w-2.5 rounded-full transition-transform ${
                      selected ? "bg-blue-600 scale-110" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                );
              })}
            </div>
          )}

          {/* Контентні блоки */}
          <div className="mt-6 md:mt-8 space-y-6 md:space-y-8">
            {product.description && (
              <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Опис</h2>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </section>
            )}

            {features.length > 0 && (
              <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
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
              <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
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
              <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
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

          <style>{`
            @media (prefers-reduced-motion: reduce) {
              [aria-roledescription="carousel"] * {
                transition: none !important;
                animation: none !important;
              }
            }
          `}</style>
        </section>

        {/* Сайдбар */}
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm md:text-base">Ціна</span>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
                  {formatUAH(product.price)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  className="w-full h-12 md:h-14 rounded-xl bg-blue-600 text-white font-semibold text-base md:text-lg hover:bg-blue-700 active:scale-[0.99] transition"
                  onClick={() => onBuy?.(product)}
                >
                  Купити зараз
                </button>
                <button
                  className="w-full h-12 md:h-14 rounded-xl border font-semibold text-base md:text-lg hover:bg-gray-50 active:scale-[0.99] transition"
                  onClick={handleAddToCart}
                >
                  Додати в кошик
                </button>
              </div>

              <div className="mt-4 text-xs md:text-sm text-gray-600 space-y-1">
                <div>🚚 Доставка: 1–3 дні по Україні</div>
                <div>🛡️ Повернення/обмін: 14 днів</div>
                <div>💬 Підтримка: 09:00–21:00</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Мобільна нижня панель */}
      {!openFS && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
            <div className="rounded-t-2xl border bg-white shadow-2xl p-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-700">{formatUAH(product.price)}</div>
                <div className="flex gap-2">
                  <button
                    className="px-4 h-11 rounded-xl border font-semibold text-sm hover:bg-gray-50"
                    onClick={handleAddToCart}
                  >
                    В кошик
                  </button>
                  <button
                    className="px-4 h-11 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
                    onClick={() => onBuy?.(product)}
                  >
                    Купити
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фулскрін */}
      {openFS && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onWheel={wheelZoom}
          onMouseMove={(e) => doDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchMove={(e) => doDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={endDrag}
        >
          <div className="p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="px-3 py-1 bg-white/10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="px-3 py-1 bg-white/10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setScale(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="px-3 py-1 bg-white/10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                1:1
              </button>
              <button
                onClick={() => setScale((s) => Math.min(4, s + 0.5))}
                className="px-3 py-1 bg-white/10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                +
              </button>
              <button
                onClick={() => setScale((s) => Math.max(1, s - 0.5))}
                className="px-3 py-1 bg-white/10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                −
              </button>
              <button
                onClick={() => setOpenFS(false)}
                className="px-3 py-1 bg-white/20 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Закрити ✕
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <img
              src={imgs[idx]}
              alt={product.title}
              draggable={false}
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
              className="absolute top-1/2 left-1/2 select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                maxWidth: "92%",
                maxHeight: "92%",
                cursor: scale > 1 ? "grab" : "zoom-out",
              }}
              onClick={() => scale === 1 && setOpenFS(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
