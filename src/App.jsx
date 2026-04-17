// src/App.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import * as Data from "./data/products";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import CategoryPage from "./components/CategoryPage";
import CatalogPage from "./components/CatalogPage";
import PopularSlider from "./components/PopularSlider";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";
import About from "./components/About";
import Contact from "./components/Contact";
import ModalBuy from "./components/ModalBuy";
import Cart from "./components/Cart";
import ThankYou from "./components/ThankYou";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Footer from "./components/Footer";


// === налаштування API
const API_URL = "/api/telegram";

export default function App() {
  useEffect(() => {
    const opts = { passive: false };
  
    const onWheel = (e) => { if (e.ctrlKey) e.preventDefault(); };        // Ctrl+колесо
    const onGesture = (e) => e.preventDefault();                           // iOS pinch
    const onDblClick = (e) => e.preventDefault();                          // подвійний клік
    const onTouchStart = (e) => { if (e.touches?.length > 1) e.preventDefault(); }; // 2 пальці
  
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("gesturestart", onGesture, opts);
    window.addEventListener("dblclick", onDblClick, opts);
    window.addEventListener("touchstart", onTouchStart, opts);
  
    return () => {
      window.removeEventListener("wheel", onWheel, opts);
      window.removeEventListener("gesturestart", onGesture, opts);
      window.removeEventListener("dblclick", onDblClick, opts);
      window.removeEventListener("touchstart", onTouchStart, opts);
    };
  }, []);
  
  // Безвідмовне читання продуктів
  const products = useMemo(() => {
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
        image: p.image || "/placeholder.png",
      }));
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // збереження кошика
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // синхронізація цін БЕЗ зациклення
  const refreshCartPrices = useCallback(() => {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const prod = products.find((p) => p.id === item.id);
        if (!prod) return item;
        if (prod.price !== item.price) changed = true;
        return { ...item, price: prod.price };
      });
      return changed ? next : prev;
    });
  }, [products]);

  useEffect(() => {
    refreshCartPrices();
  }, [refreshCartPrices]);

  // кошик
  const addToCart = (product) => {
  setCart((prev) => {
    const i = prev.findIndex((p) => p.id === product.id);
    if (i >= 0) {
      const copy = [...prev];
      copy[i] = { ...copy[i], qty: (Number(copy[i].qty) || 0) + 1 };
      return copy;
    }
    return [
      ...prev,
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
        giftText: product?.giftText?.text || product?.giftText || null, // 🎁 ДОДАНО
      },
    ];
  });
};

  const changeQty = (id, qty) =>
    setCart((prev) =>
      qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));

  // відкриття модалки швидкої покупки з картки товару
  const openBuy = (product) => {
    setSelected(product);
    setBuyOpen(true);
  };

  // оформлення кошика: очікує payload від компонента Cart і шле в Telegram
  const checkout = async (payloadFromCart) => {
    try {
      refreshCartPrices();

      const payload = payloadFromCart ?? {
        mode: "cart",
        cart: cart.map((i) => ({
          id: i.id,
          title: i.title,
          qty: Math.max(1, Number(i.qty) || 1),
          price: Number(i.price) || 0,
          lineTotal: (Number(i.price) || 0) * Math.max(1, Number(i.qty) || 1),
        })),
        subtotal: cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
        discount: 0,
        shipping: 0,
        total: cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
        createdAt: new Date().toISOString(),
      };

      const r = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data?.ok !== true) throw new Error(data?.error || "Помилка відправки");
      alert("✅ Замовлення відправлено!");
      setCart([]);
    } catch (e) {
      console.error(e);
      alert("❌ Не вдалося оформити замовлення");
    }
  };

  const cartCount = cart.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  return (
    <>
      <ScrollToTop smooth />

      {/* Шапка */}
      <Header cartCount={cartCount} />
    
      {/* SEO мета-теги */}
      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AirSoft",
            "url": "https://airsoft-ua.com/",
            "description": "Магазин пневматичних товарів для спорту та дозвілля ."
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
                <span
                  aria-hidden
                  className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 h-[3px] w-40 rounded-full bg-white/60 blur-[4px]"
                />
                <span
                  aria-hidden
                  className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-200%] animate-shine"
                />
              </h1>

              <CategoryNav />

              <section className="mt-8">
                {products.length ? (
                  <PopularSlider products={products.slice(0, 10)} onAddToCart={addToCart} onBuy={openBuy} />
                ) : (
                  <div className="rounded-2xl border bg-white/60 p-4 text-sm text-gray-700">Каталог  оновлюється.</div>
                )}
              </section>

              <section className="mt-10">
                <h2 className="relative text-left text-2xl md:text-5xl font-stencil uppercase tracking-[0.25em] text-white mb-4">
                  Товари
                </h2>

                {products.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        onBuy={openBuy}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-56 rounded-xl border bg-white/50 animate-pulse" />
                    ))}
                  </div>
                )}
              </section>
            </main>
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              refreshPrices={refreshCartPrices}
              changeQty={changeQty}
              removeFromCart={removeFromCart}
              checkout={checkout}
            />
          }
        />
        <Route path="/catalog" element={<CategoryPage onAddToCart={addToCart} onBuy={openBuy} />} />
        <Route path="/category/:id" element={<CategoryPage onAddToCart={addToCart} onBuy={openBuy} />} />

          
        <Route path="/category/:id" element={<CategoryPage onAddToCart={addToCart} onBuy={openBuy} />} />
        <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} onBuy={openBuy} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/thanks" element={<ThankYou />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      <Footer />

      {/* Модалку монтуємо лише коли потрібно */}
      {buyOpen && (
        <ModalBuy
          open
          product={selected}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </>
  );
}
