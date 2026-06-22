// src/components/CartSidebarNote.jsx
// Десктопний сигнал «додано в кошик» — у боковому меню під міні-кошиком.
// На мобайлі прихований (там CartToast). CSS-анімація (без framer-motion).
// Таймер автозникнення живе в <CartToast/> (завжди змонтований).
import { Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartSidebarNote() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div
      key={toast.key}
      role="status"
      aria-live="polite"
      className="animate-toastIn hidden lg:flex items-center gap-2.5 rounded-xl border-2 border-black bg-white p-3 shadow-md"
    >
      <span className="grid place-items-center w-8 h-8 rounded-full bg-trust text-white shrink-0">
        <Check className="w-4 h-4" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="font-display font-bold text-ink text-[13px] leading-tight">Додано в кошик</p>
        {toast.title && <p className="text-[12px] text-ink-soft line-clamp-1 mt-0.5">{toast.title}</p>}
      </div>
    </div>
  );
}
