// src/components/ModalBuy.jsx
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "/api/order";

/** Формат UAH */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function ModalBuy({
  open,
  product,
  cart = [],
  subtotal = 0,
  shipping = 0,
  discount = 0,
  total = 0,
  onClose,
  onSuccess,  // викликається після успішного замовлення
}) {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [qty, setQty] = useState(1);
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const closeBtnRef = useRef(null);

  const isCart = Array.isArray(cart) && cart.length > 0;
  const price = Number(product?.price || 0);

  // 🆕 addons товару для режиму "Купити зараз"
  const productAddons = Array.isArray(product?.addons) ? product.addons : [];
  const productAddonsTotal = productAddons.reduce(
    (s, a) => s + (Number(a.price) || 0), 0
  );
  const unitPrice = price + productAddonsTotal;

  // 🆕 singleTotal тепер включає addons
  const singleTotal = useMemo(
    () => unitPrice * Math.max(1, Number(qty) || 1),
    [unitPrice, qty]
  );
  const cartComputed = useMemo(
    () => Math.max(0, (Number(subtotal) || 0) - (Number(discount) || 0) + (Number(shipping) || 0)),
    [subtotal, discount, shipping]
  );
  const displayTotal = isCart ? (Number(total) || cartComputed) : singleTotal;

  // простий генератор номера замовлення
  const genOrderId = () => "ORD-" + Date.now().toString(36).toUpperCase();

  // ids
  const uid = useId();
  const nameId = `name-${uid}`;
  const phoneId = `phone-${uid}`;
  const agreeId = `agree-${uid}`;

  // open/reset
  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("+380");
    setQty(1);
    setAgree(true);
    setErrors({});
    setSending(false);

    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    document.documentElement.classList.add("overflow-hidden", "overscroll-none");
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("overflow-hidden", "overscroll-none");
    };
  }, [open, product?.id]);

  // esc close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // валідація
  function validateLocal() {
    const err = {};
    if (!name.trim() || name.trim().length < 2) err.name = "Вкажіть ім'я";
    if (!/^\+380\d{9}$/.test(phone)) err.phone = "Формат: +380XXXXXXXXX";
    if (!agree) err.agree = "Потрібна згода на обробку даних";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // складання замовлення
  function buildOrderPayload() {
    if (isCart) {
      const items = cart.map((i) => {
        const q           = Math.max(1, Number(i.qty) || 1);
        const p           = Number(i.price) || 0;
        const op          = Number(i.oldPrice) || 0;
        const addons      = Array.isArray(i.addons) ? i.addons : [];
        const addonsTotal = Number(i.addonsTotal) || 0;
        const ut          = Number(i.unitTotal) || p;
        return {
          id: i.id,
          title: i.title,
          qty: q,
          price: p,
          oldPrice: op,                              // ← нове
          savings: op > p ? (op - p) * q : 0,        // ← економія за позицію
          addons,
          addonsTotal,
          unitTotal: ut,
          lineTotal: ut * q,
          giftText: i.giftText?.text || i.giftText || null,
        };
      });

      // Загальна економія
      const totalSavings = items.reduce((s, it) => s + (it.savings || 0), 0);

      return {
        items,
        subtotal,
        discount,
        shipping: shipping || 0,
        total: displayTotal,
        totalSavings,                                // ← нове
        mode: "cart",
      };
    }

    // режим "Купити зараз"
    const q       = Math.max(1, Number(qty) || 1);
    const op      = Number(product?.oldPrice) || 0;
    const savings = op > price ? (op - price) * q : 0;

    return {
      items: [{
        id: product?.id,
        title: product?.title,
        qty: q,
        price,
        oldPrice: op,                                // ← нове
        savings,                                     // ← нове
        addons: productAddons,
        addonsTotal: productAddonsTotal,
        unitTotal: unitPrice,
        lineTotal: unitPrice * q,
        giftText: product?.giftText?.text || product?.giftText || null,
      }],
      subtotal: unitPrice * q,
      discount: 0,
      shipping: shipping || 0,
      total: displayTotal,
      totalSavings: savings,                         // ← нове
      mode: "single",
    };
  }

  // submit
  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!validateLocal()) return;
    setSending(true);

    const orderId = genOrderId();

    const payload = {
      orderId,
      name: name.trim(),
      phone: phone.trim(),
      order: buildOrderPayload(),
      createdAt: new Date().toISOString(),
    };

    try {
      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok !== true) {
        throw new Error(data?.error || "Помилка відправки");
      }

      // 🆕 легкі копії items для ThankYou (чек)
      const summaryItems = isCart
        ? cart.map((i) => ({
            id: i.id,
            title: i.title,
            qty: Math.max(1, Number(i.qty) || 1),
            price: Number(i.price) || 0,
            unitTotal: Number(i.unitTotal) || Number(i.price) || 0,
            addons: Array.isArray(i.addons) ? i.addons : [],
            giftText: i.giftText?.text || i.giftText || null,
          }))
        : [{
            id: product?.id,
            title: product?.title,
            qty: Math.max(1, Number(qty) || 1),
            price: Number(price) || 0,
            unitTotal: unitPrice,
            addons: productAddons,
            giftText: product?.giftText?.text || product?.giftText || null,
          }];

      const summary = {
        orderId,
        itemsCount: isCart ? cart?.length || 1 : Math.max(1, Number(qty) || 1),
        total: displayTotal,
        name,
        phone,
        items: summaryItems, // 🆕 для "чека" на ThankYou
      };
      localStorage.setItem("lastOrderSummary", JSON.stringify(summary));

      // Зберігаємо в історію замовлень
      try {
        const prev    = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        const updated = [summary, ...prev].slice(0, 50);
        localStorage.setItem("orderHistory", JSON.stringify(updated));
      } catch {/* ignore */}

      onSuccess ? onSuccess() : onClose?.();
      navigate("/thanks", { state: summary });
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || "Щось пішло не так" }));
    } finally {
      setSending(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // РЕНДЕР
  // ──────────────────────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-title"
    >
      {/* Backdrop — клік закриває */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !sending && onClose?.()}
      />

      {/* Контейнер модалки */}
      <div className="
        relative z-10
        w-full max-w-[min(720px,100vw)]
        mx-0 sm:mx-4
        bg-white
        rounded-t-3xl sm:rounded-3xl
        shadow-2xl border
        flex flex-col
        max-h-[92dvh] sm:max-h-[88dvh]
        overflow-hidden
      ">

        {/* ── Хедер (sticky) ── */}
        <div className="
          flex-shrink-0
          flex items-center justify-between gap-2
          px-4 py-3 sm:px-6 sm:py-4
          bg-white border-b
        ">
          <div className="min-w-0 flex-1">
            <h2
              id="buy-title"
              className="text-base sm:text-xl font-bold text-gray-900 leading-snug"
            >
              {isCart ? "Оформлення замовлення" : "Швидка покупка"}
            </h2>
            <p className="mt-0.5 text-gray-500 text-xs sm:text-sm line-clamp-1">
              {isCart ? "Кошик" : product?.title || "—"}
            </p>
          </div>

          {/* Кнопка X — завжди видима, великий tap target */}
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Закрити"
            onClick={() => !sending && onClose?.()}
            disabled={sending}
            className="
              flex-shrink-0
              inline-flex items-center justify-center
              h-11 w-11
              rounded-xl border border-gray-200
              text-white text-lg
              hover:bg-gray-100 active:scale-95
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
              disabled:opacity-40
              transition
            "
          >
            ✕
          </button>
        </div>

        {/* ── Тіло форми (scrollable) ── */}
        <form
          onSubmit={submit}
          noValidate
          autoComplete="on"
          aria-busy={sending}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Скролюється тільки цей блок */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5">

            {/* Прев'ю одного товару */}
            {!isCart && product && (
              <div className="flex items-start gap-3">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border shrink-0"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                    {product.title}
                  </div>
                  {product.giftText?.text && (
                    <div className="text-xs text-emerald-700 flex items-center gap-1">
                      🎁 {product.giftText.text}
                    </div>
                  )}
                  <div className="space-y-0.5 pt-1">
                    <div className="flex justify-between items-center text-xs text-gray-500 gap-2">
                    <span>Товар</span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {Number(product?.oldPrice) > price && (
                        <>
                          <span className="text-[11px] text-gray-400 line-through tabular-nums">
                            {formatUAH(product.oldPrice)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-red-600 text-white text-[10px] font-extrabold tabular-nums px-1.5 py-0.5">
                            −{Math.round((1 - price / product.oldPrice) * 100)}%
                          </span>
                        </>
                      )}
                      <span className="font-semibold text-gray-800 tabular-nums">
                        {formatUAH(price)}
                      </span>
                    </div>
                  </div>
                    {productAddons.map((a) => (
                      <div key={a.id} className="flex justify-between text-xs">
                        <span className="text-blue-600 truncate">+ {a.name}</span>
                        <span className="font-semibold text-blue-700 tabular-nums shrink-0 ml-2">{formatUAH(a.price)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-gray-200">
                      <span className="text-gray-700">Разом</span>
                      <span className="text-red-600 tabular-nums">{formatUAH(displayTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Лічильник кількості — тільки для одиночного товару */}
            {!isCart && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border p-3">
                <span className="text-sm font-medium text-gray-700">Кількість</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1 || sending}
                    className="flex justify-center items-center h-9 w-9 rounded-xl bg-gray-100 font-bold text-lg hover:bg-gray-200 active:scale-95 disabled:opacity-40 transition"
                  >−</button>
                  <span className="text-black w-8 text-center font-semibold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(99, q + 1))}
                    disabled={qty >= 99 || sending}
                    className="flex justify-center items-center h-9 w-9 rounded-xl bg-gray-100 font-bold text-lg hover:bg-gray-200 active:scale-95 disabled:opacity-40 transition"
                  >+</button>
                </div>
              </div>
            )}

            {/* Список товарів кошика */}
            {isCart && (
              <section aria-label="Товари">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Товари ({cart.length})
                </h3>
                <div className="space-y-3 rounded-2xl border p-3">
                  {cart.map((i) => {
                    const q         = Math.max(1, Number(i.qty) || 1);
                    const basePrice = Number(i.price) || 0;          // ціна за 1 штуку
                    const baseLine  = basePrice * q;
                    const addons    = Array.isArray(i.addons) ? i.addons : [];
                    const unitTotal = Number(i.unitTotal) || Number(i.price) || 0;
                    const lineTotal = unitTotal * q;

                    return (
                      <div key={i.cartItemId || i.id} className="flex gap-3">
                        <img
                          src={i.image}
                          alt={i.title}
                          className="w-12 h-12 rounded-lg object-cover border shrink-0"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex justify-between gap-3 text-sm">
                          <span className="font-medium text-gray-800 leading-snug line-clamp-2">
                            {i.title}{q > 1 && <span className="text-gray-400 font-normal"> × {q}</span>}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            {Number(i.oldPrice) > basePrice && (
                              <>
                                <span className="text-[11px] text-gray-400 line-through tabular-nums">
                                  {formatUAH(i.oldPrice)}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-red-600 text-white text-[10px] font-extrabold tabular-nums px-1.5 py-0.5">
                                  −{Math.round((1 - basePrice / i.oldPrice) * 100)}%
                                </span>
                              </>
                            )}
                            <span className="tabular-nums text-gray-800 font-semibold">
                              {formatUAH(baseLine)}
                            </span>
                          </div>
                        </div>
                          {addons.map((a) => (
                            <div key={a.id} className="flex justify-between gap-2">
                              <span className="text-xs text-blue-600 truncate">+ {a.name}</span>
                              <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">{formatUAH(a.price)}</span>
                            </div>
                          ))}
                          {i.giftText && (
                            <div className="text-xs text-emerald-700">🎁 {i.giftText}</div>
                          )}
                          {(addons.length > 0 || q > 1) && (
                            <div className="flex justify-between gap-2 pt-1 border-t border-dashed border-gray-200">
                              <span className="text-xs text-gray-400">
                                {q > 1 ? `${q} × ${formatUAH(unitTotal)}` : "Разом:"}
                              </span>
                              <span className="text-xs font-bold text-gray-800 tabular-nums shrink-0">{formatUAH(lineTotal)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Сума товарів</span>
                      <span className="tabular-nums">{formatUAH(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-700">
                        <span>Знижка</span>
                        <span className="tabular-nums">−{formatUAH(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t">
                      <span>Разом</span>
                      <span className="text-red-600 tabular-nums">{formatUAH(displayTotal)}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Контакти */}
            <section aria-labelledby="contacts-title">
              <h3 id="contacts-title" className="text-sm font-semibold text-gray-900 mb-3">
                Контакти
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <Field
                  id={nameId} name="name" label="Ім'я"
                  placeholder="Ваше ім'я" autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'' -]/g, ""))}
                  error={errors.name} help="Лише літери"
                  required disabled={sending}
                />
                <Field
                  id={phoneId} name="phone" type="tel" label="Телефон"
                  placeholder="+380XXXXXXXXX" autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const tail = (digits.startsWith("380") ? digits.slice(3) : digits).slice(0, 9);
                    setPhone("+380" + tail);
                  }}
                  error={errors.phone} help="Введіть 9 цифр"
                  inputMode="numeric" required
                  pattern="^\+380\d{9}$" maxLength={13}
                  disabled={sending}
                />
              </div>
              {errors.submit && (
                <p className="mt-2 text-xs text-red-700">{errors.submit}</p>
              )}
            </section>

            {/* Згода */}
            <div className="flex items-start gap-2.5">
              <input
                id={agreeId} name="agree" type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-invalid={!!errors.agree}
                className="mt-0.5 h-5 w-5 rounded accent-blue-600 shrink-0"
                disabled={sending} required
              />
              <label
                htmlFor={agreeId}
                className={`text-sm leading-snug ${errors.agree ? "text-red-700" : "text-gray-700"}`}
              >
                Погоджуюсь на обробку персональних даних та умови повернення.
              </label>
            </div>
            {errors.agree && (
              <p className="text-xs text-red-700 -mt-3">{errors.agree}</p>
            )}

          </div>

          {/* ── Футер (sticky) ── */}
          <div className="
            flex-shrink-0
            border-t bg-white
            px-4 sm:px-6 py-3
            pb-[calc(0.75rem+env(safe-area-inset-bottom))]
          ">
            <div className="flex items-center justify-between gap-3">
              {/* Сума */}
              <div>
                <div className="text-xs text-gray-500">{isCart ? "Разом" : "До сплати"}</div>
                <div className="text-xl sm:text-2xl font-extrabold text-red-600 tabular-nums leading-tight">
                  {formatUAH(displayTotal)}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  disabled={sending}
                  className="h-11 px-4 rounded-2xl border border-gray-300 text-sm font-semibold text-white hover:bg-gray-50 active:scale-95 disabled:opacity-40 transition"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="h-11 px-5 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
                >
                  {sending ? "Надсилаємо…" : "Купити"}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}


/* helpers */
function Row({ label, value, strong = false, accent = false }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "font-semibold" : ""}`}>
      <span className="text-gray-800">{label}</span>
      <span className={`tabular-nums ${accent ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

function Field({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
  inputMode,
  help,
  error,
  required,
  pattern,
  maxLength,
  disabled,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-800 mb-1">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={help ? `${id}-help` : undefined}
        pattern={pattern}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full rounded-xl border px-3 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-600" : "border-gray-300/70 focus:ring-blue-600"
        } disabled:opacity-50`}
      />
      <p id={`${id}-help`} className={`mt-1 text-xs ${error ? "text-red-700" : "text-gray-700"}`}>
        {error || help}
      </p>
    </div>
  );
}