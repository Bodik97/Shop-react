// src/components/Blog.jsx — список статей блогу/гайдів.
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight, BookOpen } from "lucide-react";
import { client, urlFor } from "../sanityClient";
import BulletTrajectory from "./BulletTrajectory";

const CATEGORY_LABELS = {
  air_rifles: "Пневматичні гвинтівки",
  "psp-rifles": "PCP гвинтівки",
  flobers: "Револьвери флобера",
  "pnevmo-pistols": "Пневматичні пістолети",
  "start-pistols": "Стартові пістолети",
  "pepper-sprays": "Перцеві балончики",
};

const fetchPosts = async () => {
  const query = `*[_type == "post" && published == true] | order(publishedAt desc){
    _id, title, excerpt, "slug": slug.current, publishedAt, category, mainImage
  }`;
  return await client.fetch(query);
};

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d)) : "";

// fit("max") — без обрізки: товар видно повністю (показуємо через object-contain).
const img = (src, w) => urlFor(src).width(w).fit("max").auto("format").url();

function CategoryBadge({ category, className = "" }) {
  const label = CATEGORY_LABELS[category];
  if (!label) return null;
  return (
    <span className={`inline-flex items-center rounded-full bg-orange-50 text-accent text-[11px] font-semibold px-2.5 py-1 ${className}`}>
      {label}
    </span>
  );
}

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

  const [featured, ...rest] = posts;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6">
      <Helmet>
        <title>Блог та гайди про пневматику | AirSoft-UA</title>
        <meta
          name="description"
          content="Гайди з вибору пневматики, PCP, флобера та самозахисту, відповіді на питання про легальність і догляд. Поради від AirSoft-UA."
        />
        <link rel="canonical" href="https://airsoft-ua.com/blog" />
      </Helmet>

      <nav className="text-[13px] text-ink-soft mb-5" aria-label="Хлібні крихти">
        <Link to="/" className="hover:text-accent">Головна</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Блог</span>
      </nav>

      {/* ── Хедер ── */}
      <header className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-stone-50 via-surface to-stone-100 px-6 sm:px-10 py-9 sm:py-12 mb-8 sm:mb-10">
        {/* Бренд-анімація: куля летить від «Блог» до цілі в правому нижньому куті */}
        <BulletTrajectory className="inset-0 opacity-90" />

        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-accent mb-3">
            <BookOpen className="w-4 h-4" /> Блог
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight">
            Гайди про пневматику та самозахист
          </h1>
          <p className="mt-3 text-base sm:text-lg text-ink-soft">
            Як обрати гвинтівку, що з легальністю в Україні, догляд і поради — коротко, чесно й по суті.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-ink-soft">
          Статті скоро з’являться.
        </div>
      ) : (
        <>
          {/* ── Виділена (остання) стаття ── */}
          {featured && (
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 rounded-3xl border border-line bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-8 sm:mb-10"
            >
              <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[340px] bg-surface flex items-center justify-center p-6 sm:p-8">
                {featured.mainImage && (
                  <img
                    src={img(featured.mainImage, 900)}
                    alt={featured.title}
                    decoding="async"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-white/95 backdrop-blur text-accent text-[11px] font-bold px-3 py-1.5 shadow-sm">
                  Свіже
                </span>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <CategoryBadge category={featured.category} />
                  <time className="text-[12px] text-ink-soft" dateTime={featured.publishedAt}>{fmtDate(featured.publishedAt)}</time>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight group-hover:text-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[15px] sm:text-base text-ink-soft mt-3 line-clamp-3">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-accent font-semibold">
                  Читати гайд <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          )}

          {/* ── Решта статей: послідовний список (фото зліва, текст справа) ── */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-4 sm:gap-5">
              {rest.map((p) => (
                <Link
                  key={p._id}
                  to={`/blog/${p.slug}`}
                  className="group flex rounded-2xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Фіксована висота → однаковий розмір картинок */}
                  <div className="relative shrink-0 w-28 sm:w-56 md:w-64 h-28 sm:h-40 md:h-44 bg-surface flex items-center justify-center p-3 sm:p-4">
                    {p.mainImage && (
                      <img
                        src={img(p.mainImage, 500)}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0 p-4 sm:p-5">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <CategoryBadge category={p.category} />
                      <time className="text-[12px] text-ink-soft" dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time>
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-[14px] text-ink-soft mt-1.5 line-clamp-2 hidden sm:block">{p.excerpt}</p>
                    <span className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 text-accent font-semibold text-[14px]">
                      Читати <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
