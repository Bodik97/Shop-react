// src/components/ProductPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { products } from "../data/products";

/** Формат ціни */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

/** Маленький бейдж (без динамічних класів Tailwind) */
const Badge = ({ children, variant = "blue" }) => {
  const styles =
    variant === "green"
      ? "bg-green-50 text-green-700"
      : "bg-blue-50 text-blue-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {children}
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

  // галерея
  const imgs = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.imgs) && product.imgs.length) return product.imgs;
    return [product.image].filter(Boolean);
  }, [product]);
  const [idx, setIdx] = useState(0);

  // fullscreen перегляд
  const [openFS, setOpenFS] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  const openFull = () => {
    setOpenFS(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const wheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(4, Math.max(1, s + delta)));
  };

  const startDrag = (e) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onDrag = (e) => {
    if (!dragging.current || scale === 1) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const endDrag = () => (dragging.current = false);

  const onTouchStart = (e) => {
    if (scale === 1) return;
    const t = e.touches[0];
    dragging.current = true;
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragging.current || scale === 1) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };
  const onTouchEnd = () => (dragging.current = false);

  // гарячі клавіші у фулскріні
  useEffect(() => {
    if (!openFS) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setOpenFS(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFS, imgs.length]);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <p className="text-gray-700">Товар не знайдено.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50">
          ← Назад
        </button>
      </main>
    );
  }

  const features = product.features || [];
  const specs = product.specs || {};
  const inBox = product.inBox || [];
  const warranty = product.warranty;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
      {/* Хлібні крихти */}
      <nav className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
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
              className="w-full h-11 rounded-xl border hover:bg-gray-50"
            >
              ← Назад
            </button>
        <h1
            className="
              text-center sm:text-left
              font-stencil uppercase font-extrabold tracking-[0.15em]
              text-gray-900 leading-snug drop-shadow-sm
              text-[clamp(16px,2.5vw,22px)]   /* мобільні: ~16px, великі екрани: до 22px */
              sm:text-[clamp(18px,2.2vw,26px)]
              md:text-[clamp(20px,2vw,28px)]
            "
          >
            {product.title}
        </h1>

        <div className="flex gap-2 justify-center sm:justify-end">
          <Badge variant="green">В наявності</Badge>
          <Badge variant="blue">Хіт</Badge>
        </div>
      </div>

      {/* Головний контент */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Галерея */}
        <section className="lg:col-span-7">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={imgs[idx]}
              alt={product.title}
              className="
                w-full object-cover cursor-zoom-in select-none
                h-[320px] sm:h-[380px] md:h-[460px] lg:h-[520px]
              "
              onClick={openFull}
              loading="eager"
            />
            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Попереднє фото"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border shadow hover:bg-white"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Наступне фото"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border shadow hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {imgs.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth snap-x snap-mandatory">
              {imgs.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-24 sm:w-28 rounded-xl overflow-hidden border transition snap-start ${
                    i === idx ? "ring-2 ring-blue-600" : "hover:border-blue-300"
                  }`}
                  aria-label={`Мініатюра ${i + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Контентні блоки (адаптивні відступи/розміри) */}
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

            {Object.keys(specs).length > 0 && (
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
        </section>

        {/* Сайдбар з великими CTA */}
        <aside className="lg:col-span-5 mb-30">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm md:text-base">Ціна</span>
                <div className="text-2xl md:text-3xl font-extrabold text-blue-700">{formatUAH(product.price)}</div>
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
                  onClick={() => onAddToCart?.(product)}
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

      {/* Мобільна нижня панель CTA (не показуємо під час фулскріна) */}
      {!openFS && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
            <div className="rounded-t-2xl border bg-white shadow-2xl p-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-700">{formatUAH(product.price)}</div>
                <div className="flex gap-2">
                  <button
                    className="px-4 h-11 rounded-xl border font-semibold text-sm hover:bg-gray-50"
                    onClick={() => onAddToCart?.(product)}
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

      {/* Фулскрін перегляд зображення */}
      {openFS && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onWheel={wheelZoom}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button onClick={prev} className="px-3 py-1 bg-white/10 rounded">‹</button>
              <button onClick={next} className="px-3 py-1 bg-white/10 rounded">›</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
                className="px-3 py-1 bg-white/10 rounded"
              >
                1:1
              </button>
              <button onClick={() => setScale((s) => Math.min(4, s + 0.5))} className="px-3 py-1 bg-white/10 rounded">+</button>
              <button onClick={() => setScale((s) => Math.max(1, s - 0.5))} className="px-3 py-1 bg-white/10 rounded">−</button>
              <button onClick={() => setOpenFS(false)} className="px-3 py-1 bg-white/20 rounded">Закрити ✕</button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <img
              src={imgs[idx]}
              alt={product.title}
              draggable={false}
              onMouseDown={startDrag}
              onTouchStart={onTouchStart}
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
