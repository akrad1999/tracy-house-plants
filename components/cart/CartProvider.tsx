"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  plantId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  inventory: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (plantId: string, quantity: number) => void;
  removeItem: (plantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "tracy-house-plants-cart";
const cookieKey = "tracy-house-plants-cart";
const cartMaxAgeSeconds = 60 * 60 * 24 * 7;

function readCartSnapshot(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function getCartCookie() {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${cookieKey}=`))
    ?.split("=")[1];

  try {
    return cookie ? decodeURIComponent(cookie) : null;
  } catch {
    return null;
  }
}

function getCookieDomainAttribute() {
  return window.location.hostname === "tracyhouseplants.com" || window.location.hostname.endsWith(".tracyhouseplants.com")
    ? "; domain=.tracyhouseplants.com"
    : "";
}

export function clearCartSnapshot() {
  window.localStorage.removeItem(storageKey);
  document.cookie = `${cookieKey}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${cookieKey}=; path=/; max-age=0; SameSite=Lax${getCookieDomainAttribute()}`;
}

export function persistCartSnapshot(items: CartItem[]) {
  if (items.length === 0) {
    clearCartSnapshot();
    return;
  }

  const serializedCart = JSON.stringify(items);
  window.localStorage.setItem(storageKey, serializedCart);
  document.cookie = `${cookieKey}=${encodeURIComponent(serializedCart)}; path=/; max-age=${cartMaxAgeSeconds}; SameSite=Lax${getCookieDomainAttribute()}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = readCartSnapshot(window.localStorage.getItem(storageKey));
      const cookieItems = readCartSnapshot(getCartCookie());
      setItems(storedItems.length > 0 ? storedItems : cookieItems);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      persistCartSnapshot(items);
    }
  }, [hasLoaded, items]);

  const value = useMemo<CartContextValue>(() => {
    const clampQuantity = (quantity: number, inventory: number) => Math.max(1, Math.min(quantity, inventory));

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem(item, quantity = 1) {
        if (item.inventory <= 0) return;

        setItems((currentItems) => {
          const existingItem = currentItems.find((cartItem) => cartItem.plantId === item.plantId);

          if (!existingItem) {
            return [...currentItems, { ...item, quantity: clampQuantity(quantity, item.inventory) }];
          }

          return currentItems.map((cartItem) =>
            cartItem.plantId === item.plantId
              ? { ...cartItem, ...item, quantity: clampQuantity(cartItem.quantity + quantity, item.inventory) }
              : cartItem
          );
        });
      },
      updateQuantity(plantId, quantity) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.plantId === plantId ? { ...item, quantity: clampQuantity(quantity, item.inventory) } : item
          )
        );
      },
      removeItem(plantId) {
        setItems((currentItems) => currentItems.filter((item) => item.plantId !== plantId));
      },
      clearCart() {
        clearCartSnapshot();
        setItems((currentItems) => (currentItems.length === 0 ? currentItems : []));
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
