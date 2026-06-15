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
        title="Your plant box"
        description="Local pickup only. Delivery coming soon!"
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <CartContents />
      </section>
    </>
  );
}
