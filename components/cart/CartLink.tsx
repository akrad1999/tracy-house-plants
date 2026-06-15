"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function CartLink() {
  const { itemCount } = useCart();
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    function handleCartAdded() {
      setIsBumping(true);
      window.setTimeout(() => setIsBumping(false), 450);
    }

    window.addEventListener("tracy-cart-added", handleCartAdded);
    return () => window.removeEventListener("tracy-cart-added", handleCartAdded);
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
      className={`relative inline-flex size-11 items-center justify-center rounded-full border border-[#c8ba7e]/60 bg-white text-[#4e5026] shadow-sm transition hover:border-[#4e5026]/50 ${
        isBumping ? "scale-110" : "scale-100"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.25">
        <path d="M6.5 7.5h13l-1.4 7.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.7L6 4.8H3.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 20.2h.01M16.5 20.2h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black leading-none text-white ring-2 ring-[#f6f2eb]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
