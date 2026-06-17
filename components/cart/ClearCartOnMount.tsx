"use client";

import { useEffect, useRef } from "react";
import { clearCartSnapshot, useCart } from "@/components/cart/CartProvider";

export function ClearCartOnMount() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;
    hasCleared.current = true;
    clearCartSnapshot();
    clearCart();
  }, [clearCart]);

  return null;
}
