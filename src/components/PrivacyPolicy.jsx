import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <main className="bg-transparent min-h-screen text-white">
      <Helmet>
        <title>Політика конфіденційності | AirSoft</title>
        <meta
          name="description"
          content="Політика конфіденційності магазину AirSoft. Ми поважаємо вашу приватність та захищаємо персональні дані користувачів."
        />
      </Helmet>

      {/* Hero-заголовок */}
      <section className="border-b border-gray-800 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="policy-title font-bold mb-3 text-white">
            Політика конфіденційності
            </h1>

          <p className="text-white max-w-2xl mx-auto">
            Ми цінуємо вашу довіру та дбаємо про захист особистих даних усіх користувачів
            нашого сайту AirSoft.
          </p>
        </div>
      </section>

      {/* Основний текст */}
      <section className="max-w-4xl mx-auto px-4 py-12 leading-relaxed">
        <div className="space-y-8">
          <p>
            Ця політика визначає порядок збору, використання та зберігання персональних
            даних користувачів сайту <strong>AirSoft</strong> (далі – «Сайт»).
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              1. Збір інформації
            </h2>
            <p className="text-white">
              Ми збираємо лише необхідну інформацію, яку ви добровільно надаєте під час
              оформлення замовлення чи заповнення форми: ім’я, номер телефону, електронну
              пошту, адресу доставки. Дані використовуються виключно для обробки
              замовлень.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              2. Використання даних
            </h2>
            <p className="text-white">
              Ваші персональні дані не передаються третім особам, крім служб доставки або
              платіжних сервісів, необхідних для виконання замовлення.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              3. Захист інформації
            </h2>
            <p className="text-white">
              Ми застосовуємо сучасні технічні та організаційні засоби безпеки, щоб
              запобігти несанкціонованому доступу, втраті чи розголошенню ваших даних.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">4. Файли cookie</h2>
            <p className="text-white">
              Сайт може використовувати cookie для покращення зручності користування.
              Ви можете вимкнути cookie у налаштуваннях браузера. Це не вплине на
              основні функції сайту.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">
              5. Зміни до політики
            </h2>
            <p className="text-white">
              Ми залишаємо за собою право оновлювати цю політику. Актуальна версія завжди
              опублікована на цій сторінці із зазначенням дати оновлення.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-white">6. Контакти</h2>
            <p className="text-white">
              Якщо у вас є питання щодо обробки персональних даних, напишіть на{" "}
              <a
                href="mailto:info@myshop.com"
                className="text-white hover:underline"
              >
                info@myshop.com
              </a>
              .
            </p>
          </div>

          <p className="text-sm text-white pt-6 border-t border-white/10">
            Останнє оновлення: {new Date().toLocaleDateString("uk-UA")}
          </p>
        </div>
      </section>
    </main>
  );
}
