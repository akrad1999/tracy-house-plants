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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(storageKey);
      setItems(storedCart ? JSON.parse(storedCart) : []);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
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
        setItems([]);
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
