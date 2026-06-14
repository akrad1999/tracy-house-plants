import type { Metadata } from "next";
import { CartContents } from "@/components/cart/CartContents";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Tracy House Plants cart."
};

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Review your local pickup order"
        description="Checkout is for local pickup only. Inventory is validated before Stripe Checkout starts and again after payment succeeds."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <CartContents />
      </section>
    </>
  );
}
