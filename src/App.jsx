// src/App.jsx
import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { client } from "./sanityClient";

import { CartProvider } from "./context/CartContext";
import { useCart } from "./context/CartContext";

// Eager: критичні для першого екрану
import Header from "./components/Header";
import Footer from "./components/Footer";
import CategoryNav from "./components/CategoryNav";
import PopularSlider from "./components/PopularSlider";
import ScrollToTop from "./components/ScrollToTop";

// Lazy: завантажуються лише за переходом на маршрут
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
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
  </div>
);

// ─── Завантаження продуктів для головної (тільки популярні, мінімальні поля) ──
function useSanityProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    // Беремо тільки популярні (для слайдера на головній), і тільки ті поля,
    // які реально потрібні в ProductCard. gallery/videoUrl/mainImage не тягнемо.
    const query = `*[_type == "product" && popular == true]
      | order(popularityScore desc)[0...12] {
        _id,
        "id": _id,
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
    client
      .fetch(query)
      .then((data) => setProducts(data || []))
      .catch((err) => console.error("Помилка завантаження товарів:", err));
  }, []);
  return products;
}

// ─── AppContent — внутрішній компонент ──────────────────────────────────────
// Живе ВСЕРЕДИНІ CartProvider, тому може викликати useCart()
function AppContent({ products }) {
  const { cartCount } = useCart();

  // Блокування zoom (Ctrl+колесо, iOS pinch, тощо)
  useEffect(() => {
    const opts = { passive: false };
    const onWheel      = (e) => { if (e.ctrlKey) e.preventDefault(); };
    const onGesture    = (e) => e.preventDefault();
    const onDblClick   = (e) => e.preventDefault();
    const onTouchStart = (e) => { if (e.touches?.length > 1) e.preventDefault(); };

    window.addEventListener("wheel",        onWheel,      opts);
    window.addEventListener("gesturestart", onGesture,    opts);
    window.addEventListener("dblclick",     onDblClick,   opts);
    window.addEventListener("touchstart",   onTouchStart, opts);

    return () => {
      window.removeEventListener("wheel",        onWheel);
      window.removeEventListener("gesturestart", onGesture);
      window.removeEventListener("dblclick",     onDblClick);
      window.removeEventListener("touchstart",   onTouchStart);
    };
  }, []);

  return (
    <>
      <ScrollToTop smooth />

      {/* Header тепер сам бере cartCount з useCart() — не передаємо prop */}
      <Header cartCount={cartCount} />

      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AirSoft",
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
                <h1 className="relative text-center text-3xl sm:text-4xl md:text-6xl font-stencil uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white mb-6 sm:mb-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
                  AIRSOFT
                  <span aria-hidden className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 h-[3px] w-40 rounded-full bg-white/60 blur-[4px]" />
                  <span aria-hidden className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-200%] animate-shine" />
                </h1>
                <CategoryNav />
                <section className="mt-8">
                  {products.length ? (
                    <PopularSlider products={products.slice(0, 10)} />
                  ) : (
                    <div className="rounded-2xl border bg-white/60 p-4 text-sm text-gray-700">
                      Каталог оновлюється.
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
    </>
  );
}

// ─── App — головний компонент ────────────────────────────────────────────────
// Його єдина задача: завантажити products і огорнути все в CartProvider
export default function App() {
  const products = useSanityProducts();

  return (
    <CartProvider products={products}>
      <AppContent products={products} />
    </CartProvider>
  );
}