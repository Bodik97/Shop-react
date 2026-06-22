import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RotateCcw, ScanSearch, Mail, Clock } from "lucide-react";
import { FaTelegramPlane, FaViber } from "react-icons/fa";

// Канонічний порядок категорій (збігається з Header / CategorySidebar).
const CATEGORIES = [
  { id: "air_rifles",     name: "Пневматичні гвинтівки" },
  { id: "psp-rifles",     name: "PCP гвинтівки" },
  { id: "flobers",        name: "Револьвери флобера" },
  { id: "pnevmo-pistols", name: "Пневматичні пістолети" },
  { id: "start-pistols",  name: "Стартові пістолети" },
  { id: "pepper-sprays",  name: "Перцеві балончики" },
];


const EMAIL    = "support@airsoft.shop";
const SCHEDULE  = "Пн–Пт 10:00–19:00, Сб 11:00–16:00";
const TELEGRAM = "https://t.me/AirGunShopManager";
const VIBER    = "viber://chat?number=%2B380961595130";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-stone-300">
      {/* ── Основні колонки ── */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {/* Бренд */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link to="/" className="inline-block font-stencil text-2xl tracking-wide text-white hover:text-accent transition">
            AIRSOFT-UA
          </Link>
          <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
            Пневматика та спорядження для спорту й дозвілля. Офіційний продавець: перевіряємо товар перед відправленням і доставляємо по всій Україні.
          </p>
          <div className="flex items-center gap-2.5 pt-1">
            <a
              href={TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="grid place-items-center w-11 h-11 rounded-full bg-white/5 text-white hover:bg-accent active:scale-95 transition"
            >
              <FaTelegramPlane className="w-5 h-5 translate-x-[-1px]" />
            </a>
            <a
              href={VIBER}
              aria-label="Viber"
              className="grid place-items-center w-11 h-11 rounded-full bg-white/5 text-white hover:bg-accent active:scale-95 transition"
            >
              <FaViber className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Навігація */}
        <FooterColumn title="Навігація">
          <FooterLink to="/">Головна</FooterLink>
          <FooterLink to="/catalog">Каталог</FooterLink>
          <FooterLink to="/blog">Блог</FooterLink>
          <FooterLink to="/about">Про нас</FooterLink>
          <FooterLink to="/contact">Контакти</FooterLink>
          <FooterLink to="/history-orders">Мої замовлення</FooterLink>
        </FooterColumn>

        {/* Категорії */}
        <FooterColumn title="Категорії">
          {CATEGORIES.map((c) => (
            <FooterLink key={c.id} to={`/category/${c.id}`}>{c.name}</FooterLink>
          ))}
        </FooterColumn>

        {/* Контакти + Інформація */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white mb-4">
            Контакти
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 text-stone-300 hover:text-accent transition">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                {EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-stone-400">
              <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{SCHEDULE}</span>
            </li>
          </ul>

          <ul className="mt-5 space-y-2">
            <FooterLink to="/privacy-policy">Політика конфіденційності</FooterLink>
            <FooterLink to="/terms-of-service">Умови використання</FooterLink>
          </ul>
        </div>
      </div>

      {/* ── Нижній рядок ── */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-stone-400">
          <p>© {year} AIRSOFT-UA. Усі права захищено.</p>
          <p className="text-stone-400">Ціни в гривні (₴) · Оплата при отриманні</p>
        </div>
      </div>
    </footer>
  );
}

/* ——— Допоміжні компоненти ——— */

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white mb-4">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-2 text-stone-400 hover:text-white hover:translate-x-0.5 transition-all"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-stone-600 group-hover:bg-accent transition shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </Link>
    </li>
  );
}
