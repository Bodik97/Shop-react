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
  } catch {
    /* sessionStorage недоступний — мовчки ігноруємо */
  }
};

export function useScrollRestoration({ ready = true } = {}) {
  const location = useLocation();
  const navType = useNavigationType();
  const restoredRef = useRef(false);
  const key = location.pathname + location.search;

  // Зберігаємо позицію періодично під час скролу і при unmount маршруту
  useEffect(() => {
    let timer;
    const save = () => writeOne(key, window.scrollY);

    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(save, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      save(); // фінальне збереження при відході зі сторінки
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  // Скидаємо флаг при зміні маршруту, щоб дозволити відновлення на новій сторінці
  useEffect(() => {
    restoredRef.current = false;
  }, [key]);

  // Відновлюємо позицію тільки на POP (back/forward) і коли контент готовий
  useEffect(() => {
    if (restoredRef.current) return;
    if (navType !== "POP") return;
    if (!ready) return;

    const all = readAll();
    const y = all[key];
    if (typeof y === "number" && y > 0) {
      // Подвійний rAF — даємо React домалювати DOM перед скролом
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          restoredRef.current = true;
        });
      });
    } else {
      restoredRef.current = true;
    }
  }, [navType, ready, key]);
}
