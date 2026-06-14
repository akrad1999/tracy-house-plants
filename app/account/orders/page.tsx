import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { formatPrice } from "@/lib/plants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OrderItemRow = {
  id: string;
  plant_name: string;
  quantity: number;
  line_total_cents: number;
};

type OrderRow = {
  id: string;
  status: string;
  pickup_status: string;
  total_cents: number;
  created_at: string;
  order_items: OrderItemRow[];
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your Tracy House Plants pickup orders."
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account/orders");

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      pickup_status,
      total_cents,
      created_at,
      order_items (
        id,
        plant_name,
        quantity,
        line_total_cents
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load orders: ${error.message}`);

  const orders = (data ?? []) as OrderRow[];

  return (
    <>
      <PageHero
        eyebrow="Orders"
        title="Your pickup orders"
        description="Paid Stripe orders appear here after the webhook creates the Supabase order."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-green-900/20 bg-white p-8 text-center">
            <p className="text-xl font-black text-green-950">No orders yet.</p>
            <p className="mt-2 text-sm text-green-950/65">Checkout a plant to see pickup status here.</p>
            <Link
              href="/plants"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
            >
              Browse plants
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-green-800">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-green-950">Order {order.id.slice(0, 8)}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-950">
                      Payment: {order.status}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-950">
                      Pickup: {order.pickup_status}
                    </span>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 border-t border-green-900/10 pt-5">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-green-950">
                        {item.quantity} x {item.plant_name}
                      </span>
                      <span className="font-black text-green-950">{formatPrice(item.line_total_cents / 100)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-green-900/10 pt-5">
                  <span className="text-sm font-black text-green-950">Total</span>
                  <span className="text-xl font-black text-green-950">{formatPrice(order.total_cents / 100)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
