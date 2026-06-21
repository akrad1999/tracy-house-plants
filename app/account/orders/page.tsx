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
  pickup_date: string | null;
  pickup_time: string | null;
  total_cents: number;
  created_at: string;
  order_items: OrderItemRow[];
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your Tracy House Plants order history."
};

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/account/orders");

  const { data: ordersData, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      pickup_status,
      pickup_date,
      pickup_time,
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
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Unable to load orders: ${error.message}`);

  const orders = (ordersData ?? []) as OrderRow[];

  return (
    <>
      <PageHero eyebrow="Orders" title="Your orders" description="Review paid pickup orders and scheduled pickup details." />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-green-900/20 bg-white/70 p-8 text-center">
            <p className="font-black text-green-950">No orders yet.</p>
            <p className="mt-2 text-sm leading-6 text-green-950/65">Paid pickup orders will show here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-green-900/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-green-800">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <h2 className="mt-2 text-lg font-black text-green-950">Order {order.id.slice(0, 8)}</h2>
                    {order.pickup_date && order.pickup_time ? (
                      <p className="mt-2 text-sm font-bold text-green-950/65">
                        Pickup: {new Date(`${order.pickup_date}T00:00:00`).toLocaleDateString()} at {order.pickup_time.slice(0, 5)}
                      </p>
                    ) : order.status !== "cancelled" ? (
                      <Link
                        href={`/account/orders/${order.id}/schedule`}
                        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-green-950 px-4 text-sm font-black text-white transition hover:bg-green-800"
                      >
                        Schedule pickup
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-950">{order.status}</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-950">{order.pickup_status}</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 border-t border-green-900/10 pt-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                      <span className="font-semibold text-green-950">
                        {item.quantity} x {item.plant_name}
                      </span>
                      <span className="font-black text-green-950">{formatPrice(item.line_total_cents / 100)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-green-900/10 pt-4">
                  <span className="text-sm font-black text-green-950">Total</span>
                  <span className="text-lg font-black text-green-950">{formatPrice(order.total_cents / 100)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
