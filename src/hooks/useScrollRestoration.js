import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function useScrollRestoration({ ready }) {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const scrollKey = `scroll-${pathname}`;

  // 1. Зберігаємо скрол
  useEffect(() => {
    const handleScroll = () => {
      // Не зберігаємо 0 під час переходу, щоб не затерти старе значення
      if (window.scrollY > 0) {
        sessionStorage.setItem(scrollKey, window.scrollY.toString());
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollKey]);

  // 2. Відновлюємо скрол
  useLayoutEffect(() => {
    if (!ready) return;

    if (navType === "POP") {
      const savedPosition = sessionStorage.getItem(scrollKey);
      if (savedPosition) {
        const y = parseInt(savedPosition, 10);
        // Робимо подвійний кадр для гарантії рендеру сітки
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" });
          });
        });
      }
    } else {
      // Якщо це новий перехід (PUSH), примусово вгору
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [ready, pathname, navType, scrollKey]);
}