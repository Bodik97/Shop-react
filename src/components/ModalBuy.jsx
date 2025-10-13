// src/components/ModalBuy.jsx
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { MapPin, Landmark, Package, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "/api/telegram";
const NP_API = "/api/np";

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
}) {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [qty, setQty] = useState(1);
  const [delivery, setDelivery] = useState("nova");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [comment, setComment] = useState("");
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  // НП довідники
  const [region, setRegion] = useState("");
  const [areas, setAreas] = useState([]);
  const [areaRef, setAreaRef] = useState("");
  const [cities, setCities] = useState([]);
  const [cityRef, setCityRef] = useState("");
  const [warehouses, setWarehouses] = useState([]);

  const closeBtnRef = useRef(null);

  const isCart = Array.isArray(cart) && cart.length > 0;
  const price = Number(product?.price || 0);

  const singleTotal = useMemo(() => price * Math.max(1, Number(qty) || 1), [price, qty]);
  const cartComputed = useMemo(
    () => Math.max(0, (Number(subtotal) || 0) - (Number(discount) || 0) + (Number(shipping) || 0)),
    [subtotal, discount, shipping]
  );
  const displayTotal = isCart ? (Number(total) || cartComputed) : singleTotal;

  // простий генератор номера замовлення
  const genOrderId = () => "ORD-" + Date.now().toString(36).toUpperCase();

  // ids
  const nameId = `name-${useId()}`;
  const phoneId = `phone-${useId()}`;
  const commentId = `comment-${useId()}`;
  const qtyId = `qty-${useId()}`;
  const agreeId = `agree-${useId()}`;
  const areaFieldId = `area-${useId()}`;
  const cityFieldId = `city-${useId()}`;
  const branchFieldId = `branch-${useId()}`;

  // open/reset: завжди викликається, логіка всередині з guard'ом
  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("+380");
    setQty(1);
    setDelivery("nova");
    setCity("");
    setBranch("");
    setComment("");
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

  // завантаження НП довідників
  useEffect(() => {
    if (!open) return;
    fetch(`${NP_API}?op=areas`)
      .then((r) => r.json())
      .then((j) => setAreas(j.data || []))
      .catch(() => setAreas([]));
  }, [open]);

  useEffect(() => {
    // скидаємо залежні поля
    setCities([]);
    setCityRef("");
    setCity("");
    setWarehouses([]);
    setBranch("");
    if (!areaRef) return;
    fetch(`${NP_API}?op=cities&areaRef=${encodeURIComponent(areaRef)}`)
      .then((r) => r.json())
      .then((j) => setCities(j.data || []))
      .catch(() => setCities([]));
  }, [areaRef]);

  useEffect(() => {
    setWarehouses([]);
    setBranch("");
    if (!cityRef) return;
    fetch(`${NP_API}?op=warehouses&cityRef=${encodeURIComponent(cityRef)}`)
      .then((r) => r.json())
      .then((j) => setWarehouses(j.data || []))
      .catch(() => setWarehouses([]));
  }, [cityRef]);

  // валідація
  function validateLocal() {
    const err = {};
    if (!name.trim() || name.trim().length < 2) err.name = "Вкажіть ім’я";
    if (!/^\+380\d{9}$/.test(phone)) err.phone = "Формат: +380XXXXXXXXX";
    if (delivery === "nova") {
      if (!areaRef) err.region = "Оберіть область";
      if (!cityRef) err.city = "Оберіть місто";
      if (!branch.trim()) err.branch = "Оберіть відділення";
    }
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
      return { 
        id: i.id, 
        title: i.title, 
        qty: q, 
        price: p, 
        lineTotal: p * q,
        giftText: i.giftText?.text || i.giftText || null   // ✅ додав сюди
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

    const q = Math.max(1, Number(qty) || 1);
    const p = Number(price) || 0;
    return {
      items: [{
        id: product?.id,
        title: product?.title,
        qty: q,
        price: p,
        lineTotal: p * q,
        giftText: product?.giftText?.text || product?.giftText || null   // 🎁 ДОДАНО СЮДИ
      }],
      subtotal: p * q,
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
      comment: comment.trim(),
      delivery: "nova",
      region: region.trim(),
      city: city.trim(),
      branch: branch.trim(),
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

      const summary = {
        orderId,
        itemsCount: isCart ? cart?.length || 1 : Math.max(1, Number(qty) || 1),
        total: displayTotal,
        name,
        phone,
        delivery: { region, city, branch },
      };
      localStorage.setItem("lastOrderSummary", JSON.stringify(summary));
      onClose?.();
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
                    <div className="mt-1 text-red-600 font-bold text-base sm:text-lg tabular-nums">
                      {formatUAH(price)}
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
                <div className="rounded-2xl border bg-gray-50 p-3 max-h-40 sm:max-h-48 overflow-auto">
                  {cart.map((i) => {
                    const q = Math.max(1, Number(i.qty) || 1);
                    const p = Number(i.price) || 0;
                    return (
                      <div key={i.id} className="space-y-0.5">
                        <div className="flex justify-between gap-3 text-sm text-gray-800">
                          <span className="truncate">
                            {i.title} × {q}
                          </span>
                          <span className="tabular-nums">{formatUAH(p * q)}</span>
                        </div>
                        {i.giftText && (
                          <div className="text-xs text-emerald-700 flex items-center gap-1 pl-2">
                            🎁 {i.giftText}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <hr className="my-2 border-slate-200" />
                  <Row label="Сума товарів" value={formatUAH(subtotal)} />
                  {discount > 0 && <Row label="Знижка" value={`−${formatUAH(discount)}`} />}
                  {/* <Row label="Доставка" value={shipping ? formatUAH(shipping) : "Безкоштовно"} /> */}
                  <Row strong label="Разом" value={formatUAH(displayTotal)} />
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
                  label="Ім’я"
                  placeholder="Ваше ім’я"
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
            </section>

            {/* address (НП) */}
            {delivery === "nova" && (
              <section aria-labelledby="np">
                <h3 id="np" className="text-sm font-semibold text-gray-900 mb-2">
                  Нова Пошта
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Область */}
                  <NPSelect
                    id={areaFieldId}
                    name="region"
                    label="Область"
                    required
                    icon={MapPin}
                    value={areaRef}
                    onChange={(e) => {
                      const ref = e.target.value;
                      setAreaRef(ref);
                      const a = areas.find((x) => x.ref === ref);
                      setRegion(a?.name || "");
                    }}
                    options={areas.map((a) => ({ value: a.ref, label: a.name }))}
                    autoComplete="address-level1"
                    placeholder="Оберіть область"
                    disabled={sending}
                    error={errors.region}
                  />

                  {/* Місто */}
                  <NPSelect
                    id={cityFieldId}
                    name="city"
                    label="Місто"
                    required
                    icon={Landmark}
                    value={cityRef}
                    onChange={(e) => {
                      const ref = e.target.value;
                      setCityRef(ref);
                      const c = cities.find((x) => x.ref === ref);
                      setCity(c?.name || "");
                    }}
                    options={cities.map((c) => ({ value: c.ref, label: c.name }))}
                    autoComplete="address-level2"
                    placeholder={areaRef ? "Оберіть місто" : "Спочатку оберіть область"}
                    disabled={!areaRef || sending}
                    error={errors.city}
                  />

                  {/* Відділення */}
                  <NPSelect
                    id={branchFieldId}
                    name="branch"
                    label="Відділення"
                    required
                    icon={Package}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    options={warehouses.map((w) => ({ value: w.name, label: w.name }))}
                    autoComplete="shipping street-address"
                    placeholder={cityRef ? "Оберіть відділення" : "Спочатку оберіть місто"}
                    disabled={!cityRef || sending}
                    error={errors.branch}
                  />
                </div>
              </section>
            )}

            {/* comment */}
            <section aria-labelledby="comment">
              <h3 id="comment" className="text-sm font-semibold text-gray-900 mb-2">
                Коментар
              </h3>
              <div>
                <label htmlFor={commentId} className="block text-sm text-gray-800 mb-1">
                  Коментар (необов’язково)
                </label>
                <textarea
                  id={commentId}
                  name="comment"
                  rows={3}
                  placeholder="Побажання до замовлення…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-300/70 bg-white px-3 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                  disabled={sending}
                />
                <p className="mt-1 text-xs text-gray-700">Додайте важливі деталі для доставлення.</p>
                {errors.submit && <p className="mt-1 text-xs text-red-700">{errors.submit}</p>}
              </div>
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

      <style>{`
        @keyframes bm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bm-zoom { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

/* helpers */
function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "font-semibold" : ""}`}>
      <span className="text-gray-800">{label}</span>
      <span className="tabular-nums text-gray-900">{value}</span>
    </div>
  );
}

function NPSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  required,
  icon: Icon,
  autoComplete,
}) {
  const val = value || "";
  const selected = !!val;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="text-sm text-gray-800 flex items-center gap-1">
          {Icon ? <Icon className="h-4 w-4 text-red" /> : null}
          {label} {required && <span className="text-rose-600">*</span>}
        </label>

        <span
          className={`inline-flex items-center justify-center h-6 w-6 rounded-full ring-1
            ${selected ? "bg-emerald-50 text-emerald-600 ring-emerald-200" : "bg-slate-100 text-slate-400 ring-slate-200"}`}
          aria-label={selected ? "Вибрано" : "Не вибрано"}
        >
          {selected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </span>
      </div>

      <div className="relative">
        <select
          id={id}
          name={name}
          value={val}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete={autoComplete}
          className={`appearance-none w-full rounded-2xl border-2 bg-white px-3 py-2.5 pr-10 text-[15px] transition
            ${error ? "border-rose-300 focus:ring-rose-500" : "border-slate-300 focus:ring-blue-600"}
            ${val === "" ? "text-slate-400" : "text-slate-900"}
            focus:outline-none focus:ring-2`}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-700">
          {error}
        </p>
      )}
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
