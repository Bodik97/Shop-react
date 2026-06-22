// src/components/NotFound.jsx — сторінка 404 для неіснуючих URL.
// SPA не може віддати справжній HTTP 404 (catch-all у vercel.json повертає 200),
// тому ставимо <meta name="robots" content="noindex"> — Google бачить його після
// рендеру JS і прибирає сторінку з індексу замість помилки Soft 404.
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Helmet>
        <title>Сторінку не знайдено | AirSoft-UA</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="text-center py-20">
        <p className="text-white text-5xl font-bold mb-4">404</p>
        <p className="text-white text-xl">Такої сторінки не існує або її було видалено.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="px-6 py-2 bg-blue-600 rounded-lg text-white">
            На головну
          </Link>
          <Link to="/catalog" className="px-6 py-2 bg-accent rounded-lg text-white">
            До каталогу
          </Link>
        </div>
      </div>
    </main>
  );
}
