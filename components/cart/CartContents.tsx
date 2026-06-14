"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/plants";

export function CartContents() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-green-900/20 bg-white p-8 text-center">
        <p className="text-xl font-black text-green-950">Your cart is empty.</p>
        <p className="mt-2 text-sm text-green-950/65">Add a plant before starting local pickup checkout.</p>
        <Link
          href="/plants"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
        >
          Browse plants
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.plantId} className="rounded-[2rem] border border-green-900/10 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {item.image ? (
                <img src={item.image} alt="" className="aspect-square w-full rounded-3xl object-cover sm:w-28" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-green-100 text-xs font-black uppercase tracking-[0.2em] text-green-900/45 sm:w-28">
                  Image soon
                </div>
              )}
              <div className="flex-1">
                <Link href={`/plants/${item.slug}`} className="text-xl font-black text-green-950 hover:underline">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-green-950/65">{formatPrice(item.price)} each</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-green-800">
                  {item.inventory} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-green-800">Qty</span>
                  <input
                    type="number"
                    min={1}
                    max={item.inventory}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.plantId, Number(event.target.value))}
                    className="h-11 w-20 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-3 text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.plantId)}
                  className="mt-5 text-sm font-black text-red-700 underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-green-950">Order summary</h2>
        <div className="mt-6 flex items-center justify-between border-t border-green-900/10 pt-5">
          <span className="text-sm font-black text-green-950">Subtotal</span>
          <span className="text-xl font-black text-green-950">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-green-950/65">Taxes and pickup details are handled in Stripe Checkout.</p>
        <div className="mt-6">
          <CheckoutButton />
        </div>
      </aside>
    </div>
  );
}
