// src/components/Header.jsx
import { useCart } from "../context/CartContext";

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
// lucide з аліасами під старі назви heroicons — щоб не тягнути другу
// бібліотеку іконок у бандл (решта сайту вже на lucide).
import {
  ShoppingCart as ShoppingCartIcon,
  X as XMarkIcon,
  Search as MagnifyingGlassIcon,
  Phone as PhoneIcon,
  ShieldCheck as ShieldCheckIcon,
  Truck as TruckIcon,
  Home as HomeIcon,
  LayoutGrid as Squares2X2Icon,
  ChevronRight as ChevronRightIcon,
  Info as InformationCircleIcon,
  ClipboardList as ClipboardDocumentListIcon,
  RotateCcw as ArrowPathIcon,
  BadgeCheck as CheckBadgeIcon,
  Sparkles as SparklesIcon,
  Clock as ClockIcon,
} from "lucide-react";
import logo from "/img/Logo.svg";


const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки" },
  { id: "psp-rifles",     name: "PCP гвинтівки" },
  { id: "flobers",        name: "Револьвери флобера" },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети" },
  { id: "start-pistols",  name: "Стартові пістолети" },
  { id: "pepper-sprays",    name: "Перцеві балончики" },
];

// Переваги для бігаючого рядка у верхній смузі.
const PERKS = [
  { Icon: ShieldCheckIcon,      text: "Оплата при отриманні" },
  { Icon: TruckIcon,            text: "Доставка по всій Україні" },
  { Icon: ArrowPathIcon,        text: "14 днів на повернення" },
  { Icon: CheckBadgeIcon,       text: "Гарантія якості" },
  { Icon: SparklesIcon,         text: "Оригінальна продукція" },
  { Icon: MagnifyingGlassIcon,  text: "Перевірка перед відправкою" },
  { Icon: ClockIcon,            text: "10 років на ринку" },
];

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const drawerRef = useRef(null);
  const firstFocusableRef = useRef(null);

  const press = (e) => {
    const el = e.currentTarget;
    el.classList.add("pressed");
    setTimeout(() => el.classList.remove("pressed"), 150);
  };

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/catalog?q=${encodeURIComponent(term)}` : "/catalog");
    setOpen(false);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add("overflow-hidden", "overscroll-none");
      const t = requestAnimationFrame(() => firstFocusableRef.current?.focus());
      return () => {
        cancelAnimationFrame(t);
        root.classList.remove("overflow-hidden", "overscroll-none");
      };
    }
  }, [open]);

  const Item = ({ to, children }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md transition uppercase tracking-wide ${
          isActive ? "text-accent font-extrabold" : "text-ink hover:text-accent"
        }`
      }
    >
      {children}
    </NavLink>
  );

  // Пункт мобільного меню: іконка + назва + активний стан, тач-таргет ≥44px
  const DrawerLink = ({ to, icon: Icon, children, sub = false }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      onPointerDown={press}
      className={({ isActive }) =>
        `flex items-center gap-3 w-full rounded-xl px-3 min-h-[48px] transition-transform duration-100
        [&.pressed]:scale-[0.97] ${sub ? "text-[15px]" : "text-[16px] font-semibold"} ${
          isActive
            ? "bg-orange-50 text-accent"
            : sub
            ? "text-ink-soft hover:bg-surface hover:text-ink"
            : "text-ink hover:bg-surface"
        }`
      }
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span className="flex-1">{children}</span>
    </NavLink>
  );

  return (
    <>
      {/* Верхня смуга: переваги — бігаючий рядок */}
      <div className="bg-ink text-white text-[13px]">
        {/* transform:translateZ(0)+contain — iOS Safari НЕ обрізає композитний
            (will-change-transform) marquee лише через overflow-hidden, тож шар
            «витікає» і робить сторінку горизонтально протягуваною. Власний
            композитний/клип-контекст на контейнері змушує iOS обрізати його. */}
        <div className="relative max-w-7xl mx-auto h-9 overflow-hidden flex items-center [transform:translateZ(0)] [contain:paint]">
          <div className="flex shrink-0 items-center whitespace-nowrap will-change-transform animate-marquee">
            {PERKS.map((p) => (
              <span key={p.text} className="flex items-center gap-1.5 text-stone-300 px-6">
                <p.Icon className="w-4 h-4 text-accent shrink-0" />
                {p.text}
              </span>
            ))}
            {PERKS.map((p) => (
              <span key={`dup-${p.text}`} aria-hidden="true" className="flex items-center gap-1.5 text-stone-300 px-6">
                <p.Icon className="w-4 h-4 text-accent shrink-0" />
                {p.text}
              </span>
            ))}
          </div>
          {/* Fade-краї для м'якого «входу/виходу» */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent" />
        </div>
      </div>

      <header className="sticky top-0 z-[70] border-b border-line bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center gap-3 sm:gap-4">
            {/* Лого */}
            <Link to="/" onClick={() => setOpen(false)} className="shrink-0">
              <img src={logo} alt="AirSoft-UA" className="h-11 sm:h-12 w-auto" />
            </Link>

            {/* Десктоп-нав */}
            <nav className="hidden lg:flex items-center gap-1 text-[15px] font-semibold shrink-0">
              <Item to="/">Головна</Item>
            </nav>

            {/* Пошук (десктоп/планшет) */}
            <form
              onSubmit={onSearch}
              role="search"
              className="hidden md:flex flex-1 items-center gap-2 bg-surface border border-line rounded-lg px-4 py-2.5 max-w-xl"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-ink-soft shrink-0" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Пошук: гвинтівка, пістолет, балончик…"
                aria-label="Пошук по каталогу"
                className="bg-transparent outline-none flex-1 text-[15px] text-ink placeholder:text-ink-soft"
              />
            </form>

            {/* Праворуч: Замовлення + Кошик + бургер */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
              <Link
                to="/history-orders"
                onClick={() => setOpen(false)}
                className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 h-12 text-[15px] text-ink font-semibold
                  hover:border-ink hover:bg-surface active:scale-95 transition-all"
                aria-label="Мої замовлення"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 text-ink-soft" />
                Замовлення
              </Link>

              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="relative inline-flex items-center gap-1.5 rounded-xl bg-black px-4 sm:px-5 h-11 sm:h-12  text-white font-bold uppercase tracking-wide hover:brightness-95 active:scale-95 transition"
                aria-label="Перейти до кошика"
              >
                <ShoppingCartIcon className="h-6 w-6 text-white center" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 grid place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Відкрити меню"
                aria-expanded={open}
                className="relative lg:hidden h-11 w-14 sm:h-12 sm:w-14 rounded-xl bg-ink shadow hover:brightness-110 active:scale-95 transition flex flex-col items-center justify-center gap-2 shrink-0"
              >
                <span className={`block h-0.5 w-7 bg-white rounded origin-center transition-transform duration-300 ${open ? "translate-y-1 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-7 bg-white rounded transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
                <span className={`block h-0.5 w-7 bg-white rounded origin-center transition-transform duration-300 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
              </button>
            </div>
          </div>

          {/* Пошук на мобільному — окремий рядок */}
          <form onSubmit={onSearch} role="search" className="md:hidden pb-3">
            <div className="flex items-center gap-2 bg-surface border border-line rounded-lg px-4 py-2.5">
              <MagnifyingGlassIcon className="w-5 h-5 text-ink-soft shrink-0" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Пошук товарів…"
                aria-label="Пошук по каталогу"
                className="bg-transparent outline-none flex-1 text-[15px] text-ink placeholder:text-ink-soft"
              />
            </div>
          </form>
        </div>

        {/* Backdrop */}
        {open && (
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
        )}

        {/* Drawer */}
        <aside
          ref={drawerRef}
          className={`fixed left-0 top-0 z-[90] flex flex-col h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r border-line transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Мобільне меню"
        >
          {/* Шапка меню */}
          <div className="flex items-center justify-between gap-2 h-16 px-4 border-b border-line shrink-0">
            <Link to="/" onClick={() => setOpen(false)} aria-label="На головну">
              <img src={logo} alt="AirSoft-UA" className="h-9 w-auto" />
            </Link>
            <button
              ref={firstFocusableRef}
              onClick={() => setOpen(false)}
              className="grid place-items-center h-11 w-11 bg-ink rounded-xl hover:brightness-110 active:scale-95 transition"
              aria-label="Закрити меню"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Прокручуваний вміст */}
          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 select-none [-webkit-tap-highlight-color:transparent]">
            {/* Категорії — одразу, повним списком */}
            <p className="px-3 pb-2 text-[12px] font-bold uppercase tracking-wider text-ink-soft">
              Категорії
            </p>
            <ul className="space-y-0.5">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <NavLink
                    to={`/category/${c.id}`}
                    onClick={() => setOpen(false)}
                    onPointerDown={press}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-3 w-full rounded-xl px-3 min-h-[48px] text-[15px] transition-transform duration-100
                      [&.pressed]:scale-[0.97] ${
                        isActive
                          ? "bg-orange-50 text-accent font-semibold"
                          : "text-ink hover:bg-surface"
                      }`
                    }
                  >
                    <span>{c.name}</span>
                    <ChevronRightIcon className="w-4 h-4 shrink-0 opacity-50" />
                  </NavLink>
                </li>
              ))}
            </ul>

            <hr className="my-3 border-line" />

            <DrawerLink to="/" icon={HomeIcon}>Головна</DrawerLink>
            <DrawerLink to="/catalog" icon={Squares2X2Icon}>Всі товари</DrawerLink>
            <DrawerLink to="/about" icon={InformationCircleIcon}>Про нас</DrawerLink>
            <DrawerLink to="/contact" icon={PhoneIcon}>Контакти</DrawerLink>
          </nav>

          {/* Закріплений низ: основна дія + замовлення */}
          <div className="shrink-0 border-t border-line p-3 space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 min-h-[52px] text-white font-bold uppercase tracking-wide shadow-sm
                hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
                motion-safe:transition active:scale-[0.98] touch-manipulation"
              aria-label="Перейти до кошика"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Кошик
              {cartCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/history-orders"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 min-h-[48px] text-[15px] text-ink font-semibold hover:bg-surface active:scale-[0.98] transition"
              aria-label="Мої замовлення"
            >
              <ClipboardDocumentListIcon className="h-5 w-5 text-accent" />
              Мої замовлення
            </Link>
          </div>
        </aside>
      </header>
    </>
  );
}
