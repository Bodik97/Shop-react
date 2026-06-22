// src/components/CategorySidebar.jsx
// Закріплене бокове меню категорій + розділ "Інформація".
// Рендериться через <Layout> лише на сторінках каталогу/товарів/головній.
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wind, Target, Disc, Crosshair, Zap, SprayCan, Info, Phone, Menu, ChevronDown, Newspaper } from "lucide-react";
import { client } from "../sanityClient";

// ID збігаються з Sanity-схемою та Header.jsx (канонічний порядок).
const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки", Icon: Wind },
  { id: "psp-rifles",     name: "PCP гвинтівки",          Icon: Target },
  { id: "flobers",        name: "Револьвери флобера",     Icon: Disc },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети",  Icon: Crosshair },
  { id: "start-pistols",  name: "Стартові пістолети",     Icon: Zap },
  { id: "pepper-sprays",  name: "Перцеві балончики",      Icon: SprayCan },
];

// Кількість товарів у кожній категорії — один легкий запит (тільки числа).
// Семантика збігається з CatalogPage (фільтр category === id).
const fetchCategoryCounts = async () => {
  const projection = CATEGORIES.map(
    ({ id }) => `"${id}": count(*[_type == "product" && category == "${id}"])`
  ).join(",");
  return await client.fetch(`{${projection}}`);
};

const itemBase =
  "flex items-center gap-2.5 px-3 py-3 text-[15px] border-line " +
  "transition-colors lg:hover:bg-surface lg:hover:text-accent " +
  "border-b";

const itemClass = ({ isActive }) =>
  `${itemBase} ${
    isActive
      ? "text-accent font-semibold bg-orange-50 lg:border-l-[3px] lg:border-l-accent"
      : "text-ink"
  }`;

export default function CategorySidebar() {
  // На мобільному список згорнутий — тап по заголовку розгортає.
  // На десктопі (lg+) меню завжди розкрите, тож стан тут не впливає.
  const [open, setOpen] = useState(false);

  const { data: counts } = useQuery({
    queryKey: ["categoryCounts"],
    queryFn: fetchCategoryCounts,
  });

  return (
    <aside className="lg:sticky lg:top-[88px] rounded-xl border border-line bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3.5 bg-ink text-white font-display font-semibold text-[15px] lg:cursor-default"
      >
        <Menu className="w-4 h-4" />
        Категорії
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>

      <nav className={`${open ? "block" : "hidden"} lg:block`} onClick={() => setOpen(false)}>
        {CATEGORIES.map(({ id, name, Icon }) => (
          <NavLink key={id} to={`/category/${id}`} className={itemClass}>
            <Icon className="w-5 h-5 text-ink-soft shrink-0" />
            <span className="min-w-0 truncate">{name}</span>
            {counts?.[id] != null && (
              <span
                className="ml-auto shrink-0 inline-flex items-center justify-center min-w-[1.25rem]
                  rounded-full bg-surface px-1 text-[11px] font-semibold text-ink-soft tabular-nums"
                aria-label={`товарів: ${counts[id]}`}
              >
                {counts[id]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Інформація — лише на десктопі (на мобільному є в шапці) */}
      <div className="hidden lg:block px-4 pt-3 pb-2 text-[12px] font-display font-semibold uppercase tracking-wide text-ink-soft bg-surface border-t border-line">
        Інформація
      </div>
      <nav className="hidden lg:block">
        <NavLink to="/blog" className={itemClass}>
          <Newspaper className="w-5 h-5 text-ink-soft" />
          Блог
        </NavLink>
        <NavLink to="/about" className={itemClass}>
          <Info className="w-5 h-5 text-ink-soft" />
          Про нас
        </NavLink>
        <NavLink to="/contact" className={itemClass}>
          <Phone className="w-5 h-5 text-ink-soft" />
          Контакти
        </NavLink>
      </nav>
    </aside>
  );
}
