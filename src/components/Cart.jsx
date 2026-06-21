// src/components/Cart.jsx
import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, RotateCcw, CreditCard, Truck, X, ChevronLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";
import { sanityFmt } from "../utils/sanityImg";

// Модалку оформлення тягнемо лише коли користувач натиснув "Купити"
const ModalBuy = lazy(() => import("./ModalBuy"));

/* helpers */
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));


// 🔧 FIX: перенесено поза компонент — не створюється заново кожен рендер
const PERKS = [
  { icon: ShieldCheck, text: "Гарантія" },
  { icon: RotateCcw,   text: "14 днів повернення" },
  { icon: CreditCard,  text: "Оплата при отриманні" },
  { icon: Truck,       text: "Швидка доставка" },
];

// Inline SVG-плейсхолдер для зламаних зображень.
// Не залежить від файлу в /public — щоб onError не давав 404.
const IMG_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
       <rect width="96" height="96" fill="#F3F4F6"/>
       <path d="M28 64l14-18 12 14 6-7 12 13H22z" fill="#D1D5DB"/>
       <circle cx="60" cy="34" r="6" fill="#D1D5DB"/>
     </svg>`
  );

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

  // Детальний підрахунок: товари окремо від додатків + економія
  const { itemsCount, productsSum, addonsSum, addonsCount, savings, subtotal } = useMemo(() => {
    let itemsCount = 0, productsSum = 0, addonsSum = 0, addonsCount = 0, savings = 0;
    for (const i of cart) {
      const qty      = Math.max(1, Number(i.qty) || 0);
      const price    = Number(i.price) || 0;
      const oldPrice = Number(i.oldPrice) || 0;
      const addons   = Array.isArray(i.addons) ? i.addons : [];
      const lineAddons = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
      itemsCount  += qty;
      productsSum += price * qty;
      addonsSum   += lineAddons * qty;
      addonsCount += addons.length;
      if (oldPrice > price) savings += (oldPrice - price) * qty;
    }
    return { itemsCount, productsSum, addonsSum, addonsCount, savings, subtotal: productsSum + addonsSum };
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
          className="rounded-3xl border border-line bg-white p-6 sm:p-10 text-center shadow-sm"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-white shadow">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
              <path fill="currentColor" d="M7 4h-2l-1 2H1v2h2l3.6 7.59A2 2 0 0 0 8.4 17h7.2a2 2 0 0 0 1.8-1.14L21 8H6.42l-.94-2H7zM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
            </svg>
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-ink">Кошик порожній</h1>
          <p className="mt-2 text-ink-soft text-sm sm:text-base">
            Залетіли глянути топчики? Оберіть, що зайде.
          </p>
          {freeShippingFrom > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-trust text-xs sm:text-sm font-semibold ring-1 ring-green-200">
              <span>Безкоштовна доставка від {formatUAH(freeShippingFrom)}</span>
            </div>
          )}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <BackButton />
            <Link to="/" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-accent text-white font-display font-semibold hover:brightness-95 active:scale-[0.98] transition">
              <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-90" aria-hidden>
                <path fill="currentColor" d="M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h6v6h-6v-6Z"/>
              </svg>
              У каталог
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* ── Основний рендер ── */
  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6 pb-28 md:pb-24 lg:pb-10 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <BackButton />
      </div>

      {/* Банер безкоштовної доставки */}
      {freeShippingFrom > 0 && (
        <div className="mb-5 rounded-2xl border border-line bg-white p-4">
          {leftToFree > 0 ? (
            <p className="text-sm text-ink-soft mb-2">
              Додайте ще <span className="font-semibold text-ink">{formatUAH(leftToFree)}</span>, щоб отримати
              безкоштовну доставку від {formatUAH(freeShippingFrom)}.
            </p>
          ) : (
            <p className="text-sm text-trust mb-2 font-medium">
              Умови безкоштовної доставки виконані ✓
            </p>
          )}
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${freeProgress}%` }} aria-hidden />
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
                className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-line transition-shadow hover:shadow-md"
              >
                {/* Фото */}
                <div className="sm:self-start sm:mt-1">
                  <div className="w-full sm:w-24 md:w-28 aspect-square sm:aspect-square max-h-[200px] sm:max-h-none overflow-hidden rounded-xl bg-gray-50 relative shrink-0">
                    <img
                      src={sanityFmt(item.image, 240) || IMG_PLACEHOLDER}
                      alt={item.title}
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.currentTarget.src !== IMG_PLACEHOLDER) {
                          e.currentTarget.src = IMG_PLACEHOLDER;
                        }
                      }}
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
                  <h2 className="font-semibold text-ink leading-snug break-words">
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
                      {addons.map((addon) => {
                        const addonKey = addon.id || addon.name;
                        return (
                          <span
                            key={addonKey}
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface pl-1 pr-1 py-0.5 text-xs font-medium text-ink"
                          >
                            {addon.imageUrl && (
                              <img
                                src={sanityFmt(addon.imageUrl, 40)}
                                alt={addon.name}
                                className="w-5 h-5 rounded-full object-cover border border-white shrink-0"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <span className="pl-0.5">+ {addon.name}</span>
                            <span className="font-semibold ml-0.5 tabular-nums">{formatUAH(addon.price)}</span>
                            <button
                              type="button"
                              aria-label={`Видалити ${addon.name}`}
                              onClick={() => onRemoveAddon(cartItemId, addonKey)}
                              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 !text-white hover:bg-red-600 active:scale-95 transition shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Подарунок / попередження */}
                  {item.giftText && (
                    item.category === "pepper-sprays" ? (
                      // Для перцевих балончиків це не подарунок — це
                      // обов'язкова умова відправлення. Червоний акцент, без 🎁.
                      <p className="text-sm text-red-600 font-semibold leading-snug">
                        {item.giftText}
                      </p>
                    ) : (
                      <div className="text-sm text-trust font-medium flex items-center gap-1">
                        <span>🎁</span>
                        <span>{item.giftText}</span>
                      </div>
                    )
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
                    <div className="text-xs text-ink-soft mb-0.5">Разом:</div>
                    <div className="text-xl font-extrabold text-ink tabular-nums leading-none">
                      {formatUAH(line)}
                    </div>
                    {(qty > 1 || addons.length > 0) && (
                      <div className="text-xs text-ink-soft tabular-nums mt-1">
                        {qty > 1 && `${qty} × `}{formatUAH(unitTotal)}
                      </div>
                    )}
                  </div>

                  {/* Видалення з підтвердженням */}
                  {!armed ? (
                    <button
                      type="button"
                      onClick={() => setArmedId(cartItemId)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-white mt-2 sm:mt-5 h-10 px-3 text-sm text-ink-soft hover:border-ink hover:text-ink active:scale-95 transition whitespace-nowrap"
                    >
                    <span className="font-medium">Видалити</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5 w-30 h-15 sm:w-36 " >
                      <button
                        type="button"
                        onClick={() => { onRemove(cartItemId); setArmedId(null); }}
                        className="inline-flex items-center justify-center h-14 w-30 px-2 rounded-lg bg-red-600 !text-white text-xs font-semibold hover:bg-red-700 active:scale-95 transition"
                      >
                        Підтвердити
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmedId(null)}
                        className="inline-flex items-center justify-center h-14 w-30 px-2 rounded-lg bg-ink !text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition"
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
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-line shadow-lg sticky top-24">
            <h2 className="text-ink text-2xl text-center font-bold tracking-tight mb-4">Підсумок</h2>
            <Breakdown
              itemsCount={itemsCount}
              productsSum={productsSum}
              addonsSum={addonsSum}
              addonsCount={addonsCount}
              savings={savings}
              total={total}
            />
            <div className="my-3 h-px bg-line" />
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!itemsCount}
              className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-accent text-white font-display font-semibold uppercase tracking-wide hover:brightness-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition mt-4 shadow-sm"
            >
              Оформити замовлення
            </button>

            {/* Траст-блок */}
            <div className="mt-4 grid grid-cols-1 gap-1.5">
              {PERKS.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.text} className="flex h-11 items-center gap-2 rounded-xl bg-surface border border-line px-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-green-100 text-trust">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-ink-soft">{perk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔧 FIX: прибрали animate-pulse з навігаційного посилання */}
          <Link to="/" className="block mt-3 text-center text-sm text-ink-soft hover:text-accent hover:underline transition">
            ← Продовжити покупки
          </Link>
        </aside>
      </div>

      <div aria-live="polite" className="sr-only">Разом: {formatUAH(total)}</div>

      {/* ── Sticky мобільний footer ── */}
      {/* z-50 > z-40 FAB месенджерів: при розгортанні «Деталей» підсумок перекриває кнопку */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <div className="mx-auto max-w-2xl px-2 sm:px-4 pb-[max(env(safe-area-inset-bottom),10px)]">
          <div className="rounded-t-2xl border border-line bg-white shadow-2xl p-2 sm:p-3">

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
                  <div className="text-[10px] xs:text-[11px] text-ink-soft mt-0.5 line-clamp-1">
                    Ще {formatUAH(leftToFree)} до безкоштовної
                  </div>
                )}
                {freeShippingFrom > 0 && leftToFree === 0 && (
                  <div className="text-[10px] xs:text-[11px] text-trust mt-0.5">
                    Безкоштовна доставка ✓
                  </div>
                )}
              </div>

              {/* ── Кнопки ── */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileDetails((v) => !v)}
                  aria-label={mobileDetails ? "Сховати деталі" : "Показати деталі"}
                  className="
                    inline-flex items-center justify-center
                    h-14 sm:h-16
                    px-4 sm:px-6
                    rounded-xl bg-white border border-line !text-ink
                    text-base sm:text-lg font-semibold
                    hover:bg-surface active:scale-95
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
                    h-14 sm:h-16
                    px-5 sm:px-8
                    rounded-xl bg-accent !text-white
                    text-base sm:text-lg font-bold uppercase tracking-wide
                    hover:brightness-95 active:scale-[0.98] disabled:opacity-50
                    transition shrink-0 shadow-lg
                  "
                >
                  Купити
                </button>
              </div>
            </div>

            {/* Розгортаємий підсумок */}
            {mobileDetails && (
              <div className="mt-3 pt-3 border-t border-line">
                <Breakdown
                  itemsCount={itemsCount}
                  productsSum={productsSum}
                  addonsSum={addonsSum}
                  addonsCount={addonsCount}
                  savings={savings}
                  total={total}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {showForm && (
        <Suspense fallback={null}>
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
        </Suspense>
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
      className="inline-flex items-center justify-center gap-1.5 h-12 sm:h-13 px-5 sm:px-6 rounded-xl bg-white text-ink border border-line text-base font-semibold shadow-sm hover:bg-surface hover:border-ink active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition"
      aria-label="Назад"
    >
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      Назад
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
    <div className="inline-flex items-center gap-1.5 sm:gap-2 select-none">
      <button
        type="button"
        aria-label="Зменшити кількість"
        disabled={pending || value <= min}
        onClick={() => commit((value || min) - 1)}
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-ink !text-white text-lg font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        className="w-12 sm:w-14 h-10 sm:h-11 text-center rounded-xl border-2 border-line bg-white text-ink tabular-nums font-semibold text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
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
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-ink !text-white text-lg font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        +
      </button>
    </div>
  );
}

// Детальний підсумок: товари / додатки / економія / разом
function Breakdown({ itemsCount, productsSum, addonsSum, addonsCount, savings, total }) {
  return (
    <div className="space-y-2 text-[15px]">
      <Row label="Товарів" value={`${itemsCount} шт.`} />
      <Row label="Вартість товарів" value={formatUAH(productsSum)} />
      {addonsCount > 0 ? (
        <Row label={`Додатки (${addonsCount})`} value={`+ ${formatUAH(addonsSum)}`} />
      ) : (
        <Row label="Додатки" value="Немає" valueClass="text-ink-soft" />
      )}
      {savings > 0 && (
        <Row label="Ви заощадили" value={`−${formatUAH(savings)}`} valueClass="text-trust" />
      )}
      <div className="pt-2 border-t border-line">
        <Row label="Разом до сплати" value={formatUAH(total)} strong valueClass="text-red-600" />
      </div>
    </div>
  );
}

function Row({ label, value, strong = false, valueClass = "text-ink" }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${strong ? "font-semibold text-base" : "text-sm"}`}>
      <span className="text-ink-soft">{label}</span>
      <span className={`tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}