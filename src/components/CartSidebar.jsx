// src/components/CartSidebar.jsx
// Компактний кошик у боковому меню (лише десктоп). Закріплений разом із
// меню категорій (sticky-контейнер у Layout). На мобайлі прихований —
// там кошик у хедері.
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";

export default function CartSidebar() {
  const { cart, cartCount, cartTotal } = useCart();
  const preview = cart.slice(0, 5);

  return (
    <aside aria-label="Кошик" className="hidden lg:block rounded-xl border border-line bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-ink text-white font-display font-semibold text-[15px]">
        <ShoppingCart className="w-4 h-4" />
        Кошик
        {cartCount > 0 && (
          <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] rounded-full bg-accent px-1 text-[11px] font-bold text-white border border-black tabular-nums">
            {cartCount}
          </span>
        )}
      </div>

      {cartCount === 0 ? (
        <div className="px-4 py-6 text-center text-[13px] text-ink-soft">
          Кошик порожній
        </div>
      ) : (
        <div className="p-3">
          <ul className="space-y-3">
            {preview.map((item) => (
              <li key={item.cartItemId || item.id}>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-surface border border-line flex items-center justify-center overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-ink leading-tight line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-ink-soft mt-0.5 tabular-nums">
                      {item.qty} × {formatUAH(Number(item.price) || 0)}
                    </p>
                  </div>
                </div>

                {Array.isArray(item.addons) && item.addons.length > 0 && (
                  <ul className="mt-1 ml-[3.125rem] space-y-0.5">
                    {item.addons.map((a, i) => (
                      <li key={a.id || a.name || i} className="flex items-center justify-between gap-2 text-[11px] text-ink-soft">
                        <span className="line-clamp-1">+ {a.name}</span>
                        <span className="shrink-0 tabular-nums">{formatUAH(Number(a.price) || 0)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {cart.length > 5 && (
            <p className="text-[12px] text-ink-soft mt-2.5">+ ще {cart.length - 5}</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
            <span className="text-[13px] text-ink-soft">Разом</span>
            <span className="font-display font-bold text-ink tabular-nums">{formatUAH(cartTotal)}</span>
          </div>

          <Link
            to="/cart"
            className="mt-3 flex items-center justify-center gap-1.5 bg-accent rounded-lg text-white font-display font-bold text-[14px] py-2.5 active:scale-[0.98] transition"
          >
            Оформити <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </aside>
  );
}
