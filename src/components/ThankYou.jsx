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
      <main className="mx-auto max-w-screen-sm px-4 sm:px-6 py-8 sm:py-10">
        <div className="rounded-3xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 p-6 sm:p-8 text-center shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Замовлення не знайдено</h1>
          <p className="text-gray-600 dark:text-gray-300">Можливо, сторінку оновлено або очищено дані браузера.</p>
          <Link
            to="/"
            className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90"
          >
            <Home className="h-5 w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery } = summary;

  return (
    <main
      className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="relative overflow-hidden rounded-3xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm md:shadow-lg">
        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-5 sm:p-7 md:p-9">
          <div className="flex items-start gap-3 sm:gap-4">
            <CheckCircle2 className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" />
            <div className="text-balance">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                Ваше замовлення прийнято!
              </h1>
              <p className="mt-2 text-white/90 text-sm sm:text-base">
                Ми вже передали його нашому менеджеру. Очікуйте дзвінок для підтвердження.
              </p>
            </div>
          </div>

          {/* Номер замовлення */}
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5">
            <span className="text-xs sm:text-sm">Номер замовлення:</span>
            <strong className="font-mono tracking-wide break-all">{orderId}</strong>
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs sm:text-sm hover:bg-white/30"
              aria-label="Скопіювати номер"
              title="Скопіювати"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Скопійовано" : "Копіювати"}
            </button>
            <span aria-live="polite" className="sr-only">
              {copied ? "Номер замовлення скопійовано" : ""}
            </span>
          </div>
        </div>

        {/* Контент */}
        <div className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
          {/* Коротко про замовлення */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border dark:border-neutral-800 p-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Сума</div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400">
                {formatUAH(total)}
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Товарів: {itemsCount}</div>
            </div>

            <div className="rounded-2xl border dark:border-neutral-800 p-4">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Покупець</div>
              <div className="mt-1 inline-flex items-center gap-2 text-gray-900 dark:text-white font-semibold break-words">
                <User className="h-4 w-4" /> {name || "—"}
              </div>
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="mt-1 inline-flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:underline break-all"
                >
                  <Phone className="h-4 w-4" /> {phone}
                </a>
              )}
            </div>
          </div>

          {/* Доставка */}
          {hasDelivery && (
            <div className="rounded-2xl border dark:border-neutral-800 p-4">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <Truck className="h-4 w-4" /> Доставка: Нова Пошта
              </div>
              <div className="mt-2 text-gray-900 dark:text-white space-y-1 text-sm sm:text-base">
                {delivery.region && (
                  <div className="break-words">
                    <span className="text-gray-500 dark:text-gray-400">Область:</span> {delivery.region}
                  </div>
                )}
                {delivery.city && (
                  <div className="break-words">
                    <span className="text-gray-500 dark:text-gray-400">Місто:</span> {delivery.city}
                  </div>
                )}
                {delivery.branch && (
                  <div className="break-words">
                    <span className="text-gray-500 dark:text-gray-400">Відділення:</span> {delivery.branch}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Що далі */}
          <section className="rounded-2xl border dark:border-neutral-800 p-4 bg-gray-50 dark:bg-neutral-800/40">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">Що буде далі</h2>
            <ul className="mt-2 space-y-2 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
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
                Після підтвердження замовлення ми передамо відправлення на Нову Пошту.
              </li>
            </ul>

            <p className="mt-3 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
              Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек чи договір. Остаточні деталі узгоджуються телефоном.
            </p>
          </section>

          {/* Дії */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-5 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition w-full sm:w-auto"
            >
              ← Повернутись до покупок
            </Link>

            <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              Якщо закриєте сторінку, номер замовлення знайдете в історії викликів.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
