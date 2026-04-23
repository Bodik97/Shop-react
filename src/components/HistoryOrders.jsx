// src/components/HistoryOrders.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, ShoppingCart, Home } from "lucide-react";
import { formatUAH } from "../utils/format";

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

// ─── Helper: підрахунок загальної економії замовлення ───
const calcOrderSavings = (items = []) =>
  items.reduce((s, it) => {
    const op = Number(it.oldPrice) || 0;
    const p  = Number(it.price) || 0;
    const q  = Math.max(1, Number(it.qty) || 1);
    return s + (op > p ? (op - p) * q : 0);
  }, 0);

export default function HistoryOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("orderHistory");
      setOrders(saved ? JSON.parse(saved) : []);
    } catch {
      setOrders([]);
    }
  }, []);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // ── Порожній стан ──
  if (!orders.length) {
    return (
      <main className="mx-auto max-w-screen-sm px-3 sm:px-6 py-8 sm:py-10 min-h-[800px]">
        <div className="rounded-2xl sm:rounded-3xl border bg-white p-5 sm:p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow mb-3 sm:mb-4">
            <Package className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
            Замовлень ще немає
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Тут зберігатимуться всі ваші замовлення після оформлення.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-2xl bg-black text-white text-sm sm:text-base font-semibold hover:bg-black/90 transition"
            >
              <Home className="h-4 w-4" /> На головну
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-2xl border font-semibold text-sm sm:text-base text-gray-800 hover:bg-gray-50 transition"
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
    <main className="mx-auto max-w-screen-md px-2 sm:px-6 py-4 sm:py-8 min-h-[980px]">

      {/* Заголовок */}
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">

      {/* ── Ліва частина: іконка + заголовок ── */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="
            grid place-items-center shrink-0
            h-12 w-12 sm:h-12 sm:w-12
            rounded-xl bg-black/40 ring-1 ring-white/10
          ">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="
              text-base sm:text-xl md:text-2xl
              font-extrabold text-white leading-tight truncate
            ">
              Мої замовлення
            </h1>
            <p className="text-[11px] sm:text-sm text-gray-300">
              {orders.length} {orders.length === 1 ? "замовлення" : "замовлень"}
            </p>
          </div>
        </div>

        {/* ── Права частина: кнопка "На головну" ── */}
        <Link
          to="/"
          aria-label="На головну"
          className="
            inline-flex items-center justify-center gap-1.5
            h-14 sm:h-14
            w-20 sm:w-20
            px-3 sm:px-5
            rounded-xl sm:rounded-2xl
            bg-black !text-white
            text-xs sm:text-sm font-semibold
            hover:bg-gray-800 active:scale-[0.98]
            transition shrink-0
          "
        >
          <Home className="h-7 w-7" />
          <span className="hidden xs:inline">На головну</span>
        </Link>

      </div>

      {/* Список */}
      <div className="space-y-3 sm:space-y-3">
        {orders.map((order) => {
          const isOpen        = expandedId === order.orderId;
          const items         = Array.isArray(order.items) ? order.items : [];
          const orderSavings  = calcOrderSavings(items);

          return (
            <div
              key={order.orderId}
              className="rounded-xl sm:rounded-2xl border   bg-white shadow-sm"
            >
              {/* ── Шапка замовлення ── */}
              <button
                type="button"
                onClick={() => toggle(order.orderId)}
                className="w-full  flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  {/* Номер + дата */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600 break-all">
                      {order.orderId}
                    </span>
                    <span className="text-[10px] sm:text-xs text-white/80">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  {/* Ім'я + телефон */}
                  <div className="mt-0.5 text-xs sm:text-sm text-white truncate">
                    {order.name && <span>{order.name}</span>}
                    {order.name && order.phone && <span className="mx-1 sm:mx-1.5 text-gray-300">·</span>}
                    {order.phone && <span>{order.phone}</span>}
                  </div>
                  {/* 🆕 Мітка "зі знижкою" якщо була економія */}
                  {orderSavings > 0 && (
                    <div className="mt-1 text-[10px] sm:text-xs text-emerald-700 font-medium">
                      💚 Економія: {formatUAH(orderSavings)}
                    </div>
                  )}
                </div>

                {/* Сума + іконка */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-sm sm:text-lg font-extrabold text-red-600 tabular-nums">
                    {formatUAH(order.total)}
                  </span>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-gray-400" />
                    : <ChevronDown className="h-4 w-4 text-gray-400" />
                  }
                </div>
              </button>

              {/* ── Деталі ── */}
              {isOpen && (
                <div className="border-s-black px-3 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4 bg-gray-200 xs:bg-gray-200">
                  {items.length > 0 ? (
                    <>
                      <div className="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 sm:mb-3">
                        Склад замовлення
                      </div>
                      <ul className="space-y-2 sm:space-y-3">
                        {items.map((item, idx) => {
                          const qty         = Math.max(1, Number(item.qty) || 1);
                          const basePrice   = Number(item.price) || 0;
                          const oldPrice    = Number(item.oldPrice) || 0;
                          const hasDiscount = oldPrice > basePrice;
                          const itemSavings = hasDiscount ? (oldPrice - basePrice) * qty : 0;
                          const addons      = Array.isArray(item.addons) ? item.addons : [];
                          const addonsSum   = addons.reduce((s, a) => s + (Number(a.price) || 0), 0);
                          const unitTotal   = basePrice + addonsSum;
                          const lineTotal   = unitTotal * qty;

                          return (
                            <li
                              key={`${item.id ?? idx}-${idx}`}
                              className="rounded-2xl sm:rounded-xl border bg-white p-2.5 sm:p-3"
                            >
                              {/* Назва + ціна */}
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-900 leading-snug break-words flex-1">
                                  {item.title}
                                  {qty > 1 && (
                                    <span className="ml-1 text-gray-400 font-normal">× {qty}</span>
                                  )}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums shrink-0">
                                  {formatUAH(lineTotal)}
                                </span>
                              </div>

                              {/* Знижка */}
                              {hasDiscount && (
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] sm:text-xs text-gray-400 line-through tabular-nums">
                                    {formatUAH(oldPrice)}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold tabular-nums px-1.5 py-0.5">
                                    −{Math.round((1 - basePrice / oldPrice) * 100)}%
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">
                                    🔥 −{formatUAH(itemSavings)}
                                  </span>
                                </div>
                              )}

                              {/* Базова ціна якщо є addons */}
                              {addons.length > 0 && (
                                <div className="mt-1 text-[11px] sm:text-xs text-gray-500 tabular-nums">
                                  Товар: {formatUAH(basePrice)}
                                </div>
                              )}

                              {/* Addons */}
                              {addons.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {addons.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700"
                                    >
                                      + {a.name}
                                      <span className="font-semibold">{formatUAH(a.price)}</span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Подарунок */}
                              {item.giftText && (
                                <div className="mt-1 text-[11px] sm:text-xs text-emerald-700 flex items-start gap-1">
                                  <span className="shrink-0">🎁</span>
                                  <span className="break-words">{item.giftText}</span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 text-center py-2">
                      Деталі товарів недоступні
                    </p>
                  )}

                  {/* Підсумок */}
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t space-y-1">
                    {orderSavings > 0 && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-medium">
                        <span>💚 Ваша економія:</span>
                        <span className="tabular-nums">{formatUAH(orderSavings)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Разом:</span>
                      <span className="text-base sm:text-xl font-extrabold text-red-600 tabular-nums">
                        {formatUAH(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопки внизу */}
      
    </main>
  );
}