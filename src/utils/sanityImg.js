// Хелпер для оптимізації зображень з Sanity CDN.
// Додає auto=format → CDN повертає WebP/AVIF якщо браузер підтримує,
// плюс масштабує під потрібну ширину, щоб не тягнути сирі повнорозмірні PNG.

/**
 * Додає Sanity CDN params до URL для оптимальної доставки.
 * @param {string} url — оригінальний URL з cdn.sanity.io
 * @param {number} [w=1200] — потрібна ширина
 * @param {number} [q=80]   — якість JPEG/WebP (1–100)
 */
export function sanityFmt(url, w = 1200, q = 80) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("cdn.sanity.io")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}auto=format&fit=max&w=${w}&q=${q}`;
}

/**
 * Будує srcSet для responsive-зображення.
 * @param {string} url
 * @param {number[]} [widths] — список ширин у пікселях
 * @param {number} [q]
 */
export function sanitySrcSet(url, widths = [320, 480, 640, 800, 1200], q = 80) {
  if (!url || !url.includes?.("cdn.sanity.io")) return undefined;
  return widths.map((w) => `${sanityFmt(url, w, q)} ${w}w`).join(", ");
}
