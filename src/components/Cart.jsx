// src/components/Cart.jsx
import { useCallback, useEffect, useId, useMemo, useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalBuy from "./ModalBuy";
import { ShieldCheck, RotateCcw, CreditCard, Truck, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";

/* helpers */
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));


// 🔧 FIX: перенесено поза компонент — не створюється заново кожен рендер
const PERKS = [
  { icon: ShieldCheck, text: "12 міс гарантія" },
  { icon: RotateCcw,   text: "14 днів повернення" },
  { icon: CreditCard,  text: "Оплата при отриманні" },
  { icon: Truck,       text: "Швидка доставка" },
];

export default function Cart({ freeShippingFrom = 0 }) {
  const {
    cart,
    changeQty,
    removeFromCart,
    removeAddon,
    clearCart,
    refreshCartPrices,
  } = useCart();
  const [isPending, startTransition] = useTransition();
  const [armedId, setArmedId] = useState(null);
  const [mobileDetails, setMobileDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { refreshCartPrices?.(); }, [refreshCartPrices]);

  // Автоматично знімаємо "armed" через 3 сек якщо не підтвердив
  useEffect(() => {
    if (!armedId) return;
    const t = setTimeout(() => setArmedId(null), 3000);
    return () => clearTimeout(t);
  }, [armedId]);

  // 🔧 FIX: subtotal враховує addons через unitTotal
  const { itemsCount, subtotal } = useMemo(() => {
    const itemsCount = cart.reduce((n, i) => n + Math.max(1, Number(i.qty) || 0), 0);
    const subtotal = cart.reduce((s, i) => {
      const qty  = Math.max(1, Number(i.qty) || 0);
      const unit = Number(i.unitTotal) || Number(i.price) || 0;
      return s + unit * qty;
    }, 0);
    return { itemsCount, subtotal };
  }, [cart]);

  const discount = 0;
  const total      = Math.max(0, subtotal - discount);
  const leftToFree = Math.max(0, (freeShippingFrom || 0) - subtotal);
  const freeProgress = freeShippingFrom
    ? Math.min(100, Math.round((subtotal / freeShippingFrom) * 100))
    : 0;

  // 🔧 FIX: всі actions через cartItemId
  const onQtyChange = useCallback(
    (cartItemId, nextQty) => startTransition(() => changeQty?.(cartItemId, nextQty)),
    [changeQty]
  );
  const onRemove = useCallback(
    (cartItemId) => startTransition(() => removeFromCart?.(cartItemId)),
    [removeFromCart]
  );
  const onRemoveAddon = useCallback(
    (cartItemId, addonId) => removeAddon?.(cartItemId, addonId),
    [removeAddon]
  );
  const handleCheckout = useCallback(() => setShowForm(true), []);

  /* ── Порожній кошик ── */
  if (!cart.length) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <section role="status" aria-live="polite"
          className="rounded-3xl border bg-white p-6 sm:p-10 text-center shadow-sm"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
              <path fill="currentColor" d="M7 4h-2l-1 2H1v2h2l3.6 7.59A2 2 0 0 0 8.4 17h7.2a2 2 0 0 0 1.8-1.14L21 8H6.42l-.94-2H7zM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
            </svg>
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">Кошик порожній</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Залетіли глянути топчики? Оберіть, що зайде.
          </p>
          {freeShippingFrom > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 text-xs sm:text-sm font-semibold ring-1 ring-emerald-200">
              <span>Безкоштовна доставка від {formatUAH(freeShippingFrom)}</span>
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <BackButton />
            <Link to="/" className="group relative h-12 px-6 rounded-2xl font-semibold focus:outline-none active:scale-[0.98] transition">
              <span aria-hidden className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 blur-lg opacity-60 group-hover:opacity-80 transition" />
              <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
              <span className="relative z-10 flex mt-3 items-center justify-center gap-2 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-90" aria-hidden>
                  <path fill="currentColor" d="M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h6v6h-6v-6Z"/>
                </svg>
                У каталог
              </span>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* ── Основний рендер ── */
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-5 pt-6 pb-28 md:pb-24 lg:pb-10 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <BackButton />
      </div>

      {/* Банер безкоштовної доставки */}
      {freeShippingFrom > 0 && (
        <div className="mb-5 rounded-2xl border bg-white p-4">
          {leftToFree > 0 ? (
            <p className="text-sm text-gray-700 mb-2">
              Додайте ще <span className="font-semibold">{formatUAH(leftToFree)}</span>, щоб отримати
              безкоштовну доставку від {formatUAH(freeShippingFrom)}.
            </p>
          ) : (
            <p className="text-sm text-emerald-700 mb-2 font-medium">
              Умови безкоштовної доставки виконані ✓
            </p>
          )}
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-blue-600 transition-[width] duration-500" style={{ width: `${freeProgress}%` }} aria-hidden />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

        {/* ── Список товарів ── */}
        <section className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const cartItemId = item.cartItemId || item.id;
            const qty        = clamp(Number(item.qty) || 1, 1, 99);
            const price      = Number(item.price) || 0;
            const oldPrice   = Number(item.oldPrice) || 0;
            const saving     = oldPrice > price ? oldPrice - price : 0;
            const low        = Number(item.stock) > 0 && Number(item.stock) <= 5;
            const addons     = Array.isArray(item.addons) ? item.addons : [];
            const addonsSum  = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
            const unitTotal  = price + addonsSum;
            // 🔧 FIX: лінійна сума = (базова + addons) × qty
            const line       = unitTotal * qty;
            const armed      = armedId === cartItemId;

            return (
              <article
                key={cartItemId}
                className="flex flex-col sm:flex-row sm:items-stretch gap-4 p-4 bg-white rounded-2xl border transition-shadow hover:shadow-md"
              >
                {/* Фото */}
                <div className="sm:self-start sm:mt-1">
                  <div className="w-full sm:w-24 md:w-28 aspect-square overflow-hidden rounded-xl bg-gray-50 relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />
                    {low && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5">
                        Залишилось {item.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Центральна частина */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">

                  {/* Назва */}
                  <h2 className="font-semibold text-gray-900 leading-snug break-words">
                    {item.title}
                  </h2>

                  {/* Базова ціна товару */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 🔧 FIX: прибрали lg:text-4xl — виглядало кричаще */}
                    <div className="text-red-600 font-extrabold text-2xl sm:text-3xl tabular-nums">
                      {formatUAH(price)}
                    </div>
                    {saving > 0 && oldPrice > 0 && (
                      <>
                        <div className="text-sm text-gray-400 line-through tabular-nums">{formatUAH(oldPrice)}</div>
                        <span className="inline-flex items-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white text-xs font-extrabold tabular-nums px-2.5 py-0.5">
                          −{Math.round((saving / oldPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* 🆕 Addons з хрестиком видалення */}
                  {addons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {addons.map((addon) => (
                        <span
                          key={addon.id}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 pl-2.5 pr-1 py-0.5 text-xs font-medium text-blue-900"
                        >
                          + {addon.name}
                          <span className="font-semibold ml-0.5 tabular-nums">{formatUAH(addon.price)}</span>
                          {/* 🆕 Червоний хрестик */}
                          <button
                            type="button"
                            aria-label={`Видалити ${addon.name}`}
                            onClick={() => onRemoveAddon(cartItemId, addon.id)}
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-red-500 hover:bg-red-500 transition shrink-0"
                          >
                           X <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Подарунок */}
                  {item.giftText && (
                    <div className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <span>🎁</span>
                      <span>{item.giftText}</span>
                    </div>
                  )}

                  {/* Лічильник кількості */}
                  <div className="mt-1">
                    <label htmlFor={`qty-${cartItemId}`} className="sr-only ">
                      Кількість для {item.title}
                    </label>
                    <Qty
                      id={`qty-${cartItemId}`}
                      value={qty}
                      min={1}
                      max={99}
                      // 🔧 FIX: передаємо cartItemId
                      onChange={(next) => onQtyChange(cartItemId, next)}
                      pending={isPending}
                    />
                  </div>
                </div>

                {/* Права частина: сума + видалення */}
                <div className="flex sm:flex-col sm:items-end justify-between sm:justify-between gap-2 sm:min-w-[120px] sm:max-w-[140px]">

                  {/* Підсумок позиції */}
                  <div className="sm:text-right">
                    <div className="text-xs text-gray-400 mb-0.5">Разом:</div>
                    <div className="text-xl font-extrabold text-gray-900 tabular-nums leading-none">
                      {formatUAH(line)}
                    </div>
                    {(qty > 1 || addons.length > 0) && (
                      <div className="text-xs text-gray-400 tabular-nums mt-1">
                        {qty > 1 && `${qty} × `}{formatUAH(unitTotal)}
                      </div>
                    )}
                  </div>

                  {/* Видалення з підтвердженням */}
                  {!armed ? (
                    <button
                      type="button"
                      onClick={() => setArmedId(cartItemId)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 mt-5 h-10 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-100 transition whitespace-nowrap"
                    >
                      🗑️ <span className="font-medium">Видалити</span>
                    </button>
                  ) : (
                    // 🔑 Ключова зміна: flex-col + w-full щоб обидві кнопки поміщались
                    <div className="flex flex-col gap-1.5 w-35 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => { onRemove(cartItemId); setArmedId(null); }}
                        className="inline-flex items-center justify-center h-8 w-36 px-2 rounded-lg bg-red-600 text-red-500 text-xs font-medium hover:bg-red-700 transition "
                      >
                        Видалити
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmedId(null)}
                        className="inline-flex items-center justify-center h-8 w-36 px-2 rounded-lg border text-xs text-white hover:bg-gray-50 transition "
                      >
                        Скасувати
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* ── Сайдбар підсумку ── */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="p-5 sm:p-6 bg-white/95 backdrop-blur rounded-2xl border shadow-xl ring-3 ring-slate-800 sticky top-24">
            <h2 className="text-blue-950 text-2xl text-center font-bold tracking-tight mb-4">Підсумок</h2>
            <Breakdown itemsCount={itemsCount} subtotal={subtotal} discount={discount} total={total} />
            <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!itemsCount}
              className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition mt-4 shadow-lg"
            >
              Оформити замовлення
            </button>

            {/* Траст-блок */}
            <div className="mt-4 grid grid-cols-1 gap-1.5">
              {PERKS.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.text} className="flex h-11 items-center gap-2 rounded-xl bg-gray-50 ring-1 ring-black/5 px-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-gray-700">{perk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔧 FIX: прибрали animate-pulse з навігаційного посилання */}
          <Link to="/" className="block mt-3 text-center text-sm text-gray-600 hover:text-black hover:underline transition">
            ← Продовжити покупки
          </Link>
        </aside>
      </div>

      <div aria-live="polite" className="sr-only">Разом: {formatUAH(total)}</div>

      {/* ── Sticky мобільний footer ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto max-w-2xl px-2 sm:px-4 pb-[max(env(safe-area-inset-bottom),10px)]">
          <div className="rounded-t-2xl border bg-white shadow-2xl p-2 sm:p-3">

            <div className="flex items-center justify-between gap-2">
              {/* ── Ціна ── */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-0.5 text-red-600 font-extrabold tabular-nums flex-wrap leading-none">
                  {(() => {
                    const f = formatUAH(total);
                    const amount = f.replace(/\s*₴$/, "");
                    return (
                      <>
                        {/* Мінімум 16px на 320px → максимум 26px на великих */}
                        <span className="text-[clamp(16px,5vw,26px)]">{amount}</span>
                        <span className="text-[clamp(13px,3vw,18px)] opacity-80">₴</span>
                      </>
                    );
                  })()}
                </div>

                {freeShippingFrom > 0 && leftToFree > 0 && (
                  <div className="text-[10px] xs:text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    Ще {formatUAH(leftToFree)} до безкоштовної
                  </div>
                )}
                {freeShippingFrom > 0 && leftToFree === 0 && (
                  <div className="text-[10px] xs:text-[11px] text-emerald-700 mt-0.5">
                    Безкоштовна доставка ✓
                  </div>
                )}
              </div>

              {/* ── Кнопки ── */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileDetails((v) => !v)}
                  aria-label={mobileDetails ? "Сховати деталі" : "Показати деталі"}
                  className="
                    inline-flex items-center justify-center
                    h-10 sm:h-11
                    px-2.5 sm:px-3
                    rounded-xl border border-gray-300
                    text-xs sm:text-sm font-medium text-white
                    hover:bg-gray-50 active:scale-95
                    transition shrink-0
                  "
                >
                  {mobileDetails ? "Сховати" : "Деталі"}
                </button>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!itemsCount}
                  className="
                    inline-flex items-center justify-center
                    h-10 sm:h-11
                    px-3 sm:px-5
                    rounded-xl bg-black text-white
                    text-xs sm:text-sm font-semibold
                    active:scale-[0.98] disabled:opacity-50
                    transition shrink-0
                  "
                >
                  Купити
                </button>
              </div>
            </div>

            {/* Розгортаємий підсумок */}
            {mobileDetails && (
              <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Товарів</span>
                  <span className="tabular-nums">{itemsCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Сума товарів</span>
                  <span className="tabular-nums">{formatUAH(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Знижка</span>
                    <span className="tabular-nums">−{formatUAH(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Разом</span>
                  <span className="tabular-nums text-red-600">{formatUAH(total)}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showForm && (
        <ModalBuy
          open={showForm}
          product={null}
          cart={cart}
          subtotal={subtotal}
          discount={discount}
          total={total}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            clearCart?.();
          }}
        />
      )}
    </main>
  );
}

/* ── Subcomponents ── */

function BackButton() {
  const nav = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? nav(-1) : nav("/"))}
      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
      aria-label="Назад"
    >
      ← Назад
    </button>
  );
}

// 🔧 FIX: кнопки +/- тепер 44px (мінімум Apple HIG для touchscreen)
// 🔧 FIX: поле ширше (w-16 → w-20) — зручніше вводити на мобільному
function Qty({ id, value, onChange, min = 1, max = 99, pending = false }) {
  const autoId   = useId();
  const inputId  = id || `qty-${autoId}`;
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next) => {
    const n = Number(next);
    if (Number.isFinite(n)) {
      const clamped = clamp(Math.trunc(n), min, max);
      onChange?.(clamped);
      setDraft(String(clamped));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <button
        type="button"
        aria-label="Зменшити кількість"
        disabled={pending || value <= min}
        onClick={() => commit((value || min) - 1)}
        // 🔧 h-11 w-11 = 44px — мінімум для зручного tap на мобільному
        className="inline-flex h-8 w-11 items-center justify-center rounded-2xl bg-gray-100 text-white text-lg font-bold hover:bg-gray-200 active:scale-95 disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        −
      </button>

      <label htmlFor={inputId} className="sr-only">Кількість</label>
      <input
        id={inputId}
        name={inputId}
        inputMode="numeric"
        min={min}
        max={max}
        // 🔧 w-20 замість w-16 — ширше поле, зручніше вводити
        className="w-15 h-8 text-center rounded-2xl border-2 border-gray-200 bg-white text-gray-900 tabular-nums font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => e.key === "Enter" && commit(draft)}
        disabled={pending}
      />

      <button
        type="button"
        aria-label="Збільшити кількість"
        disabled={pending || value >= max}
        onClick={() => commit((value || min) + 1)}
        className="inline-flex h-8 w-11 items-center justify-center rounded-2xl bg-gray-100 text-white text-lg font-bold hover:bg-gray-200 active:scale-95 disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        +
      </button>
    </div>
  );
}

// 🔧 FIX: accent тепер для value (не label), "Разом" — червоний
function Breakdown({ itemsCount, subtotal, discount, total }) {
  return (
    <div className="space-y-2 text-[15px]">
      <Row label="Товарів"       value={String(itemsCount)} />
      <Row label="Сума товарів"  value={formatUAH(subtotal)} />
      {discount > 0 && (
      <Row label="Знижка" value={`−${formatUAH(discount)}`} valueClass="text-emerald-600" />
      )}
      <div className="pt-2 border-t">
        <Row label="Разом" value={formatUAH(total)} strong valueClass="text-red-600" />
      </div>
    </div>
  );
}

function Row({ label, value, strong = false, valueClass = "text-gray-900" }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-semibold text-base" : "text-sm"}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}