"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/plants";

export function CartContents() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#7a5c2f]/25 bg-white/55 p-8 text-center">
        <p className="text-xl font-black text-[#31551f]">Your cart is empty.</p>
        <p className="mt-2 text-sm text-[#4d3d24]/65">Pick a plant first.</p>
        <Link
          href="/plants"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#31551f] px-6 text-sm font-black text-white transition hover:bg-[#243f18]"
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
          <article key={item.plantId} className="rounded-[1.25rem] bg-[#fffaf0] p-3 shadow-lg shadow-[#5f4b24]/12 ring-1 ring-[#7a5c2f]/10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {item.image ? (
                <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover sm:w-28" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-[#dfd0aa] text-xs font-black uppercase tracking-[0.2em] text-[#31551f]/45 sm:w-28">
                  Photo soon
                </div>
              )}
              <div className="flex-1">
                <Link href={`/plants/${item.slug}`} className="text-xl font-black text-[#31551f] hover:underline">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-[#4d3d24]/65">{formatPrice(item.price)} each</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#6f7d2d]">
                  {item.inventory} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#6f7d2d]">Qty</span>
                  <input
                    type="number"
                    min={1}
                    max={item.inventory}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.plantId, Number(event.target.value))}
                    className="h-11 w-20 rounded-2xl border border-[#7a5c2f]/20 bg-[#f8f0df] px-3 text-[#2b2418] outline-none focus:border-[#31551f] focus:ring-4 focus:ring-[#31551f]/10"
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

      <aside className="h-fit rounded-[1.5rem] border border-[#7a5c2f]/15 bg-white/60 p-6 shadow-sm">
        <h2 className="text-2xl font-black text-[#31551f]">Order summary</h2>
        <div className="mt-6 flex items-center justify-between border-t border-[#7a5c2f]/10 pt-5">
          <span className="text-sm font-black text-[#31551f]">Subtotal</span>
          <span className="text-xl font-black text-[#31551f]">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#4d3d24]/65">Pickup in Tracy.</p>
        <div className="mt-6">
          <CheckoutButton />
        </div>
      </aside>
    </div>
  );
}
