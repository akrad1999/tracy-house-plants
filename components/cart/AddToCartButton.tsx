"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

type AddToCartButtonProps = {
  plant: {
    id: string;
    slug: string;
    name: string;
    price: number;
    inventory: number;
    image?: string;
  };
  className?: string;
};

export function AddToCartButton({ plant, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const isSoldOut = plant.inventory <= 0;

  function handleClick() {
    addItem(
      {
        plantId: plant.id,
        slug: plant.slug,
        name: plant.name,
        price: plant.price,
        inventory: plant.inventory,
        image: plant.image
      },
      1
    );
    setAdded(true);
    window.dispatchEvent(new Event("tracy-cart-added"));
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSoldOut}
      className={`relative overflow-visible ${
        className ??
        "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-950/40 sm:w-auto"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-4 right-5 rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white shadow-lg transition ${
          added ? "-translate-y-2 scale-100 opacity-100" : "translate-y-0 scale-75 opacity-0"
        }`}
      >
        +1
      </span>
      {isSoldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
