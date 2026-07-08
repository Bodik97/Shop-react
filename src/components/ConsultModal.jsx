// src/components/ConsultModal.jsx
// Міні-форма "Консультація": ім'я + телефон → /api/order (type: consult) → Telegram.
import { useState, useEffect, useRef, useId } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { formatPhoneUA, isValidPhoneUA, phoneToE164UA } from "../utils/format";
import { trackGenerateLead } from "../utils/analytics";

export default function ConsultModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380 ");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const closeRef = useRef(null);
  const uid = useId();
  const nameId = `c-name-${uid}`;
  const phoneId = `c-phone-${uid}`;

  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("+380 ");
    setErrors({});
    setSending(false);
    setDone(false);
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    document.documentElement.classList.add("overflow-hidden", "overscroll-none");
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("overflow-hidden", "overscroll-none");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const err = {};
    if (!name.trim() || name.trim().length < 2) err.name = "Вкажіть ім'я";
    if (!isValidPhoneUA(phone)) err.phone = "Формат: +380 XX XXX XX XX";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSending(true);
    try {
      const r = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consult",
          name: name.trim(),
          phone: phoneToE164UA(phone),
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok !== true) throw new Error("fail");
      // GA4 generate_lead — лише коли заявка реально відправлена
      trackGenerateLead();
      setDone(true);
    } catch {
      setErrors((p) => ({
        ...p,
        submit: "Не вдалося надіслати. Спробуйте ще раз або напишіть нам у Viber / Telegram.",
      }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consult-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !sending && onClose?.()}
      />

      {/* Контейнер */}
      <div className="relative z-10 w-full max-w-md mx-0 sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-line overflow-hidden">
        {/* Хедер */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-line">
          <h2 id="consult-title" className="text-lg font-bold text-ink">
            Безкоштовна консультація
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Закрити"
            onClick={() => !sending && onClose?.()}
            className="grid place-items-center h-10 w-10 rounded-xl bg-ink !text-white hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-green-100 mb-3">
              <CheckCircle2 className="h-8 w-8 text-trust" />
            </div>
            <h3 className="text-lg font-bold text-ink">Дякуємо!</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Менеджер звʼяжеться з вами у Viber або Telegram найближчим часом.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-accent text-white font-display font-semibold hover:brightness-95 active:scale-95 transition"
            >
              Готово
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="px-5 py-5 space-y-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            <p className="text-sm text-ink-soft">
              Залиште ім'я та номер — звʼяжемося з вами у Viber або Telegram, допоможемо підібрати товар і відповімо на питання.
            </p>

            <div>
              <label htmlFor={nameId} className="block text-sm text-ink mb-1">
                Ім'я <span className="text-accent">*</span>
              </label>
              <input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ'' -]/g, ""))}
                autoComplete="name"
                placeholder="Ваше ім'я"
                disabled={sending}
                aria-invalid={!!errors.name}
                className={`w-full rounded-xl border px-3 h-12 text-[15px] text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 ${
                  errors.name ? "border-red-400 focus:ring-red-600" : "border-line focus:ring-accent focus:border-accent"
                } disabled:opacity-50`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor={phoneId} className="block text-sm text-ink mb-1">
                Телефон (Viber / Telegram) <span className="text-accent">*</span>
              </label>
              <input
                id={phoneId}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(formatPhoneUA(e.target.value))}
                autoComplete="tel"
                placeholder="+380 XX XXX XX XX"
                maxLength={19}
                disabled={sending}
                aria-invalid={!!errors.phone}
                className={`w-full rounded-xl border px-3 h-12 text-[15px] text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 ${
                  errors.phone ? "border-red-400 focus:ring-red-600" : "border-line focus:ring-accent focus:border-accent"
                } disabled:opacity-50`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
            </div>

            {errors.submit && <p className="text-xs text-red-700">{errors.submit}</p>}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex w-full items-center justify-center gap-2 h-12 rounded-xl bg-accent text-white font-display font-semibold uppercase tracking-wide hover:brightness-95 active:scale-[0.98] disabled:opacity-50 transition shadow-sm"
            >
              <Send className="h-5 w-5" />
              {sending ? "Надсилаємо…" : "Надіслати заявку"}
            </button>

            <p className="text-[11px] text-ink-soft text-center">
              Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
