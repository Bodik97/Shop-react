// src/components/CartToast.jsx
// Єдиний глобальний сигнал «додано в кошик». Спрацьовує з будь-якого місця
// (картка товару, сторінка товару) через CartContext. Помітний на десктопі
// й мобайлі, доступний (role="status", aria-live), автозникнення, пауза на hover.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartToast() {
  const { toast, clearToast, cartCount } = useCart();
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  // Автозникнення ~3.5с; пауза на hover/focus. Перезапуск при кожному додаванні (toast.key).
  useEffect(() => {
    if (!toast || paused) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, paused, clearToast]);

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -18, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -12, scale: 0.97 },
      };

  return (
    <div className="pointer-events-none fixed z-[100] top-[70px] inset-x-3 sm:top-auto sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[360px] lg:hidden">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            role="status"
            aria-live="polite"
            {...enter}
            transition={{ duration: 0.26, ease: "easeOut" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="pointer-events-auto rounded-2xl border-2 border-black bg-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="relative shrink-0 w-14 h-14 rounded-xl bg-surface border border-line flex items-center justify-center overflow-hidden">
                {toast.image ? (
                  <img src={toast.image} alt="" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Check className="w-6 h-6 text-trust" />
                )}
                <span className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-trust text-white shadow">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-ink text-[14px] leading-tight">Додано в кошик</p>
                {toast.title && <p className="text-[13px] text-ink-soft line-clamp-1 mt-0.5">{toast.title}</p>}
              </div>
              <button
                type="button"
                onClick={clearToast}
                aria-label="Закрити"
                className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-ink-soft hover:bg-surface transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 pb-3">
              <Link
                to="/cart"
                onClick={clearToast}
                className="flex items-center justify-center gap-1.5 bg-accent rounded-xl text-white font-display font-bold text-[14px] py-2.5 active:scale-[0.98] transition"
              >
                Перейти в кошик{cartCount > 0 ? ` (${cartCount})` : ""} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
