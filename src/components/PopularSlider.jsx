// src/components/PopularSlider.jsx
import { useMemo } from "react";
import ProductCard from "./ProductCard";

export default function PopularSlider({
  products = [],
  onAddToCart,
  onBuy,
  title = "Популярні товари",
}) {
  // Фільтрація та сортування списку популярних товарів
  const list = useMemo(() => {
    const popular = (products || [])
      .filter(
        (p) =>
          p?.popular === true ||
          p?.isPopular === true ||
          p?.tags?.includes?.("popular") ||
          p?.badges?.includes?.("popular")
      )
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    return popular.length ? popular : products;
  }, [products]);

  if (!list.length) return null;

  return (
    <section className="py-8">
      {/* Заголовок */}
      <div className="mb-6 px-4 sm:px-0">
        <h2 className="text-2xl font-stencil uppercase tracking-[0.25em] text-white">
          {title}
        </h2>
      </div>

      {/* Адаптивна сітка */}
      <div 
        className=" grid 
                    grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4 
                    gap-3 
                    sm:gap-6 
                    px-2 
                    sm:px-0"
      >
        {list.map((p) => (
          <div key={p.id} className="flex justify-center w-full">
            <ProductCard 
              product={p} 
              onAddToCart={onAddToCart} 
              onBuy={onBuy} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}