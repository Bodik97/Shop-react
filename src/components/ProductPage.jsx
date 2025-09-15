// src/components/ProductPage.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { products } from "../data/products";

/* формат ціни */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

/* бейдж */
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

  const product = useMemo(() => products.find((p) => String(p.id) === String(id)), [id]);

  const isPopular = !!(
    product?.popular ||
    product?.isPopular ||
    product?.badges?.includes?.("popular") ||
    product?.tags?.includes?.("popular") ||
    product?.meta?.popular
  );

  /* галерея */
  const imgs = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.imgs) && product.imgs.length) return product.imgs.filter(Boolean);
    return [product?.image].filter(Boolean);
  }, [product]);

  const [idx, setIdx] = useState(0);
  const clampIndex = useCallback((i) => (imgs.length ? (i + imgs.length) % imgs.length : 0), [imgs.length]);
  const prev = useCallback(() => setIdx((i) => clampIndex(i - 1)), [clampIndex]);
  const next = useCallback(() => setIdx((i) => clampIndex(i + 1)), [clampIndex]);

  /* фулскрін + зум */
  const [openFS, setOpenFS] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map()); // для пінча
  const swipeStartX = useRef(0);
  const pinchStart = useRef({ dist: 0, scale: 1 });

  const clampOffset = (x, y, s) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxX = (vw * (s - 1)) / 2;
    const maxY = (vh * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const zoomAt = (next, cx, cy) => {
    const ns = Math.max(1, Math.min(4, next));
    setOffset((o) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      // вектор від центру до курсора відносно поточного офсету
      const px = cx - vw / 2 - o.x;
      const py = cy - vh / 2 - o.y;
      const k = 1 - ns / scale; // scale — поточний
      const nx = o.x + px * k;
      const ny = o.y + py * k;
      return clampOffset(nx, ny, ns);
    });
    setScale(ns);
    if (ns === 1) setOffset({ x: 0, y: 0 });
  };

  const openFull = () => {
    setOpenFS(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // коліщатко — без preventDefault (у пасивних слухачах не можна)
  const onWheelFS = (e) => {
    const dir = Math.sign(e.deltaY);
    zoomAt(scale - dir * 0.25, e.clientX, e.clientY);
  };

  const onDoubleClickFS = (e) => zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);

  // клавіатура у фулскріні
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
  }, [openFS, prev, next, scale]);

  // toast
  const [flashCart, setFlashCart] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <p className="text-gray-700">Товар не знайдено.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50">← Назад</button>
      </main>
    );
  }

  /* керування перетягом */
  const startDrag = (clientX, clientY) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };
  const doDrag = (clientX, clientY) => {
    if (!dragging.current || scale === 1) return;
    const nx = clientX - dragStart.current.x;
    const ny = clientY - dragStart.current.y;
    setOffset(clampOffset(nx, ny, scale));
  };
  const endDrag = () => (dragging.current = false);

  /* свайп у міні-галереї */
  const onPointerDown = (e) => {
    swipeStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  };
  const onPointerUp = (e) => {
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const dx = x - swipeStartX.current;
    if (Math.abs(dx) > 36) (dx > 0 ? prev() : next());
  };

  /* пінч-зум у фулскріні (Pointer Events) */
  const onFSPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStart.current = { dist, scale };
    } else if (scale > 1) {
      startDrag(e.clientX, e.clientY);
    }
  };
  const onFSPointerMove = (e) => {
    const map = pointers.current;
    if (map.has(e.pointerId)) map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2) {
      const [a, b] = [...map.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const factor = dist / Math.max(1, pinchStart.current.dist || 1);
      const next = Math.max(1, Math.min(4, (pinchStart.current.scale || 1) * factor));
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      zoomAt(next, cx, cy);
    } else if (dragging.current) {
      doDrag(e.clientX, e.clientY);
    }
  };
  const onFSPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    endDrag();
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
    setFlashCart(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashCart(false), 2200);
  };

  const features = product.features || [];
  const specs = product.specs || {};
  const inBox = product.inBox || [];
  const warranty = product.warranty;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
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

      <nav className="text-xs sm:text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">Головна</Link>
        <span className="mx-1">/</span>
        <Link to={`/category/${product.category}`} className="hover:underline">Категорія</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 line-clamp-1">{product.title}</span>
      </nav>

      {/* заголовок */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <button onClick={() => navigate(-1)} className="w-full h-11 rounded-xl border hover:bg-gray-50 sm:w-auto sm:px-4">← Назад</button>
        <h1 className="text-center sm:text-left font-stencil uppercase font-extrabold tracking-[0.15em] text-gray-900 leading-snug drop-shadow-sm text-[clamp(16px,2.5vw,22px)] sm:text-[clamp(18px,2.2vw,26px)] md:text-[clamp(20px,2vw,28px)]">
          {product.title}
        </h1>
        <div className="flex gap-2 justify-center sm:justify-end">
          {isPopular && <Badge variant="popular" className="backdrop-blur-sm/0" />}
          <Badge variant="green">В наявності</Badge>
        </div>
      </div>

      {/* контент */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* галерея */}
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
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
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

            {/* БІЛІ СТРІЛКИ на темних кнопках */}
            {imgs.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Попереднє фото"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 flex items-center justify-center rounded-full bg-black/50 text-white shadow-xl ring-1 ring-black/30 hover:bg-black/60 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.5 4.5 8 12l7.5 7.5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Наступне фото"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 flex items-center justify-center rounded-full bg-black/50 text-white shadow-xl ring-1 ring-black/30 hover:bg-black/60 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition"
                >
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 4.5 16 12l-7.5 7.5" />
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
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm md:text-base">Ціна</span>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatUAH(product.price)}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <button className="w-full h-12 md:h-14 rounded-xl bg-blue-600 text-white font-semibold text-base md:text-lg hover:bg-blue-700 active:scale-[0.99] transition" onClick={() => onBuy?.(product)}>
                  Купити зараз
                </button>
                <button className="w-full h-12 md:h-14 rounded-xl border font-semibold text-base md:text-lg hover:bg-gray-50 active:scale-[0.99] transition" onClick={handleAddToCart}>
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

      {/* мобільна нижня панель */}
      {!openFS && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
            <div className="rounded-t-2xl border bg-white shadow-2xl p-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-700">{formatUAH(product.price)}</div>
                <div className="flex gap-2">
                  <button className="px-4 h-11 rounded-xl border font-semibold text-sm hover:bg-gray-50" onClick={handleAddToCart}>
                    В кошик
                  </button>
                  <button className="px-4 h-11 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700" onClick={() => onBuy?.(product)}>
                    Купити
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* фулскрін перегляд */}
      {openFS && (
        <div
          className="fixed inset-0 z-50 bg-black/95"
          style={{ touchAction: "none" }}
          onWheel={onWheelFS}
          onDoubleClick={onDoubleClickFS}
          onPointerDown={onFSPointerDown}
          onPointerMove={onFSPointerMove}
          onPointerUp={onFSPointerUp}
          onPointerCancel={onFSPointerUp}
        >
          {/* верхня панель */}
          <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="h-10 min-w-10 px-3 rounded bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Попереднє фото"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="h-10 min-w-10 px-3 rounded bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Наступне фото"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => zoomAt(1, innerWidth / 2, innerHeight / 2)}
                className="h-10 min-w-10 px-3 rounded bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Масштаб 1:1"
              >
                1:1
              </button>
              <button
                onClick={() => zoomAt(scale + 0.5, innerWidth / 2, innerHeight / 2)}
                className="h-10 min-w-10 px-3 rounded bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Збільшити"
              >
                +
              </button>
              <button
                onClick={() => zoomAt(scale - 0.5, innerWidth / 2, innerHeight / 2)}
                className="h-10 min-w-10 px-3 rounded bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Зменшити"
              >
                −
              </button>
              <button
                onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); setOpenFS(false); }}
                className="h-10 min-w-10 px-3 rounded bg-white/20 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>
          </div>

          {/* великі бокові кнопки з БІЛИМИ стрілками */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Попереднє фото"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-black/55 text-white shadow-xl ring-1 ring-black/40 hover:bg-black/70 hover:scale-105 transition"
              >
                <svg viewBox="0 0 24 24" className="h-9 w-9 mx-auto" aria-hidden="true">
                  <path d="M15.5 4.5 8 12l7.5 7.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Наступне фото"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-black/55 text-white shadow-xl ring-1 ring-black/40 hover:bg-black/70 hover:scale-105 transition"
              >
                <svg viewBox="0 0 24 24" className="h-9 w-9 mx-auto" aria-hidden="true">
                  <path d="M8.5 4.5 16 12l-7.5 7.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {/* зображення */}
          <img
            src={imgs[idx]}
            alt={product.title}
            draggable={false}
            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
            className="absolute top-1/2 left-1/2 select-none will-change-transform"
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
              maxWidth: "92%",
              maxHeight: "92%",
              cursor: scale > 1 ? "grab" : "zoom-in",
            }}
          />
        </div>
      )}

      {/* контентні блоки */}
      <div className="mt-6 md:mt-8 space-y-6 md:space-y-8">
        {product.description && (
          <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Опис</h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">{product.description}</p>
          </section>
        )}

        {Array.isArray(product.features) && product.features.length > 0 && (
          <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Переваги</h3>
            <ul className="space-y-2 text-sm md:text-base">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-gray-800">{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!Object.keys(product.specs || {}).length && (
          <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Характеристики</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 md:gap-y-3 text-sm md:text-base">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="text-gray-900 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(Array.isArray(product.inBox) && product.inBox.length > 0) || product.warranty ? (
          <section className="bg-white/90 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm mb-20">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Комплектація та гарантія</h3>
            {Array.isArray(product.inBox) && product.inBox.length > 0 && (
              <ul className="list-disc pl-5 md:pl-6 text-gray-800 space-y-1 text-sm md:text-base">
                {product.inBox.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            )}
            {product.warranty && <p className="mt-3 text-gray-700 text-sm md:text-base">{product.warranty}</p>}
          </section>
        ) : null}
      </div>
    </main>
  );
}
