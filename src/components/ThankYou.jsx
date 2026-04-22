// src/components/ThankYou.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2, Phone, Truck, Clock,
  Home, Copy, Check, User, Package,
} from "lucide-react";
import { formatUAH } from "../utils/format";

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
    } catch { /* Clipboard API недоступний */ }
  };

  if (!summary) {
    return (
      <main className="mx-auto max-w-screen-sm px-3 sm:px-6 py-8 sm:py-10">
        <div className="rounded-2xl sm:rounded-3xl border bg-white p-5 sm:p-8 text-center shadow-sm">
          <h1 className="text-xl sm:text-3xl font-extrabold mb-2 text-gray-900">
            Замовлення не знайдено
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Можливо, сторінку оновлено або очищено дані браузера.
          </p>
          <Link
            to="/"
            className="mt-5 sm:mt-6 inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-11 sm:h-12 rounded-2xl bg-black text-white text-sm sm:text-base font-semibold hover:bg-black/90"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" /> На головну
          </Link>
        </div>
      </main>
    );
  }

  const { orderId, itemsCount, total, name, phone, delivery, items = [] } = summary;

  return (
    <main className="mx-auto max-w-screen-md px-2 sm:px-6 md:px-8 py-4 sm:py-10">
      <div className="relative rounded-2xl sm:rounded-[28px] p-[1.5px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(16,185,129,.35)]">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[26px] border bg-white shadow-md">

          {/* ── HERO ── */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 sm:px-6 py-6 sm:py-10 text-center">
            <div className="mx-auto max-w-2xl flex flex-col items-center">
              <div className="mb-3 relative grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20">
                <span className="absolute inset-0 rounded-full animate-ping bg-white/10" />
                <CheckCircle2 className="relative h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                Ваше замовлення прийнято!
              </h1>
              <p className="mt-2 text-white/95 text-xs sm:text-base leading-snug">
                Дякуємо! Зазвичай телефонуємо протягом{" "}
                <strong className="whitespace-nowrap">5–30 хв</strong> у робочий час.
                Якщо не додзвонимось — обов'язково передзвонимо ще.
              </p>

              {/* Номер замовлення */}
              <div className="mt-4 sm:mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white/15 px-3 sm:px-4 py-2 ring-1 ring-white/25 backdrop-blur max-w-full">
                <span className="text-xs sm:text-sm text-white/80">Номер:</span>
                <strong className="font-mono tracking-wide break-all text-xs sm:text-sm">
                  {orderId}
                </strong>
                <button
                  type="button"
                  onClick={copyId}
                  aria-label={copied ? "Скопійовано" : "Скопіювати номер"}
                  className={`inline-flex items-center justify-center gap-1 h-8 rounded-lg px-2.5 sm:px-3 text-xs sm:text-sm font-medium transition
                    ${copied ? "bg-white text-emerald-700 scale-95" : "bg-white/20 text-white hover:bg-white/35 active:scale-95"}`}
                >
                  {copied
                    ? <><Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span>ОК</span></>
                    : <><Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span>Копія</span></>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── КОНТЕНТ ── */}
          <div className="px-3 sm:px-6 py-5 sm:py-8 bg-white text-gray-900">
            <div className="mx-auto max-w-2xl space-y-3 sm:space-y-5">

              {/* Сума + Покупець */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl border p-3 sm:p-5 text-center">
                  <div className="text-xs sm:text-sm text-gray-500">Сума замовлення</div>
                  <div className="mt-1 text-xl sm:text-3xl font-extrabold text-red-700 tabular-nums">
                    {formatUAH(total)}
                  </div>
                  <div className="mt-0.5 text-xs sm:text-sm text-gray-500">
                    {itemsCount} {itemsCount === 1 ? "товар" : itemsCount < 5 ? "товари" : "товарів"}
                  </div>
                </div>

                <div className="rounded-xl sm:rounded-2xl border p-3 sm:p-5 text-center">
                  <div className="text-xs sm:text-sm text-gray-500">Покупець</div>
                  <div className="mt-1 flex items-center justify-center gap-1.5 font-semibold text-sm sm:text-base text-gray-900">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
                    <span className="truncate max-w-full">{name || "—"}</span>
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="mt-1.5 flex items-center justify-center gap-1.5 text-gray-700 hover:underline break-all text-xs sm:text-sm"
                    >
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 shrink-0" />
                      {phone}
                    </a>
                  )}
                </div>
              </div>

              {/* ЧЕК */}
              {items.length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border overflow-hidden">
                  <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border-b">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-xs sm:text-sm text-gray-800">
                      Склад замовлення
                    </span>
                  </div>

                  <ul className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const qty         = Math.max(1, Number(item.qty) || 1);
                      const basePrice   = Number(item.price) || 0;
                      const oldPrice    = Number(item.oldPrice) || 0;
                      const hasDiscount = oldPrice > basePrice;
                      const itemSavings = hasDiscount ? (oldPrice - basePrice) * qty : 0;
                      const addons      = Array.isArray(item.addons) ? item.addons : [];
                      const addonsSum   = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
                      const unitTotal   = basePrice + addonsSum;
                      const lineTotal   = unitTotal * qty;

                      return (
                        <li key={`${item.id ?? idx}-${idx}`} className="px-3 sm:px-5 py-3 sm:py-4 space-y-1.5">

                          {/* Назва + ціна */}
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug break-words">
                                {item.title}
                                {qty > 1 && (
                                  <span className="ml-1 text-gray-400 font-normal">× {qty}</span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
                              {hasDiscount && (
                                <>
                                  <span className="text-[10px] sm:text-xs text-gray-400 line-through tabular-nums">
                                    {formatUAH(oldPrice)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums px-1.5 py-0.5">
                                    −{Math.round((1 - basePrice / oldPrice) * 100)}%
                                  </span>
                                </>
                              )}
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
                                {formatUAH(basePrice)}
                              </span>
                            </div>
                          </div>

                          {/* Економія */}
                          {hasDiscount && (
                            <div className="pl-2 sm:pl-3 text-[11px] sm:text-xs text-emerald-700 flex items-center gap-1">
                              🔥 Економія: <span className="font-semibold">{formatUAH(itemSavings)}</span>
                            </div>
                          )}

                          {/* Addons */}
                          {addons.map((a) => (
                            <div key={a.id} className="flex items-center justify-between gap-2 pl-2 sm:pl-3">
                              <span className="text-[11px] sm:text-xs text-blue-700 flex items-center gap-1 truncate">
                                <span className="text-blue-400">+</span>
                                <span className="truncate">{a.name}</span>
                              </span>
                              <span className="text-[11px] sm:text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                                {formatUAH(a.price)}
                              </span>
                            </div>
                          ))}

                          {/* Подарунок */}
                          {item.giftText && (
                            <div className="pl-2 sm:pl-3 text-[11px] sm:text-xs text-emerald-700 flex items-start gap-1">
                              <span className="shrink-0">🎁</span>
                              <span className="break-words">{item.giftText}</span>
                            </div>
                          )}

                          {/* Підсумок рядка */}
                          {(addons.length > 0 || qty > 1) && (
                            <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-dashed border-gray-200">
                              <span className="text-[11px] sm:text-xs text-gray-500">
                                {qty > 1 ? `${qty} × ${formatUAH(unitTotal)}` : "Разом:"}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums shrink-0">
                                {formatUAH(lineTotal)}
                              </span>
                            </div>
                          )}

                        </li>
                      );
                    })}
                  </ul>

                  <div className="bg-gray-50 border-t">
                    {/* Економія */}
                    {(() => {
                      const totalSavings = items.reduce((s, it) => {
                        const op = Number(it.oldPrice) || 0;
                        const p  = Number(it.price) || 0;
                        const q  = Math.max(1, Number(it.qty) || 1);
                        return s + (op > p ? (op - p) * q : 0);
                      }, 0);
                      return totalSavings > 0 ? (
                        <div className="flex items-center justify-between px-3 sm:px-5 py-2 border-b border-gray-200">
                          <span className="text-xs sm:text-sm text-emerald-700 font-medium">
                            💚 Ваша економія:
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-700 tabular-nums">
                            {formatUAH(totalSavings)}
                          </span>
                        </div>
                      ) : null;
                    })()}

                    {/* Разом */}
                    <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3">
                      <span className="text-xs sm:text-sm text-gray-600">Разом до оплати:</span>
                      <span className="text-base sm:text-lg font-extrabold text-red-700 tabular-nums">
                        {formatUAH(total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Доставка */}
              {hasDelivery && (
                <div className="rounded-xl sm:rounded-2xl border p-3 sm:p-5 text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    Доставка: <span className="text-red-700 font-medium">Нова Пошта</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-700">
                    {delivery.region && <div><span className="text-gray-500">Область:</span> {delivery.region}</div>}
                    {delivery.city && <div><span className="text-gray-500">Місто:</span> {delivery.city}</div>}
                    {delivery.branch && <div><span className="text-gray-500">Відділення:</span> {delivery.branch}</div>}
                  </div>
                </div>
              )}

              {/* Що далі */}
              <div className="rounded-xl sm:rounded-2xl border p-3 sm:p-5">
                <h2 className="font-semibold text-base sm:text-lg text-center">Що буде далі</h2>
                <ol className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <span className="mt-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-800">
                      <span className="font-medium">Менеджер вже на лінії.</span>{" "}
                      Зв'язок протягом <strong>5–30 хв</strong>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Clock className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-800">
                      Якщо не додзвонились — спробуємо ще. Ви нічого не пропустите.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 sm:gap-3">
                    <Truck className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-800">
                      Після підтвердження відправимо посилку та надішлемо ТТН у SMS.
                    </div>
                  </li>
                </ol>
                <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-500 text-center border-t pt-2.5 sm:pt-3">
                  Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек.
                </p>
              </div>

              {/* Дії */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
                <Link
                  to="/contact"
                  aria-label="Відкрити контакти"
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center h-11 sm:h-12 px-5 sm:px-6 rounded-2xl font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <span aria-hidden className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-lg opacity-70 group-hover:opacity-90 transition" />
                  <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-[0_12px_30px_rgba(20,184,166,.45)]" />
                  <span className="relative z-10 inline-flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    Зв'язатися з нами
                  </span>
                </Link>

                <Link
                  to="/"
                  className="inline-flex w-full sm:w-auto items-center justify-center h-11 px-5 rounded-2xl border font-semibold text-sm sm:text-base text-gray-800 hover:bg-gray-50 active:scale-[0.99] transition"
                >
                  ← До покупок
                </Link>
              </div>

              <p className="text-center text-[10px] sm:text-xs text-gray-400 pb-1">
                Якщо будете не на зв'язку — не хвилюйтесь, спробуємо ще раз ✨
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}