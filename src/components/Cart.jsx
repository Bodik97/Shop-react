// src/components/Cart.jsx
import { Link } from "react-router-dom";

/** Формат ціни */
const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

export default function Cart({ cart = [], refreshPrices, changeQty, removeFromCart, checkout }) {
  const itemsCount = cart.reduce((n, i) => n + Math.max(1, Number(i.qty) || 0), 0);
  const total = cart.reduce((sum, p) => sum + (Number(p.price) || 0) * (Math.max(1, Number(p.qty) || 0)), 0);

  if (!cart.length) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Кошик порожній 🛒</h1>
        <p className="text-gray-600 mb-6">Додайте товари до кошика, щоб оформити замовлення.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Перейти до покупок
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pt-6 pb-24 lg:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Ваш кошик</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Список товарів */}
        <section className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const qty = Math.max(1, Number(item.qty) || 1);
            const price = Number(item.price) || 0;
            return (
              <article
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border"
              >
                {/* Зображення */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl"
                />

                {/* Інфо */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h2>
                  <div className="mt-1 text-blue-600 font-bold">{formatUAH(price)}</div>

                  {/* Кількість (мобіль friendly) */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      aria-label="Зменшити кількість"
                      onClick={() => changeQty(item.id, Math.max(1, qty - 1))}
                      className="h-10 w-10 rounded-xl border hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-medium">{qty}</span>
                    <button
                      aria-label="Збільшити кількість"
                      onClick={() => changeQty(item.id, Math.min(99, qty + 1))}
                      className="h-10 w-10 rounded-xl border hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Підсумок по товару + видалення */}
                <div className="sm:text-right">
                  <div className="text-sm text-gray-500">Разом</div>
                  <div className="text-lg font-bold text-gray-900">{formatUAH(price * qty)}</div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Видалити
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Підсумок (десктоп/планшет) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="p-6 bg-white rounded-2xl shadow-md border">
            <h2 className="text-xl font-bold mb-4">Підсумок</h2>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Товарів</span>
              <span>{itemsCount}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Разом</span>
              <span>{formatUAH(total)}</span>
            </div>
            <button
              onClick={checkout}
              className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.99] transition"
            >
              Оформити замовлення
            </button>
            <Link to="/" className="block mt-3 text-center text-sm text-gray-600 hover:underline">
              ← Продовжити покупки
            </Link>
          </div>
        </aside>
      </div>

      {/* Мобільна “липка” панель підсумку */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto max-w-5xl px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="rounded-t-2xl border bg-white shadow-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Разом ({itemsCount})</div>
                <div className="text-lg font-extrabold text-blue-700">{formatUAH(total)}</div>
              </div>
              <button
                onClick={checkout}
                className="h-12 px-5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.99] transition"
              >
                Оформити
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
