// src/utils/analytics.js — обгортка над GA4 gtag.js для ecommerce-подій

const safeGtag = (...args) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag(...args);
  } catch (err) {
    console.warn("[analytics] gtag error:", err);
  }
};

const itemFromProduct = (product, quantity = 1) => ({
  item_id: String(product?.id || product?._id || ""),
  item_name: product?.title || "",
  price: Number(product?.price) || 0,
  item_category: product?.category || undefined,
  quantity,
});

export const trackPageView = (path) => {
  safeGtag("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : undefined,
  });
};

export const trackViewItem = (product) => {
  if (!product) return;
  safeGtag("event", "view_item", {
    currency: "UAH",
    value: Number(product.price) || 0,
    items: [itemFromProduct(product)],
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  safeGtag("event", "add_to_cart", {
    currency: "UAH",
    value: (Number(product.price) || 0) * quantity,
    items: [itemFromProduct(product, quantity)],
  });
};

export const trackBeginCheckout = (items, total) => {
  if (!Array.isArray(items) || items.length === 0) return;
  safeGtag("event", "begin_checkout", {
    currency: "UAH",
    value: Number(total) || 0,
    items: items.map((item) => itemFromProduct(item, item.qty || 1)),
  });
};

export const trackPurchase = ({ orderId, items, total, shipping = 0 }) => {
  if (!Array.isArray(items) || items.length === 0) return;
  safeGtag("event", "purchase", {
    transaction_id: orderId,
    currency: "UAH",
    value: Number(total) || 0,
    shipping: Number(shipping) || 0,
    items: items.map((item) => itemFromProduct(item, item.qty || 1)),
  });
};
