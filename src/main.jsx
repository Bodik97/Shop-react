// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Блок pinch/zoom і дабл-тап зум
(function () {
  // iOS Safari pinch
  document.addEventListener('gesturestart',  e => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend',    e => e.preventDefault(), { passive: false });

  // Pinch на інших (Chrome/Android): коли scale змінюється
  document.addEventListener('touchmove', e => {
    if (e.scale !== undefined && e.scale !== 1) e.preventDefault();
  }, { passive: false });

  // Дабл-тап зум
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  // Ctrl/Cmd + колесо (desktop pinch на трекпаді)
  document.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }, { passive: false });

  // Подвійний клік (деякі браузери)
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
})();


ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>
);
