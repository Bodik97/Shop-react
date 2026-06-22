// src/App.jsx
import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ArrowRight, BadgeCheck, ShieldCheck, Truck, RotateCcw, ScanSearch } from "lucide-react";
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery 
} from "@tanstack/react-query"; // Додано React Query
import { client } from "./sanityClient";
import { trackPageView } from "./utils/analytics";

import { CartProvider } from "./context/CartContext";
import { useCart } from "./context/CartContext";

// Створюємо клієнт для кешування поза компонентом
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // Дані вважаються "свіжими" 10 хвилин
      gcTime: 1000 * 60 * 30,    // Тримати в кеші 30 хвилин
      refetchOnWindowFocus: false,
    },
  },
});

// SPA page_view трекер для GA4
function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

// Eager компоненти
import Header from "./components/Header";
import Footer from "./components/Footer";
import Layout from "./components/Layout";
import PopularSlider from "./components/PopularSlider";
import ContactFAB from "./components/ContactFAB";
import CartToast from "./components/CartToast";
import ConsultModal from "./components/ConsultModal";
import HeroRadar from "./components/HeroRadar";

// Lazy сторінки
const CatalogPage      = lazy(() => import("./components/CatalogPage"));
const ProductPage      = lazy(() => import("./components/ProductPage"));
const Cart             = lazy(() => import("./components/Cart"));
const About            = lazy(() => import("./components/About"));
const Contact          = lazy(() => import("./components/Contact"));
const HistoryOrders    = lazy(() => import("./components/HistoryOrders"));
const ThankYou         = lazy(() => import("./components/ThankYou"));
const PrivacyPolicy    = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService   = lazy(() => import("./components/TermsOfService"));
const Blog             = lazy(() => import("./components/Blog"));
const BlogPost         = lazy(() => import("./components/BlogPost"));
const NotFound         = lazy(() => import("./components/NotFound"));
// Нижче згину на головній — лінива загрузка (виносить framer-motion з критичного бандла).
const ReviewsSlider    = lazy(() => import("./components/ReviewsSlider"));
const FaqSection       = lazy(() => import("./components/FaqSection"));

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
  </div>
);

// Функція завантаження продуктів для React Query
const fetchPopularProducts = async () => {
  const query = `*[_type == "product" && popular == true]
    | order(popularityScore desc)[0...18] {
      _id,
      "id": _id,
      "slug": slug.current,
      title,
      price,
      oldPrice,
      category,
      popular,
      popularityScore,
      giftText,
      stock,
      "mainImageUrl": mainImage.asset->url
    }`;
  return await client.fetch(query);
};

// ─── AppContent ──────────────────────────────────────────────────────────
function AppContent() {
  const { cartCount } = useCart();
  const [consultOpen, setConsultOpen] = useState(false);

  // Використовуємо React Query замість useEffect/useState
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: fetchPopularProducts,
  });

  return (
    <>
      {/* ScrollToTop видалено, щоб не конфліктувати з відновленням скролу */}
      <PageViewTracker />

      <div className="flex min-h-dvh flex-col">
      <Header cartCount={cartCount} />

      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AirSoft-UA",
            "url": "https://airsoft-ua.com/",
            "description": "Магазин пневматичних товарів для спорту та дозвілля.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://airsoft-ua.com/catalog?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        `}</script>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AirSoft-UA",
            "url": "https://airsoft-ua.com/",
            "logo": "https://airsoft-ua.com/img/Logo.svg",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "support@airsoft.shop",
              "contactType": "customer support",
              "areaServed": "UA",
              "availableLanguage": "uk"
            }
          }
        `}</script>
      </Helmet>

      <div className="flex-1">
      <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <main>
                <Helmet>
                  <title>AirSoft-UA — Професійна пневматика та спорядження | Купити в Україні</title>
                  <meta name="description" content="Офіційний магазин пневматики та спорядження в Україні. Перевіряємо товар перед відправленням, доставка по всій Україні, оплата при отриманні." />
                  <link rel="canonical" href="https://airsoft-ua.com/" />

                  <meta property="og:type" content="website" />
                  <meta property="og:url" content="https://airsoft-ua.com/" />
                  <meta property="og:title" content="AirSoft-UA — Професійна пневматика та спорядження" />
                  <meta property="og:description" content="Офіційний магазин пневматики та спорядження в Україні. Доставка по всій Україні, оплата при отриманні." />
                  <meta property="og:image" content="https://airsoft-ua.com/img/ogp-img.webp" />
                  <meta property="og:image:width" content="1200" />
                  <meta property="og:image:height" content="630" />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="AirSoft-UA — Професійна пневматика та спорядження" />
                  <meta name="twitter:description" content="Офіційний магазин пневматики та спорядження в Україні. Доставка по всій Україні, оплата при отриманні." />
                  <meta name="twitter:image" content="https://airsoft-ua.com/img/ogp-img.webp" />
                </Helmet>

                {/* HERO — ціннісна пропозиція + заклики */}
                <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-stone-50 via-surface to-stone-200 px-6 sm:px-10 py-10 sm:py-14">
                  {/* Декоративний анімований радар — приціл/точність, за текстом */}
                  <HeroRadar />

                  <div className="relative z-10">
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink max-w-2xl leading-tight">
                      Професійна пневматика <span className="text-accent">та спорядження</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-xl">
                      Офіційний продавець. Перевіряємо кожен товар перед відправленням і відправляємо по всій Україні. Оплата при отриманні.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 font-display font-semibold text-white hover:brightness-95 active:scale-95 transition">
                        Перейти в каталог <ArrowRight className="w-5 h-5" />
                      </Link>
                      <button type="button" onClick={() => setConsultOpen(true)} className="inline-flex items-center rounded-lg border-2 border-ink px-6 py-3.5 font-display font-semibold text-ink hover:bg-ink hover:text-white transition">
                        Консультація
                      </button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink">
                      <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-trust" />10 років на ринку</span>
                      <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-trust" />Оригінальна продукція</span>
                      <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-trust" />Гарантія якості</span>
                    </div>
                  </div>
                </section>

                {/* ТРАС-БАР — сигнали довіри підняті нагору */}
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { Icon: ShieldCheck, title: "Оплата при отриманні", sub: "Платіть, коли отримали" },
                    { Icon: Truck, title: "Доставка по Україні", sub: "Нова Пошта 1–3 дні" },
                    { Icon: ScanSearch, title: "Перевірка перед відправкою", sub: "Тестуємо кожен товар" },
                    { Icon: RotateCcw, title: "14 днів на повернення", sub: "Без зайвих питань" },
                  ].map(({ Icon, title, sub }) => (
                    <div key={title} className="flex items-center justify-center gap-3 rounded-xl border border-line bg-white p-4">
                      <span className="grid place-items-center w-10 h-10 rounded-lg bg-green-100 shrink-0">
                        <Icon className="w-5 h-5 text-trust" />
                      </span>
                      <div>
                        <div className="font-display font-semibold text-[14px] text-ink leading-tight">{title}</div>
                        <div className="text-[13px] text-ink-soft">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <section className="mt-5">
                  {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : products.length ? (
                    <PopularSlider products={products.slice(0, 16)} title="Популярні товари" />
                  ) : (
                    <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
                      Каталог оновлюється...
                    </div>
                  )}
                </section>
                <Suspense fallback={null}>
                  <ReviewsSlider />
                  <FaqSection />
                </Suspense>
              </main>
            }
          />

          <Route path="/cart"             element={<Cart />} />
          <Route path="/catalog"          element={<CatalogPage />} />
          <Route path="/category/:id"     element={<CatalogPage />} />
          <Route path="/product/:id"      element={<ProductPage />} />
          <Route path="/about"            element={<About />} />
          <Route path="/contact"          element={<Contact />} />
          <Route path="/thanks"           element={<ThankYou />} />
          <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/blog"             element={<Blog />} />
          <Route path="/blog/:slug"       element={<BlogPost />} />
          <Route path="/history-orders"   element={<HistoryOrders />} />
          <Route path="/reviews"         element={<ReviewsSlider />} />

          {/* Catch-all 404: без нього невідомі URL віддають порожню сторінку
              зі статусом 200 — Google рахує це як Soft 404 */}
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </Suspense>
      </Layout>
      </div>

      <Footer />
      </div>
      <ContactFAB />
      <CartToast />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </QueryClientProvider>
  );
}