// src/components/CategoryNav.jsx
import { useMemo } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import pistImg from "../img/pist.webp";
import pnevmoImg from "../img/pnevmo.webp";
import knifesImg from "../img/knifes.webp";
import acsesoryImg from "../img/acsesory.webp";
import bgImg from "../img/background-img.webp";

const categories = [
  { id: "air_rifles", name: "Пневматичні гвинтівки", image: pnevmoImg },
  { id: "psp-rifles", name: "ПСП гвинтівки", image: pnevmoImg },
  { id: "flobers", name: "Флобери", image: pnevmoImg },
  { id: "pistols", name: "Пістолети", image: pistImg },
  { id: "knives", name: "Ножі", image: knifesImg },
  { id: "accessories", name: "Аксесуари", image: acsesoryImg }
];

const bgImage = bgImg;

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
    <section
      className="relative py-6 sm:py-10 rounded-2xl overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4">
        <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-4 sm:mb-6">
          Категорії
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {catsWithImages.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={`/category/${cat.id}`}
                className="group block rounded-2xl bg-white/90 backdrop-blur border border-white/60 
                           shadow hover:shadow-lg hover:-translate-y-0.5 transition overflow-hidden
                           sm:hover:scale-105 sm:transition-transform h-full"
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
                    <div className="sm:hidden">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-600" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryNav;