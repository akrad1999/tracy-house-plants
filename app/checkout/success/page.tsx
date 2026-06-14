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
        <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/60 p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-[#4e5026]">Order received.</h1>
          <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
            If it does not appear right away, refresh orders in a few seconds.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c]"
            >
              View orders
            </Link>
            <Link
              href="/plants"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/25 bg-white/45 px-6 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
