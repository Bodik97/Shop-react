// src/components/ErrorBoundary.jsx
// Ловить помилки рендера сторінок, щоб один баг не клав увесь сайт білим
// екраном. Скидається при зміні маршруту — помилка на одній сторінці не
// блокує перехід на інші.
import { Component } from "react";
import { useLocation } from "react-router-dom";

class Boundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Користувач перейшов на інший маршрут — даємо сторінці новий шанс
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
          <h1 className="text-2xl font-bold text-ink">Щось пішло не так</h1>
          <p className="mt-2 text-ink-soft max-w-md">
            Сталася помилка при відображенні сторінки. Спробуйте оновити — це
            зазвичай допомагає.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-accent text-white font-semibold hover:brightness-95 active:scale-95 transition"
            >
              Оновити сторінку
            </button>
            {/* Звичайний <a> — повне перезавантаження гарантує чистий стан */}
            <a
              href="/"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-line text-ink font-semibold hover:bg-surface active:scale-95 transition"
            >
              На головну
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return <Boundary resetKey={pathname}>{children}</Boundary>;
}
