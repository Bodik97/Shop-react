import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// Приклад категорій
const CATEGORIES = [
  { id: "pistols", name: "Пістолети", icon: "🔫" },
  { id: "rifles", name: "Гвинтівки", icon: "🔫" },
  { id: "knives", name: "Ножі", icon: "🔪" },
  { id: "accessories", name: "Аксесуари", icon: "🧤" },
];

export default function Header({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Ефект для зміни фону при скролі
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Item = ({ to, children }) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `px-3 py-2 text-sm rounded-md transition
         ${isActive ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="w-full px-4 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Лого */}
          <Link to="/" className="text-2xl font-bold text-blue-950 hover:text-blue-700 transition">
            AIRSOFT SHOP
          </Link>

          {/* Desktop меню */}
          <div className="hidden lg:flex items-center gap-2">
            <Item to="/">Головна</Item>

            {/* Каталог з анімацією */}
            <div className="relative group">
              <NavLink
                to="/catalog"
                className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded-md transition"
              >
                Каталог
              </NavLink>
              <div
                className="absolute left-0 top-full mt-2 min-w-64 bg-white border rounded-xl shadow-lg p-4 opacity-0 invisible 
                          group-hover:opacity-100 group-hover:visible transition-all duration-300"
              >
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(c => (
                    <Link
                      key={c.id}
                      to={`/category/${c.id}`}
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
          </div>

          {/* Праворуч */}
          <div className="flex items-center gap-4">
            {/* Пошук */}
            <div className="hidden md:flex items-center border rounded-lg px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Пошук…"
                className="ml-2 outline-none bg-transparent text-sm"
              />
            </div>

            {/* Кошик */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-white hover:bg-blue-700 transition"
            >
              <ShoppingCartIcon className="h-5 w-5 text-white" />
              <span className="hidden sm:inline text-white">Кошик</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Бургер */}
            <button
              onClick={() => setOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
              aria-label="Меню"
            >
              {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile side-drawer */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-lg p-5 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">Меню</h3>
          <nav className="flex flex-col gap-2">
            <Item to="/">Головна</Item>
            <div>
              <span className="px-3 py-2 text-sm text-gray-500">Каталог</span>
              <div className="grid grid-cols-1 gap-1 mt-1">
                {CATEGORIES.map(c => (
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
            <Item to="/about">Про нас</Item>
            <Item to="/contact">Контакти</Item>
          </nav>

          {/* Пошук мобільний */}
          <div className="mt-5 flex items-center border rounded-lg px-3 py-1.5">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Пошук…"
              className="ml-2 outline-none bg-transparent text-sm flex-1"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
