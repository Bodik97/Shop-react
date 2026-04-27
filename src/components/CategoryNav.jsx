// src/components/CategoryNav.jsx
import { useMemo } from "react";
import { Link } from "react-router-dom";

import pistImg from "../img/pist.webp";
import pnevmoImg from "../img/pnevmo.webp";
import knifesImg from "../img/knifes.webp";
import acsesoryImg from "../img/acsesory.webp";

// Фон беремо зі стабільного публічного шляху, а не з bundle —
// щоб preload-link в index.html міг його знайти.
const BG_IMAGE = "/img/background-img.webp";

const categories = [
  { id: "air_rifles", name: "Пневматичні гвинтівки", image: pnevmoImg },
  { id: "psp-rifles", name: "PCP гвинтівки", image: pnevmoImg },
  { id: "flobers", name: "Револьвери флобера", image: pnevmoImg },
  { id: "pvevmo-pistols", name: "Пневматичні пістолети", image: pistImg },
  { id: "start-pistols", name: "Стартові пістолети", image: knifesImg },
  { id: "accessories", name: "Аксесуари", image: acsesoryImg }
];

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'>
  <rect width='100%' height='100%' fill='#e5e7eb'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-family='sans-serif' font-size='14'>
    Немає зображення
  </text></svg>`);

function CategoryNav() {
  const catsWithImages = useMemo(() => {
    // Тепер 'categories' береться з константи вище
    return categories.map((cat) => ({
      ...cat,
      image: cat.image || FALLBACK_IMG,
    }));
  }, []);

  return (
    <section className="relative py-6 sm:py-10 rounded-2xl overflow-hidden">
      {/* LCP-зображення: реальний <img> із fetchpriority=high.
          Це дає браузеру змогу знайти картинку в HTML і завантажити її
          з найвищим пріоритетом. */}
      <img
        src={BG_IMAGE}
        alt=""
        aria-hidden="true"
        width={1600}
        height={400}
        decoding="async"
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4">
        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-4 sm:mb-6">
          Категорії
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {catsWithImages.map((cat, i) => (
            <div
              key={cat.id}
              className="animate-fadeUp active:scale-95 transition-transform"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Link
                to={`/category/${cat.id}`}
                className="group block rounded-2xl bg-white border border-white/60
                           shadow hover:shadow-lg hover:-translate-y-0.5 transition-transform overflow-hidden
                           sm:hover:scale-105 h-full"
              >
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500
                               sm:group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-3 sm:p-4 flex items-center gap-1">
                  <h3 className="text-lg sm:text-2xl md:text-[28px] lg:text-[32px] font-semibold text-gray-800 leading-tight">{cat.name}</h3>
                </div>

                <div className="px-3 sm:px-4 pb-3">
                  <div className="mt-0.5 mb-1 text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Перейти</span>
                    <svg viewBox="0 0 24 24" className="h-6 w-6 opacity-80 transition-transform group-hover:translate-x-0.5">
                      <path fill="currentColor" d="M10 6l6 6-6 6v-4H4v-4h6V6z" />
                    </svg>
                    {/* Прибрали animate-ping × 6 — нескінченна анімація на
                        мобільному GPU тримала композитор завжди зайнятим.
                        Залишив статичну точку — той самий візуальний натяк. */}
                    <span aria-hidden className="sm:hidden h-2.5 w-2.5 rounded-full bg-pink-600 shadow-[0_0_4px_rgba(236,72,153,0.6)]" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryNav;