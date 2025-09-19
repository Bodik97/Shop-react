// src/pages/Contact.jsx
import { Phone, Mail, Clock, MapPin, Headphones } from "lucide-react";

export default function Contact() {
  const PHONE_DISPLAY = "+38 (096) 000-00-00";
  const PHONE_TEL = "+380960000000";
  const EMAIL = "support@airsoft.shop";
  const HOURS = "Пн–Пт 10:00–19:00, Сб 11:00–16:00";
  const ADDRESS_LINES = [
    "Київ, вул. Бориспільська, 9 (Дарницький р-н, індустріальна зона)",
    "Київ, вул. Новокостянтинівська, 2А (Подільський р-н, промзона)",
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        {/* м’який фон */}
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(80%_60%_at_50%_-10%,#000_0%,transparent_70%)]" />
        <div className="relative p-6 sm:p-8 md:p-12">
          <div className="flex flex-col items-center text-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold text-gray-700">
              <Headphones className="h-4 w-4" />
              Служба підтримки
            </span>

            <div className="mx-auto text-center max-w-[28ch] sm:max-w-[40ch] md:max-w-[56ch]">
              <h2
                lang="uk"
                className="font-extrabold text-gray-900 tracking-tight
                           text-[clamp(24px,5vw,46px)]
                           leading-[1.15] sm:leading-[1.12] md:leading-[1.08]
                           [hyphens:auto]"
              >
                Ми на зв’язку — швидко допоможемо і підкажемо, що обрати
              </h2>
            </div>

            <p className="max-w-2xl text-gray-600 text-sm sm:text-base">
              Зазвичай відповідаємо протягом 5–15 хв у робочий час. Пишіть, коли зручно — ми поруч.
            </p>
          </div>

          {/* Картки контактів */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <InfoCard
              icon={<Phone className="h-5 w-5 text-gray-900" />}
              label="Телефон"
              value={
                <a className="hover:underline" href={`tel:${PHONE_TEL}`}>
                  {PHONE_DISPLAY}
                </a>
              }
            />
            <InfoCard
              icon={<Mail className="h-5 w-5 text-gray-900" />}
              label="Email"
              value={
                <a className="hover:underline" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              }
            />
            <InfoCard
              icon={<Clock className="h-5 w-5 text-gray-900" />}
              label="Графік"
              value={HOURS}
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5 text-gray-900" />}
              label="Адреса"
              value={ADDRESS_LINES}
            />
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="mt-8">
        <div className="rounded-3xl overflow-hidden border bg-white shadow-sm">
          <iframe
            title="Мапа"
            src="https://maps.google.com/maps?q=Kyiv&t=&z=12&ie=UTF8&iwloc=&output=embed"
            className="w-full h-[280px] sm:h-[340px] md:h-[420px]"
            loading="lazy"
          />
        </div>
      </section>

      {/* Переваги */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { t: "Швидка відповідь", d: "5–15 хв у робочий час" },
          { t: "Дбайлива консультація", d: "Рекомендуємо справді потрібне" },
          { t: "Без хвилювань", d: "14 днів на повернення / обмін" },
        ].map((i) => (
          <div
            key={i.t}
            className="rounded-2xl border bg-white p-4 sm:p-5 text-center shadow-sm"
          >
            <div className="text-[13px] sm:text-sm text-gray-500">{i.t}</div>
            <div className="mt-1 font-semibold text-gray-900 text-sm sm:text-base">
              {i.d}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

/* ——— Subcomponent ——— */
function InfoCard({ icon, label, value }) {
  const isArray = Array.isArray(value);
  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-5 text-center shadow-sm">
      <div className="mx-auto grid place-items-center h-10 w-10 rounded-xl bg-gray-100">
        {icon}
      </div>
      <div className="mt-2 text-[12px] sm:text-sm text-gray-500">{label}</div>

      {/* Якщо масив — рендеримо списком із ключами */}
      {isArray ? (
        <ul className="mt-1 space-y-1 font-semibold text-gray-900 text-sm sm:text-base">
          {value.map((line, idx) => (
            <li key={`${label}-${idx}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 font-semibold text-gray-900 text-sm sm:text-base break-words">
          {value}
        </div>
      )}
    </div>
  );
}
