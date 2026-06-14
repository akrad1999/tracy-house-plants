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
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSoldOut}
      className={
        className ??
        "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-950/40 sm:w-auto"
      }
    >
      {isSoldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
