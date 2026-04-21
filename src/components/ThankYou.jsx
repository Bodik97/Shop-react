// src/components/ThankYou.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2, Phone, Truck, Clock,
  Home, Copy, Check, User, Package,
} from "lucide-react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

function loadSummary(state) {
  if (state) return state;
  try {
    const saved = localStorage.getItem("lastOrderSummary");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function ThankYou() {
  const { state } = useLocation();
  const [summary] = useState(() => loadSummary(state));
  const [copied, setCopied] = useState(false);

  const hasDelivery =
    !!summary?.delivery &&
    (summary.delivery.region || summary.delivery.city || summary.delivery.branch);

  const copyId = async () => {
    if (!summary?.orderId) return;
    try {
      await navigator.clipboard.writeText(summary.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* Clipboard API недоступний */}
  };

  if (!summary) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 sm:px-6 py-10">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Замовлення не знайдено</h1>
          <p className="text-gray-600">Можливо, сторінку оновлено або очищено дані браузера.</p>
          <Link to="/" className="mt-6 inline-flex items-center justify-center gap-2 px-5 h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90">
            <Home className="h-5 w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery, items = [] } = summary;

  return (
    <main className="mx-auto max-w-screen-md px-4 sm:px-6 md:px-8 py-8 md:py-10">
      <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,.35)]">
        <div className="relative overflow-hidden rounded-[26px] border bg-white shadow-md">

          {/* HERO */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-10 text-center">
            <div className="mx-auto max-w-2xl flex flex-col items-center">
              <div className="mb-3 grid place-items-center h-14 w-14 rounded-full bg-white/20">
                <span className="absolute h-14 w-14 rounded-full animate-ping bg-white/10" />
                <CheckCircle2 className="relative h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Ваше замовлення прийнято!
              </h1>
              <p className="mt-2 text-white/95 text-sm sm:text-base">
                Дякуємо! Зазвичай телефонуємо протягом <strong>5–30 хв</strong> у робочий час.{" "}
                Якщо не додзвонимось — обов'язково передзвонимо ще.
              </p>

              {/* Номер + кнопка */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 ring-1 ring-white/25 backdrop-blur">
                <span className="text-sm text-white/80">Номер:</span>
                <strong className="font-mono tracking-wide break-all">{orderId}</strong>
                <button
                  type="button"
                  onClick={copyId}
                  aria-label={copied ? "Скопійовано" : "Скопіювати номер замовлення"}
                  className={`ml-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg px-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                    ${copied
                      ? "bg-white text-emerald-700 scale-95"
                      : "bg-white/20 text-white hover:bg-white/35 active:scale-95"
                    }`}
                >
                  {copied
                    ? <><Check className="h-4 w-4" /><span>Скопійовано</span></>
                    : <><Copy className="h-4 w-4" /><span>Копіювати</span></>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* КОНТЕНТ */}
          <div className="px-6 py-8 bg-white text-gray-900">
            <div className="mx-auto max-w-2xl space-y-5">

              {/* Сума / Покупець */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-5 text-center">
                  <div className="text-sm text-gray-500">Сума замовлення</div>
                  <div className="mt-1 text-3xl font-extrabold text-red-700 tabular-nums">
                    {formatUAH(total)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {itemsCount} {itemsCount === 1 ? "товар" : itemsCount < 5 ? "товари" : "товарів"}
                  </div>
                </div>

                <div className="rounded-2xl border p-5 text-center">
                  <div className="text-sm text-gray-500">Покупець</div>
                  <div className="mt-1 flex items-center justify-center gap-2 font-semibold text-gray-900">
                    <User className="h-5 w-5 text-red-600 shrink-0" />
                    {name || "—"}
                  </div>
                  {phone && (
                    <a href={`tel:${phone}`} className="mt-2 flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:underline break-all text-sm">
                      <Phone className="h-4 w-4 text-red-600 shrink-0" />
                      {phone}
                    </a>
                  )}
                </div>
              </div>

              {/* ЧЕК */}
              {items.length > 0 && (
                <div className="rounded-2xl border overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-sm text-gray-800">Склад замовлення</span>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const qty        = Math.max(1, Number(item.qty) || 1);
                      const basePrice  = Number(item.price) || 0;
                      const addons     = Array.isArray(item.addons) ? item.addons : [];
                      const addonsSum  = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
                      const unitTotal  = basePrice + addonsSum;
                      const lineTotal  = unitTotal * qty;

                      return (
                        <li key={`${item.id ?? idx}-${idx}`} className="px-5 py-4 space-y-1.5">

                          {/* ── Рядок 1: базовий товар ── */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-gray-900 leading-snug">
                                {item.title}
                                {qty > 1 && (
                                  <span className="ml-1.5 text-gray-400 font-normal">× {qty}</span>
                                )}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                              {formatUAH(basePrice)}
                            </span>
                          </div>

                          {/* ── Рядки 2+: кожен addon окремо ── */}
                          {addons.map((a) => (
                            <div key={a.id} className="flex items-center justify-between gap-3 pl-3">
                              <span className="text-xs text-blue-700 flex items-center gap-1">
                                <span className="text-blue-400">+</span>
                                {a.name}
                              </span>
                              <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                                {formatUAH(a.price)}
                              </span>
                            </div>
                          ))}

                          {/* Подарунок */}
                          {item.giftText && (
                            <div className="pl-3 text-xs text-emerald-700 flex items-center gap-1">
                              🎁 {item.giftText}
                            </div>
                          )}

                          {/* ── Підсумок рядка (тільки якщо є addons або qty > 1) ── */}
                          {(addons.length > 0 || qty > 1) && (
                            <div className="flex items-center justify-between gap-3 pt-1.5 mt-1 border-t border-dashed border-gray-200">
                              <span className="text-xs text-gray-500">
                                {qty > 1 ? `${qty} × ${formatUAH(unitTotal)}` : "Разом за позицію:"}
                              </span>
                              <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">
                                {formatUAH(lineTotal)}
                              </span>
                            </div>
                          )}

                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t">
                    <span className="text-sm text-gray-600">Разом до оплати:</span>
                    <span className="text-lg font-extrabold text-red-700 tabular-nums">
                      {formatUAH(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Доставка */}
              {hasDelivery && (
                <div className="rounded-2xl border p-5 text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-red-600" />
                    Доставка: <span className="text-red-700 font-medium">Нова Пошта</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    {delivery.region && <div><span className="text-gray-500">Область:</span> {delivery.region}</div>}
                    {delivery.city && <div><span className="text-gray-500">Місто:</span> {delivery.city}</div>}
                    {delivery.branch && <div><span className="text-gray-500">Відділення:</span> {delivery.branch}</div>}
                  </div>
                </div>
              )}

              {/* Що буде далі */}
              <div className="rounded-2xl border p-5">
                <h2 className="font-semibold text-lg text-center">Що буде далі</h2>
                <ol className="mt-4 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="text-sm text-gray-800">
                      <span className="font-medium">Менеджер вже на лінії.</span>{" "}
                      Зв'язок протягом <strong>5–30 хв</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-sm text-gray-800">
                      Якщо не додзвонились — спробуємо ще раз. Ви нічого не пропустите.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-sm text-gray-800">
                      Після підтвердження відправимо посилку та надішлемо ТТН у SMS.
                    </div>
                  </li>
                </ol>
                <p className="mt-4 text-xs text-gray-500 text-center border-t pt-3">
                  Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек.
                  Остаточні деталі узгоджуються телефоном.
                </p>
              </div>

              {/* Дії */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <Link
                  to="/contact"
                  aria-label="Відкрити контакти"
                  className="group relative inline-flex items-center justify-center h-12 px-6 rounded-2xl font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none"
                >
                  <span aria-hidden className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-lg opacity-70 group-hover:opacity-90 transition" />
                  <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-[0_12px_30px_rgba(20,184,166,.45)]" />
                  <span aria-hidden className="pointer-events-none absolute -left-10 top-0 h-full w-10 rotate-12 bg-white/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-[230%] transition-transform duration-700 ease-out" />
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                      <path d="M6.6 10.8a15.6 15.6 0 006.6 6.6l2.2-2.2a1 1 0 011.02-.24 11.1 11.1 0 003.5.56 1 1 0 011 1v3.4a1 1 0 01-1 1A16.9 16.9 0 013 5a1 1 0 011-1h3.4a1 1 0 011 1c0 1.22.2 2.41.56 3.5a1 1 0 01-.24 1.02L6.6 10.8z"/>
                    </svg>
                    Зв'язатися з нами
                    <span className="text-white/80 text-xs hidden sm:inline">09:00–21:00</span>
                  </span>
                </Link>

                <Link to="/" className="inline-flex items-center justify-center h-11 px-5 rounded-2xl border font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.99] transition">
                  ← Повернутись до покупок
                </Link>
              </div>

              <p className="text-center text-xs text-gray-400 pb-1">
                Якщо будете не на зв'язку — не хвилюйтесь, обов'язково спробуємо ще раз ✨
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}