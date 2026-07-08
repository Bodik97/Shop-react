// src/utils/sentry.js
// Моніторинг помилок на проді. Ліниво: SDK вантажиться динамічним імпортом
// після load/idle, щоб не роздувати критичний бандл (LCP і так вузьке місце).
// Без VITE_SENTRY_DSN або поза прод-збіркою — повний no-op.

const DSN = import.meta.env.VITE_SENTRY_DSN;
const ENABLED = import.meta.env.PROD && !!DSN;

let sentryPromise = null; // кешуємо, щоб SDK вантажився один раз

const loadSentry = () => {
  if (!sentryPromise) {
    sentryPromise = import("@sentry/react").then((Sentry) => {
      Sentry.init({
        dsn: DSN,
        // Тільки помилки, без performance-трейсингу — менше ваги й квоти
        tracesSampleRate: 0,
        sendDefaultPii: false,
        // Шум, який не варто репортити
        ignoreErrors: [
          "ResizeObserver loop",
          "Failed to fetch dynamically imported module",
          "AbortError",
        ],
      });
      return Sentry;
    });
  }
  return sentryPromise;
};

// Викликається з main.jsx після завантаження сторінки
export function initSentry() {
  if (!ENABLED) return;
  const start = () => loadSentry();
  if (document.readyState === "complete") {
    (window.requestIdleCallback || setTimeout)(start);
  } else {
    window.addEventListener("load", () => (window.requestIdleCallback || setTimeout)(start), { once: true });
  }
}

// Ручний репорт (використовує ErrorBoundary)
export function reportError(error, extra) {
  if (!ENABLED) return;
  loadSentry().then((Sentry) => Sentry.captureException(error, { extra })).catch(() => {});
}
