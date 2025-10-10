import { Helmet } from "react-helmet";

export default function TermsOfService() {
  return (
    <main className="bg-transparent min-h-screen text-white">
      <Helmet>
        <title>Умови використання | AirSoft</title>
        <meta
          name="description"
          content="Умови використання сайту AirSoft. Правила користування інтернет-магазином пневматичних товарів для спорту та дозвілля."
        />
      </Helmet>

      {/* Hero-заголовок */}
      <section className="border-b border-gray-800 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-3 text-white">
            Умови використання
          </h1>
          <p className="text-white max-w-2xl mx-auto">
            Ознайомтесь з основними правилами користування сайтом AirSoft перед
            оформленням замовлення.
          </p>
        </div>
      </section>

      {/* Основний текст */}
      <section className="max-w-4xl mx-auto px-4 py-12 leading-relaxed">
        <div className="space-y-8">
          <p>
            Використовуючи сайт <strong>AirSoft</strong> (далі – «Сайт»), ви погоджуєтесь
            із наведеними нижче умовами. Якщо ви не згодні з будь-якою частиною цих умов,
            будь ласка, не користуйтесь Сайтом.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              1. Загальні положення
            </h2>
            <p className="text-indigo-100">
              Сайт надає користувачам можливість переглядати асортимент товарів для спорту
              та дозвілля, ознайомлюватись із характеристиками продукції та оформлювати
              замовлення онлайн.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              2. Точність інформації
            </h2>
            <p className="text-indigo-100">
              Ми докладаємо зусиль для підтримання актуальності цін та описів товарів, але
              не гарантуємо повної відсутності помилок. У разі виявлення неточності ми
              можемо оновити або скасувати замовлення після повідомлення користувача.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              3. Замовлення та оплата
            </h2>
            <p className="text-indigo-100">
              Під час оформлення замовлення ви підтверджуєте достовірність наданих даних.
              Оплата здійснюється через безпечні сервіси. Ми не зберігаємо та не передаємо
              платіжні дані третім особам.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              4. Відповідальність
            </h2>
            <p className="text-indigo-100">
              Магазин не несе відповідальності за неправильне або небезпечне використання
              товарів. Уся пневматика представлена виключно як спортивна продукція для
              відпочинку та тренувань.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              5. Зміни до умов
            </h2>
            <p className="text-indigo-100">
              Ми залишаємо за собою право оновлювати ці умови. Актуальна версія завжди
              розміщена на цій сторінці із зазначенням дати оновлення.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">6. Контакти</h2>
            <p className="text-white">
              Якщо у вас виникли питання, напишіть нам на{" "}
              <a
                href="mailto:info@myshop.com"
                className="text-white "
              >
                info@myshop.com
              </a>
              .
            </p>
          </div>

          <p className="text-sm text-white  pt-6 border-t border-white/10s">
            Останнє оновлення: {new Date().toLocaleDateString("uk-UA")}
          </p>
        </div>
      </section>
    </main>
  );
}
