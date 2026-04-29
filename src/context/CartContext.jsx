/* eslint-disable react-refresh/only-export-components */

// src/context/CartContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { urlFor } from "../sanityClient";

// ─── Helpers ────────────────────────────────────────────────────────────────
const makeFingerprint = (id, addons = []) => {
  const addonIds = (addons || []).map((a) => a.id).sort().join(",");
  return `${id}::${addonIds}`;
};

const sumAddons = (addons = []) =>
  (addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);

// Пріоритет: готовий URL із GROQ → urlFor(mainImage) → старе поле product.image
const resolveProductImage = (product) => {
  if (!product) return null;
  if (product.mainImageUrl) return product.mainImageUrl;
  if (product.mainImage) {
    try {
      return urlFor(product.mainImage).width(300).url();
    } catch {
      return product.image || null;
    }
  }
  return product.image || null;
};

// ─── 1. Створюємо "канал зв'язку" ───────────────────────────────────────────
const CartContext = createContext(null);

// ─── 2. Provider — "радіостанція" що веде мовлення ──────────────────────────
export function CartProvider({ children, products = [] }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Зберігаємо в localStorage при кожній зміні
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Синхронізація цін, картинок і category з каталогом
  const refreshCartPrices = useCallback(() => {
    if (!products.length) return;
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const prod = products.find((p) => p.id === item.id);
        if (!prod) return item;
        const newOldPrice = Number(prod.oldPrice) || 0;
        const newImage    = resolveProductImage(prod) || item.image;
        const newCategory = prod.category || item.category || null;
        if (
          prod.price !== item.price ||
          newOldPrice !== item.oldPrice ||
          newImage !== item.image ||
          newCategory !== item.category
        ) {
          changed = true;
        }
        return {
          ...item,
          price: prod.price,
          oldPrice: newOldPrice,
          image: newImage,
          category: newCategory,
        };
      });
      return changed ? next : prev;
    });
  }, [products]);

  useEffect(() => {
    refreshCartPrices();
  }, [refreshCartPrices]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const addons      = Array.isArray(product.addons) ? product.addons : [];
      const fingerprint = makeFingerprint(product.id, addons);
      const i           = prev.findIndex(
        (p) => makeFingerprint(p.id, p.addons) === fingerprint
      );
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: (Number(copy[i].qty) || 0) + 1 };
        return copy;
      }
      const addonsTotal = sumAddons(addons);
      const price       = Number(product.price) || 0;
      return [
        ...prev,
        {
            cartItemId: `${product.id}-${Date.now()}`,
            id:         product.id,
            title:      product.title,
            // category потрібна для умовного рендеру giftText
            // (напр. для pepper-sprays — без 🎁, червоний акцент).
            category:   product.category || null,
            price,
            oldPrice:   Number(product.oldPrice) || 0,
            image:      resolveProductImage(product),
            qty:        1,
            giftText:   product?.giftText?.text || product?.giftText || null,
            addons,
            addonsTotal,
            unitTotal:  price + addonsTotal,
        },
        ];
    });
  }, []);

  const changeQty = useCallback((cartItemId, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((p) => (p.cartItemId || p.id) !== cartItemId)
        : prev.map((p) =>
            (p.cartItemId || p.id) === cartItemId ? { ...p, qty } : p
          )
    );
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) =>
      prev.filter((p) => (p.cartItemId || p.id) !== cartItemId)
    );
  }, []);

  const removeAddon = useCallback((cartItemId, addonKey) => {
    setCart((prev) =>
      prev.map((item) => {
        if ((item.cartItemId || item.id) !== cartItemId) return item;
        const addons      = (item.addons || []).filter((a) => (a.id || a.name) !== addonKey);
        const addonsTotal = sumAddons(addons);
        return {
          ...item,
          addons,
          addonsTotal,
          unitTotal: (Number(item.price) || 0) + addonsTotal,
        };
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ─── Похідні значення ─────────────────────────────────────────────────────
  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + (Number(i.qty) || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce((s, i) => {
        const qty  = Math.max(1, Number(i.qty) || 0);
        const unit = Number(i.unitTotal) || Number(i.price) || 0;
        return s + unit * qty;
      }, 0),
    [cart]
  );

  // ─── Value — все що доступно через useCart() ──────────────────────────────
  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      addToCart,
      changeQty,
      removeFromCart,
      removeAddon,
      clearCart,
      refreshCartPrices,
    }),
    [cart, cartCount, cartTotal, addToCart, changeQty,
     removeFromCart, removeAddon, clearCart, refreshCartPrices]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ─── 3. useCart — "радіоприймач" для будь-якого компонента ──────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}