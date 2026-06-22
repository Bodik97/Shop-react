// src/components/MobileCartBar.jsx
// Глобальна мобільна панель кошика: завжди під рукою «Деталі» + «Оформити».
// «Деталі» розгортає вміст кошика інлайн (не перекидає на /cart);
// «Оформити» веде в /cart. Показується на мобайлі, коли в кошику є товари,
// КРІМ сторінок зі своїм баром (товар, кошик) і подяки.
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";
import { sanityFmt } from "../utils/sanityImg";

const HIDE = [/^\/cart/, /^\/product\//, /^\/thanks/];

export default function MobileCartBar() {
  const { cart, cartCount, cartTotal } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (cartCount === 0) return null;
  if (HIDE.some((re) => re.test(pathname))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] lg:hidden">
      <div className="mx-auto max-w-2xl px-2 pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="rounded-t-2xl border border-line bg-white shadow-2xl overflow-hidden">
          {/* Розгортний вміст кошика */}
          {open && (
            <div className="border-b border-line px-3 py-3 max-h-[45vh] overflow-y-auto">
              <ul className="space-y-2">
                {cart.map((i) => {
                  const q = Math.max(1, Number(i.qty) || 1);
                  const line = (Number(i.unitTotal) || Number(i.price) || 0) * q;
                  const addons = Array.isArray(i.addons) ? i.addons : [];
                  return (
                    <li key={i.cartItemId || i.id} className="flex gap-2 text-sm">
                      <img
                        src={sanityFmt(i.image, 72)}
                        alt=""
                        className="w-9 h-9 rounded-lg object-contain bg-surface border border-line shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate text-ink">
                            {i.title}{q > 1 && <span className="text-ink-soft"> ×{q}</span>}
                          </span>
                          <span className="tabular-nums font-semibold text-ink shrink-0">{formatUAH(line)}</span>
                        </div>
                        {addons.map((a) => (
                          <div key={a.id || a.name} className="flex items-center justify-between gap-2 text-xs text-ink-soft mt-0.5">
                            <span className="min-w-0 truncate">+ {a.name}</span>
                            <span className="tabular-nums shrink-0">{formatUAH(a.price)}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Рядок: сума + Деталі + Оформити */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-ink-soft leading-none">У кошику: {cartCount}</div>
              <div className="text-red-600 font-extrabold tabular-nums text-[17px] leading-tight mt-0.5">
                {formatUAH(cartTotal)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white border border-line text-ink font-semibold text-[14px] hover:bg-surface active:scale-95 transition shrink-0"
            >
              {open ? "Сховати" : "Деталі"}
            </button>
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-accent text-white font-bold text-[14px] uppercase tracking-wide active:scale-[0.98] transition shrink-0"
            >
              Оформити <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
