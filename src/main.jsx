// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { initSentry } from "./utils/sentry";

// Моніторинг помилок (no-op без VITE_SENTRY_DSN); вантажиться після load/idle
initSentry();

// Вимикаємо нативне відновлення скролу — у SPA воно перебиває наше:
// браузер пробує scrollTo одразу при back-навігації, поки сторінка ще
// порожня (loading), і скрол губиться. useScrollRestoration робить це
// правильно — після рендеру даних.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
