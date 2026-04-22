// src/App.jsx
import { useEffect, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import * as Data from "./data/products";

import { CartProvider } from "./context/CartContext";
import { useCart } from "./context/CartContext";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import CategoryPage from "./components/CategoryPage";
import CatalogPage from "./components/CatalogPage";
import PopularSlider from "./components/PopularSlider";
import ProductPage from "./components/ProductPage";
import About from "./components/About";
import Contact from "./components/Contact";
import ModalBuy from "./components/ModalBuy";
import HistoryOrders from "./components/HistoryOrders";
import Cart from "./components/Cart";
import ThankYou from "./components/ThankYou";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Footer from "./components/Footer";

// ─── Нормалізація продуктів ──────────────────────────────────────────────────
// Винесено в окремий hook — App.jsx стає чистішим
function useProducts() {
  return useMemo(() => {
    const raw = Array.isArray(Data.products)
      ? Data.products
      : Array.isArray(Data.default)
      ? Data.default
      : [];
    return raw
      .filter((p) => p && p.id != null && p.title)
      .map((p) => ({
        ...p,
        price: Number(p.price) || 0,
        image:
          p.image ||
          (Array.isArray(p.imgs) ? p.imgs[0] : null) ||
          "/placeholder.png",
      }));
  }, []);
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

      <Routes>
        <Route
          path="/"
          element={
            <main className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="relative text-center text-4xl md:text-6xl font-stencil uppercase tracking-[0.2em] text-white mb-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
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

        {/* ↓ Жоден Route більше не передає onAddToCart / onBuy / cart через props */}
        <Route path="/cart"             element={<Cart />} />
        <Route path="/catalog"          element={<CategoryPage />} />
        <Route path="/category/:id"     element={<CategoryPage />} />
        <Route path="/product/:id"      element={<ProductPage />} />
        <Route path="/about"            element={<About />} />
        <Route path="/contact"          element={<Contact />} />
        <Route path="/thanks"           element={<ThankYou />} />
        <Route path="/privacy-policy"   element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/history-orders" element={<HistoryOrders />} />
      </Routes>

      <Footer />
    </>
  );
}

// ─── App — головний компонент ────────────────────────────────────────────────
// Його єдина задача: завантажити products і огорнути все в CartProvider
export default function App() {
  const products = useProducts();

  return (
    <CartProvider products={products}>
      <AppContent products={products} />
    </CartProvider>
  );
}