// src/hooks/useScrollRestoration.js
//
// Єдина точка керування скролом для маршруту:
// • На POP (back/forward) — відновлює раніше збережену позицію з sessionStorage
// • На PUSH/REPLACE (нова навігація) — скролить у верх сторінки
//
// Замінює окремий <ScrollToTop /> компонент: один хук на сторінку покриває
// обидва сценарії і не конфліктує сам з собою.
//
// Параметр `ready` потрібен сторінкам, які асинхронно завантажують дані:
// поки масив товарів пустий — сторінка коротка, scrollTo(y=1500) обріжеться.
// Передаємо `ready: !isLoading && items.length > 0`, хук дочекається.

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

  // Зберігаємо позицію періодично під час скролу і фінально при відході зі сторінки
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
      save();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  // Скидаємо флаг при зміні маршруту, щоб дозволити дію на новій сторінці
  useEffect(() => {
    restoredRef.current = false;
  }, [key]);

  // Виконуємо скрол: POP → restore, PUSH/REPLACE → top
  useEffect(() => {
    if (restoredRef.current) return;
    if (!ready) return;

    // Подвійний rAF — даємо React/браузеру домалювати DOM перед скролом
    const performScroll = (y) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          restoredRef.current = true;
        });
      });
    };

    if (navType === "POP") {
      const all = readAll();
      const y = all[key];
      performScroll(typeof y === "number" && y > 0 ? y : 0);
    } else {
      // PUSH/REPLACE — нова навігація, в верх
      performScroll(0);
    }
  }, [navType, ready, key]);
}
