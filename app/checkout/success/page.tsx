import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Checkout Success",
  description: "Your Tracy House Plants payment was received."
};

export default function CheckoutSuccessPage() {
  return (
    <>
      <ClearCartOnMount />
      <PageHero
        eyebrow="Paid"
        title="Thank you"
        description="Your plants will be ready for pickup soon."
      />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-[#7a5c2f]/15 bg-white/60 p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-[#31551f]">Order received.</h1>
          <p className="mt-3 text-sm leading-6 text-[#4d3d24]/65">
            If it does not appear right away, refresh orders in a few seconds.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#31551f] px-6 text-sm font-black text-white transition hover:bg-[#243f18]"
            >
              View orders
            </Link>
            <Link
              href="/plants"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#7a5c2f]/25 bg-white/45 px-6 text-sm font-black text-[#31551f] transition hover:border-[#31551f]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
