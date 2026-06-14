"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function CheckoutButton() {
  const { items } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function startCheckout() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ plantId: item.plantId, quantity: item.quantity }))
        })
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.href = "/sign-in?next=/cart";
        return;
      }

      if (!response.ok || !payload.url) throw new Error(payload.error ?? "Unable to start checkout.");

      window.location.href = payload.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={items.length === 0 || isLoading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#31551f] px-6 text-sm font-black text-white transition hover:bg-[#243f18] disabled:cursor-not-allowed disabled:bg-[#31551f]/40"
      >
        {isLoading ? "Redirecting to Stripe..." : "Checkout"}
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <p className="mt-3 text-xs leading-5 text-[#4d3d24]/55">
        Your order is saved after payment.
      </p>
    </div>
  );
}
