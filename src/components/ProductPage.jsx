// src/components/ProductPage.jsx
import { useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { products } from "../data/products";

export default function ProductPage({ onAddToCart, onBuy }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(
    () => products.find(p => String(p.id) === String(id)),
    [id]
  );

  const imgs = product?.images?.length ? product.images : [product?.image].filter(Boolean);
  const [idx, setIdx] = useState(0);

  // Fullscreen viewer
  const [openFS, setOpenFS] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({x:0, y:0});
  const dragRef = useRef(null);
  const dragStart = useRef(null);

  const prev = () => setIdx(i => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx(i => (i + 1) % imgs.length);

  const openFull = () => { setOpenFS(true); setScale(1); setOffset({x:0,y:0}); };
  const wheelZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(s => Math.min(4, Math.max(1, s + delta)));
  };
  const startDrag = (e) => {
    if (scale === 1) return;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    dragRef.current = true;
  };
  const onDrag = (e) => {
    if (!dragRef.current || scale === 1) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const endDrag = () => (dragRef.current = false);

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <p>Товар не знайдено.</p>
        <button onClick={() => navigate(-1)} className="mt-3 px-3 py-2 border rounded">← Назад</button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded mb-4">← Назад</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Галерея */}
        <section>
          <div className="relative">
            <img
              src={imgs[idx]}
              alt={product.title}
              className="w-full h-[360px] md:h-[460px] object-cover rounded-xl cursor-zoom-in"
              onClick={openFull}
            />
            {imgs.length > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow">‹</button>
                <button onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 border shadow">›</button>
              </>
            )}
          </div>

          {imgs.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-16 w-20 rounded-lg overflow-hidden border ${i===idx ? "ring-2 ring-blue-500" : ""}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Інфо */}
        <section>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="mt-2 text-2xl text-blue-600 font-semibold">{product.price} ₴</div>
          <p className="mt-4 text-gray-700 whitespace-pre-line">
            {product.description ?? "Опис буде додано."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => onBuy?.(product)}
            >
              Купити
            </button>
            <button
              className="px-4 py-2 border rounded"
              onClick={() => onAddToCart?.(product)}
            >
              В кошик
            </button>
          </div>
        </section>
      </div>

      {/* Fullscreen viewer with zoom/pan */}
      {openFS && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onWheel={wheelZoom}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          <div className="p-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button onClick={prev} className="px-3 py-1 bg-white/10 rounded">‹</button>
              <button onClick={next} className="px-3 py-1 bg-white/10 rounded">›</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setScale(1) || setOffset({x:0,y:0})} className="px-3 py-1 bg-white/10 rounded">1:1</button>
              <button onClick={() => setScale(s=>Math.min(4,s+0.5))} className="px-3 py-1 bg-white/10 rounded">+</button>
              <button onClick={() => setScale(s=>Math.max(1,s-0.5))} className="px-3 py-1 bg-white/10 rounded">−</button>
              <button onClick={() => setOpenFS(false)} className="px-3 py-1 bg-white/20 rounded">Закрити ✕</button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <img
              src={imgs[idx]}
              alt=""
              draggable={false}
              onMouseDown={startDrag}
              className="absolute top-1/2 left-1/2 select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                maxWidth: "90%",
                maxHeight: "90%",
                cursor: scale > 1 ? "grab" : "default",
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
