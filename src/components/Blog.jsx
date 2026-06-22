// src/components/Blog.jsx — список статей блогу/гайдів.
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { client, urlFor } from "../sanityClient";

const fetchPosts = async () => {
  const query = `*[_type == "post" && published == true] | order(publishedAt desc){
    _id, title, excerpt, "slug": slug.current, publishedAt, mainImage
  }`;
  return await client.fetch(query);
};

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d)) : "";

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

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

      <nav className="text-[13px] text-ink-soft mb-4" aria-label="Хлібні крихти">
        <Link to="/" className="hover:text-accent">Головна</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Блог</span>
      </nav>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">Блог та гайди</h1>
      <p className="text-ink-soft mb-8 max-w-2xl">
        Як обрати пневматику, що з легальністю в Україні, догляд і поради — коротко й по суті.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
          Статті скоро з’являться.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/blog/${p.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-white overflow-hidden hover:shadow-md transition"
            >
              {p.mainImage && (
                <div className="aspect-[16/10] overflow-hidden bg-surface">
                  <img
                    src={urlFor(p.mainImage).width(600).height(375).fit("crop").auto("format").url()}
                    alt={p.title}
                    width={600}
                    height={375}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <time className="text-[12px] text-ink-soft" dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time>
                <h2 className="font-display text-lg font-bold text-ink mt-1 leading-snug group-hover:text-accent transition-colors">
                  {p.title}
                </h2>
                <p className="text-[14px] text-ink-soft mt-2 line-clamp-3">{p.excerpt}</p>
                <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-accent font-semibold text-[14px]">
                  Читати <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
