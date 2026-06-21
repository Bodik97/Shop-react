// src/components/CategorySidebar.jsx
// Закріплене бокове меню категорій + розділ "Інформація".
// Рендериться через <Layout> лише на сторінках каталогу/товарів/головній.
import { NavLink } from "react-router-dom";
import { Wind, Target, Disc, Crosshair, Zap, SprayCan, Info, Phone, Menu } from "lucide-react";

// ID збігаються з Sanity-схемою та Header.jsx (канонічний порядок).
const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки", Icon: Wind },
  { id: "psp-rifles",     name: "PCP гвинтівки",          Icon: Target },
  { id: "flobers",        name: "Револьвери флобера",     Icon: Disc },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети",  Icon: Crosshair },
  { id: "start-pistols",  name: "Стартові пістолети",     Icon: Zap },
  { id: "pepper-sprays",  name: "Перцеві балончики",      Icon: SprayCan },
];

const itemBase =
  "flex items-center gap-3 px-4 py-3 text-[15px] border-line " +
  "transition-colors lg:hover:bg-surface lg:hover:text-accent " +
  "border-b";

const itemClass = ({ isActive }) =>
  `${itemBase} ${
    isActive
      ? "text-accent font-semibold bg-orange-50 lg:border-l-[3px] lg:border-l-accent"
      : "text-ink"
  }`;

export default function CategorySidebar() {
  return (
    <aside className="lg:sticky lg:top-[88px] rounded-xl border border-line bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3.5 bg-ink text-white font-display font-semibold text-[15px]">
        <Menu className="w-4 h-4" />
        Категорії
      </div>

      <nav>
        {CATEGORIES.map(({ id, name, Icon }) => (
          <NavLink key={id} to={`/category/${id}`} className={itemClass}>
            <Icon className="w-5 h-5 text-ink-soft" />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* Інформація — лише на десктопі (на мобільному є в шапці) */}
      <div className="hidden lg:block px-4 pt-3 pb-2 text-[12px] font-display font-semibold uppercase tracking-wide text-ink-soft bg-surface border-t border-line">
        Інформація
      </div>
      <nav className="hidden lg:block">
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
