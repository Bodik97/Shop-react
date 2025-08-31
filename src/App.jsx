// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { products } from "./data/products";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import CategoryPage from "./components/CategoryPage";
import PopularSlider from "./components/PopularSlider";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";

// ВАЖЛИВО: правильні імпорти
import ModalBuy from "./components/ModalBuy"; // модальне вікно покупки
import Cart from "./components/Cart";         // сторінка кошика

export default function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // збереження кошика
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // синхронізація цін
  const refreshCartPrices = () => {
    setCart(prev =>
      prev.map(item => {
        const prod = products.find(p => p.id === item.id);
        return prod ? { ...item, price: prod.price } : item;
      })
    );
  };
  useEffect(() => { refreshCartPrices(); }, []);

  // кошик
  const addToCart = (product) => {
    setCart(prev => {
      const i = prev.findIndex(p => p.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + 1 };
        return copy;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };
  const changeQty = (id, qty) =>
    setCart(prev => (qty <= 0 ? prev.filter(p => p.id !== id) : prev.map(p => (p.id === id ? { ...p, qty } : p))));
  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const checkout = () => {
    refreshCartPrices();
    console.log("ORDER:", cart);
    alert("Замовлення відправлено!");
  };

  // модалка швидкої покупки
  const openBuy = (product) => { setSelected(product); setBuyOpen(true); };
  const submitBuy = (payload) => {
    console.log("ORDER (quick):", payload);
    setBuyOpen(false);
    alert("Заявку відправлено! Ми зв’яжемося з вами.");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Header cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={
            <main className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="relative text-center text-5xl md:text-6xl font-stencil uppercase tracking-[0.3em] text-white mb-12">
                AIRSOFT
              </h1>

              <CategoryNav />

              <section className="mt-8">
                <h2 className="relative text-left text-2xl md:text-5xl font-stencil uppercase tracking-[0.25em] text-white mb-4">
                  Популярні товари
                </h2>
                <PopularSlider
                  products={products.slice(0, 10)}
                  onAddToCart={addToCart}
                  onBuy={openBuy}
                />
              </section>

              <section className="mt-10">
                <h2 className="relative text-left text-2xl md:text-5xl font-stencil uppercase tracking-[0.25em] text-white mb-4">
                  Товари
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, i) => (
                    <ProductCard
                      key={`${product.id}-${i}`}      // поки id неунікальні
                      product={product}
                      onAddToCart={addToCart}
                      onBuy={openBuy}
                    />
                  ))}
                </div>
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

        <Route
          path="/category/:id"
          element={<CategoryPage onAddToCart={addToCart} onBuy={openBuy} />}
        />

        <Route
          path="/product/:id"
          element={<ProductPage onAddToCart={addToCart} onBuy={openBuy} />}
        />
      </Routes>

      {/* модалка швидкої покупки */}
      <ModalBuy
        open={buyOpen}
        product={selected}
        onClose={() => setBuyOpen(false)}
        onSubmit={submitBuy}
      />
    </>
  );
}
