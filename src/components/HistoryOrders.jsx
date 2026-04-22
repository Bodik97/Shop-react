// src/components/HistoryOrders.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, ShoppingCart, Home } from "lucide-react";

const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Number(n) || 0) + " ₴";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("uk-UA", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// Читаємо historію з localStorage — один раз при маунті
function loadHistory() {
  try {
    const saved = localStorage.getItem("orderHistory");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function HistoryOrders() {
  const [orders] = useState(() => loadHistory());
  // expandedId — яке замовлення розгорнуто для перегляду деталей
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // ── Порожній стан ──
  if (!orders.length) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 sm:px-6 py-10">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Замовлень ще немає</h1>
          <p className="text-gray-500 text-sm">
            Тут зберігатимуться всі ваші замовлення після оформлення.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 transition"
            >
              <Home className="h-4 w-4" /> На головну
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl border font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <ShoppingCart className="h-4 w-4" /> До кошика
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Список замовлень ──
  return (
    <main className="mx-auto max-w-screen-md px-4 sm:px-6 py-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Мої замовлення</h1>
            <p className="text-xs text-gray-500">{orders.length} замовлень</p>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          ← На головну
        </Link>
      </div>

      {/* Список */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isOpen = expandedId === order.orderId;
          const items  = Array.isArray(order.items) ? order.items : [];

          return (
            <div
              key={order.orderId}
              className="rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* ── Шапка замовлення (завжди видима) ── */}
              <button
                type="button"
                onClick={() => toggle(order.orderId)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  {/* Номер + дата */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  {/* Ім'я + телефон */}
                  <div className="mt-0.5 text-sm text-gray-600 truncate">
                    {order.name && <span>{order.name}</span>}
                    {order.name && order.phone && <span className="mx-1.5 text-gray-300">·</span>}
                    {order.phone && <span>{order.phone}</span>}
                  </div>
                </div>

                {/* Сума + іконка */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-lg font-extrabold text-red-600 tabular-nums">
                    {formatUAH(order.total)}
                  </span>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 text-gray-400" />
                  }
                </div>
              </button>

              {/* ── Деталі замовлення (розгортаються) ── */}
              {isOpen && (
                <div className="border-t px-5 pb-5 pt-4 bg-gray-50">

                  {items.length > 0 ? (
                    <>
                      {/* Список товарів */}
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Склад замовлення
                      </div>
                      <ul className="space-y-3">
                        {items.map((item, idx) => {
                          const qty       = Math.max(1, Number(item.qty) || 1);
                          const basePrice = Number(item.price) || 0;
                          const addons    = Array.isArray(item.addons) ? item.addons : [];
                          const addonsSum = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
                          const unitTotal = basePrice + addonsSum;
                          const lineTotal = unitTotal * qty;

                          return (
                            <li
                              key={`${item.id ?? idx}-${idx}`}
                              className="rounded-xl border bg-white p-3"
                            >
                              {/* Назва + сума */}
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-medium text-gray-900 leading-snug">
                                  {item.title}
                                  {qty > 1 && (
                                    <span className="ml-1.5 text-gray-400 font-normal">× {qty}</span>
                                  )}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                                  {formatUAH(lineTotal)}
                                </span>
                              </div>

                              {/* Базова ціна якщо є addons */}
                              {addons.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500 tabular-nums">
                                  Товар: {formatUAH(basePrice)}
                                </div>
                              )}

                              {/* Addons */}
                              {addons.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {addons.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                                    >
                                      + {a.name}
                                      <span className="font-semibold">{formatUAH(a.price)}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Подарунок */}
                              {item.giftText && (
                                <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1">
                                  🎁 {item.giftText}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-2">
                      Деталі товарів недоступні
                    </p>
                  )}

                  {/* Підсумок */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-gray-600">Загальна сума:</span>
                    <span className="text-xl font-extrabold text-red-600 tabular-nums">
                      {formatUAH(order.total)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопки внизу */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-black text-white font-semibold hover:bg-black/90 transition"
        >
          <Home className="h-4 w-4" /> На головну
        </Link>
        <Link
          to="/cart"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl border font-semibold text-gray-800 hover:bg-gray-50 transition"
        >
          <ShoppingCart className="h-4 w-4" /> До кошика
        </Link>
      </div>
    </main>
  );
}