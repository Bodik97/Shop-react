// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../img/Logo.svg";

const CATEGORIES = [
  { id: "pistols", name: "Пістолети", icon: "🔫" },
  { id: "rifles", name: "Гвинтівки", icon: "🏹" },
  { id: "knives", name: "Ножі", icon: "🔪" },
  { id: "accessories", name: "Аксесуари", icon: "🕶️" },
];

export default function Header({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // блокування скролу коли меню відкрите
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
    <header className="sticky top-0 z-50 border-b bg-white shadow-md">
      <div className="w-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
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
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-blue-50 text-sm text-gray-700"
                      >
                        <span>{c.icon}</span> {c.name}
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
          <Link to="/" className="lg:hidden" onClick={() => setOpen(false)}>
            <img src={logo} alt="Airsoft Shop Logo" className="h-12 w-auto" />
          </Link>

          {/* RIGHT: Кошик + бургер */}
          <div className="flex items-center gap-4">
            {/* КНОПКА КОШИКА */}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-lg text-white font-bold uppercase tracking-wide hover:bg-blue-700 transition"
            >
              <ShoppingCartIcon className="h-6 w-9 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* БУРГЕР */}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-label="Відкрити меню"
              aria-expanded={open}
              className="relative lg:hidden h-12 w-18 rounded-2xl border bg-blue-950 shadow hover:bg-blue-800 active:scale-95 transition-all duration-200 grid place-items-center"
            >
              {/* три лінії */}
              <span
                className={`block h-0.5 w-8 bg-white rounded origin-center transition-transform duration-300
                  ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-8 bg-white rounded my-1 transition-all duration-300
                  ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`block h-0.5 w-8 bg-white rounded origin-center transition-transform duration-300
                  ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Меню</span>
          <button
            ref={firstFocusableRef}
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          <NavLink to="/" onClick={() => setOpen(false)} className="px-3 py-2">Головна</NavLink>
          <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">Каталог</div>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} onClick={() => setOpen(false)} className="px-3 py-2">
              {c.icon} {c.name}
            </Link>
          ))}
          <NavLink to="/about" onClick={() => setOpen(false)} className="px-3 py-2">Про нас</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className="px-3 py-2">Контакти</NavLink>
        </nav>
      </aside>
    </header>
  );
}
