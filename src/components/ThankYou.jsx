import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Phone, Truck, Home } from "lucide-react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ThankYou() {
  const { state } = useLocation();
  const [summary, setSummary] = useState(() => state || null);

  useEffect(() => {
    if (!summary) {
      try {
        const saved = localStorage.getItem("lastOrderSummary");
        if (saved) setSummary(JSON.parse(saved));
      } catch {}
    }
  }, [summary]);

  const hasDelivery = useMemo(
    () => !!summary?.delivery && (summary.delivery.region || summary.delivery.city || summary.delivery.branch),
    [summary]
  );

  if (!summary) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 text-center">
          <p className="text-lg">Дані замовлення не знайдені.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-black text-white">
            <Home className="h-5 w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery } = summary;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-white shadow">
        {/* верхній блок */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-2xl sm:text-3xl font-extrabold">Дякуємо за замовлення!</h1>
          </div>
          <p className="mt-2 text-white/90">
            Номер замовлення <span className="font-semibold bg-white/15 px-2 py-0.5 rounded">{orderId}</span>
          </p>
        </div>

        {/* контент */}
        <div className="p-6 sm:p-8 grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-600">Сума до сплати</div>
              <div className="mt-1 text-2xl font-extrabold text-blue-700">{formatUAH(total)}</div>
              <div className="mt-2 text-sm text-gray-600">Товарів: {itemsCount}</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-600">Контакти</div>
              <div className="mt-1 font-semibold text-gray-900">{name}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-gray-800">
                <Phone className="h-4 w-4" />
                <a className="hover:underline" href={`tel:${phone}`}>{phone}</a>
              </div>
            </div>
          </div>

          {hasDelivery && (
            <div className="rounded-2xl border p-4">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" /> Доставка (Нова Пошта)
              </div>
              <div className="mt-2 text-gray-900 space-y-1">
                {delivery.region && <div><span className="text-gray-500">Область:</span> {delivery.region}</div>}
                {delivery.city && <div><span className="text-gray-500">Місто:</span> {delivery.city}</div>}
                {delivery.branch && <div><span className="text-gray-500">Відділення:</span> {delivery.branch}</div>}
              </div>
            </div>
          )}

          <div className="rounded-2xl border p-4 bg-gray-50">
            <p className="text-gray-800">
              Наш менеджер зв’яжеться з вами найближчим часом для підтвердження деталей замовлення. Зазвичай це займає
              від 5 до 30 хв у робочий час.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            >
              ← Повернутись до покупок
            </Link>

            <div className="text-xs text-gray-500">
              Збережено в профілі браузера як <span className="font-mono">lastOrderSummary</span>.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
