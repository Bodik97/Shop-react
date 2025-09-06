// src/components/Cart.jsx
import { useCallback, useEffect, useId, useMemo, useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalBuy from "./ModalBuy";

/* helpers */
const fmtUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Math.max(0, Number(n) || 0)) + " ₴";
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export default function Cart({
  cart = [],
  refreshPrices,
  changeQty,
  removeFromCart,
  checkout,
  freeShippingFrom = 0,
  shippingOptions,
}) {
  const [isPending, startTransition] = useTransition();
  const [armedId, setArmedId] = useState(null);

  const [shipId, setShipId] = useState(() => shippingOptions?.[0]?.id ?? "pickup");

  const [mobileDetails, setMobileDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    const subtotal = cart.reduce(
      (s, p) => s + (Number(p.price) || 0) * Math.max(1, Number(p.qty) || 0),
      0
    );
    return { itemsCount, subtotal };
  }, [cart]);

  /* shipping options (memo) */
  const options = useMemo(
    () =>
      shippingOptions?.length
        ? shippingOptions
        : [
            { id: "pickup", label: "Самовивіз", price: 0 },
            { id: "post", label: "Поштомат / Відділення", price: 70 },
            { id: "courier", label: "Кур'єр", price: 100 },
          ],
    [shippingOptions]
  );

  /* keep shipId valid if options change */
  useEffect(() => {
    if (!options.length) return;
    if (!options.some((o) => o.id === shipId)) {
      setShipId(options[0].id);
    }
  }, [options, shipId]);

  const currentShip = options.find((o) => o.id === shipId) || options[0];
  const shipping =
    subtotal >= freeShippingFrom && freeShippingFrom > 0 ? 0 : Number(currentShip?.price || 0);

  /* без промокодів => знижка 0 */
  const discount = 0;

  const total = Math.max(0, subtotal - discount + shipping);
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
              {/* glow */}
              <span
                aria-hidden
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 blur-lg opacity-60 group-hover:opacity-80 transition"
              />
              {/* fill */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
              />
              {/* shine */}
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
            const line = price * qty;
            const armed = armedId === item.id;

            return (
              <article
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-stretch gap-4 p-4 bg-white rounded-2xl border"
              >
                <div className="sm:self-center">
                  <div className="w-16 sm:w-20 aspect-square overflow-hidden rounded-xl bg-gray-50 relative">
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
                      <span className="absolute left-1 top-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-1.5 py-0.5">
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

                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-blue-700 font-bold tabular-nums">{fmtUAH(price)}</div>
                    {saving > 0 && oldPrice > 0 && (
                      <>
                        <div className="text-sm text-gray-500 line-through">{fmtUAH(oldPrice)}</div>
                        <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5">
                          −{Math.round((saving / oldPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-3">
                    <label htmlFor={`qty-${item.id}`} className="sr-only">
                      Кількість для {item.title}
                    </label>
                    <Qty
                      id={`qty-${item.id}`}
                      value={qty}
                      min={1}
                      max={99}
                      onChange={(next) => onQtyChange(item.id, next)}
                      pending={isPending}
                    />
                  </div>
                </div>

                <div className="sm:w-48 sm:flex sm:flex-col sm:items-end sm:justify-between">
                  <div className="sm:text-right">
                    <div className="text-xs text-gray-500">Разом:</div>
                    <div className="text-lg font-extrabold text-gray-900 tabular-nums">
                      {fmtUAH(line)}
                    </div>
                  </div>

                  {!armed ? (
                    <button
                      type="button"
                      onClick={() => setArmedId(item.id)}
                      className="mt-3 sm:mt-0 inline-flex items-center justify-center gap-1 rounded-2xl bg-black px-3.5 py-2 text-red-500 hover:bg-black/90"
                    >
                      🗑️ <span className="font-semibold">Видалити</span>
                    </button>
                  ) : (
                    <div className="mt-3 sm:mt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onRemove(item.id);
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
          <div className="p-6 bg-white rounded-2xl border sticky top-24">
            <h2 className="text-xl font-bold mb-4">Підсумок</h2>

            <Breakdown
              itemsCount={itemsCount}
              subtotal={subtotal}
              discount={discount}
              shipping={shipping}
              total={total}
            />

            <Shipping
              options={options}
              value={shipId}
              onChange={setShipId}
              freeShippingFrom={freeShippingFrom}
              subtotal={subtotal}
            />

            <button
              type="button"
              onClick={handleCheckout}
              disabled={!itemsCount}
              className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
            >
              Оформити замовлення
            </button>

            {/* Траст-блок */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-gray-100">🛡️</span>
                12 міс гарантія
              </div>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-gray-100">↩️</span>
                14 днів повернення
              </div>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-gray-100">💳</span>
                Оплата при отриманні
              </div>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-gray-100">🚚</span>
                Швидка доставка
              </div>
            </div>

            <Link to="/" className="block mt-3 text-center text-sm text-gray-600 hover:underline">
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
        <div className="mx-auto max-w-6xl px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="rounded-t-2xl border bg-white shadow-2xl p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-blue-700 tabular-nums">
                  {fmtUAH(total)}
                </div>
                {freeShippingFrom > 0 && (
                  <>
                    {leftToFree > 0 ? (
                      <div className="text-[12px] text-gray-600">
                        Додайте ще {fmtUAH(leftToFree)} до безкоштовної доставки
                      </div>
                    ) : (
                      <div className="text-[12px] text-emerald-700">Безкоштовна доставка активна</div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDetails((v) => !v)}
                  className="inline-flex items-center justify-center h-11 px-3 rounded-2xl border hover:bg-gray-50"
                >
                  Деталі
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!itemsCount}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-black text-white font-semibold md:hover:bg-black/90 active:scale-[0.98] disabled:opacity-50 transition"
                >
                  Оформити
                </button>
              </div>
            </div>

            {mobileDetails && (
              <div className="mt-3 text-sm text-gray-800 space-y-1">
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span className="font-medium">{currentShip.label}</span>
                </div>
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
          shipping={shipping}
          discount={discount}
          total={total}
          onClose={() => setShowForm(false)}
          onSubmit={(payload) => {
            checkout?.(payload);
            setShowForm(false);
          }}
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

function Shipping({ options, value, onChange, freeShippingFrom, subtotal }) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-gray-700 mb-2">Доставка</legend>
      <div className="space-y-2">
        {options.map((o) => {
          const free = subtotal >= freeShippingFrom && freeShippingFrom > 0;
          const price = free ? 0 : o.price;
          const id = `ship-${o.id}`;
          const active = value === o.id;
          return (
            <label
              key={o.id}
              htmlFor={id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer ${
                active ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  id={id}
                  name="shipping"
                  type="radio"
                  checked={active}
                  onChange={() => onChange(o.id)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span>{o.label}</span>
              </span>
              <span className="tabular-nums text-gray-900">{price ? fmtUAH(price) : "0 ₴"}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Breakdown({ itemsCount, subtotal, discount, shipping, total }) {
  return (
    <div className="mb-4 text-[15px]">
      <Row label="Товарів" value={String(itemsCount)} />
      <Row label="Сума товарів" value={fmtUAH(subtotal)} />
      {discount > 0 && <Row label="Знижка" value={`−${fmtUAH(discount)}`} accent="text-emerald-700" />}
      <Row label="Доставка" value={fmtUAH(shipping)} />
      <Row strong label="Разом" value={fmtUAH(total)} />
    </div>
  );
}

function Row({ label, value, strong = false, accent = "text-gray-700" }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-semibold text-lg" : ""}`}>
      <span className={accent}>{label}</span>
      <span className="tabular-nums text-gray-900">{value}</span>
    </div>
  );
}
