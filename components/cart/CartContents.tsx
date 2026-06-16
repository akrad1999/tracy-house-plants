"use client";

import Link from "next/link";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/plants";

export function CartContents() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#c8ba7e]/25 bg-white/55 p-8 text-center">
        <p className="text-xl font-black text-[#4e5026]">Your cart is empty.</p>
        <p className="mt-2 text-sm text-[#49392c]/65">Pick a plant first.</p>
        <Link
          href="/plants"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c]"
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
          <article key={item.plantId} className="rounded-[1.25rem] bg-[#f6f2eb] p-3 shadow-lg shadow-[#49392c]/12 ring-1 ring-[#c8ba7e]/10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {item.image ? (
                <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover sm:w-28" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-[#c8ba7e] text-xs font-black uppercase tracking-[0.2em] text-[#4e5026]/45 sm:w-28">
                  Photo soon
                </div>
              )}
              <div className="flex-1">
                <Link href={`/plants/${item.slug}`} className="text-xl font-black text-[#4e5026] hover:underline">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-[#49392c]/65">{formatPrice(item.price)} each</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#cb6843]">
                  {item.inventory} available
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#cb6843]">Qty</span>
                  <div className="inline-flex items-center rounded-2xl border border-[#c8ba7e]/20 bg-[#f6f2eb] p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.plantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="inline-flex size-9 items-center justify-center rounded-full text-lg font-black text-[#4e5026] transition hover:bg-white disabled:cursor-not-allowed disabled:text-[#49392c]/25"
                    >
                      −
                    </button>
                    <span className="min-w-9 text-center text-sm font-black text-[#49392c]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.plantId, item.quantity + 1)}
                      disabled={item.quantity >= item.inventory}
                      aria-label={`Increase ${item.name} quantity`}
                      className="inline-flex size-9 items-center justify-center rounded-full text-lg font-black text-[#4e5026] transition hover:bg-white disabled:cursor-not-allowed disabled:text-[#49392c]/25"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.plantId)}
                  className="min-h-11 rounded-full border border-red-700/20 px-4 text-sm font-black text-red-700 transition hover:border-red-700/50 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/60 p-6 shadow-sm">
        <h2 className="text-2xl font-black text-[#4e5026]">Order summary</h2>
        <div className="mt-6 flex items-center justify-between border-t border-[#c8ba7e]/10 pt-5">
          <span className="text-sm font-black text-[#4e5026]">Subtotal</span>
          <span className="text-xl font-black text-[#4e5026]">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#49392c]/65">Pickup in Tracy.</p>
        <div className="mt-6">
          <CheckoutButton />
        </div>
      </aside>
    </div>
  );
}
