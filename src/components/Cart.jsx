// src/components/Cart.jsx
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n) + " ₴";

export default function Cart({
  cart = [],
  refreshPrices,
  changeQty,
  removeFromCart,
  checkout,
}) {
  const navigate = useNavigate();

  // ВАЖЛИВО: запускаємо 1 раз при монтуванні
  useEffect(() => {
    refreshPrices?.();
  }, []);

  const totals = useMemo(() => {
    const items = cart.reduce((n, i) => n + Math.max(1, Number(i.qty) || 0), 0);
    const sum = cart.reduce((s, i) => {
      const price = Number(i.price) || 0;
      const qty = Math.max(1, Number(i.qty) || 0);
      return s + price * qty;
    }, 0);
    return { items, sum };
  }, [cart]);

  if (!cart.length) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">Кошик</h1>
        <p className="text-gray-600 mb-6">Кошик порожній.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-black hover:bg-blue-700"
        >
          ← Продовжити покупки
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50"
        >
          ← Назад
        </button>
        <Link
          to="/"
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Продовжити покупки
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Кошик</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const price = Number(item.price) || 0;
            const qty = Math.max(1, Number(item.qty) || 0);
            const subtotal = price * qty;

            const dec = () => changeQty(item.id, Math.max(1, qty - 1));
            const inc = () => changeQty(item.id, Math.min(99, qty + 1));

            return (
              <article
                key={item.id}
                className="group flex items-center gap-4 border rounded-2xl p-4 shadow-sm bg-white hover:shadow-md transition"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-xl border"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>

                  <div className="mt-1 text-sm text-gray-500">
                    Ціна: <span className="font-medium text-gray-900">{formatUAH(price)}</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={dec}
                      disabled={qty <= 1}
                      className="px-2 py-1 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Зменшити кількість"
                    >
                      –
                    </button>
                    <span className="min-w-6 text-center">{qty}</span>
                    <button
                      onClick={inc}
                      className="px-2 py-1 border rounded-lg"
                      aria-label="Збільшити кількість"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-black">Разом</div>
                  <div className="text-lg font-bold text-black">{formatUAH(subtotal)}</div>
                  <button
                    onClick={() => {
                      if (confirm("Видалити товар з кошика?")) {
                        removeFromCart(item.id);
                      }
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 transition 1s"
                  >
                    Видалити
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-max lg:sticky lg:top-24">
          <div className="rounded-2xl border p-5 shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold mb-4 text-black">Підсумок</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-black">Товарів</span>
                <span className="text-black">{totals.items}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-black">Сума</span>
                <span className="font-medium text-black">{formatUAH(totals.sum)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              className="w-full mt-5 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Оформити замовлення
            </button>

            <Link
              to="/"
              className="block text-center mt-3 text-sm text-blue-600 hover:underline"
            >
              Продовжити покупки
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
