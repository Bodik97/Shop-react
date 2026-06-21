// src/components/Header.jsx
import { useCart } from "../context/CartContext";

import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import logo from "/img/Logo.svg";
import { PHONE_DISPLAY, PHONE_HREF } from "../utils/contacts";

// ID мають збігатися з Sanity-схемою (studio-shop/schemaTypes/products.ts).
// Канонічний порядок такий же, як на сторінці категорії.
const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки" },
  { id: "psp-rifles",     name: "PCP гвинтівки" },
  { id: "flobers",        name: "Револьвери флобера" },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети" },
  { id: "start-pistols",  name: "Стартові пістолети" },
  { id: "pepper-sprays",    name: "Перцеві балончики" },
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

  return (
    <>
      {/* Верхня смуга: довіра + телефон */}
      <div className="bg-ink text-white text-[13px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-9 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-5 text-stone-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-accent" />
              Оплата при отриманні
            </span>
            <span className="flex items-center gap-1.5">
              <TruckIcon className="w-4 h-4 text-accent" />
              Доставка по всій Україні
            </span>
          </div>
          <a
            href={`tel:${PHONE_HREF}`}
            className="flex items-center gap-1.5 font-semibold ml-auto sm:ml-0 hover:text-accent transition"
          >
            <PhoneIcon className="w-4 h-4 text-accent" />
            {PHONE_DISPLAY}
          </a>
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
              <div className="relative group">
                <NavLink
                  to="/catalog"
                  className="px-3 py-2 text-ink hover:text-accent transition uppercase tracking-wide inline-block"
                >
                  Каталог
                </NavLink>
                <div className="absolute left-0 top-full mt-2 min-w-64 bg-white border border-line rounded-xl shadow-lg p-4 opacity-0 invisible
                                group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.id}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 hover:bg-orange-50 hover:text-accent text-sm text-ink-soft transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Item to="/about">Про нас</Item>
              <Item to="/contact">Контакти</Item>
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
            <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto md:ml-0">
              <Link
                to="/history-orders"
                onClick={() => setOpen(false)}
                className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-[15px] text-ink font-semibold hover:bg-surface transition"
                aria-label="Мої замовлення"
              >
                Замовлення
              </Link>

              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="relative inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 sm:px-5 h-11 sm:h-12 text-white font-bold uppercase tracking-wide hover:brightness-95 active:scale-95 transition"
                aria-label="Перейти до кошика"
              >
                <ShoppingCartIcon className="h-6 w-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 grid place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">
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
          className={`fixed left-0 top-0 z-[90] h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r border-line transition-transform duration-400
            ${open ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Мобільне меню"
        >
          <div className="flex items-center justify-between p-2 ">
            <Link to="/" onClick={() => setOpen(false)} aria-label="На головну">
              <img src={logo} alt="AirSoft-UA" className="h-10 w-20" />
            </Link>
            <button
              ref={firstFocusableRef}
              onClick={() => setOpen(false)}
              className="p-2 bg-ink rounded-lg hover:brightness-110 active:scale-95 transition"
              aria-label="Закрити меню"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <hr className="my-2 border-line" />
          <nav className="p-2 space-y-2 text-[18px] font-medium w-full select-none [-webkit-tap-highlight-color:transparent]">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                onClick={() => setOpen(false)}
                onPointerDown={press}
                className="block w-full rounded-xl px-4 py-3 bg-white text-ink
                          transition-transform duration-100 [transform]
                          [&.pressed]:bg-surface [&.pressed]:scale-95"
              >
                {c.name}
              </Link>
            ))}

            <hr className="my-2 border-line" />

            <NavLink
              to="/about"
              onClick={() => setOpen(false)}
              onPointerDown={press}
              className={({ isActive }) =>
                `block w-full rounded-xl px-4 py-3 bg-surface text-ink
                transition-transform duration-100 [transform]
                [&.pressed]:bg-orange-50 [&.pressed]:scale-95 ${isActive ? "text-accent" : ""}`
              }
            >
              Про нас
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              onPointerDown={press}
              className={({ isActive }) =>
                `block w-full rounded-xl px-4 py-3 bg-surface text-ink
                transition-transform duration-100 [transform]
                [&.pressed]:bg-orange-50 [&.pressed]:scale-95 ${isActive ? "text-accent" : ""}`
              }
            >
              Контакти
            </NavLink>
          </nav>

          {/* Кошик + Замовлення */}
          <div className="p-4 border-t border-line space-y-2">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-white font-semibold shadow-sm
                hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
                motion-safe:transition active:scale-[0.98] touch-manipulation"
              aria-label="Перейти до кошика"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Кошик
              {cartCount > 0 && (
                <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/history-orders"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-base text-ink font-semibold hover:bg-surface active:scale-95 transition"
              aria-label="Мої замовлення"
            >
              Мої замовлення
            </Link>
          </div>
        </aside>
      </header>
    </>
  );
}
