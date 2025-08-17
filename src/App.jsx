import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";
import ProductCard from "./components/ProductCard";
import BuyModal from "./components/BuyModal";
import Cart from "./components/Cart";

import pistolImg from "./img/1.jpeg";
import pistolImg2 from "./img/2.jpeg";
import pistolImg3 from "./img/3.jpeg";
import pistolImg4 from "./img/4.jpeg";

// Приклад товарів
const demoProducts = [
  { id: 1, title: "Куртка робоча CXS NAOS", price: 3300, image: pistolImg },
  { id: 2, title: "Кросівки робочі Record 246 S1", price: 1800, image: pistolImg2 },
  { id: 3, title: "Набір викруток 6в1", price: 420, image: pistolImg3 },
  { id: 4, title: "Окуляри захисні", price: 150, image: pistolImg4 },
];

export default function App() {
  // === Стейти ===
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // === LocalStorage ===
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // === Синхронізація цін ===
  const refreshCartPrices = () => {
    setCart(prev =>
      prev.map(item => {
        const prod = demoProducts.find(p => p.id === item.id);
        return prod ? { ...item, price: prod.price } : item;
      })
    );
  };
  useEffect(() => {
    refreshCartPrices();
  }, []);

  // === Логіка кошика ===
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
    setCart(prev =>
      qty <= 0
        ? prev.filter(p => p.id !== id)
        : prev.map(p => (p.id === id ? { ...p, qty } : p))
    );

  const removeFromCart = (id) =>
    setCart(prev => prev.filter(p => p.id !== id));

  const checkout = () => {
    refreshCartPrices();
    console.log("ORDER:", cart);
    alert("Замовлення відправлено!");
  };

  // === Модалка Buy ===
  const openBuy = (product) => {
    setSelected(product);
    setBuyOpen(true);
  };

  const submitBuy = (payload) => {
    console.log("ORDER:", payload);
    setBuyOpen(false);
    alert("Заявку відправлено! Ми зв’яжемося з вами.");
  };

  // === Кількість товарів для бейджа у хедері ===
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // === JSX ===
  return (
    <>
      <Header cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={
            <main className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-4xl font-bold mb-6">Головна сторінка</h1>

              <CategoryNav />

              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Популярні товари
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demoProducts.map((product) => (
                    <ProductCard
                      key={product.id}
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
      </Routes>

      <BuyModal
        open={buyOpen}
        product={selected}
        onClose={() => setBuyOpen(false)}
        onSubmit={submitBuy}
      />
    </>
  );
}
