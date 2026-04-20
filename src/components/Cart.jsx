// src/components/Cart.jsx
import { useCallback, useEffect, useId, useMemo, useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalBuy from "./ModalBuy";
import { ShieldCheck, RotateCcw, CreditCard, Truck } from "lucide-react";

/* helpers */
const fmtUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Math.max(0, Number(n) || 0)) + " ₴";
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export default function Cart({
  cart = [],
  refreshPrices,
  changeQty,
  removeFromCart,
  freeShippingFrom = 0,
}) {
  const [isPending, startTransition] = useTransition();
  const [armedId, setArmedId] = useState(null);

  const [mobileDetails, setMobileDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const perks = [
    { icon: ShieldCheck, text: "12 міс гарантія" },
    { icon: RotateCcw,  text: "14 днів повернення" },
    { icon: CreditCard, text: "Оплата при отриманні" },
    { icon: Truck,      text: "Швидка доставка" },
  ];

  /* refresh prices */
  useEffect(() => {
    refreshPrices?.();
  }, [refreshPrices]);

  /* auto-unarm delete button */
  useEffect(() => {
    if (!armedId) return;
    const t = setTimeout(() => setArmedId(null), 3000);
    return () => clearTimeout(t);
  }, [armedId]);

  /* totals */
  const { itemsCount, subtotal } = useMemo(() => {
    const itemsCount = cart.reduce((n, i) => n + Math.max(1, Number(i.qty) || 0), 0);
    const subtotal = cart.reduce((s, i) => {
      const qty = Math.max(1, Number(i.qty) || 0);
      // 🆕 unitTotal = price + addonsTotal (збережено в addToCart)
      // Якщо unitTotal є — використовуємо його, інакше fallback на price
      const unitPrice = Number(i.unitTotal) || Number(i.price) || 0;
      return s + unitPrice * qty;
    }, 0);
    return { itemsCount, subtotal };
  }, [cart]);

  /* без промокодів => знижка 0 */
  const discount = 0;

  const total = Math.max(0, subtotal - discount);
  const leftToFree = Math.max(0, (freeShippingFrom || 0) - subtotal);
  const freeProgress = freeShippingFrom
    ? Math.min(100, Math.round((subtotal / freeShippingFrom) * 100))
    : 0;

  /* actions */
  const onQtyChange = useCallback(
    (id, nextQty) => {
      startTransition(() => {
        changeQty?.(id, nextQty);
      });
    },
    [changeQty, startTransition]
  );

  const onRemove = useCallback(
    (id) => {
      startTransition(() => {
        removeFromCart?.(id);
      });
    },
    [removeFromCart, startTransition]
  );

  const handleCheckout = useCallback(() => setShowForm(true), []);

  /* empty cart */
  if (!cart.length) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <section
          role="status"
          aria-live="polite"
          className="rounded-3xl border bg-white p-6 sm:p-10 text-center shadow-sm"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 4h-2l-1 2H1v2h2l3.6 7.59A2 2 0 0 0 8.4 17h7.2a2 2 0 0 0 1.8-1.14L21 8H6.42l-.94-2H7zM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold">Кошик порожній</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Залетіли глянути топчики? Оберіть, що зайде.
          </p>

          {freeShippingFrom > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 text-xs sm:text-sm font-semibold ring-1 ring-emerald-200">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M13.5 2.5s.5 2.5-1.5 4.5c-1.3 1.3-2 2.7-2 4.2A4 4 0 0 0 14 15c0-1.7-.8-2.9-.3-4.4.7-2.1 3.3-3 3.3-3s.5 1.4.5 3.1c0 4.6-3.3 8.7-7.5 8.7S3 15.9 3 12.2c0-3.6 2.6-6.8 6.1-8.2-.2.9-.3 2 .9 3.2 1.4-1 2.3-2.8 3.5-4.7z"
                />
              </svg>
              <span>Безкоштовна доставка від {fmtUAH(freeShippingFrom)}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <BackButton />

            <Link
              to="/"
              className="group relative h-12 px-6 rounded-2xl font-semibold focus:outline-none active:scale-[0.98] transition"
            >
              <span
                aria-hidden
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 blur-lg opacity-60 group-hover:opacity-80 transition"
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -left-10 top-0 h-full w-10 rotate-12 bg-white/25 opacity-0 group-hover:opacity-100 group-hover:translate-x-[140%] transition-transform duration-700 ease-out"
              />

              <span className="relative z-10 flex mt-3 items-center justify-center gap-2 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-90" aria-hidden="true">
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

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-5 pt-6 pb-28 md:pb-24 lg:pb-10 overflow-x-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <BackButton />
      </div>

      {/* Free shipping banner */}
      {freeShippingFrom > 0 && (
        <div className="mb-5 rounded-2xl border bg-white p-4">
          {leftToFree > 0 ? (
            <p className="text-sm text-gray-700 mb-2">
              Додайте ще <span className="font-semibold">{fmtUAH(leftToFree)}</span>, щоб отримати
              безкоштовну доставку від {fmtUAH(freeShippingFrom)}.
            </p>
          ) : (
            <p className="text-sm text-emerald-700 mb-2 font-medium">
              Умови безкоштовної доставки виконані.
            </p>
          )}
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-[width] duration-500"
              style={{ width: `${freeProgress}%` }}
              aria-hidden
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
        {/* items */}
        <section className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const qty = clamp(Number(item.qty) || 1, 1, 99);
            const price = Number(item.price) || 0;
            const oldPrice = Number(item.oldPrice) || 0;
            const saving = oldPrice > price ? oldPrice - price : 0;
            const low = Number(item.stock) > 0 && Number(item.stock) <= 5;
            // 🆕 рядок = unitTotal (ціна з addons) × qty
            const unitPrice = Number(item.unitTotal) || price;
            // const line = unitPrice * qty;
            // 🆕 armed по cartItemId (унікальний), а не item.id (може дублюватись)
            const armed = armedId === item.cartItemId;
            // 🆕 вибрані addons (можуть бути відсутні у старих позиціях)
            const addons = Array.isArray(item.addons) ? item.addons : [];

            return (
              <article
                // 🆕 key по cartItemId — гарантовано унікальний
                key={item.cartItemId || item.id}
                className="flex flex-col sm:flex-row sm:items-stretch gap-4 p-4 bg-white rounded-2xl border"
              >
                <div className="sm:self-center">
                  <div className="w-full sm:w-22 md:w-30 lg:w-38 aspect-square overflow-hidden rounded-xl bg-gray-50 relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                    {low && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5">
                        Залишилось {item.stock}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 line-clamp-2 break-words">
                    {item.title}
                  </h2>
                  {item.attrs && (
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{item.attrs}</p>
                  )}

                  {/* 🆕 Список addons під назвою товару */}
                  {addons.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {addons.map((addon) => (
                        <span
                          key={addon.id}
                          className="inline items-center gap-6 rounded-full border border-blue-100 bg-blue-50 px-1 py-1 text-xs font-medium text-black"
                        >
                          + {addon.name} 
                        </span>
                      ))}
                    </div>
                  )}

                  {item.giftText && (
                    <div className="mt-1 text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <span className="animate-pulse">🎁</span>
                      <span>{item.giftText}</span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-red-600 font-extrabold text-xl sm:text-xl md:text-3xl lg:text-4xl tabular-nums">
                      {/* 🆕 показуємо unitPrice (з addons), а не лише базову ціну */}
                      {fmtUAH(unitPrice)}
                    </div>

                    {saving > 0 && oldPrice > 0 && (
                      <>
                        <div className="text-lg text-gray-500 line-through">{fmtUAH(oldPrice)}</div>
                          <span className="inline-flex items-center rounded-full bg-rose-100 text-text-sm font-bold px-2.5 py-1">
                            −{Math.round((saving / oldPrice) * 100)}%
                          </span>
                      </>
                      
                    )}
                    <div className="mt-3 sm:mt-0 inline-flex items-center gap-2 ml-auto">
                    <label htmlFor={`qty-${item.cartItemId || item.id}`} className="sr-only">
                      Кількість для {item.title}
                    </label>
                    <Qty
                      id={`qty-${item.cartItemId || item.id}`}
                      value={qty}
                      min={1}
                      max={99}
                      // 🆕 передаємо cartItemId, а не item.id
                      onChange={(next) => onQtyChange(item.cartItemId || item.id, next)}
                      pending={isPending}
                    />
                  </div>
                  </div>
                </div>

                <div className="sm:w-48 sm:flex sm:flex-col sm:items-end sm:justify-end  ml-auto">
                  {/* <div className="sm:text-right">
                    <div className="text-xs text-gray-500">Разом:</div>
                    <div className="text-lg font-extrabold text-gray-900 tabular-nums">
                      {fmtUAH(line)}
                    </div>
                  </div> */}
                    
                  {!armed ? (
                    <button
                      type="button"
                      // 🆕 armedId ← cartItemId
                      onClick={() => setArmedId(item.cartItemId || item.id)}
                      className="mt-3 sm:mt-0 inline-flex items-center justify-center gap-1 rounded-2xl bg-black px-3.5 py-2 text-red-500 hover:bg-gray-700"
                    >
                      🗑️ <span className="font-semibold">Видалити</span>
                    </button>
                  ) : (
                    <div className="mt-3 sm:mt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // 🆕 передаємо cartItemId
                          onRemove(item.cartItemId || item.id);
                          setArmedId(null);
                        }}
                        className="inline-flex items-center justify-center px-3 h-9 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Підтвердити
                      </button>
                      <button
                        type="button"
                        onClick={() => setArmedId(null)}
                        className="inline-flex items-center justify-center px-3 h-9 rounded-xl border text-sm hover:bg-gray-50"
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

        {/* sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="p-5 sm:p-6 bg-white/95 backdrop-blur rounded-2xl border shadow-xl ring-1 ring-slate-200 sticky top-24">
            <h2 className="text-lg text-center text-black sm:text-xl font-bold tracking-tight mb-4">Підсумок</h2>

            <Breakdown
              itemsCount={itemsCount}
              subtotal={subtotal}
              discount={discount}
              total={total}
            />

            <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!itemsCount}
              className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition mt-4 shadow-lg"
            >
              Оформити замовлення
            </button>

            {/* Траст-блок */}
            <div className="mt-3">
            <div className="grid grid-cols-1">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.text}
                    className="flex h-12 w-full items-center justify-start mt-1.5 gap-2
                              rounded-2xl bg-white/90 ring-1 ring-black/5 text-center"
                  >
                    <span className="grid h-8 w-8 place-items-center ml-5 rounded-xl
                                    bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-gray-900">{perk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

            <Link to="/" className="block mt-3 text-center text-sm text-black hover:underline animate-pulse">
              ← Продовжити покупки
            </Link>
          </div>
        </aside>
      </div>

      <div aria-live="polite" className="sr-only">
        Разом: {fmtUAH(total)}
      </div>

      {/* STICKY MOBILE FOOTER */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 pb-[max(env(safe-area-inset-bottom),10px)]">
          <div className="rounded-t-xl sm:rounded-t-2xl border bg-white shadow-2xl p-2.5 sm:p-3">
            <div className="flex items-center justify-between gap-2 max-[360px]:flex-col max-[360px]:items-stretch">
              {/* Ціна */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-1 text-red-600 font-extrabold tabular-nums whitespace-nowrap overflow-hidden">
                  {(() => {
                    const f = fmtUAH(total);
                    const amount = f.replace(/\s*₴$/, "");
                    return (
                      <>
                        <span className="leading-none text-[clamp(18px,8vw,28px)]">{amount}</span>
                        <span className="leading-none opacity-80 text-[clamp(16px,3.5vw,16px)]">₴</span>
                      </>
                    );
                  })()}
                </div>

                {freeShippingFrom > 0 && (
                  leftToFree > 0 ? (
                    <div className="text-[11px] sm:text-[12px] text-gray-600 mt-0.5">
                      Додайте ще {fmtUAH(leftToFree)} до безкоштовної доставки
                    </div>
                  ) : (
                    <div className="text-[11px] sm:text-[12px] text-emerald-700 mt-0.5">
                      Безкоштовна доставка активна
                    </div>
                  )
                )}
              </div>

              {/* Кнопки */}
              <div className="flex items-center gap-2 max-[360px]:w-full max-[360px]:justify-between">
                <button
                  type="button"
                  onClick={() => setMobileDetails((v) => !v)}
                  className="inline-flex items-center justify-center h-10 sm:h-11 px-3 rounded-xl border text-sm hover:bg-gray-50 shrink-0"
                >
                  Деталі
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!itemsCount}
                  className="inline-flex items-center justify-center h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-black text-white font-semibold active:scale-[0.98] disabled:opacity-50 transition shrink-0 min-w-[110px]"
                >
                  Оформити
                </button>
              </div>
            </div>

            {mobileDetails && (
              <div className="mt-3 text-xs sm:text-sm text-gray-800 space-y-1">
                <div className="flex justify-between">
                  <span>Товарів</span>
                  <span className="tabular-nums">{itemsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Разом</span>
                  <span className="tabular-nums font-semibold">{fmtUAH(total)}</span>
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
        />
      )}
    </main>
  );
}

/* subcomponents */

function BackButton() {
  const nav = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? nav(-1) : nav("/"))}
      className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-2xl border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      aria-label="Назад"
    >
      ← Назад
    </button>
  );
}

function Qty({ id, value, onChange, min = 1, max = 99, pending = false }) {
  const autoId = useId();
  const inputId = id || `qty-${autoId}`;
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
    <div className="flex items-center gap-2 select-none">
      <button
        type="button"
        aria-label="Зменшити кількість"
        disabled={pending || value <= min}
        onClick={() => commit((value || min) - 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black !text-red-500 md:hover:bg-black/90 active:scale-[0.98] disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
      >
        −
      </button>

      <input
        id={inputId}
        name={inputId}
        inputMode="numeric"
        min={min}
        max={max}
        className="w-16 h-10 text-center rounded-2xl border-2 border-slate-300 bg-white text-slate-900 tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={() => commit(draft)}
        disabled={pending}
        aria-describedby={`${inputId}-hint`}
      />
      <span id={`${inputId}-hint`} className="sr-only">
        Введіть кількість від {min} до {max}
      </span>

      <button
        type="button"
        aria-label="Збільшити кількість"
        disabled={pending || value >= max}
        onClick={() => commit((value || min) + 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black !text-green-500 md:hover:bg-black/90 active:scale-[0.98] disabled:opacity-40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
      >
        +
      </button>
    </div>
  );
}

function Breakdown({ itemsCount, subtotal, discount, total }) {
  return (
    <div className="mb-4 text-[15px]">
      <Row label="Товарів" value={String(itemsCount)} />
      <Row label="Сума товарів" value={fmtUAH(subtotal)} />
      {discount > 0 && <Row label="Знижка" value={`−${fmtUAH(discount)}`} accent="text-emerald-700" />}
      <Row strong label="Разом" value={fmtUAH(total)} />
    </div>
  );
}

function Row({ label, value, strong = false, accent = "text-gray-700" }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-semibold text-lg" : ""}`}>
      <span className={accent}>{label}</span>
      <span className="tabular-nums text-black">{value}</span>
    </div>
  );
}