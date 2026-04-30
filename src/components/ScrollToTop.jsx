import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop({ smooth = false }) {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // На back/forward (POP) не чіпаємо скрол — там працює useScrollRestoration,
    // який точково відновлює позицію після завантаження даних сторінки.
    if (navType === "POP") return;

    const behavior = smooth ? "smooth" : "auto";

    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior, block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  }, [pathname, hash, smooth, navType]);

  return null;
}
