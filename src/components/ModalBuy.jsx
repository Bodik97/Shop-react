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
  onSuccess, // 🆕 викликається після успішного замовлення
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
  const qtyId = `qty-${uid}`;
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
        const q = Math.max(1, Number(i.qty) || 1);
        const p = Number(i.price) || 0;
        const addons = Array.isArray(i.addons) ? i.addons : [];
        const addonsTotal = Number(i.addonsTotal) || 0;
        const ut = Number(i.unitTotal) || p;
        return {
          id: i.id,
          title: i.title,
          qty: q,
          price: p,
          addons,
          addonsTotal,
          unitTotal: ut,
          lineTotal: ut * q,
          giftText: i.giftText?.text || i.giftText || null,
        };
      });
      return {
        items,
        subtotal,
        discount,
        shipping: shipping || 0,
        total: displayTotal,
        mode: "cart",
      };
    }

    // режим "Купити зараз"
    const q = Math.max(1, Number(qty) || 1);
    return {
      items: [{
        id: product?.id,
        title: product?.title,
        qty: q,
        price,
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

      // 🆕 Зберігаємо в історію замовлень
      try {
        const prev = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        // Додаємо нове замовлення на початок (найновіші зверху)
        const updated = [summary, ...prev].slice(0, 50); // максимум 50 замовлень
        localStorage.setItem("orderHistory", JSON.stringify(updated));
      } catch {
        // ignore: localStorage недоступний
      }

      // 🆕 onSuccess очищає кошик, потім переходимо на ThankYou
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sending && onClose?.()} />

      {/* container */}
      <div className="relative w-full max-w-full sm:max-w-[720px] mx-2 sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border max-h-[92vh] overflow-auto">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4 bg-white/95 backdrop-blur border-b">
          <div className="min-w-0">
            <h2 id="buy-title" className="text-[18px] sm:text-xl font-bold text-gray-900 leading-snug">
              {isCart ? "Оформлення замовлення" : "Швидка покупка"}
            </h2>
            <p className="mt-0.5 text-gray-700 text-sm line-clamp-2">
              {isCart ? "Кошик" : product?.title || "—"}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Закрити"
            onClick={() => !sending && onClose?.()}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
            disabled={sending}
          >
            ✕
          </button>
        </div>

        {/* form */}
        <form onSubmit={submit} noValidate autoComplete="on" aria-busy={sending}>
          {/* body */}
          <div className="px-3 sm:px-6 pt-4 pb-28 sm:pb-6 space-y-5">
            {/* single preview */}
            {!isCart && product && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-18 h-18 sm:w-24 sm:h-24 rounded-xl object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                      {product.title}
                    </div>
                    {product.giftText?.text && (
                      <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1">
                        🎁 {product.giftText.text}
                      </div>
                    )}

                    {/* Цінова розбивка */}
                    <div className="mt-2 space-y-1">
                      {/* Базова ціна товару */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">Товар</span>
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatUAH(price)}
                        </span>
                      </div>

                      {/* Кожен addon окремим рядком */}
                      {productAddons.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-blue-600 truncate">+ {a.name}</span>
                          <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                            {formatUAH(a.price)}
                          </span>
                        </div>
                      ))}

                      {/* Підсумок тільки якщо є addons */}
                      {productAddons.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-gray-200">
                          <span className="text-xs text-gray-500">Разом</span>
                          <span className="text-base font-extrabold text-red-600 tabular-nums">
                            {formatUAH(unitPrice)}
                          </span>
                        </div>
                      )}

                      {/* Якщо addons немає — просто велика ціна */}
                      {productAddons.length === 0 && (
                        <div className="text-base font-extrabold text-red-600 tabular-nums">
                          {formatUAH(price)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    type="button"
                    aria-label="−"
                    onClick={() => setQty((q) => Math.max(1, Number(q || 1) - 1))}
                    className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black !text-white hover:bg-black/90 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-40"
                    disabled={sending || qty <= 1}
                  >
                    −
                  </button>

                  <label htmlFor={qtyId} className="sr-only">
                    Кількість
                  </label>
                  <input
                    id={qtyId}
                    name="qty"
                    type="number"
                    min={1}
                    max={99}
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                    className="w-14 sm:w-16 h-9 sm:h-10 rounded-xl border-2 border-slate-300 bg-white text-slate-900 tabular-nums font-semibold text-base text-center focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                    disabled={sending}
                  />

                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => setQty((q) => Math.min(99, Number(q || 1) + 1))}
                    className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black !text-white hover:bg-black/90 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-40"
                    disabled={sending || qty >= 99}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* cart summary */}
            {isCart && (
              <section aria-labelledby="order-summary" className="space-y-2">
                <h3 id="order-summary" className="text-sm font-semibold text-gray-900">
                  Ваше замовлення
                </h3>
                <div className="rounded-2xl border bg-gray-50 p-3 max-h-52 sm:max-h-60 overflow-auto space-y-3">
                  {cart.map((i) => {
                    const q         = Math.max(1, Number(i.qty) || 1);
                    const basePrice = Number(i.price) || 0;
                    const addons    = Array.isArray(i.addons) ? i.addons : [];
                    const addonsSum = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
                    const unitTotal = basePrice + addonsSum;
                    const lineTotal = unitTotal * q;

                    return (
                      <div key={i.cartItemId || i.id} className="flex gap-3">

                        {/* Картинка товару */}
                        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border bg-white">
                          <img
                            src={i.image || "/placeholder.png"}
                            alt={i.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                          />
                        </div>

                        {/* Права частина: назва + addons + підсумок */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Назва + базова ціна */}
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-800 leading-snug line-clamp-2">
                              {i.title}{q > 1 && <span className="text-gray-400 font-normal"> × {q}</span>}
                            </span>
                            <span className="tabular-nums shrink-0 text-gray-800">
                              {formatUAH(basePrice)}
                            </span>
                          </div>

                          {/* Кожен addon окремим рядком */}
                          {addons.map((a) => (
                            <div key={a.id} className="flex justify-between gap-3 pl-2">
                              <span className="text-xs text-blue-600 truncate">+ {a.name}</span>
                              <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                                {formatUAH(a.price)}
                              </span>
                            </div>
                          ))}

                          {/* Подарунок */}
                          {i.giftText && (
                            <div className="text-xs text-emerald-700 flex items-center gap-1 pl-2">
                              🎁 {i.giftText}
                            </div>
                          )}

                          {/* Підсумок позиції */}
                          {(addons.length > 0 || q > 1) && (
                            <div className="flex justify-between gap-3 pt-1 border-t border-dashed border-gray-200">
                              <span className="text-xs text-gray-400">
                                {q > 1 ? `${q} × ${formatUAH(unitTotal)}` : "Разом за позицію:"}
                              </span>
                              <span className="text-xs font-bold text-gray-800 tabular-nums shrink-0">
                                {formatUAH(lineTotal)}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}

                  <hr className="border-slate-200" />
                  <Row label="Сума товарів" value={formatUAH(subtotal)} />
                  {discount > 0 && <Row label="Знижка" value={`−${formatUAH(discount)}`} />}
                  <Row strong accent label="Разом" value={formatUAH(displayTotal)} />
                </div>
              </section>
            )}

            {/* contacts */}
            <section aria-labelledby="contacts">
              <h3 id="contacts" className="text-sm font-semibold text-gray-900 mb-2">
                Контакти
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Field
                  id={nameId}
                  name="name"
                  label="Ім'я"
                  placeholder="Ваше ім'я"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'’ -]/g, "");
                    setName(v);
                  }}
                  error={errors.name}
                  help="Лише літери"
                  required
                  disabled={sending}
                />

                <Field
                  id={phoneId}
                  name="phone"
                  type="tel"
                  label="Телефон"
                  placeholder="+380XXXXXXXXX"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const tail = (digits.startsWith("380") ? digits.slice(3) : digits).slice(0, 9);
                    setPhone("+380" + tail);
                  }}
                  error={errors.phone}
                  help="Введіть 9 цифр"
                  inputMode="numeric"
                  required
                  pattern="^\\+380\\d{9}$"
                  maxLength={13}
                  disabled={sending}
                />
              </div>
              {errors.submit && <p className="mt-2 text-xs text-red-700">{errors.submit}</p>}
            </section>

            {/* agree */}
            <section>
              <div className="flex items-start gap-2 text-sm">
                <input
                  id={agreeId}
                  name="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  aria-invalid={!!errors.agree}
                  aria-describedby={errors.agree ? `${agreeId}-error` : undefined}
                  className="mt-0.5 h-5 w-5 rounded accent-blue-600"
                  disabled={sending}
                  required
                />
                <label htmlFor={agreeId} className={errors.agree ? "text-red-700" : "text-gray-800"}>
                  Погоджуюсь на обробку персональних даних та умови повернення.
                </label>
              </div>
              {errors.agree && (
                <p id={`${agreeId}-error`} className="mt-1 text-xs text-red-700">
                  {errors.agree}
                </p>
              )}
            </section>
          </div>

          {/* sticky footer */}
          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t px-3 sm:px-6 py-3 [padding-bottom:env(safe-area-inset-bottom)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 order-2 sm:order-1">
                <div className="text-xs text-gray-600">{isCart ? "Разом" : "До сплати"}</div>
                <div className="mb-5 text-2xl font-extrabold text-red-700 tabular-nums">
                  {formatUAH(displayTotal)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  className="h-12 sm:h-11 w-full sm:w-auto rounded-2xl bg-black px-4 !text-white md:hover:bg-black/90 active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-50"
                  disabled={sending}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="h-12 sm:h-11 w-full sm:w-auto rounded-2xl bg-black px-5 font-semibold !text-white md:hover:bg-black/90 active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black disabled:opacity-50"
                  disabled={sending}
                >
                  {sending ? "Відправляємо…" : "Оформити"}
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