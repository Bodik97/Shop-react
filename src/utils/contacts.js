// src/utils/contacts.js — централізовані контакти магазину.
// Заміни плейсхолдери на свої реальні значення нижче.

// ⚠️ Заміни на свої:
export const TELEGRAM_USERNAME = "your_telegram";   // без @, наприклад "airsoft_ua"
export const VIBER_PHONE = "380960000000";          // номер для Viber, без + і пробілів

// Готові посилання — використовуй їх у компонентах
export const links = {
  telegram: `https://t.me/${TELEGRAM_USERNAME}`,
  viber: `viber://chat?number=%2B${VIBER_PHONE}`,
};
