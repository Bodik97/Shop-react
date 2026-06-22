// src/components/Blog.jsx — список статей блогу/гайдів.
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight, BookOpen } from "lucide-react";
import { client, urlFor } from "../sanityClient";

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

const img = (src, w, h) => urlFor(src).width(w).height(h).fit("crop").auto("format").url();

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
    <main>
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
      <header className="rounded-3xl border border-line bg-gradient-to-br from-stone-50 via-surface to-stone-100 px-6 sm:px-10 py-9 sm:py-12 mb-8 sm:mb-10">
        <p className="inline-flex items-center gap-1.5 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-accent mb-3">
          <BookOpen className="w-4 h-4" /> Блог
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink leading-tight max-w-2xl">
          Гайди про пневматику та самозахист
        </h1>
        <p className="mt-3 text-base sm:text-lg text-ink-soft max-w-2xl">
          Як обрати гвинтівку, що з легальністю в Україні, догляд і поради — коротко, чесно й по суті.
        </p>
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
              <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[340px] overflow-hidden bg-surface">
                {featured.mainImage && (
                  <img
                    src={img(featured.mainImage, 900, 620)}
                    alt={featured.title}
                    width={900}
                    height={620}
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
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

          {/* ── Решта статей ── */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {rest.map((p) => (
                <Link
                  key={p._id}
                  to={`/blog/${p.slug}`}
                  className="group flex flex-col rounded-2xl border border-line bg-white overflow-hidden hover:shadow-md hover:-translate-y-1 transition duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                    {p.mainImage && (
                      <img
                        src={img(p.mainImage, 640, 400)}
                        alt={p.title}
                        width={640}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    )}
                    <CategoryBadge category={p.category} className="absolute top-3 left-3 !bg-white/95 backdrop-blur shadow-sm" />
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <time className="text-[12px] text-ink-soft" dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time>
                    <h3 className="font-display text-[17px] font-bold text-ink mt-1.5 leading-snug group-hover:text-accent transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-[14px] text-ink-soft mt-2 line-clamp-2">{p.excerpt}</p>
                    <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-accent font-semibold text-[14px]">
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
