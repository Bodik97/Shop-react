// src/components/ProductPage.jsx
import { lazy, Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
// 1. Імпортуємо клієнт Sanity
import { client } from "../sanityClient";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { trackViewItem } from "../utils/analytics";

// Lazy: модалка покупки потрібна тільки після кліку
const ModalBuy = lazy(() => import("./ModalBuy"));

const SITE_URL = "https://airsoft-ua.com";

// Назви категорій українською — для SEO мета-тегів і schema.org
const CATEGORY_NAMES = {
  air_rifles: "Пневматичні гвинтівки",
  "psp-rifles": "PCP гвинтівки",
  flobers: "Револьвери флобера",
  "pnevmo-pistols": "Пневматичні пістолети",
  "start-pistols": "Стартові пістолети",
  "pepper-sprays": "Перцеві балончики",
};

// ─── Хелпер для YouTube/Vimeo embed URL ─────────────────────────────────────
function getVideoEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

const Badge = ({ children, variant = "blue", className = "" }) => {
  const styles =
    variant === "green"
      ? "bg-green-50 text-green-700"
      : variant === "popular"
      ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-sm"
      : "bg-blue-50 text-blue-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${className}`}>
      {variant === "popular" ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
            <path fill="currentColor" d="M13.5 2s1 2 .5 3.5S11 7 11 9s1.5 3 3 3 3-1 3-3 2-3.5 2-3.5S21 9 21 12.5 17.9 21 12 21 3 16.6 3 12.5 5.5 7 9 6c0 0-.5 1.5 0 2.5S11 10 11 8.5 12 2 13.5 2Z" />
          </svg>
          Популярний
        </>
      ) : (
        children
      )}
    </span>
  );
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // --- Sanity Data State ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyProduct, setBuyProduct] = useState(null); 

  // --- Завантаження даних ---
  // :id у URL може бути або slug.current, або _id (зворотна сумісність зі старими URL у Google).
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const query = `*[_type == "product" && (slug.current == $idOrSlug || _id == $idOrSlug)][0] {
          ...,
          "id": _id,
          "slug": slug.current,
          "gallery": images[].asset->url,
          "mainImageUrl": mainImage.asset->url,
          addons[]{
            name,
            price,
            "imageUrl": image.asset->url
          }
        }`;
        const data = await client.fetch(query, { idOrSlug: id });
        setProduct(data);
      } catch (err) {
        console.error("Sanity fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // GA4 view_item — після успішного завантаження товару (один раз на товар)
  useEffect(() => {
    if (product?.id) trackViewItem(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const isPopular = !!product?.popular;

  // Слайдер — тільки фото: головне + галерея (відео винесено в окрему секцію)
  const slides = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.mainImageUrl) list.push({ type: "image", url: product.mainImageUrl });
    if (product.gallery?.length) {
      product.gallery.forEach((g) => g && list.push({ type: "image", url: g }));
    }
    return list;
  }, [product]);

  // Усі слайди — це фото, тому imgs = slides
  const imgs = useMemo(() => slides.map((s) => s.url), [slides]);

  const videoEmbed = useMemo(
    () => getVideoEmbedUrl(product?.videoUrl),
    [product?.videoUrl]
  );

  const [idx, setIdx] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    setSelectedAddons([]);
    setIdx(0);
  }, [id]);

  // --- Логіка слайдера та зуму ---
  const clampIndex = useCallback((i) => (slides.length ? (i + slides.length) % slides.length : 0), [slides.length]);
  const prev = useCallback(() => setIdx((i) => clampIndex(i - 1)), [clampIndex]);
  const next = useCallback(() => setIdx((i) => clampIndex(i + 1)), [clampIndex]);
  const currentSlide = slides[idx] || null;

  const [openFS, setOpenFS] = useState(false);
  const [fsIdx, setFsIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const swipeStartX = useRef(0);
  const pinchStart = useRef({ dist: 0, scale: 1 });

  const fsPrev = useCallback(
    () => setFsIdx((i) => (imgs.length ? (i - 1 + imgs.length) % imgs.length : 0)),
    [imgs.length]
  );
  const fsNext = useCallback(
    () => setFsIdx((i) => (imgs.length ? (i + 1) % imgs.length : 0)),
    [imgs.length]
  );

  const clampOffset = (x, y, s) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const maxX = (vw * (s - 1)) / 2;
    const maxY = (vh * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const zoomAt = useCallback((next, cx, cy) => {
      const ns = Math.max(1, Math.min(4, next));
      setOffset((o) => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const px = cx - vw / 2 - o.x;
        const py = cy - vh / 2 - o.y;
        const k = 1 - ns / scale;
        return clampOffset(o.x + px * k, o.y + py * k, ns);
      });
      setScale(ns);
      if (ns === 1) setOffset({ x: 0, y: 0 });
    }, [scale]);

  const openFull = () => {
    if (currentSlide?.type !== "image") return;
    const pos = Math.max(0, imgs.indexOf(currentSlide.url));
    setFsIdx(pos);
    setOpenFS(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };
  const onWheelFS = (e) => zoomAt(scale - Math.sign(e.deltaY) * 0.25, e.clientX, e.clientY);
  const onDoubleClickFS = (e) => zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY);

  useEffect(() => {
    if (!openFS) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") fsPrev();
      if (e.key === "ArrowRight") fsNext();
      if (e.key === "Escape") setOpenFS(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openFS, fsPrev, fsNext]);

  const [flashCart, setFlashCart] = useState(false);
  const timerRef = useRef(null);

  const startDrag = (clientX, clientY) => {
    if (scale === 1) return;
    dragging.current = true;
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };
  const doDrag = (clientX, clientY) => {
    if (!dragging.current || scale === 1) return;
    setOffset(clampOffset(clientX - dragStart.current.x, clientY - dragStart.current.y, scale));
  };
  const endDrag = () => (dragging.current = false);

  const onFSPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale };
    } else if (scale > 1) startDrag(e.clientX, e.clientY);
  };
  const onFSPointerMove = (e) => {
    const map = pointers.current;
    if (map.has(e.pointerId)) map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size === 2) {
      const [a, b] = [...map.values()];
      const factor = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinchStart.current.dist || 1);
      const nextS = Math.max(1, Math.min(4, (pinchStart.current.scale || 1) * factor));
      zoomAt(nextS, (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (dragging.current) {
      doDrag(e.clientX, e.clientY);
    }
  };
  const onFSPointerUp = (e) => { pointers.current.delete(e.pointerId); endDrag(); };

  // --- Обробка даних (Specs & Addons) ---
  // Зберігаємо оригінальний порядок з CMS і фільтруємо порожні рядки.
  const specs = useMemo(() => {
    if (!Array.isArray(product?.specs)) return [];
    return product.specs.filter(
      (s) => s && s.label && (s.value || s.value === 0)
    );
  }, [product?.specs]);

  const addons = product?.addons ?? [];

  const addonsTotal = useMemo(() => {
    // Використовуємо локальну змінну всередині, щоб не залежати від зовнішньої 'addons'
    const currentAddons = product?.addons ?? [];
    return currentAddons
      .filter((a) => selectedAddons.includes(a.name))
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  }, [product?.addons, selectedAddons]);

  const finalPrice = (Number(product?.price) || 0) + addonsTotal;

  const toggleAddon = (name) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  // --- SEO meta + schema.org ---
  const seo = useMemo(() => {
    if (!product) return null;
    const productId = product.id || product._id;
    // Канонічний URL — завжди через slug, якщо він є.
    // Старі URL з _id залишаються робочими, але canonical веде Google на slug-варіант.
    const productSlug = product.slug || productId;
    const productUrl = `${SITE_URL}/product/${productSlug}`;
    const priceStr = formatUAH(product.price || 0);
    const categoryName = CATEGORY_NAMES[product.category] || product.category || "";
    const title = `${product.title} — ${priceStr} | AirSoft-UA`;
    const description = product.description?.trim()
      ? product.description.replace(/\s+/g, " ").slice(0, 160)
      : `${product.title} — купити в Україні. Ціна ${priceStr}. Швидка доставка, гарантія, оплата при отриманні.`;
    const inStock = product.stock == null || product.stock > 0;
    const images = [product.mainImageUrl, ...(product.gallery || [])].filter(Boolean);

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: images,
      description: product.description || product.title,
      sku: productId,
      category: categoryName,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "UAH",
        price: product.price || 0,
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Головна", item: `${SITE_URL}/` },
        ...(product.category
          ? [{
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: `${SITE_URL}/category/${product.category}`,
            }]
          : []),
        {
          "@type": "ListItem",
          position: product.category ? 3 : 2,
          name: product.title,
        },
      ],
    };

    // Динамічна OG-картинка з логотипом, ціною, фото — для шарингу в соцмережі.
    // У Product schema (для Google) залишаємо сире фото товару — пошуковику зайвий бренд не треба.
    const ogImage = `${SITE_URL}/api/og?slug=${encodeURIComponent(productSlug)}`;

    return {
      title,
      description,
      url: productUrl,
      ogTitle: `${product.title} — ${priceStr}`,
      ogImage,
      image: product.mainImageUrl || null,
      price: product.price || 0,
      inStock,
      productSchemaJson: JSON.stringify(productSchema),
      breadcrumbSchemaJson: JSON.stringify(breadcrumbSchema),
    };
  }, [product]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-x-hidden">
      {!product ? (
        <div className="text-center py-20">
          <p className="text-white text-xl">Товар не знайдено.</p>
          <button onClick={() => navigate("/")} className="mt-4 px-6 py-2 bg-blue-600 rounded-lg text-white">На головну</button>
        </div>
      ) : (
        <>
        {seo && (
            <Helmet>
              <title>{seo.title}</title>
              <meta name="description" content={seo.description} />
              <link rel="canonical" href={seo.url} />

              <meta property="og:type" content="product" />
              <meta property="og:title" content={seo.ogTitle} />
              <meta property="og:description" content={seo.description} />
              <meta property="og:url" content={seo.url} />
              <meta property="og:image" content={seo.ogImage} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="product:price:amount" content={String(seo.price)} />
              <meta property="product:price:currency" content="UAH" />
              <meta property="product:availability" content={seo.inStock ? "in stock" : "out of stock"} />

              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={seo.ogTitle} />
              <meta name="twitter:description" content={seo.description} />
              <meta name="twitter:image" content={seo.ogImage} />
              <meta name="twitter:image:alt" content={product.title} />

              <script type="application/ld+json">{seo.productSchemaJson}</script>
              <script type="application/ld+json">{seo.breadcrumbSchemaJson}</script>
            </Helmet>
          )}

          {flashCart && (
            <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] animate-slideUpFade">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 shadow-lg">
                ✅ Додано в кошик
              </span>
            </div>
          )}

          <nav className="text-xs sm:text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:underline">Головна</Link>
            <span className="mx-1">/</span>
            <Link to={`/category/${product.category}`} className="hover:underline capitalize">{product.category}</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-200 line-clamp-1">{product.title}</span>
          </nav>

          <div className="header-flex mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
            <button onClick={() => navigate(-1)} className="w-fit px-4 h-10 bg-black !text-white rounded-xl font-semibold hover:bg-gray-900 active:scale-95 transition text-sm">
              ← Назад
            </button>
            <h1
              lang="uk"
              className="font-extrabold text-white leading-tight text-pretty hyphens-auto [overflow-wrap:anywhere] text-[clamp(1.25rem,5vw,2.5rem)] max-w-full"
            >
              {product.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* ГАЛЕРЕЯ */}
            <section className="lg:col-span-7">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl border border-gray-100">
                <img
                  src={currentSlide?.url}
                  alt={product.title}
                  className="w-full aspect-[4/3] object-contain cursor-zoom-in"
                  onClick={openFull}
                  onPointerDown={(e) => (swipeStartX.current = e.clientX)}
                  onPointerUp={(e) => {
                    const dx = e.clientX - swipeStartX.current;
                    if (Math.abs(dx) > 50) (dx > 0 ? prev() : next());
                  }}
                />

                {/* Prev / Next */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Попередній слайд"
                      className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/70 text-white hover:bg-black active:scale-95 transition shadow"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Наступний слайд"
                      className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/70 text-white hover:bg-black active:scale-95 transition shadow"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Крапки-індикатори */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIdx(i)}
                          aria-label={`Слайд ${i + 1}`}
                          className={`h-2 rounded-full transition-all ${
                            i === idx ? "w-6 bg-black" : "w-2 bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* САЙДБАР */}
            <aside className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    {isPopular && <Badge variant="popular" />}
                    <Badge variant="green">В наявності</Badge>
                </div>

                <div className="space-y-1 mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600 tabular-nums">
                    {formatUAH(finalPrice)}
                  </div>
                  {product.oldPrice && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 line-through text-base sm:text-lg tabular-nums">{formatUAH(product.oldPrice)}</span>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                        </span>
                    </div>
                  )}
                </div>

                {product.giftText && (
                    product.category === "pepper-sprays" ? (
                        // Для перцевих балончиків це не подарунок —
                        // показуємо просто текст без помаранчевої плашки і смайлика.
                        <p className="text-sm text-gray-700 leading-snug mb-6">
                            {product.giftText}
                        </p>
                    ) : (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
                            <div className="flex gap-3 text-orange-800">
                                <span className="text-xl">🎁</span>
                                <div>
                                    <p className="font-bold text-sm">Подарунок до замовлення!</p>
                                    <p className="text-xs opacity-90">{product.giftText}</p>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {addons.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <p className="font-bold text-gray-900">Додати до комплекту:</p>
                    {addons.map((addon) => (
                      <label key={addon.name} className={`flex items-start sm:items-center justify-between gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-xl border-2 transition cursor-pointer ${selectedAddons.includes(addon.name) ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <input type="checkbox" checked={selectedAddons.includes(addon.name)} onChange={() => toggleAddon(addon.name)} className="w-5 h-5 accent-blue-600 shrink-0 mt-1 sm:mt-0" />
                            {addon.imageUrl && (
                              <img
                                src={addon.imageUrl}
                                alt={addon.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
                                loading="lazy"
                                decoding="async"
                                width={56}
                                height={56}
                              />
                            )}
                            <span className="text-[13px] sm:text-sm font-medium leading-snug min-w-0 [overflow-wrap:anywhere] hyphens-auto" lang="uk">
                              {addon.name}
                            </span>
                        </div>
                        <span className="font-bold text-sm tabular-nums shrink-0 self-start sm:self-auto pt-1 sm:pt-0">+{formatUAH(addon.price)}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => setBuyProduct({...product, addons: addons.filter(a => selectedAddons.includes(a.name))})} className="h-12 sm:h-14 bg-black !text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-900 active:scale-[0.98] transition shadow-lg">
                    Купити зараз
                  </button>
                  <button
                    onClick={() => {
                        const chosen = addons.filter(a => selectedAddons.includes(a.name));
                        addToCart({...product, addons: chosen});
                        if (timerRef.current) clearTimeout(timerRef.current);
                        setFlashCart(true);
                        timerRef.current = setTimeout(() => setFlashCart(false), 2000);
                    }}
                    className="h-12 sm:h-14 bg-black !text-white rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition"
                  >
                    <ShoppingCart size={20} /> Додати в кошик
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* ВІДЕО ТА ХАРАКТЕРИСТИКИ */}
          <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
            {videoEmbed && (
              <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Відеоогляд</h2>
                <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={videoEmbed}
                    title={`Відео: ${product.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </section>
            )}

            {specs.length > 0 && (
                <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Характеристики</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 lg:gap-x-12">
                        {specs.map((spec, i) => (
                            <div
                                key={`${spec.label}-${i}`}
                                className="flex items-start justify-between gap-3 sm:gap-4 py-2.5 border-b border-gray-100 last:border-b-0 odd:md:border-b md:[&:nth-last-child(-n+2)]:border-b-0"
                            >
                                <dt className="text-gray-500 text-sm md:text-base shrink-0 max-w-[55%] break-words leading-snug">
                                    {spec.label}
                                </dt>
                                <dd className="text-gray-900 font-semibold text-sm md:text-base text-right break-words min-w-0 leading-snug">
                                    {spec.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
          </div>
        </>
      )}

      {/* ФУЛСКРІН ГАЛЕРЕЯ */}
      {openFS && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col" style={{ touchAction: "none" }}>
            <div className="p-3 sm:p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b gap-2">
                <div className="flex gap-1.5 sm:gap-2">
                    <button onClick={fsPrev} className="w-11 h-11 rounded-full bg-black !text-white flex items-center justify-center font-bold active:scale-95 transition">←</button>
                    <button onClick={fsNext} className="w-11 h-11 rounded-full bg-black !text-white flex items-center justify-center font-bold active:scale-95 transition">→</button>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                    <button onClick={() => zoomAt(scale + 0.5, innerWidth/2, innerHeight/2)} className="w-11 h-11 bg-black !text-white rounded-lg font-bold active:scale-95 transition">+</button>
                    <button onClick={() => zoomAt(scale - 0.5, innerWidth/2, innerHeight/2)} className="w-11 h-11 bg-black !text-white rounded-lg font-bold active:scale-95 transition">−</button>
                    <button onClick={() => setOpenFS(false)} className="w-11 h-11 bg-black !text-white rounded-lg font-bold active:scale-95 transition" aria-label="Закрити">✕</button>
                </div>
            </div>
            <div 
                className="flex-1 relative overflow-hidden"
                onWheel={onWheelFS}
                onDoubleClick={onDoubleClickFS} 
                onPointerDown={onFSPointerDown}
                onPointerMove={onFSPointerMove}
                onPointerUp={onFSPointerUp}
            >
                <img
                  src={imgs[fsIdx]}
                  alt="Full view"
                  className="absolute top-1/2 left-1/2 transition-transform duration-75"
                  style={{
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    maxWidth: "95%",
                    maxHeight: "90%",
                    objectFit: "contain"
                  }}
                  draggable={false}
                />
            </div>
          </div>
      )}

      {buyProduct && (
        <Suspense fallback={null}>
          <ModalBuy open product={buyProduct} onClose={() => setBuyProduct(null)} />
        </Suspense>
      )}
    </main>
  );
}