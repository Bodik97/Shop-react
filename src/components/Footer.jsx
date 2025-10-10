import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 bg-white text-black/90">
      {/* Верхній блок */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Бренд */}
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">AirSoft</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
              since {new Date().getFullYear()}
            </span>
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed">
            Пневматичні товари та аксесуари для спорту і дозвілля. Якість, сервіс, швидка доставка.
          </p>

          {/* Соцмережі (відключено за вимогою) */}
          {/*
          <div className="flex items-center gap-4 pt-2">
            ... іконки ...
          </div>
          */}
        </div>

        {/* Навігація */}
        <FooterColumn title="Навігація">
          <FooterLink to="/">Головна</FooterLink>
          <FooterLink to="/catalog">Каталог</FooterLink>
          <FooterLink to="/about">Про нас</FooterLink>
          <FooterLink to="/contact">Контакти</FooterLink>
        </FooterColumn>

        {/* Інформація */}
        <FooterColumn title="Інформація">
          <FooterLink to="/privacy-policy">Політика конфіденційності</FooterLink>
          <FooterLink to="/terms-of-service">Умови використання</FooterLink>
        </FooterColumn>
      </div>

      {/* Дівайдер з легким градієнтом */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Нижній рядок */}
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-black/70">
        <p>© {new Date().toLocaleDateString("uk-UA", { year: "numeric" })} AirSoft. Усі права захищено.</p>
        <div className="flex items-center gap-4">
          <MiniLink to="/privacy-policy">Конфіденційність</MiniLink>
          <MiniLink to="/terms-of-service">Умови</MiniLink>
          <a href="mailto:info@myshop.com" className="opacity-80 hover:opacity-100 transition">
            info@myshop.com
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ——— Допоміжні компоненти ——— */

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-2 text-black hover:text-white transition"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gray-800 group-hover:bg-white transition" />
        <span className="relative">
          {children}
          <span
            className="absolute left-0 -bottom-0.5 h-px w-full bg-white/60 scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}

function MiniLink({ to, children }) {
  return (
    <Link
      to={to}
      className="opacity-80 hover:opacity-100 transition underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
