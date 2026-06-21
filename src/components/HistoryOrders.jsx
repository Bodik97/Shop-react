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
        <div className="rounded-2xl sm:rounded-3xl border border-line bg-white p-5 sm:p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-accent text-white shadow mb-3 sm:mb-4">
            <Package className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink mb-2">
            Замовлень ще немає
          </h1>
          <p className="text-xs sm:text-sm text-ink-soft">
            Тут зберігатимуться всі ваші замовлення після оформлення.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-xl bg-accent text-white text-sm sm:text-base font-display font-semibold hover:brightness-95 active:scale-[0.98] transition"
            >
              <Home className="h-4 w-4" /> На головну
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-xl border border-line font-semibold text-sm sm:text-base text-ink hover:bg-surface hover:border-ink transition"
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
          <div className="grid place-items-center shrink-0 h-12 w-12 rounded-xl bg-ink">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-ink leading-tight truncate">
              Мої замовлення
            </h1>
            <p className="text-[11px] sm:text-sm text-ink-soft">
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
            h-12 sm:h-14
            w-20 sm:w-auto
            px-3 sm:px-5
            rounded-xl
            border border-line bg-white !text-ink
            text-xs sm:text-sm font-semibold
            hover:bg-surface hover:border-ink active:scale-[0.98]
            transition shrink-0
          "
        >
          <Home className="h-6 w-6" />
          <span className="hidden xs:inline">На головну</span>
        </Link>

      </div>

      {/* Список */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen        = expandedId === order.orderId;
          const items         = Array.isArray(order.items) ? order.items : [];
          const orderSavings  = calcOrderSavings(items);

          return (
            <div
              key={order.orderId}
              className={`rounded-xl border border-line overflow-hidden transition-shadow ${
                isOpen ? "shadow-md" : ""
              }`}
            >
              {/* ── Шапка замовлення ── */}
              <button
                type="button"
                onClick={() => toggle(order.orderId)}
                className={`w-full flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-4 text-left transition-colors ${
                  isOpen ? "bg-ink text-white" : "bg-white text-ink hover:bg-surface"
                }`}
              >
                <div className="flex-1 min-w-0">
                  {/* Номер + дата */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-tighter">
                      № {order.orderId}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-medium uppercase ${
                      isOpen ? "text-stone-300" : "text-ink-soft"
                    }`}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  {/* Ім'я + телефон */}
                  <div className={`mt-1 text-xs sm:text-sm font-bold uppercase truncate ${
                    isOpen ? "text-white" : "text-ink"
                  }`}>
                    {order.name && <span>{order.name}</span>}
                    {order.name && order.phone && <span className="mx-1.5 opacity-40">|</span>}
                    {order.phone && <span className="opacity-80">{order.phone}</span>}
                  </div>
                  {/* Мітка "зі знижкою" */}
                  {orderSavings > 0 && (
                    <div className={`mt-1 text-[10px] sm:text-xs font-black uppercase ${
                      isOpen ? "text-red-300" : "text-red-600"
                    }`}>
                      Знижка: {formatUAH(orderSavings)}
                    </div>
                  )}
                </div>

                {/* Сума + іконка */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className={`text-base sm:text-xl font-black tabular-nums ${
                    isOpen ? "text-white" : "text-red-600"
                  }`}>
                    {formatUAH(order.total)}
                  </span>
                  {isOpen
                    ? <ChevronUp className="h-5 w-5 text-white" />
                    : <ChevronDown className="h-5 w-5 text-ink-soft" />
                  }
                </div>
              </button>

              {/* ── Деталі ── */}
              {isOpen && (
                <div className="px-3 sm:px-5 pb-5 pt-4 bg-surface">
                  {items.length > 0 ? (
                    <>
                      <div className="text-[10px] font-black text-ink uppercase tracking-widest mb-3 border-b border-line pb-1">
                        Товари у замовленні
                      </div>
                      <ul className="space-y-2">
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
                              className="border border-line rounded-lg bg-white p-3"
                            >
                              {/* Назва + ціна */}
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs sm:text-sm font-bold text-ink uppercase leading-tight flex-1">
                                  {item.title}
                                  {qty > 1 && (
                                    <span className="ml-2 text-accent font-black">[{qty} шт.]</span>
                                  )}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-ink tabular-nums shrink-0">
                                  {formatUAH(lineTotal)}
                                </span>
                              </div>

                              {/* Знижка */}
                              {hasDiscount && (
                                <div className="mt-1 flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] sm:text-xs text-ink-soft line-through">
                                    {formatUAH(oldPrice)}
                                  </span>
                                  <span className="bg-red-600 text-white text-[9px] font-bold uppercase rounded-full px-1.5 py-0.5">
                                    Акція
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-trust font-bold">
                                    −{formatUAH(itemSavings)}
                                  </span>
                                </div>
                              )}

                              {/* Addons */}
                              {addons.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {addons.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center bg-white border border-line rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-ink"
                                    >
                                      + {a.name} ({formatUAH(a.price)})
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Подарунок / умова */}
                              {item.giftText && (
                                <div className="mt-2 text-[10px] sm:text-xs text-trust font-bold uppercase">
                                  Подарунок: {item.giftText}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="text-xs text-ink-soft uppercase text-center py-4">
                      Інформація про товари відсутня
                    </p>
                  )}

                  {/* Підсумок */}
                  <div className="mt-5 pt-4 border-t-2 border-ink space-y-1">
                    {orderSavings > 0 && (
                      <div className="flex items-center justify-between text-xs font-bold text-trust uppercase">
                        <span>Загальна знижка:</span>
                        <span className="tabular-nums">{formatUAH(orderSavings)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold uppercase text-ink-soft">Разом до сплати:</span>
                      <span className="text-xl sm:text-2xl font-black text-red-600 tabular-nums">
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
    </main>
  );
}
