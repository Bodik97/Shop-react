// src/hooks/useScrollRestoration.js
//
// Зберігає позицію скролу для поточного маршруту в sessionStorage і
// відновлює її при back/forward навігації (POP). На звичайну (PUSH/REPLACE)
// навігацію не впливає — там працює <ScrollToTop />.
//
// Параметр `ready` потрібен сторінкам, які асинхронно завантажують дані:
// поки масив товарів пустий, сторінка коротка і скрол навіть якщо ми його
// поставимо — обріжеться. Передаємо `ready: !loading && items.length > 0`,
// і хук дочекається готовності перед відновленням.

import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "scrollPositions";
const DEBUG = true; // ⚠️ debug логи в консолі — прибрати коли все працює

const log = (...args) => {
  if (DEBUG) console.log("[scroll]", ...args);
};

const readAll = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeOne = (key, y) => {
  try {
    const all = readAll();
    all[key] = y;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    log("save", key, "→", y);
  } catch {
    /* sessionStorage недоступний — мовчки ігноруємо */
  }
};

export function useScrollRestoration({ ready = true } = {}) {
  const location = useLocation();
  const navType = useNavigationType();
  const restoredRef = useRef(false);
  const key = location.pathname + location.search;

  log("hook called", { key, navType, ready, restored: restoredRef.current });

  // Зберігаємо позицію періодично під час скролу і при unmount маршруту
  useEffect(() => {
    let timer;
    const save = () => writeOne(key, window.scrollY);

    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    log("save listener registered for", key);
    return () => {
      clearTimeout(timer);
      save(); // фінальне збереження при відході зі сторінки
      window.removeEventListener("scroll", onScroll);
      log("save listener removed for", key, "final scrollY:", window.scrollY);
    };
  }, [key]);

  // Скидаємо флаг при зміні маршруту, щоб дозволити відновлення на новій сторінці
  useEffect(() => {
    restoredRef.current = false;
    log("restored flag reset for", key);
  }, [key]);

  // Відновлюємо позицію тільки на POP (back/forward) і коли контент готовий
  useEffect(() => {
    log("restore effect", { navType, ready, restored: restoredRef.current, key });
    if (restoredRef.current) {
      log("restore SKIP: already restored");
      return;
    }
    if (navType !== "POP") {
      log("restore SKIP: navType is", navType, "(not POP)");
      return;
    }
    if (!ready) {
      log("restore SKIP: not ready");
      return;
    }

    const all = readAll();
    const y = all[key];
    log("restore CHECK storage", { key, y, allKeys: Object.keys(all) });

    if (typeof y === "number" && y > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          restoredRef.current = true;
          log("restore DONE → scrollTo", y, "after rAFx2");
        });
      });
    } else {
      restoredRef.current = true;
      log("restore SKIP: no saved position");
    }
  }, [navType, ready, key]);
}
