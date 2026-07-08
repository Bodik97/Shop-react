// src/utils/dispatch.js
// Дедлайн відправки за київським часом.
// ⚠️ Кат-офи звірити з реальним графіком відправок магазину.
// Графік роботи: Пн–Пт 10:00–19:00, Сб 11:00–16:00, Нд — вихідний.
const CUTOFF_WEEKDAY = 15; // Пн–Пт: відправка сьогодні до 15:00
const CUTOFF_SATURDAY = 13; // Сб: відправка сьогодні до 13:00

export function dispatchMessage(now = new Date()) {
  // Час у Києві незалежно від таймзони пристрою відвідувача
  const kyiv = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Kyiv" }));
  const day = kyiv.getDay(); // 0 = неділя
  const hour = kyiv.getHours();

  if (day >= 1 && day <= 5 && hour < CUTOFF_WEEKDAY)
    return `Замовте до ${CUTOFF_WEEKDAY}:00 — відправимо сьогодні`;
  if (day === 6) {
    if (hour < CUTOFF_SATURDAY)
      return `Замовте до ${CUTOFF_SATURDAY}:00 — відправимо сьогодні`;
    return "Замовте зараз — відправимо в понеділок";
  }
  // Пн–Пт після кат-офу та неділя: наступна відправка завтра
  return "Замовте зараз — відправимо завтра";
}
