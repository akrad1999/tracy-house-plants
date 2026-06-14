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
        eyebrow="Payment received"
        title="Thanks for your order"
        description="Stripe confirmed your payment. We will prepare your plants for local pickup."
      />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-green-950">Your pickup order is being prepared.</h1>
          <p className="mt-3 text-sm leading-6 text-green-950/65">
            If your order does not appear immediately, give Stripe a few seconds to send the webhook and refresh your orders page.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
            >
              View orders
            </Link>
            <Link
              href="/plants"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-green-950/20 px-6 text-sm font-black text-green-950 transition hover:border-green-950"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
