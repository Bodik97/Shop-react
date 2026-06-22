// src/components/MobileCartBar.jsx
// Глобальна мобільна панель кошика: завжди під рукою «Деталі» + «Оформити».
// Показується на мобайлі, коли в кошику є товари, КРІМ сторінок зі своїм
// нижнім баром (кошик, товар) і подяки. Компактна (h-10) — зручна.
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatUAH } from "../utils/format";

const HIDE = [/^\/cart/, /^\/product\//, /^\/thanks/];

export default function MobileCartBar() {
  const { cartCount, cartTotal } = useCart();
  const { pathname } = useLocation();

  if (cartCount === 0) return null;
  if (HIDE.some((re) => re.test(pathname))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] lg:hidden">
      <div className="mx-auto max-w-2xl px-2 pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="flex items-center gap-2 rounded-t-2xl border border-line bg-white shadow-2xl px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-ink-soft leading-none">У кошику: {cartCount}</div>
            <div className="text-red-600 font-extrabold tabular-nums text-[17px] leading-tight mt-0.5">
              {formatUAH(cartTotal)}
            </div>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white border border-line text-ink font-semibold text-[14px] hover:bg-surface active:scale-95 transition shrink-0"
          >
            Деталі
          </Link>
          <Link
            to="/cart"
            className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-accent text-white font-bold text-[14px] uppercase tracking-wide active:scale-[0.98] transition shrink-0"
          >
            Оформити <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
