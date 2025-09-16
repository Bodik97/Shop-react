// src/components/ThankYou.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Phone, Truck, Clock, Home, Copy, User } from "lucide-react";

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
      <main className="mx-auto max-w-screen-sm px-4 sm:px-6 py-10">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Замовлення не знайдено</h1>
          <p className="text-gray-600">Можливо, сторінку оновлено або очищено дані браузера.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90"
          >
            <Home className="h-5 w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery } = summary;

  return (
    <main className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 py-8 md:py-10">
      {/* Обгортка з градієнтною рамкою */}
      <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,.35)]">
        <div className="relative overflow-hidden rounded-[26px] border bg-white shadow-md">
          {/* HERO — тільки зверху, завжди кольоровий, по центру */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-10 text-center">
            <div className="mx-auto max-w-2xl flex flex-col items-center">
              <div className="mb-3 grid place-items-center h-14 w-14 rounded-full bg-white/20">
                <span className="absolute h-14 w-14 rounded-full animate-ping bg-white/10" />
                <CheckCircle2 className="relative h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Ваше замовлення прийнято!
              </h1>
              <p className="mt-2 text-white/95">
                Дякуємо! Зазвичай телефонуємо протягом <strong>5–30 хв</strong> у робочий час.
                Якщо не додзвонимось — обов’язково передзвонимо ще.
              </p>

              {/* Номер замовлення */}
              <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 ring-1 ring-white/25 backdrop-blur">
                <span className="text-sm">Номер:</span>
                <strong className="font-mono tracking-wide break-all">{orderId}</strong>
                <button
                  onClick={copyId}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition
                    ${copied ? "bg-emerald-400 text-black" : "bg-white/20 hover:bg-white/30"}`}
                  aria-label="Скопіювати номер"
                  title="Скопіювати"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Скопійовано" : "Копіювати"}
                </button>
              </div>
            </div>
          </div>

          {/* ДАЛІ — лише БІЛИЙ фон і темний текст, усе по центру */}
          <div className="px-6 py-8 bg-white text-gray-900">
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              {/* Сума / Покупець */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-5 bg-white">
                  <div className="text-sm text-gray-600">Сума</div>
                  <div className="mt-1 text-3xl font-extrabold text-blue-700">
                    {formatUAH(total)}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Товарів: {itemsCount}</div>
                </div>

                <div className="rounded-2xl border p-5 bg-white">
                  <div className="text-sm text-gray-600">Покупець</div>
                  <div className="mt-1 inline-flex items-center justify-center gap-2 font-semibold">
                    <User className="h-4 w-4" /> {name || "—"}
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="mt-1 inline-flex items-center justify-center gap-2 text-gray-800 hover:underline break-all"
                    >
                      <Phone className="h-4 w-4" /> {phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Доставка */}
              {hasDelivery && (
                <div className="rounded-2xl border p-5 bg-white">
                  <div className="inline-flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" /> Доставка: Нова Пошта
                  </div>
                  <div className="mt-2 space-y-1">
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

              {/* Таймлайн/кроки */}
              <div className="rounded-2xl border p-5 bg-white">
                <h2 className="font-semibold text-lg">Що буде далі</h2>
                <ol className="mt-3 space-y-3">
                  <li className="flex items-start justify-center gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-gray-800">
                      <span className="font-medium">Менеджер вже на лінії.</span> Зв’язок у
                      <strong> 5–30 хв</strong>.
                    </div>
                  </li>
                  <li className="flex items-start justify-center gap-3">
                    <Clock className="mt-0.5 h-8 w-8 text-emerald-600" />
                    <div className="text-gray-800">
                      Якщо не додзвонились — спробуємо ще раз. Ви нічого не пропустите.
                    </div>
                  </li>
                  <li className="flex items-start justify-center gap-3">
                    <Truck className="mt-0.5 h-8 w-8 text-emerald-600" />
                    <div className="text-gray-800">
                      Після підтвердження відправимо посилку та надішлемо ТТН у SMS.
                    </div>
                  </li>
                </ol>

                <p className="mt-3 text-xs text-gray-600">
                  Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек чи
                  договір. Остаточні деталі узгоджуються телефоном.
                </p>
              </div>

              {/* Дії */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Кнопка на сторінку контактів */}
                <Link
                  to="/contact"         // <-- заміни шлях, якщо у тебе інший (наприклад /contact)
                  aria-label="Відкрити контакти"
                  className="group relative inline-flex items-center justify-center h-12 px-6
                            rounded-2xl font-semibold text-white
                            transition-transform duration-300 ease-out
                            hover:scale-[1.02] active:scale-95 focus:outline-none"
                >
                  {/* свічення навколо */}
                  <span
                    aria-hidden
                    className="absolute -inset-1 rounded-3xl
                              bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
                              blur-lg opacity-70 group-hover:opacity-90 transition"
                  />
                  {/* фон-кнопка */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl
                              bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600
                              shadow-[0_12px_30px_rgba(20,184,166,.45)]"
                  />
                  {/* «гінт» (shine) */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-10 top-0 h-full w-10 rotate-12
                              bg-white/30 opacity-0
                              group-hover:opacity-100 group-hover:translate-x-[230%]
                              transition-transform duration-700 ease-out"
                  />
                  {/* контент */}
                  <span className="relative z-10 inline-flex items-center gap-2 tracking-tight">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2a1 1 0 011.02-.24 11.1 11.1 0 003.5.56 1 1 0 011 1v3.4a1 1 0 01-1 1A16.9 16.9 0 013 5a1 1 0 011-1h3.4a1 1 0 011 1c0 1.22.2 2.41.56 3.5a1 1 0 01-.24 1.02L6.6 10.8z"/>
                    </svg>
                    <span className="text-white">Зв’язатися з нами</span>
                    <span className="ml-1 text-white/90 text-xs hidden sm:inline">09:00–21:00 щодня</span>
                  </span>
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-2xl border font-semibold hover:bg-gray-50 active:scale-[0.99] transition"
                >
                  ← Повернутись до покупок
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500">
                Якщо будете не на зв’язку — не хвилюйтесь, ми обов’язково спробуємо ще раз ✨
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
