import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import bgImage from "../img/background-img.png";

const categories = [
  { id: "workwear", name: "Пістолети ", image: "/placeholder/workwear.jpg" },
  { id: "boots", name: "Пневматичні гвинтівки", image: "/placeholder/boots.jpg" },
  { id: "tools", name: "Ножі", image: "/placeholder/tools.jpg" },
  { id: "accessories", name: "Аксесуари", image: "/placeholder/accessories.jpg" },
];

export default function CategoryNav() {
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const [paused, setPaused] = useState(false);


  // ♾️ плавна автопрокрутка
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // повага до налаштувань доступності

    let speed = 0.35; // px за кадр — підкручуй за смаком (0.2–0.6)
    const loop = () => {
      if (!paused) {
        // коли дійшли до кінця — повертаємось на початок (без ривка)
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollTo({ left: 0, behavior: "auto" });
        } else {
          el.scrollLeft += speed;
        }
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [paused]);

  return (
    <section
      className="py-6 rounded-2xl overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white drop-shadow">Категорії</h2>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {categories.concat(categories).map((cat, i) => (
              // дублюємо список 2 рази, щоб перехід у 0 виглядав безшовно
              <div key={`${cat.id}-${i}`} className="flex-shrink-0 w-72 sm:w-80">
                <Link
                  to={`/category/${cat.id}`}
                  className="group block rounded-xl bg-white/95 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="h-32 bg-gray-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800">{cat.name}</h3>
                    <p className="text-xs text-gray-500">Перейти →</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* мобільні кнопки поверх */}
          
        </div>
      </div>
    </section>
  );
}
