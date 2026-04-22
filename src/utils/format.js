// src/utils/format.js

// Один форматер для всього проєкту.
// Якщо завтра захочеш змінити формат — міняєш тільки тут.
export const formatUAH = (n) =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 })
    .format(Math.max(0, Number(n) || 0)) + " ₴";