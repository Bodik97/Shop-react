// src/pages/Contact.jsx
import { useState, useId } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const nameId = `c-name-${useId()}`;
  const emailId = `c-email-${useId()}`;
  const phoneId = `c-phone-${useId()}`;
  const msgId = `c-msg-${useId()}`;
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", agree: true });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    // TODO: відправити на бекенд
    setSent(true);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold">Контакти</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Інфо */}
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Як нас знайти</h2>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li><b>Телефон:</b> <a className="text-blue-700 hover:underline" href="tel:+380960000000">+38 (096) 000-00-00</a></li>
            <li><b>Email:</b> <a className="text-blue-700 hover:underline" href="mailto:support@airsoft.shop">support@airsoft.shop</a></li>
            <li><b>Графік:</b> Пн–Пт 10:00–19:00, Сб 11:00–16:00</li>
            <li className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-gray-50" aria-label="Instagram">📷</a>
              <a href="https://t.me/" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-gray-50" aria-label="Telegram">✈️</a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-gray-50" aria-label="TikTok">🎵</a>
            </li>
          </ul>

          <div className="mt-4 rounded-xl overflow-hidden border">
            <iframe
              title="Мапа"
              src="https://maps.google.com/maps?q=Kyiv&t=&z=12&ie=UTF8&iwloc=&output=embed"
              className="w-full h-56"
              loading="lazy"
            />
          </div>
        </section>

        {/* Форма */}
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold">Напишіть нам</h2>

          {sent ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
              Повідомлення надіслано. Ми відповімо найближчим часом.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <Field
                id={nameId}
                name="name"
                label="Ім’я*"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id={emailId}
                  name="email"
                  type="email"
                  label="Email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Field
                  id={phoneId}
                  name="phone"
                  type="tel"
                  label="Телефон*"
                  autoComplete="tel"
                  placeholder="+380XXXXXXXXX"
                  pattern="^\+380\d{9}$"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\s/g, "") })}
                  required
                  help="Формат: +380XXXXXXXXX"
                />
              </div>
              <FieldTextarea
                id={msgId}
                name="message"
                label="Повідомлення*"
                placeholder="Як ми можемо допомогти?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="text-gray-700">
                  Погоджуюсь на обробку персональних даних.
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Надіслати
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  id, name, label, type = "text", value, onChange, placeholder, autoComplete, required,
  pattern, help,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-800 mb-1">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        pattern={pattern}
        className="w-full rounded-xl border px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300"
      />
      {help && <p className="mt-1 text-xs text-gray-700">{help}</p>}
    </div>
  );
}

function FieldTextarea({ id, name, label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-800 mb-1">{label}</label>
      <textarea
        id={id}
        name={name}
        rows={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300 resize-y"
      />
    </div>
  );
}
