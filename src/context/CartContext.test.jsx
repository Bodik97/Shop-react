// src/context/CartContext.test.jsx
// Критична бізнес-логіка кошика: fingerprint (товар+addons), кількість,
// підсумки, видалення addon-ів, персист у localStorage.
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const PRODUCT = {
  id: "p1",
  title: "Пістолет",
  price: 3999,
  oldPrice: 4699,
  category: "start-pistols",
};

const ADDON_A = { id: "a1", name: "Кобура", price: 699 };
const ADDON_B = { id: "a2", name: "Кулі", price: 990 };

beforeEach(() => {
  localStorage.clear();
});

describe("addToCart", () => {
  it("додає товар: qty 1, unitTotal = price + addons", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));

    expect(result.current.cart).toHaveLength(1);
    const item = result.current.cart[0];
    expect(item.qty).toBe(1);
    expect(item.addonsTotal).toBe(699);
    expect(item.unitTotal).toBe(3999 + 699);
  });

  it("той самий товар з тими ж addons → qty +1, не новий рядок", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
  });

  it("той самий товар з іншими addons → окремий рядок", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_B] }));

    expect(result.current.cart).toHaveLength(2);
  });

  it("порядок addons не впливає на fingerprint", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A, ADDON_B] }));
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_B, ADDON_A] }));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
  });
});

describe("підсумки", () => {
  it("cartCount і cartTotal рахують addons та кількість", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A] }));

    expect(result.current.cartCount).toBe(2);
    expect(result.current.cartTotal).toBe((3999 + 699) * 2);
  });
});

describe("changeQty / removeFromCart / clearCart", () => {
  it("qty ≤ 0 видаляє позицію", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(PRODUCT));
    const id = result.current.cart[0].cartItemId;

    act(() => result.current.changeQty(id, 0));
    expect(result.current.cart).toHaveLength(0);
  });

  it("changeQty оновлює кількість", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(PRODUCT));
    const id = result.current.cart[0].cartItemId;

    act(() => result.current.changeQty(id, 5));
    expect(result.current.cart[0].qty).toBe(5);
    expect(result.current.cartTotal).toBe(3999 * 5);
  });

  it("removeFromCart прибирає позицію", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(PRODUCT));
    const id = result.current.cart[0].cartItemId;

    act(() => result.current.removeFromCart(id));
    expect(result.current.cart).toHaveLength(0);
  });

  it("clearCart очищає все", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart(PRODUCT));
    act(() => result.current.addToCart({ ...PRODUCT, id: "p2" }));

    act(() => result.current.clearCart());
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });
});

describe("removeAddon", () => {
  it("перераховує addonsTotal та unitTotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addToCart({ ...PRODUCT, addons: [ADDON_A, ADDON_B] }));
    const id = result.current.cart[0].cartItemId;

    act(() => result.current.removeAddon(id, "a1"));
    const item = result.current.cart[0];
    expect(item.addons).toHaveLength(1);
    expect(item.addonsTotal).toBe(990);
    expect(item.unitTotal).toBe(3999 + 990);
  });
});

describe("localStorage", () => {
  it("кошик зберігається і відновлюється", () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.addToCart(PRODUCT));
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.cart).toHaveLength(1);
    expect(second.result.current.cart[0].id).toBe("p1");
  });
});
