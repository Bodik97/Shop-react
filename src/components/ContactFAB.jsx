// src/components/ContactFAB.jsx — плаваюча кнопка контактів у правому нижньому куті.
// Розгортає вгору кружечки з месенджерами при кліку.

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { FaTelegramPlane, FaViber } from "react-icons/fa";

const messengers = [
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/AirGunShopManager", // ВАШЕ ПОСИЛАННЯ ТУТ
    bg: "bg-[#229ED9] hover:bg-[#1a87bd]",
    Icon: FaTelegramPlane,
    iconClass: "translate-x-[-1px]",
  },
  {
    id: "viber",
    label: "Viber",
    href: "viber://chat?number=%2B380961595130", // ВАШ НОМЕР ТУТ (замість 38093...)
    bg: "bg-[#7360F2] hover:bg-[#5d4cd9]",
    Icon: FaViber,
  },
];

export default function ContactFAB() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3"
    >
      {/* Кнопки месенджерів */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        // ВИПРАВЛЕННЯ: замість aria-hidden використовуємо inert, 
        // або просто не рендеримо для скрінрідерів, коли закрито
        aria-hidden={!open}
      >
        {messengers.map((m, i) => (
          <a
            key={m.id}
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            // ВИПРАВЛЕННЯ: якщо меню закрите, посилання не повинні отримувати фокус
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/20 ${m.bg} transition-transform hover:scale-110 active:scale-95`}
          >
            <m.Icon className={`h-5 w-5 ${m.iconClass || ""}`} />
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-black/85 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              {m.label}
            </span>
          </a>
        ))}
      </div>

      {/* Головна кнопка */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Закрити контакти" : "Зв'язатись з нами"}
        aria-expanded={open}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl ring-2 ring-white/20 transition-all duration-300 active:scale-95 ${
          open ? "bg-gray-900 rotate-90" : "bg-orange-600 shadow-orange-500/50"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-orange-500 opacity-60 animate-ping" />
        )}
      </button>
    </div>
  );
}