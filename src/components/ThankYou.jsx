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
        <div className="rounded-2xl sm:rounded-3xl border border-line bg-white p-5 sm:p-8 text-center shadow-sm">
          <h1 className="text-xl sm:text-3xl font-extrabold mb-2 text-ink">
            Замовлення не знайдено
          </h1>
          <p className="text-sm sm:text-base text-ink-soft">
            Можливо, сторінку оновлено або очищено дані браузера.
          </p>
          <Link
            to="/"
            className="mt-5 sm:mt-6 inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-11 sm:h-12 rounded-xl bg-accent text-white text-sm sm:text-base font-display font-semibold hover:brightness-95 active:scale-95 transition"
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[26px] border border-line bg-white shadow-md">

        {/* ── HERO ── */}
        <div className="relative bg-gradient-to-br from-green-600 to-trust text-white px-4 sm:px-6 py-6 sm:py-10 text-center">
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
                  ${copied ? "bg-white text-trust scale-95" : "bg-white/20 text-white hover:bg-white/35 active:scale-95"}`}
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
        <div className="px-3 sm:px-6 py-5 sm:py-8 bg-white text-ink">
          <div className="mx-auto max-w-2xl space-y-3 sm:space-y-5">

            {/* Сума + Покупець */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl sm:rounded-2xl border border-line p-3 sm:p-5 text-center">
                <div className="text-xs sm:text-sm text-ink-soft">Сума замовлення</div>
                <div className="mt-1 text-xl sm:text-3xl font-extrabold text-red-700 tabular-nums">
                  {formatUAH(total)}
                </div>
                <div className="mt-0.5 text-xs sm:text-sm text-ink-soft">
                  {itemsCount} {itemsCount === 1 ? "товар" : itemsCount < 5 ? "товари" : "товарів"}
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-line p-3 sm:p-5 text-center">
                <div className="text-xs sm:text-sm text-ink-soft">Покупець</div>
                <div className="mt-1 flex items-center justify-center gap-1.5 font-semibold text-sm sm:text-base text-ink">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                  <span className="truncate max-w-full">{name || "—"}</span>
                </div>
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="mt-1.5 flex items-center justify-center gap-1.5 text-ink-soft hover:text-accent break-all text-xs sm:text-sm transition"
                  >
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
                    {phone}
                  </a>
                )}
              </div>
            </div>

            {/* ЧЕК */}
            {items.length > 0 && (
              <div className="rounded-xl sm:rounded-2xl border border-line overflow-hidden">
                <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-surface border-b border-line">
                  <Package className="h-4 w-4 text-trust" />
                  <span className="font-semibold text-xs sm:text-sm text-ink">
                    Склад замовлення
                  </span>
                </div>

                <ul className="divide-y divide-line">
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
                            <span className="text-xs sm:text-sm font-semibold text-ink leading-snug break-words">
                              {item.title}
                              {qty > 1 && (
                                <span className="ml-1 text-ink-soft font-normal">× {qty}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
                            {hasDiscount && (
                              <>
                                <span className="text-[10px] sm:text-xs text-ink-soft line-through tabular-nums">
                                  {formatUAH(oldPrice)}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums px-1.5 py-0.5">
                                  −{Math.round((1 - basePrice / oldPrice) * 100)}%
                                </span>
                              </>
                            )}
                            <span className="text-xs sm:text-sm font-semibold text-ink tabular-nums">
                              {formatUAH(basePrice)}
                            </span>
                          </div>
                        </div>

                        {/* Економія */}
                        {hasDiscount && (
                          <div className="pl-2 sm:pl-3 text-[11px] sm:text-xs text-trust flex items-center gap-1">
                            🔥 Економія: <span className="font-semibold">{formatUAH(itemSavings)}</span>
                          </div>
                        )}

                        {/* Addons */}
                        {addons.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-2 pl-2 sm:pl-3">
                            <span className="text-[11px] sm:text-xs text-ink-soft flex items-center gap-1 truncate">
                              <span className="text-accent">+</span>
                              <span className="truncate">{a.name}</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-ink tabular-nums shrink-0">
                              {formatUAH(a.price)}
                            </span>
                          </div>
                        ))}

                        {/* Подарунок */}
                        {item.giftText && (
                          <div className="pl-2 sm:pl-3 text-[11px] sm:text-xs text-trust flex items-start gap-1">
                            <span className="shrink-0">🎁</span>
                            <span className="break-words">{item.giftText}</span>
                          </div>
                        )}

                        {/* Підсумок рядка */}
                        {(addons.length > 0 || qty > 1) && (
                          <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t border-dashed border-line">
                            <span className="text-[11px] sm:text-xs text-ink-soft">
                              {qty > 1 ? `${qty} × ${formatUAH(unitTotal)}` : "Разом:"}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-ink tabular-nums shrink-0">
                              {formatUAH(lineTotal)}
                            </span>
                          </div>
                        )}

                      </li>
                    );
                  })}
                </ul>

                <div className="bg-surface border-t border-line">
                  {/* Економія */}
                  {(() => {
                    const totalSavings = items.reduce((s, it) => {
                      const op = Number(it.oldPrice) || 0;
                      const p  = Number(it.price) || 0;
                      const q  = Math.max(1, Number(it.qty) || 1);
                      return s + (op > p ? (op - p) * q : 0);
                    }, 0);
                    return totalSavings > 0 ? (
                      <div className="flex items-center justify-between px-3 sm:px-5 py-2 border-b border-line">
                        <span className="text-xs sm:text-sm text-trust font-medium">
                          💚 Ваша економія:
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-trust tabular-nums">
                          {formatUAH(totalSavings)}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* Разом */}
                  <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3">
                    <span className="text-xs sm:text-sm text-ink-soft">Разом до оплати:</span>
                    <span className="text-base sm:text-lg font-extrabold text-red-700 tabular-nums">
                      {formatUAH(total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Доставка */}
            {hasDelivery && (
              <div className="rounded-xl sm:rounded-2xl border border-line p-3 sm:p-5 text-center">
                <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-ink-soft">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  Доставка: <span className="text-ink font-medium">Нова Пошта</span>
                </div>
                <div className="mt-2 space-y-1 text-xs sm:text-sm text-ink">
                  {delivery.region && <div><span className="text-ink-soft">Область:</span> {delivery.region}</div>}
                  {delivery.city && <div><span className="text-ink-soft">Місто:</span> {delivery.city}</div>}
                  {delivery.branch && <div><span className="text-ink-soft">Відділення:</span> {delivery.branch}</div>}
                </div>
              </div>
            )}

            {/* Що далі */}
            <div className="rounded-xl sm:rounded-2xl border border-line p-3 sm:p-5">
              <h2 className="font-semibold text-base sm:text-lg text-center text-ink">Що буде далі</h2>
              <ol className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <span className="mt-1.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-trust animate-pulse shrink-0" />
                  <div className="text-xs sm:text-sm text-ink-soft">
                    <span className="font-medium text-ink">Менеджер вже на лінії.</span>{" "}
                    Зв'язок протягом <strong>5–30 хв</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Clock className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-trust shrink-0" />
                  <div className="text-xs sm:text-sm text-ink-soft">
                    Якщо не додзвонились — спробуємо ще. Ви нічого не пропустите.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Truck className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-trust shrink-0" />
                  <div className="text-xs sm:text-sm text-ink-soft">
                    Після підтвердження відправимо посилку та надішлемо ТТН у SMS.
                  </div>
                </li>
              </ol>
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-ink-soft text-center border-t border-line pt-2.5 sm:pt-3">
                Це <strong>підтвердження прийняття замовлення</strong>, а не фіскальний чек.
              </p>
            </div>

            {/* Дії */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
              <Link
                to="/contact"
                aria-label="Відкрити контакти"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl bg-accent text-white font-display font-semibold text-sm sm:text-base hover:brightness-95 active:scale-95 transition"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                Зв'язатися з нами
              </Link>

              <Link
                to="/"
                className="inline-flex w-full sm:w-auto items-center justify-center h-12 px-5 rounded-xl border border-line font-semibold text-sm sm:text-base text-ink hover:bg-surface hover:border-ink active:scale-[0.99] transition"
              >
                ← До покупок
              </Link>
            </div>

            <p className="text-center text-[10px] sm:text-xs text-ink-soft pb-1">
              Якщо будете не на зв'язку — не хвилюйтесь, спробуємо ще раз ✨
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
