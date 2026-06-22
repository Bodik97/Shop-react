// src/components/BlogPost.jsx — сторінка статті блогу.
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { PortableText } from "@portabletext/react";
import { Loader2, ArrowRight, ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { client, urlFor } from "../sanityClient";

const SITE = "https://airsoft-ua.com";

const CATEGORY_LABELS = {
  air_rifles: "Пневматичні гвинтівки",
  "psp-rifles": "PCP гвинтівки",
  flobers: "Револьвери флобера",
  "pnevmo-pistols": "Пневматичні пістолети",
  "start-pistols": "Стартові пістолети",
  "pepper-sprays": "Перцеві балончики",
};

const fetchPost = async (slug) => {
  const query = `*[_type == "post" && slug.current == $slug && published == true][0]{
    _id, title, excerpt, "slug": slug.current, body, author, authorRole,
    category, faq, publishedAt, updatedAt, seoTitle, mainImage
  }`;
  return await client.fetch(query, { slug });
};

const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d)) : "";

// Рендер Portable Text у стилі сайту.
const ptComponents = {
  block: {
    normal: ({ children }) => <p className="text-ink-soft leading-relaxed mb-4">{children}</p>,
    h2: ({ children }) => <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="font-display text-lg font-bold text-ink mt-6 mb-2">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent bg-surface rounded-r-lg px-4 py-3 my-5 text-ink-soft italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-ink-soft">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-ink-soft">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const ext = /^https?:\/\//.test(value?.href || "") && !value.href.includes("airsoft-ua.com");
      return (
        <a
          href={value?.href}
          className="text-accent underline underline-offset-2 hover:brightness-90"
          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) =>
      value?.asset ? (
        <img
          src={urlFor(value).width(1200).fit("max").auto("format").url()}
          alt={value.alt || ""}
          loading="lazy"
          decoding="async"
          className="w-full rounded-xl border border-line my-6"
        />
      ) : null,
  },
};

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!post) {
    return (
      <main className="py-16 text-center">
        <Helmet>
          <meta name="robots" content="noindex" />
          <title>Статтю не знайдено | AirSoft-UA</title>
        </Helmet>
        <h1 className="font-display text-2xl font-bold text-ink">Статтю не знайдено</h1>
        <button onClick={() => navigate("/blog")} className="mt-4 px-6 py-2.5 bg-accent rounded-lg text-white font-semibold">
          До блогу
        </button>
      </main>
    );
  }

  const url = `${SITE}/blog/${post.slug}`;
  const coverUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format").url()
    : `${SITE}/img/ogp-img.webp`;
  const seoTitle = post.seoTitle || `${post.title} | AirSoft-UA`;
  const modified = post.updatedAt || post.publishedAt;
  const catLabel = CATEGORY_LABELS[post.category];

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: coverUrl,
    datePublished: post.publishedAt,
    dateModified: modified,
    author: { "@type": "Person", name: post.author, ...(post.authorRole ? { jobTitle: post.authorRole } : {}) },
    publisher: {
      "@type": "Organization",
      name: "AirSoft-UA",
      logo: { "@type": "ImageObject", url: `${SITE}/img/Logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  });

  const faqSchema =
    post.faq?.length > 0
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        })
      : null;

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  });

  return (
    <main>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={coverUrl} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={modified} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={coverUrl} />

        <script type="application/ld+json">{articleSchema}</script>
        <script type="application/ld+json">{breadcrumbSchema}</script>
        {faqSchema && <script type="application/ld+json">{faqSchema}</script>}
      </Helmet>

      <article className="max-w-3xl mx-auto">
        <nav className="text-[13px] text-ink-soft mb-4" aria-label="Хлібні крихти">
          <Link to="/" className="hover:text-accent">Головна</Link>
          <span className="mx-1.5">/</span>
          <Link to="/blog" className="hover:text-accent">Блог</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink line-clamp-1 inline">{post.title}</span>
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4 text-[13px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="w-4 h-4" />
            {post.author}{post.authorRole ? `, ${post.authorRole}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            {post.updatedAt ? `Оновлено ${fmtDate(post.updatedAt)}` : fmtDate(post.publishedAt)}
          </span>
        </div>

        {post.mainImage && (
          <img
            src={urlFor(post.mainImage).width(1200).height(630).fit("crop").auto("format").url()}
            alt={post.title}
            width={1200}
            height={630}
            className="w-full rounded-2xl border border-line mt-6 mb-8"
            decoding="async"
          />
        )}

        <div className="text-[16px]">
          <PortableText value={post.body} components={ptComponents} />
        </div>

        {post.faq?.length > 0 && (
          <section className="mt-10 pt-8 border-t border-line">
            <h2 className="font-display text-xl font-bold text-ink mb-4">Питання та відповіді</h2>
            <div className="divide-y divide-line">
              {post.faq.map((f, i) => (
                <details key={i} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-ink text-[15px]">
                    {f.q}
                    <span className="ml-3 grid place-items-center w-6 h-6 rounded-full bg-accent text-white text-xs group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-ink-soft leading-relaxed text-[15px]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {catLabel && (
          <Link
            to={`/category/${post.category}`}
            className="mt-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 hover:border-accent transition group"
          >
            <span className="font-display font-semibold text-ink">Переглянути: {catLabel}</span>
            <ArrowRight className="w-5 h-5 text-accent group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        <Link to="/blog" className="mt-8 inline-flex items-center gap-1.5 text-ink-soft hover:text-accent text-[14px]">
          <ArrowLeft className="w-4 h-4" /> Усі статті
        </Link>
      </article>
    </main>
  );
}
