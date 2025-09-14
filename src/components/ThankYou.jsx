// src/components/ThankYou.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Phone,
  Truck,
  Clock,
  Home,
  Copy,
  Headphones,
  User,
} from "lucide-react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ThankYou() {
  const { state } = useLocation();
  const [summary, setSummary] = useState(() => state || null);
  const [copied, setCopied] = useState(false);

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

  const copyId = async () => {
    if (!summary?.orderId) return;
    try {
      await navigator.clipboard.writeText(summary.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (!summary) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-3xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Замовлення не знайдено</h1>
          <p className="text-gray-600">Можливо, сторінку оновлено або очищено дані браузера.</p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 px-5 h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90"
          >
            <Home className="h-5 w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery } = summary;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-white shadow-lg">
        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-7 sm:p-9">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-10 w-10 shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Ваше замовлення прийнято!
              </h1>
              <p className="mt-2 text-white/90">
                Ми вже передали його нашому менеджеру — очікуйте дзвінок для підтвердження.
              </p>
            </div>
          </div>

          {/* Номер замовлення */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5">
            <span className="text-sm">Номер замовлення:</span>
            <strong className="font-mono tracking-wide">{orderId}</strong>
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-sm hover:bg-white/30"
              aria-label="Скопіювати номер"
              title="Скопіювати"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Скопійовано" : "Копіювати"}
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Коротко про замовлення */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-600">Сума</div>
              <div className="mt-1 text-2xl font-extrabold text-blue-700">{formatUAH(total)}</div>
              <div className="mt-2 text-sm text-gray-600">Товарів: {itemsCount}</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-600">Покупець</div>
              <div className="mt-1 inline-flex items-center gap-2 text-gray-900 font-semibold">
                <User className="h-4 w-4" /> {name}
              </div>
              <a href={`tel:${phone}`} className="mt-1 inline-flex items-center gap-2 text-gray-800 hover:underline">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>

          {/* Доставка */}
          {hasDelivery && (
            <div className="rounded-2xl border p-4">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" /> Доставка: Нова Пошта
              </div>
              <div className="mt-2 text-gray-900 space-y-1">
                {delivery.region && (
                  <div>
                    <span className="text-gray-500">Область:</span> {delivery.region}
                  </div>
                )}
                {delivery.city && (
                  <div>
                    <span className="text-gray-500">Місто:</span> {delivery.city}
                  </div>
                )}
                {delivery.branch && (
                  <div>
                    <span className="text-gray-500">Відділення:</span> {delivery.branch}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Що далі */}
          <section className="rounded-2xl border p-4 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Що буде далі</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-800">
              <li className="flex items-start gap-2">
                <Headphones className="h-4 w-4 mt-0.5 text-emerald-600" />
                Менеджер зателефонує для підтвердження позицій, способу доставки та оплати.
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-emerald-600" />
                Зазвичай дзвінок протягом 5–30 хв у робочий час.
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-0.5 text-emerald-600" />
                Після підтвердження ми упакуємо й передамо відправлення на Нову Пошту.
              </li>
            </ul>

            <p className="mt-3 text-xs text-gray-600">
              Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек чи договір.
              Остаточні деталі узгоджуються телефоном із менеджером.
            </p>
          </section>

          {/* Дії */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
            >
              ← Повернутись до покупок
            </Link>

            <div className="text-xs text-gray-500">
              Якщо ви закриєте цю сторінку, номер замовлення можна буде знайти в історії викликів.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
