import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ smooth = false }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
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
  }, [pathname, hash, smooth]); // ← додали smooth

  return null;
}
