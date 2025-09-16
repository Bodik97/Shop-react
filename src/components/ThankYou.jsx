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
    () =>
      !!summary?.delivery &&
      (summary.delivery.region || summary.delivery.city || summary.delivery.branch),
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
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Замовлення не знайдено
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Можливо, сторінку оновлено або очищено дані браузера.
          </p>
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
      {/* Градієнтна рамка з легким сяйвом */}
      <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,.35)]">
        <div className="relative overflow-hidden rounded-[26px] border bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-md">

          {/* Декоративні “іскорки” */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(60% 60% at 50% 50%, #34d399 0%, rgba(52,211,153,0) 60%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(60% 60% at 50% 50%, #22d3ee 0%, rgba(34,211,238,0) 60%)" }}
          />

          {/* Hero */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-5 sm:p-7 md:p-9">
            {/* маленькі конфеті-крапки */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                {Array.from({ length: 26 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={(i * 37) % 400}
                    cy={(i * 71) % 200}
                    r={(i % 3) + 1}
                    fill="white"
                  />
                ))}
              </svg>
            </div>

            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 rounded-full bg-white/15 p-1.5">
                <div className="relative grid place-items-center h-10 w-10 rounded-full bg-white/20">
                  <span className="absolute inset-0 rounded-full animate-ping bg-white/20" />
                  <CheckCircle2 className="relative h-6 w-6" />
                </div>
              </div>

              <div className="text-balance">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow">
                  Ваше замовлення прийнято!
                </h1>
                <p className="mt-2 text-white/95 text-sm sm:text-base">
                  Дякуємо за замовлення — ми вже працюємо над ним. Зазвичай телефонуємо протягом{" "}
                  <strong>5–30&nbsp;хв</strong> у робочий час. Якщо не додзвонимося — обов’язково
                  передзвонимо ще.
                </p>
              </div>
            </div>

            {/* Номер замовлення */}
            <div className="relative z-[1] mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
              <span className="text-xs sm:text-sm">Номер замовлення:</span>
              <strong className="font-mono tracking-wide break-all">{orderId}</strong>
              <button
                onClick={copyId}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs sm:text-sm transition
                ${copied ? "bg-emerald-400 text-black" : "bg-white/20 hover:bg-white/30"}`}
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
          <div className="p-5 sm:p-7 md:p-8 space-y-6 sm:space-y-7">

            {/* Карточки суми/покупця */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border dark:border-neutral-800 p-4 bg-white/70 dark:bg-white/5 backdrop-blur">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Сума</div>
                <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-cyan-300">
                  {formatUAH(total)}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Товарів: {itemsCount}
                </div>
              </div>

              <div className="rounded-2xl border dark:border-neutral-800 p-4 bg-white/70 dark:bg-white/5 backdrop-blur">
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
              <div className="rounded-2xl border dark:border-neutral-800 p-4 bg-white/70 dark:bg-white/5 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <Truck className="h-4 w-4" /> Доставка: Нова Пошта
                </div>
                <div className="mt-2 text-gray-900 dark:text-white space-y-1 text-sm sm:text-base">
                  {delivery.region && (
                    <div className="break-words">
                      <span className="text-gray-500 dark:text-gray-400">Область:</span>{" "}
                      {delivery.region}
                    </div>
                  )}
                  {delivery.city && (
                    <div className="break-words">
                      <span className="text-gray-500 dark:text-gray-400">Місто:</span>{" "}
                      {delivery.city}
                    </div>
                  )}
                  {delivery.branch && (
                    <div className="break-words">
                      <span className="text-gray-500 dark:text-gray-400">Відділення:</span>{" "}
                      {delivery.branch}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Таймлайн наступних кроків */}
            <section className="rounded-2xl border dark:border-neutral-800 p-4 bg-gray-50/80 dark:bg-neutral-800/40">
              <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                Що буде далі
              </h2>

              <ol className="mt-3 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Менеджер вже на лінії.</span> Ми телефонуємо протягом{" "}
                    <strong>5–30 хв</strong> у робочий час, щоб підтвердити замовлення.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    Якщо раптом не додзвонились — спробуємо ще раз. Ви нічого не пропустите.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    Після підтвердження передамо відправлення на Нову Пошту та надішлемо ТТН у SMS.
                  </div>
                </li>
              </ol>

              <p className="mt-3 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
                Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек чи
                договір. Остаточні деталі узгоджуються телефоном.
              </p>
            </section>

            {/* Блок турботи/контакти */}
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/70 dark:bg-white/5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-100">
                  <div className="font-semibold">Ми на зв’язку щодня, 09:00–21:00</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Якщо зручно — подзвоніть нам, і ми пришвидшимо підтвердження.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`tel:${phone || ""}`}
                  className="inline-flex items-center justify-center h-11 px-4 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] transition"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Подзвонити нам
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center h-11 px-4 rounded-2xl border font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-[0.99] transition"
                >
                  ← Повернутись до покупок
                </Link>
              </div>
            </div>

            {/* Маленька нотатка нижче */}
            <div className="text-center text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              Якщо будете не на зв’язку — не хвилюйтесь, ми обов’язково спробуємо ще раз ✨
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
