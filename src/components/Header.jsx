// src/components/Header.jsx
import { useCart } from "../context/CartContext";

import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "/img/Logo.svg";
import { FaInstagram, FaTiktok, FaTelegram } from "react-icons/fa";

// ID мають збігатися з Sanity-схемою (studio-shop/schemaTypes/products.ts).
// Канонічний порядок такий же, як на сторінці категорії.
const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки" },
  { id: "psp-rifles",     name: "PCP гвинтівки" },
  { id: "flobers",        name: "Револьвери флобера" },
  { id: "pvevmo-pistols", name: "Пневматичні пістолети" },
  { id: "start-pistols",  name: "Стартові пістолети" },
  { id: "pepper-sprays",    name: "Перцеві балончики" },
];

export default function Header() {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const firstFocusableRef = useRef(null);

  const press = (e) => {
    const el = e.currentTarget;
    el.classList.add("pressed");
    setTimeout(() => el.classList.remove("pressed"), 150);
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
          isActive ? "text-blue-700 font-extrabold" : "text-gray-800 hover:text-blue-700"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-[70] border-b bg-white shadow-md">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          {/* LEFT: Лого + Нав */}
          <div className="hidden lg:flex items-center">
            <Link to="/" onClick={() => setOpen(false)}>
              <img src={logo} alt="Airsoft Shop Logo" className="h-16 w-auto" />
            </Link>

            <nav className="flex items-center gap-6 text-lg font-semibold ml-6">
              <Item to="/">Головна</Item>
              <div className="relative group">
                <NavLink
                  to="/catalog"
                  className="px-3 py-2 text-gray-800 hover:text-blue-700 transition uppercase tracking-wide"
                >
                  Каталог
                </NavLink>
                <div className="absolute left-0 top-full mt-2 min-w-64 bg-white border rounded-xl shadow-lg p-4 opacity-0 invisible 
                                group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.id}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 hover:bg-blue-50 text-sm text-gray-700"
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
          </div>

          {/* MOBILE: Лого */}
          <Link to="/" className="lg:hidden shrink-0" onClick={() => setOpen(false)}>
            <img src={logo} alt="Airsoft Shop Logo" className="h-10 sm:h-12 w-auto" />
          </Link>

          {/* RIGHT: Замовлення + Кошик + бургер */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* КНОПКА ЗАМОВЛЕННЯ — тільки десктоп */}
            <Link
              to="/history-orders"
              onClick={() => setOpen(false)}
              className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-base !text-white font-semibold hover:bg-gray-900 transition"
              aria-label="Мої замовлення"
            >
              📋 Замовлення
            </Link>

            {/* КНОПКА КОШИКА */}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex items-center gap-1.5 rounded-xl bg-black px-3 sm:px-5 h-11 sm:h-12 !text-white font-bold uppercase tracking-wide hover:bg-gray-900 active:scale-95 transition"
              aria-label="Перейти до кошика"
            >
              <ShoppingCartIcon className="h-6.5 w-8 sm:h-6 sm:w-6 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 grid place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* БУРГЕР */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Відкрити меню"
              aria-expanded={open}
              className="relative lg:hidden h-11 w-14 sm:h-12 sm:w-14 rounded-xl bg-black shadow hover:bg-blue-800 active:scale-95 transition flex flex-col items-center justify-center gap-2 shrink-0"
            >
              <span className={`block h-0.5 w-7 bg-white rounded origin-center transition-transform duration-300 ${open ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-7 bg-white rounded transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`block h-0.5 w-7 bg-white rounded origin-center transition-transform duration-300 ${open ? "-translate-y-1 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed left-0 top-0 z-[90] h-full w-80 max-w-[85vw] bg-white shadow-3xl border-r transition-transform duration-400
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Мобільне меню"
      >
        <div className="flex items-center justify-between p-2 ">
          <Link to="/" onClick={() => setOpen(false)} aria-label="На головну">
            <img src={logo} alt="AirSoft" className="h-10 w-20" />
          </Link>
          <button
            ref={firstFocusableRef}
            onClick={() => setOpen(false)}
            className="p-2 bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition"
            aria-label="Закрити меню"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
          <hr className="my-2 border-gray-300" />
        <nav className="p-2 space-y-2 text-[18px] font-medium w-full select-none [-webkit-tap-highlight-color:transparent]">
          {/* Категорії (без бордерів, ефект лише на тап) */}
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              onClick={() => setOpen(false)}
              onPointerDown={press}
              className="block w-full rounded-xl px-4 py-3 bg-white text-gray-900
                        transition-transform duration-100 [transform]
                        [&.pressed]:bg-gray-100 [&.pressed]:scale-95"
            >
              {c.name}
            </Link>
          ))}

          <hr className="my-2 border-gray-300" />

          {/* Про нас — постійний фон + tap-ефект */}
          <NavLink
            to="/about"
            onClick={() => setOpen(false)}
            onPointerDown={press}
            className={({ isActive }) =>
              `block w-full rounded-xl px-4 py-3 bg-blue-100 text-gray-900
              transition-transform duration-100 [transform]
              [&.pressed]:bg-purple-100 [&.pressed]:scale-95 ${isActive ? "text-blue-700" : ""}`
            }
          >
            Про нас
          </NavLink>

          {/* Контакти — постійний фон + tap-ефект */}
          <NavLink
            to="/contact"
            onClick={() => setOpen(false)}
            onPointerDown={press}
            className={({ isActive }) =>
              `block w-full rounded-xl px-4 py-3 bg-blue-100 text-gray-900
              transition-transform duration-100 [transform]
              [&.pressed]:bg-purple-100 [&.pressed]:scale-95 ${isActive ? "text-blue-700" : ""}`
            }
          >
            Контакти
          </NavLink>
        </nav>


        {/* ДОДАТКОВИЙ БЛОК: Кошик + Замовлення */}
        <div className="p-4 border-t space-y-2">
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 !text-white font-semibold shadow-sm
              md:hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black
              motion-safe:transition motion-safe:duration-200 [transition-property:transform,background-color,box-shadow]
              active:scale-[0.98] active:shadow-none sm:active:scale-100 touch-manipulation"
            aria-label="Перейти до кошика"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Кошик
            {cartCount > 0 && (
              <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Кнопка перегляду замовлень */}
          <Link
            to="/history-orders"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-base !text-white font-semibold hover:bg-gray-900 active:scale-95 transition"
            aria-label="Мої замовлення"
          >
            📋 Мої замовлення
          </Link>
        </div>
      </aside>
    </header>
  );
}

/* SVG іконки соцмереж без зовнішніх залежностей */