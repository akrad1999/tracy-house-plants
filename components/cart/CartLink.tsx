"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-green-900/15 bg-white px-4 py-2 text-sm font-black text-green-950 shadow-sm transition hover:border-green-900/40"
    >
      Cart{itemCount > 0 ? ` (${itemCount})` : ""}
    </Link>
  );
}
