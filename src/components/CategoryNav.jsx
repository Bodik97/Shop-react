// src/components/CategoryNav.jsx
import { useMemo } from "react";
// eslint-disable-next-line
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { categories } from "../data/products";

const bgImage = "https://res.cloudinary.com/da27wfewm/image/upload/v1758359721/background-img_beohna.webp";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'>
  <rect width='100%' height='100%' fill='#e5e7eb'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-family='sans-serif' font-size='14'>
    Немає зображення
  </text></svg>`);

function CategoryNav() {
  const catsWithImages = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      image: cat.image || FALLBACK_IMG,
    }));
  }, []);

  return (
    <section
      className="relative py-8 sm:py-10 rounded-2xl overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* затемнення */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-white mb-6 ">
          Категорії
        </h2>

        {/* Сітка замість каруселі */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] lg:grid-cols-2 gap-6 sm:gap-2.5 lg:gap-4">
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

                {/* Текст + індикатор */}
                <div className="p-4 flex items-center gap-1">
                  <h3 className="text-[36px] font-semibold text-gray-800">{cat.name}</h3>
                  
                </div>

                <div className="px-4 pb-3">
                  <div className="mt-0.5 mb-1 text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-[15px] font-medium text-gray-700">Перейти</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 opacity-80 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d="M10 6l6 6-6 6v-4H4v-4h6V6z" />
                    </svg>
                    {/* рожева точка для мобільних */}
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