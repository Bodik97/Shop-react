// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Вимикаємо нативне відновлення скролу — у SPA воно перебиває наше:
// браузер пробує scrollTo одразу при back-навігації, поки сторінка ще
// порожня (loading), і скрол губиться. useScrollRestoration робить це
// правильно — після рендеру даних.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// 🔬 DEBUG: трасуємо ВСІ виклики window.scrollTo щоб знайти хто скидає скрол
if (typeof window !== "undefined") {
  const origScrollTo = window.scrollTo.bind(window);
  window.scrollTo = function (...args) {
    const top = typeof args[0] === "object" ? args[0]?.top : args[1];
    const behavior = typeof args[0] === "object" ? args[0]?.behavior : "auto";
    console.warn("[scrollTo]", { top, behavior, currentY: window.scrollY });
    console.trace("scrollTo called from");
    return origScrollTo(...args);
  };
}

// Блок pinch/zoom і дабл-тап зум
(function () {
  document.addEventListener("gesturestart",  e => e.preventDefault(), { passive: false });
  document.addEventListener("gesturechange", e => e.preventDefault(), { passive: false });
  document.addEventListener("gestureend",    e => e.preventDefault(), { passive: false });
  document.addEventListener("touchmove", e => {
    if (e.scale !== undefined && e.scale !== 1) e.preventDefault();
  }, { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener("touchend", e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener("wheel", e => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener("dblclick", e => e.preventDefault(), { passive: false });
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
