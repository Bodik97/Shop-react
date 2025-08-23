// src/components/BuyModal.jsx
import { useEffect, useRef, useState } from "react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n) + " ₴";

export default function BuyModal({ open, product, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", comment: "" });
  const containerRef = useRef(null);
  const nameRef = useRef(null);

  // reset при відкритті + фокус на ім’я + lock scroll
  useEffect(() => {
    if (open) {
      setForm({ name: "", phone: "", address: "", comment: "" });
      const t = requestAnimationFrame(() => nameRef.current?.focus());
      document.documentElement.classList.add("overflow-hidden");
      return () => {
        cancelAnimationFrame(t);
        document.documentElement.classList.remove("overflow-hidden");
      };
    }
  }, [open]);

  // закриття по Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      return alert("Ім’я і телефон — обов’язково");
    }
    onSubmit?.({ ...form, productId: product?.id, productTitle: product?.title });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="buy-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm
                   animate-[fadeIn_.25s_ease-out]"
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-3xl border border-white/20
                   bg-white shadow-2xl ring-1 ring-black/5
                   animate-[zoomIn_.22s_ease-out]
                   overflow-hidden"
      >
        {/* Верхня панель */}
        <div className="flex items-start gap-4 p-5 sm:p-6">
          {/* Прев’ю товару */}
          {product?.image ? (
            <div className="hidden sm:block">
              <img
                src={product.image}
                alt={product?.title || "Товар"}
                className="h-20 w-20 rounded-2xl object-cover border"
              />
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            <h3 id="buy-modal-title" className="text-xl font-semibold tracking-tight text-gray-900">
              Купівля товару
            </h3>
            <p className="mt-1 text-sm text-gray-500 truncate">
              {product?.title ?? "—"}
            </p>
            {product?.price != null && (
              <p className="mt-1 text-base font-semibold text-blue-700">
                {formatUAH(product.price)}
              </p>
            )}
          </div>

          {/* Хрестик */}
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Закрити модалку"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={submit} className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="space-y-3.5">
            <label className="block">
              <span className="block text-sm text-black mb-1">Ім’я*</span>
              <input
                ref={nameRef}
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Ваше ім’я"
                className="w-full rounded-xl border text-gray-900 border-gray-200 bg-white px-3.5 py-2.5
                           outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
                           transition"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-black mb-1">Телефон*</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handle}
                placeholder="+38 (0ХХ) ХХХ-ХХ-ХХ"
                className="w-full rounded-xl border text-gray-900 border-gray-200 bg-white px-3.5 py-2.5
                           outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
                           transition"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-black mb-1">Адреса</span>
              <input
                name="address"
                value={form.address}
                onChange={handle}
                placeholder="Місто, відділення або адреса"
                className="w-full rounded-xl border text-gray-900 border-gray-200 bg-white px-3.5 py-2.5
                           outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
                           transition"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-gray-600 mb-1">Коментар</span>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handle}
                placeholder="Додаткові побажання"
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5
                           outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400
                           transition resize-none"
              />
            </label>
          </div>

          {/* Кнопки */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5
                         hover:bg-gray-50 active:bg-gray-100
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Відмінити
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 text-white px-4 py-2.5
                         hover:bg-blue-700 active:bg-blue-800
                         shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Підтвердити
            </button>
          </div>
        </form>
      </div>

      {/* Мікро-анімації */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes zoomIn { from { opacity: 0; transform: translateY(8px) scale(0.98) }
                            to   { opacity: 1; transform: translateY(0)   scale(1) } }
      `}</style>
    </div>
  );
}
