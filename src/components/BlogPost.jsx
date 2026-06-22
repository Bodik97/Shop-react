// src/components/BlogPost.jsx — сторінка статті блогу.
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { PortableText } from "@portabletext/react";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
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
    normal: ({ children }) => <p className="text-[17px] text-ink-soft leading-[1.8] mb-5">{children}</p>,
    h2: ({ children }) => <h2 className="font-display text-xl sm:text-2xl font-bold text-ink mt-10 mb-4 scroll-mt-24">{children}</h2>,
    h3: ({ children }) => <h3 className="font-display text-lg font-bold text-ink mt-7 mb-2.5">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent bg-surface rounded-r-xl px-5 py-4 my-6 text-ink-soft italic text-[17px]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-5 space-y-2.5 text-[17px] text-ink-soft">{children}</ul>,
    number: ({ children }) => <ol className="mb-5 space-y-2.5 text-[17px] text-ink-soft list-decimal pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="relative pl-7 leading-[1.7] before:absolute before:left-0 before:top-[0.6em] before:h-2 before:w-2 before:rounded-full before:bg-accent">
        {children}
      </li>
    ),
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
  const authorInitials = (post.author || "A").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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

        {catLabel && (
          <Link
            to={`/category/${post.category}`}
            className="inline-flex items-center rounded-full bg-orange-50 text-accent text-[11px] font-bold uppercase tracking-wide px-3 py-1 mb-4 hover:bg-orange-100 transition"
          >
            {catLabel}
          </Link>
        )}

        <h1 className="font-display text-2xl sm:text-3xl lg:text-[40px] font-bold text-ink leading-[1.15]">
          {post.title}
        </h1>

        <p className="mt-4 text-[17px] sm:text-lg text-ink-soft leading-relaxed">{post.excerpt}</p>

        <div className="flex items-center gap-3 mt-6 pb-6 border-b border-line">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-ink text-white font-display font-bold text-sm shrink-0">
            {authorInitials}
          </span>
          <div className="text-[13px] leading-tight">
            <div className="font-semibold text-ink">{post.author}</div>
            <div className="text-ink-soft mt-0.5">
              {post.authorRole ? `${post.authorRole} · ` : ""}
              {post.updatedAt ? `оновлено ${fmtDate(post.updatedAt)}` : fmtDate(post.publishedAt)}
            </div>
          </div>
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
