"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function ClearCartOnMount() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;
    hasCleared.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}
