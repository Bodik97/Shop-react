// src/components/CartSidebarNote.jsx
// Десктопний сигнал «додано в кошик» — показується всередині бокового меню,
// під міні-кошиком. На мобайлі прихований (там fixed-toast). Таймер
// автозникнення живе в <CartToast/> (завжди змонтований), тут — лише візуал.
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartSidebarNote() {
  const { toast } = useCart();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.key}
          role="status"
          aria-live="polite"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="hidden lg:flex items-center gap-2.5 rounded-xl border-2 border-black bg-white p-3 shadow-md"
        >
          <span className="grid place-items-center w-8 h-8 rounded-full bg-trust text-white shrink-0">
            <Check className="w-4 h-4" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold text-ink text-[13px] leading-tight">Додано в кошик</p>
            {toast.title && <p className="text-[12px] text-ink-soft line-clamp-1 mt-0.5">{toast.title}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
