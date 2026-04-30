// src/utils/format.js

// Один форматер для всього проєкту.
// Якщо завтра захочеш змінити формат — міняєш тільки тут.
export const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 })
    .format(Math.max(0, Number(n) || 0)) + " ₴";

// Лише цифри з рядка
export const onlyDigits = (s) => String(s || "").replace(/\D+/g, "");

// Маска українського телефону: "+380 XX XXX XX XX".
// Приймає будь-який ввід (з/без +, з/без 380, з/без пробілів) — повертає маску.
export const formatPhoneUA = (input) => {
  let d = onlyDigits(input);
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 9);
  const pretty = d.replace(
    /(\d{2})(\d{3})(\d{2})(\d{2})?/,
    (_, a, b, c, d4) => [a, b, c, d4].filter(Boolean).join(" ")
  );
  return "+380 " + pretty.trimEnd();
};

// Перевіряє що в полі телефон валідний (12 цифр з 380 префіксом)
export const isValidPhoneUA = (input) => {
  const d = onlyDigits(input);
  return d.length === 12 && d.startsWith("380");
};

// Дістає чистий E.164 формат з замаскованого вводу: "+380XXXXXXXXX"
export const phoneToE164UA = (input) =>
  "+380" + onlyDigits(input).replace(/^380/, "").slice(0, 9);