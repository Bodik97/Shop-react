// src/components/ModalBuy.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/** Формат ціни (грн) */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ModalBuy({ open, product, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // +380XXXXXXXXX
  const [qty, setQty] = useState(1);
  const [delivery, setDelivery] = useState("nova");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [comment, setComment] = useState("");
  const [agree, setAgree] = useState(true);

  const dialogRef = useRef(null);
  const firstFocusRef = useRef(null);

  const price = Number(product?.price || 0);
  const total = useMemo(() => price * Math.max(1, Number(qty) || 1), [price, qty]);

  // Скидання при відкритті / зміні товару
  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("");
    setQty(1);
    setDelivery("nova");
    setCity("");
    setBranch("");
    setComment("");
    setAgree(true);
  }, [open, product?.id]);

  // Заборона скролу фону та автофокус
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add("overflow-hidden", "overscroll-none");
      const t = setTimeout(() => firstFocusRef.current?.focus(), 0);
      return () => {
        clearTimeout(t);
        root.classList.remove("overflow-hidden", "overscroll-none");
      };
    }
  }, [open]);

  // Esc для закриття
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Простенька валідація
  const errors = {};
  if (!name.trim()) errors.name = "Вкажіть ім'я";
  if (!/^\+380\d{9}$/.test(phone)) errors.phone = "Телефон у форматі +380XXXXXXXXX";
  if (!city.trim()) errors.city = "Вкажіть місто";
  if (!branch.trim()) errors.branch = "Вкажіть відділення/адресу";
  if (!agree) errors.agree = "Потрібна згода на обробку даних";

  const submit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    const payload = {
      product: { id: product?.id, title: product?.title, price },
      qty: Math.max(1, Number(qty) || 1),
      total,
      customer: { name, phone },
      delivery: { method: delivery, city, branch },
      comment: comment?.trim(),
      createdAt: new Date().toISOString(),
    };
    onSubmit?.(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />

      {/* Контейнер модалки: максимально мобільний-friendly bottom-sheet */}
      <div
        ref={dialogRef}
        className="
          relative w-full max-w-full sm:w-[640px]
          bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border
          p-4 sm:p-6
          max-h-[90vh] overflow-auto
          pb-[calc(env(safe-area-inset-bottom)+1rem)]
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="buy-title"
              className="text-lg sm:text-xl font-bold text-gray-900 leading-snug"
            >
              Швидка покупка
            </h2>
            {product && (
              <p className="mt-0.5 text-gray-500 text-sm line-clamp-2">
                {product.title}
              </p>
            )}
          </div>

          <button
            ref={firstFocusRef}
            type="button"
            aria-label="Закрити"
            onClick={() => onClose?.()}
            className="h-10 w-10 grid place-items-center rounded-xl border hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {/* Товар (мобільне вертикальне розміщення) */}
        {product && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={product.image}
                alt={product.title}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg object-cover border"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                  {product.title}
                </div>
                <div className="mt-1 text-blue-700 font-bold text-base sm:text-lg">
                  {formatUAH(price)}
                </div>
              </div>
            </div>

            {/* Qty — стає під картинкою на вузьких екранах */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                aria-label="Зменшити кількість"
                onClick={() => setQty((q) => Math.max(1, Number(q || 1) - 1))}
                className="h-10 w-10 rounded-xl border hover:bg-gray-50"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-14 h-10 rounded-xl border text-center text-base"
              />
              <button
                type="button"
                aria-label="Збільшити кількість"
                onClick={() => setQty((q) => Math.min(99, Number(q || 1) + 1))}
                className="h-10 w-10 rounded-xl border hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={submit} className="mt-5 space-y-4">
          {/* Поля 1 ряду — на мобілці по одному, на великих поруч */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ім’я</label>
              <input
                type="text"
                placeholder="Ваше ім’я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Телефон</label>
              <input
                type="tel"
                placeholder="+380XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
                className={`w-full rounded-xl border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? "border-red-400" : "border-gray-300"
                }`}
              />
              <p
                className={`mt-1 text-xs ${
                  errors.phone ? "text-red-600" : "text-gray-500"
                }`}
              >
                Формат: +380XXXXXXXXX
              </p>
            </div>
          </div>

          {/* Доставка — блоки по вертикалі на мобілці */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Доставка</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value="nova"
                  checked={delivery === "nova"}
                  onChange={() => setDelivery("nova")}
                />
                Нова Пошта
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value="ukr"
                  checked={delivery === "ukr"}
                  onChange={() => setDelivery("ukr")}
                />
                Укрпошта
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value="courier"
                  checked={delivery === "courier"}
                  onChange={() => setDelivery("courier")}
                />
                Кур’єр
              </label>
            </div>
          </div>

          {/* Адреса */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Місто</label>
              <input
                type="text"
                placeholder="Київ"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Відділення/адреса
              </label>
              <input
                type="text"
                placeholder="Відділення №1"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.branch ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.branch && (
                <p className="mt-1 text-xs text-red-600">{errors.branch}</p>
              )}
            </div>
          </div>

          {/* Коментар */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Коментар (необов’язково)
            </label>
            <textarea
              rows={3}
              placeholder="Побажання до замовлення…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Згода */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span className={errors.agree ? "text-red-600" : "text-gray-600"}>
              Погоджуюсь на обробку персональних даних та умови повернення.
            </span>
          </label>

          {/* Підсумок для мобілки — кнопки 100% ширини */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-gray-700">
              <span>Разом:</span>
              <span className="text-xl font-extrabold text-blue-700">
                {formatUAH(total)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onClose?.()}
                className="h-12 w-full rounded-xl border font-semibold hover:bg-gray-50 active:scale-[0.99] transition"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="h-12 w-full rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.99] transition"
              >
                Оформити
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
