// src/App.jsx
import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
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
import CategoryNav from "./components/CategoryNav";
import PopularSlider from "./components/PopularSlider";
import ContactFAB from "./components/ContactFAB";

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

  // Використовуємо React Query замість useEffect/useState
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: fetchPopularProducts,
  });

  // Блокування zoom
  useEffect(() => {
    const opts = { passive: false };
    const onWheel = (e) => { if (e.ctrlKey) e.preventDefault(); };
    const onGesture = (e) => e.preventDefault();
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("gesturestart", onGesture, opts);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("gesturestart", onGesture);
    };
  }, []);

  return (
    <>
      {/* ScrollToTop видалено, щоб не конфліктувати з відновленням скролу */}
      <PageViewTracker />

      <Header cartCount={cartCount} />

      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AirSoft-UA",
            "url": "https://airsoft-ua.com/",
            "description": "Магазин пневматичних товарів для спорту та дозвілля."
          }
        `}</script>
      </Helmet>

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <Helmet>
                  <title>AirSoft-UA — Пневматичні гвинтівки та пістолети | Купити в Україні</title>
                  <meta name="description" content="Магазин пневматичних товарів в Україні: гвинтівки, пістолети, PCP, револьвери флобера." />
                  <link rel="canonical" href="https://airsoft-ua.com/" />
                </Helmet>
                
                <h1 className="relative text-center text-3xl sm:text-4xl md:text-6xl font-stencil uppercase tracking-[0.15em] text-white mb-6 sm:mb-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
                  AIRSOFT-UA
                </h1>

                <CategoryNav />
                
                <section className="mt-8">
                  {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
                  ) : products.length ? (
                    <PopularSlider products={products.slice(0, 16)} title="Популярні товари" />
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/30">
                      Каталог оновлюється...
                    </div>
                  )}
                </section>
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
          <Route path="/history-orders"   element={<HistoryOrders />} />
        </Routes>
      </Suspense>

      <Footer />
      <ContactFAB />
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