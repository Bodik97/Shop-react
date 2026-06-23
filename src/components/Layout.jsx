// src/components/Layout.jsx
// Обгортка контенту: на сторінках каталогу/категорій/товарів/головній показує
// закріплене бокове меню категорій; на інформаційних/транзакційних сторінках
// (about, contact, cart, history-orders, privacy-policy, terms-of-service) —
// повноширинний контент без aside.
import { useLocation } from "react-router-dom";
import CategorySidebar from "./CategorySidebar";
import CartSidebar from "./CartSidebar";
import CartSidebarNote from "./CartSidebarNote";

// Шляхи, де показуємо бокове меню.
const ASIDE_MATCHERS = [/^\/$/, /^\/catalog/, /^\/category/, /^\/product/];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const withAside = ASIDE_MATCHERS.some((re) => re.test(pathname));

  // Повноширинні сторінки рендеримо як є.
  if (!withAside) return children;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="grid lg:grid-cols-[248px_1fr] gap-5 lg:gap-7 items-start">
        {/* Меню категорій + закріплений міні-кошик тримаються разом (sticky) */}
        <div className="lg:sticky lg:top-[88px] lg:self-start space-y-4">
          <CategorySidebar />
          <CartSidebar />
          <CartSidebarNote />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
