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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 text-center">
          <h1 className="heading-title font-bold mb-4 text-white leading-tight">
            Умови використання
           </h1>




          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Ознайомтесь з основними правилами користування сайтом AirSoft перед
            оформленням замовлення.
          </p>
        </div>
      </section>

      {/* Основний текст */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16 leading-relaxed">
        <div className="space-y-10 sm:space-y-12">
          <p className="text-sm sm:text-base md:text-lg text-white/90">
            Використовуючи сайт <strong>AirSoft</strong> (далі – «Сайт»), ви погоджуєтесь
            із наведеними нижче умовами. Якщо ви не згодні з будь-якою частиною цих умов,
            будь ласка, не користуйтесь Сайтом.
          </p>

          {[
            {
              title: "1. Загальні положення",
              text: "Сайт надає користувачам можливість переглядати асортимент товарів для спорту та дозвілля, ознайомлюватись із характеристиками продукції та оформлювати замовлення онлайн.",
            },
            {
              title: "2. Точність інформації",
              text: "Ми докладаємо зусиль для підтримання актуальності цін та описів товарів, але не гарантуємо повної відсутності помилок. У разі виявлення неточності ми можемо оновити або скасувати замовлення після повідомлення користувача.",
            },
            {
              title: "3. Замовлення та оплата",
              text: "Під час оформлення замовлення ви підтверджуєте достовірність наданих даних. Оплата здійснюється через безпечні сервіси. Ми не зберігаємо та не передаємо платіжні дані третім особам.",
            },
            {
              title: "4. Відповідальність",
              text: "Магазин не несе відповідальності за неправильне або небезпечне використання товарів. Уся пневматика представлена виключно як спортивна продукція для відпочинку та тренувань.",
            },
            {
              title: "5. Зміни до умов",
              text: "Ми залишаємо за собою право оновлювати ці умови. Актуальна версія завжди розміщена на цій сторінці із зазначенням дати оновлення.",
            },
            {
              title: "6. Контакти",
              text: (
                <>
                  Якщо у вас виникли питання, напишіть нам на{" "}
                  <a
                    href="mailto:info@myshop.com"
                    className="underline text-indigo-300 hover:text-indigo-200"
                  >
                    info@myshop.com
                  </a>
                  .
                </>
              ),
            },
          ].map((item, index) => (
            <div key={index}>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-white">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/80">
                {item.text}
              </p>
            </div>
          ))}

          <p className="text-xs sm:text-sm text-white/70 pt-6 border-t border-white/10">
            Останнє оновлення: {new Date().toLocaleDateString("uk-UA")}
          </p>
        </div>
      </section>
    </main>
  );
}
