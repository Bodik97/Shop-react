// src/pages/About.jsx
import { useEffect, useMemo, useState, useId } from "react";
import { Link } from "react-router-dom";
import Faq from "./Faq";

/** ——— helpers ——— */
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("uk-UA", { year: "numeric", month: "short", day: "2-digit" });
const AVG = (arr) => (arr.length ? arr.reduce((s, r) => s + r.rating, 0) / arr.length : 0);

/** ——— demo seed ——— */
const SEED = [
  {
    id: "r1",
    name: "Олександр",
    rating: 5,
    message: "Швидка відправка, чесна консультація. Привід прийшов відрегульований.",
    createdAt: "2025-07-20T10:00:00.000Z",
    recommended: true,
    verified: true,
  },
  {
    id: "r2",
    name: "Марія",
    rating: 5,
    message: "Сподобався сервіс і упаковка. Додатково поклали наклейки, дрібниця але приємно.",
    createdAt: "2025-08-01T14:10:00.000Z",
    recommended: true,
    verified: true,
  },
  {
    id: "r3",
    name: "Ігор",
    rating: 4,
    message: "Все добре, тільки Новапошта затримала день. Магазин тримав у курсі.",
    createdAt: "2025-08-10T09:40:00.000Z",
    recommended: true,
    verified: false,
  },
];

/** ——— page ——— */
export default function About() {
  const STORE_KEY = "about_reviews_v1";
  const [reviews, setReviews] = useState([]);
  const [sent, setSent] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  // load + seed
  useEffect(() => {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      setReviews(sanitize(JSON.parse(raw)));
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(SEED));
      setReviews(SEED);
    }
  }, []);

  // persist
  useEffect(() => {
    if (reviews?.length) localStorage.setItem(STORE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const avg = useMemo(() => AVG(reviews), [reviews]);
  const total = reviews.length;

  // share
  const onShare = async () => {
    setShareMsg("");
    const url = window.location.origin + "/";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "AIRSOFT — спорядження та сервіс",
          text: "Рекомендую цей магазин для страйкболу",
          url,
        });
        setShareMsg("Посилання надіслано.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg("Посилання скопійоване.");
      }
    } catch {
      setShareMsg("Не вдалося поділитись.");
    }
    setTimeout(() => setShareMsg(""), 2500);
  };

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 lg:py-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-8 lg:p-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-[26px] leading-tight sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Про нас
          </h1>
          <p className="mt-3 text-slate-200 text-[15px] sm:text-base lg:text-lg">
            Профі зі спорядження для страйкболу. Тестуємо, налаштовуємо, пояснюємо простими словами.
          </p>

          {/* buttons */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:auto-rows-min sm:grid-cols-2 md:grid-cols-3 md:gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-blue-600 !text-white hover:!text-white active:!text-white focus-visible:!text-white visited:!text-white no-underline font-semibold shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"

            >
              Перейти в каталог
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl border border-white/30 !text-white visited:!text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60"


            >
              Зв’язатися
            </Link>
            <button
              type="button"
              onClick={onShare}
              aria-label="Поділитися"
              className="inline-flex items-center justify-center h-11 px-5 rounded-2xl !bg-white !text-slate-900 font-semibold shadow-sm hover:!bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            >
              Поділитись
            </button>
            {shareMsg && (
              <span className="sm:col-span-2 md:col-span-3 self-center text-sm text-slate-200">
                {shareMsg}
              </span>
            )}
          </div>

          <TrustBar />
        </div>

        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        />
      </section>

      {/* VALUE PROPS */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <VP icon="⚙️" title="Передпродажне налаштування">
          Перевіряємо і налаштовуємо базові вузли перед відправкою.
        </VP>
        <VP icon="⚡" title="Швидка доставка">
          Відправка день у день для замовлень до 15:00.
        </VP>
        <VP icon="🛡️" title="Гарантія та підтримка">
          Пояснюємо, консультуємо, не зникаємо після покупки.
        </VP>
        <VP icon="💳" title="Оплата як зручно">
          Картка, післяплата, безготівка для ФОП/ТОВ.
        </VP>
      </section>

      {/* STATS + CTA */}
      <section className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
  {/* Років на ринку */}
  <div className="relative overflow-hidden rounded-2xl border bg-white p-5 group">
    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" aria-hidden />
    <div className="flex flex-col items-center text-center">
      <div className="text-transparent bg-clip-text 
                bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
                text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow">
        7+
      </div>


      <div className="mt-1 text-sm text-black">Років на ринку</div>
      <div className="mt-3 h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full w-5/6 rounded-full bg-blue-600 group-hover:w-full transition-[width] duration-500" />
      </div>
    </div>
  </div>

  {/* Товарів на складі */}
  <div className="relative overflow-hidden rounded-2xl border bg-white p-5 group">
    <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" aria-hidden />
    <div className="flex flex-col items-center text-center">
      <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 
                text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow">
        3&nbsp;500+
      </div>

      <div className="mt-1 text-sm text-gray-600">Товарів на складі</div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[12px] text-gray-700">
        ⚡ Швидка відправка
      </div>
    </div>
  </div>

  {/* Рейтинг + CTA */}
  <div className="relative overflow-hidden rounded-2xl border p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="text-[13px] sm:text-sm text-slate-300">Середня оцінка</div>
        <div className="mt-1 flex items-center gap-2">
          <Stars value={avg} size={18} />
          <span className="text-lg font-extrabold tabular-nums">
            {Number.isFinite(avg) ? avg.toFixed(1) : "0.0"}
          </span>
          <span className="text-slate-400 text-[13px] sm:text-sm">({total})</span>
        </div>
      </div>

      <Link
        to="/cart"
        className="group relative inline-flex items-center justify-center h-11 px-5 rounded-2xl font-semibold
                    text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50"
      >
        {/* glow */}
        <span aria-hidden className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 blur-lg opacity-60 group-hover:opacity-80 transition" />
        {/* fill */}
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-[0_10px_30px_rgba(0,0,0,0.25)]" />
        {/* shine */}
        <span aria-hidden className="pointer-events-none absolute -left-10 top-0 h-full w-10 rotate-12 bg-white/25 opacity-0 group-hover:opacity-100 group-hover:translate-x-[140%] transition-transform duration-700 ease-out" />
        <span className="relative z-10 text-white">До покупок</span>
      </Link>
    </div>
  </div>
</section>


      {/* GALLERY
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Shot title="Тестування перед відправкою" />
        <Shot title="Команда і сервіс" />
        <Shot title="Реальні комплекти" />
      </section> */}

      {/* REVIEWS */}
      <ReviewsBlock reviews={reviews} setReviews={setReviews} setSent={setSent} sent={sent} />

      {/* FAQ */}
      <section className="mt-10 rounded-2xl border bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
          Питання і відповіді
        </h2>
        <div className="divide-y divide-gray-200">
          <Faq
            q="Як швидко ви відправляєте?"
            a="Зазвичай того ж дня до 15:00. Далі — на наступний робочий день."
          />
          <Faq
            q="Що з гарантією?"
            a="Обмін/повернення 14 днів, сервіс від бренду або наш партнерський сервісний центр."
          />
          <Faq
            q="Чи допоможете підібрати?"
            a="Так. Напишіть нам у Telegram або залиште повідомлення на сторінці Контакти."
          />
        </div>
      </section>


      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "AIRSOFT",
            url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Number.isFinite(avg) ? avg.toFixed(1) : "5.0",
              reviewCount: String(total || 1),
            },
          }),
        }}
      />
    </main>
  );
}

/** ——— subcomponents ——— */

function TrustBar() {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Badge icon="↩️" text="14 днів повернення" />
      <Badge icon="✅" text="Сертифіковані бренди" />
      <Badge icon="💬" text="Підтримка з 10:00 до 19:00" />
      <Badge icon="🔒" text="Безпечна оплата" />
    </div>
  );
}

function Badge({ text, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-gradient-to-r from-slate-800 to-slate-900/90 px-4 py-3 
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-lg hover:scale-[1.02] transition">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg shadow">
        {icon}
      </div>
      <span className="text-[15px] sm:text-base font-medium text-slate-100">{text}</span>
    </div>
  );
}


function VP({ icon, title, children }) {
  return (
    <div className="h-full rounded-2xl border bg-white p-4 sm:p-5">
      <div className="flex h-full items-start gap-3">
        <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl bg-blue-50 text-base sm:text-xl">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[15px] sm:text-base">{title}</div>
          <p className="mt-1 text-gray-700 text-[13px] sm:text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-5 text-center">
      <div className="text-xl sm:text-3xl font-extrabold">{value}</div>
      <div className="text-xs sm:text-sm text-gray-600">{label}</div>
    </div>
  );
}

function Shot({ title }) {
  return (
    <figure className="relative overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200" />
      <figcaption className="absolute left-2 bottom-2 rounded-lg bg-black/60 px-2.5 py-1 text-white text-xs sm:text-sm">
        {title}
      </figcaption>
    </figure>
  );
}

/** ——— Reviews ——— */
function ReviewsBlock({ reviews, setReviews, sent, setSent }) {
  const [sort, setSort] = useState("new");

  const sorted = useMemo(() => {
    const copy = [...reviews];
    if (sort === "new") return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "top") return copy.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
    return copy;
  }, [reviews, sort]);

  return (
    <section className="mt-10 grid gap-5 lg:grid-cols-3">
      {/* LIST */}
      <div className="lg:col-span-2 rounded-2xl border bg-white p-3 sm:p-6 overflow-hidden">
        {/* header: не ламається на 320px */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold">Відгуки</h2>
          <div className="w-full sm:w-auto">
            <label htmlFor="sort" className="sr-only">Сортування</label>
            <select
              id="sort"
              aria-label="Сортування"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full h-9 rounded-xl border px-3 text-sm"
            >
              <option value="new">Спочатку нові</option>
              <option value="top">Спочатку з вищою оцінкою</option>
            </select>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 divide-y">
          {sorted.map((r) => (
            <ReviewItem key={r.id} r={r} />
          ))}
          {!sorted.length && <div className="py-6 text-gray-600">Ще немає відгуків. Будьте першим(ою).</div>}
        </div>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border bg-white p-4 sm:p-6 lg:sticky lg:top-6 h-fit">
        <h3 className="text-lg font-bold">Залишити відгук</h3>
        <ReviewForm
          onSubmit={(rev) => {
            setReviews((prev) => [{ ...rev, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev]);
            setSent(true);
            setTimeout(() => setSent(false), 2500);
          }}
        />
        {sent && (
          <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 text-sm">
            Дякуємо за відгук.
          </div>
        )}
      </div>
    </section>
  );
}


function ReviewItem({ r }) {
  return (
    <article className="py-3 sm:py-4 flex gap-3">
      <div className="h-7 w-7 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white grid place-items-center text-xs sm:text-base font-bold">
        {r.name?.slice(0, 1)?.toUpperCase() || "?"}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="font-semibold text-[15px] truncate max-w-[40%] sm:max-w-none">{r.name || "Анонім"}</div>
          <Stars value={r.rating} size={16} />
          <time className="text-[11px] sm:text-xs text-gray-500">{fmtDate(r.createdAt)}</time>
          {r.verified && (
            <span className="ml-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              Перевірена покупка
            </span>
          )}
        </div>
        <p className="mt-1 text-gray-800 break-words break-all whitespace-pre-line text-[15px] sm:text-base">
          {r.message}
        </p>
        {r.recommended && (
          <div className="mt-1 text-[13px] sm:text-sm text-emerald-700">Рекомендую друзям ✅</div>
        )}
      </div>
    </article>
  );
}



function Stars({ value = 0, size = 18 }) {
  const full = Math.round(clamp(value, 0, 5));
  return (
    <div className="inline-flex align-middle" aria-label={`Оцінка ${full} з 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" className={i === 4 ? "" : "mr-0.5"} aria-hidden>
          <path d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L10 15.9l-5.37 2.2 1.03-6.01L1.3 7.84l6.03-.88L10 1.5z" fill={i < full ? "#f59e0b" : "#e5e7eb"} />
        </svg>
      ))}
    </div>
  );
}

/** ——— Review form ——— */
function ReviewForm({ onSubmit }) {
  const base = useId();
  const nameId = `name-${base}`;
  const msgId = `msg-${base}`;
  const agreeId = `agree-${base}`;
  const recId = `rec-${base}`;

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [recommended, setRecommended] = useState(true);
  const [agree, setAgree] = useState(true);
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!agree) return setErr("Потрібна згода на обробку даних.");
    if (!message.trim() || message.trim().length < 10) return setErr("Мінімум 10 символів відгуку.");
    onSubmit?.({
      name: name?.trim() || "Анонім",
      rating: clamp(Number(rating) || 5, 1, 5),
      message: message.trim(),
      recommended,
      verified: false,
    });
    setName(""); setRating(5); setHover(0); setMessage(""); setRecommended(true); setAgree(true);
  };

  const active = hover || rating;

  return (
    <form onSubmit={submit} className="mt-3 space-y-4" autoComplete="on">
      {/* Name */}
      <div>
        <label htmlFor={nameId} className="block text-sm text-gray-800 mb-1.5">Ім’я</label>
        <input
          id={nameId}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Як вас звати ?"
          className="w-full text-black rounded-2xl border border-gray-300/70 bg-white/80 backdrop-blur-[1px] px-3 py-2 text-[15px] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-[0_1px_0_rgba(16,24,40,.04)]"
          autoComplete="name"
        />
      </div>

      {/* Rating */}
      <fieldset>
        <legend className="block text-sm text-gray-800 mb-1.5">Оцінка</legend>
        <div role="radiogroup" aria-label="Оцінка" className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((v) => {
            const id = `rate-${v}-${base}`;
            return (
              <label key={v} htmlFor={id} className="cursor-pointer">
                <input
                  id={id}
                  type="radio"
                  name="rating"
                  value={v}
                  checked={Number(rating) === v}
                  onChange={() => setRating(v)}
                  className="sr-only"
                />
                <svg
                  width="24" height="24" viewBox="0 0 20 20" aria-hidden
                  onMouseEnter={() => setHover(v)} onMouseLeave={() => setHover(0)}
                  className="transition-colors"
                >
                  <path
                    d="M10 1.5l2.7 5.46 6.03.88-4.36 4.25 1.03 6.01L10 15.9l-5.37 2.2 1.03-6.01L1.3 7.84l6.03-.88L10 1.5z"
                    fill={v <= active ? "#f59e0b" : "#e5e7eb"}
                  />
                </svg>
              </label>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">Натисніть зірку, щоб вибрати 1–5.</p>
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor={msgId} className="block text-sm text-gray-800 mb-1.5">Відгук</label>
        <textarea
          id={msgId}
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Що сподобалось або що покращити?"
          className="w-full text-black rounded-2xl border border-gray-300/70 bg-white/80 backdrop-blur-[1px] px-3 py-2 text-[15px] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y shadow-[0_1px_0_rgba(16,24,40,.04)]"
        />
        <p className="mt-1 text-xs text-gray-600">Конструктивна критика вітається.</p>
      </div>

      {/* Toggles */}
      <label htmlFor={recId} className="flex items-center gap-2 text-[15px] cursor-pointer">
        <input
          id={recId}
          name="recommended"
          type="checkbox"
          checked={recommended}
          onChange={(e) => setRecommended(e.target.checked)}
          className="h-5 w-5 rounded accent-blue-600"
        />
        <span className="text-gray-800">Рекомендую друзям</span>
      </label>

      <label htmlFor={agreeId} className="flex items-start gap-2 text-[15px] cursor-pointer">
        <input
          id={agreeId}
          name="agree"
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded accent-blue-600"
        />
        <span className={agree ? "text-gray-800" : "text-red-700"}>
          Погоджуюсь на обробку персональних даних.
        </span>
      </label>

      {/* Error */}
      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-2 text-sm text-red-800">
          {err}
        </div>
      )}

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center h-12 rounded-2xl !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold shadow-lg shadow-blue-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700"
        >
          Надіслати відгук
        </button>
      </div>
    </form>
  );
}



/** ——— utils ——— */
function sanitize(list) {
  return (Array.isArray(list) ? list : [])
    .map((r, i) => ({
      id: r.id || `r-${i}`,
      name: String(r.name || "Анонім").slice(0, 40).trim(),
      rating: clamp(Number(r.rating) || 5, 1, 5),
      message: String(r.message || "").slice(0, 800).trim(),
      createdAt: r.createdAt || new Date().toISOString(),
      recommended: !!r.recommended,
      verified: !!r.verified,
    }))
    .slice(0, 500);
}

<section className="mt-10 rounded-2xl border bg-white p-6 shadow-lg">
  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
    Питання і відповіді
  </h2>
  <div className="divide-y divide-gray-200">
    <Faq q="Як швидко ви відправляєте?" a="Зазвичай того ж дня до 15:00. Далі — на наступний робочий день." />
    <Faq q="Що з гарантією?" a="Обмін/повернення 14 днів, сервіс від бренду або наш партнерський сервісний центр." />
    <Faq q="Чи допоможете підібрати?" a="Так. Напишіть нам у Telegram або залиште повідомлення на сторінці Контакти." />
  </div>
</section>

