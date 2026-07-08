// src/utils/format.test.js
import { describe, it, expect } from "vitest";
import {
  formatUAH,
  onlyDigits,
  formatPhoneUA,
  isValidPhoneUA,
  phoneToE164UA,
} from "./format";

// Intl для uk-UA використовує нерозривні пробіли в групуванні —
// нормалізуємо, щоб тести не залежали від версії ICU.
const norm = (s) => s.replace(/[  ]/g, " ");

describe("formatUAH", () => {
  it("форматує число з розділювачем тисяч і ₴", () => {
    expect(norm(formatUAH(3999))).toBe("3 999 ₴");
    expect(norm(formatUAH(11693))).toBe("11 693 ₴");
  });

  it("нечислові та відʼємні значення → 0 ₴", () => {
    expect(norm(formatUAH(undefined))).toBe("0 ₴");
    expect(norm(formatUAH(null))).toBe("0 ₴");
    expect(norm(formatUAH("abc"))).toBe("0 ₴");
    expect(norm(formatUAH(-100))).toBe("0 ₴");
  });

  it("рядок-число приймається", () => {
    expect(norm(formatUAH("499"))).toBe("499 ₴");
  });
});

describe("onlyDigits", () => {
  it("лишає тільки цифри", () => {
    expect(onlyDigits("+380 50 123-45-67")).toBe("380501234567");
    expect(onlyDigits(null)).toBe("");
  });
});

describe("formatPhoneUA", () => {
  it("маскує повний номер у різних форматах вводу", () => {
    expect(formatPhoneUA("380501234567")).toBe("+380 50 123 45 67");
    expect(formatPhoneUA("+380501234567")).toBe("+380 50 123 45 67");
    expect(formatPhoneUA("0501234567")).toBe("+380 50 123 45 67");
    expect(formatPhoneUA("80501234567")).toBe("+380 50 123 45 67");
    expect(formatPhoneUA("501234567")).toBe("+380 50 123 45 67");
  });

  it("частковий ввід: групування пробілами вмикається від 7 цифр", () => {
    expect(formatPhoneUA("050")).toBe("+380 50");
    expect(formatPhoneUA("05012")).toBe("+380 5012"); // ще без груп
    expect(formatPhoneUA("05012345")).toBe("+380 50 123 45");
  });

  it("зайві цифри обрізаються", () => {
    expect(formatPhoneUA("3805012345679999")).toBe("+380 50 123 45 67");
  });
});

describe("isValidPhoneUA", () => {
  it("валідний = рівно 12 цифр із префіксом 380", () => {
    expect(isValidPhoneUA("+380 50 123 45 67")).toBe(true);
    expect(isValidPhoneUA("380501234567")).toBe(true);
  });

  it("короткий, довгий або без 380 — невалідний", () => {
    expect(isValidPhoneUA("+380 50 123 45 6")).toBe(false);
    expect(isValidPhoneUA("0501234567")).toBe(false);
    expect(isValidPhoneUA("")).toBe(false);
  });
});

describe("phoneToE164UA", () => {
  it("маска → чистий E.164", () => {
    expect(phoneToE164UA("+380 50 123 45 67")).toBe("+380501234567");
  });

  it("ввід без 380 теж нормалізується", () => {
    expect(phoneToE164UA("50 123 45 67")).toBe("+380501234567");
  });
});
