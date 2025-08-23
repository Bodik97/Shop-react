// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../img/Logo.svg";

const CATEGORIES = [
  { id: "pistols", name: "Пістолети", icon: "🔫" },
  { id: "rifles", name: "Гвинтівки", icon: "🏹" },
  { id: "knives", name: "Ножі", icon: "🔪" },
  { id: "accessories", name: "Аксесуари", icon: "🕶️" },
];

export default function Header({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onKeyDownTrap = (e) => {
    if (!open || e.key !== "Tab") return;
    const nodes = drawerRef.current?.querySelectorAll(
      'a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!nodes?.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

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
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        open ? "bg-white shadow-md" : scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="w-full px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ЛІВИЙ БЛОК: Лого + Навігація (в одному flex) */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
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

          {/* MOBILE/SMALL: Лого по центру зліва */}
          <Link
            to="/"
            className="lg:hidden text-2xl font-extrabold font-stencil tracking-wide text-blue-950"
            onClick={() => setOpen(false)}
          >
            <img src={logo} alt="Airsoft Shop Logo" className="h-16 w-auto" />
          </Link>

          {/* ПРАВИЙ БЛОК: Кошик + бургер */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex items-center gap-2 rounded-lg bg-blue-950 px-3 py-2 text-white hover:bg-blue-700 transition"
            >
              <ShoppingCartIcon className="h-5 w-5 text-white" />
              <span className="hidden sm:inline text-base font-semibold uppercase tracking-wide">Кошик</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
              aria-label="Відкрити меню"
              aria-expanded={open}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay & drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${open ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setOpen(false)}
      >
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Головне меню"
          tabIndex={-1}
          onKeyDown={onKeyDownTrap}
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl
                      transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Меню</span>
            <button
              ref={firstFocusableRef}
              type="button"
              aria-label="Закрити меню"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer content */}
          <nav className="p-4 flex flex-col gap-1">
            <NavLink to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 text-lg font-semibold uppercase tracking-wide">
              Головна
            </NavLink>

            <div className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">Каталог</div>
            <div className="grid grid-cols-1 gap-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-blue-50 text-gray-800"
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="text-base font-medium">{c.name}</span>
                </Link>
              ))}
            </div>

            <NavLink to="/about" onClick={() => setOpen(false)} className="mt-2 px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 text-lg font-semibold uppercase tracking-wide">
              Про нас
            </NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 text-lg font-semibold uppercase tracking-wide">
              Контакти
            </NavLink>

            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              У кошик {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
