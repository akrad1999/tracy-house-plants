import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecordCheckoutView } from "@/components/checkout/RecordCheckoutView";
import { PickupScheduler } from "@/components/checkout/PickupScheduler";
import { PageHero } from "@/components/PageHero";
import { formatPrice } from "@/lib/plants";
import { getBlackoutSlotKey, getPickupWindowDateValues } from "@/lib/pickup";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type ScheduleOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = {
  title: "Schedule Pickup",
  description: "Choose a pickup date and time for your Tracy House Plants order."
};

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
  pickup_date: string | null;
  pickup_time: string | null;
  order_items: OrderItemRow[];
};

async function getBlockedPickupSlots(createdAt: string) {
  const dateValues = getPickupWindowDateValues(createdAt);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("pickup_blackout_slots").select("pickup_date, pickup_time").in("pickup_date", dateValues);

  if (error) throw new Error(`Unable to load pickup availability: ${error.message}`);

  return (data ?? []).map((slot) => getBlackoutSlotKey(slot.pickup_date, String(slot.pickup_time)));
}

export default async function ScheduleOrderPage({ params }: ScheduleOrderPageProps) {
  const { orderId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/account/orders/${orderId}/schedule`)}`);

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      pickup_status,
      total_cents,
      created_at,
      pickup_date,
      pickup_time,
      order_items (
        id,
        plant_name,
        quantity,
        line_total_cents
      )
    `
    )
    .eq("id", orderId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load order: ${error.message}`);
  if (!order) redirect("/account/orders");

  const orderRow = order as OrderRow;
  const blockedPickupSlots = await getBlockedPickupSlots(orderRow.created_at);
  const isCancelled = orderRow.status === "cancelled" || orderRow.pickup_status === "Cancelled";

  return (
    <>
      <RecordCheckoutView orderId={orderRow.id} />
      <PageHero
        eyebrow="Pickup"
        title="Schedule your pickup"
        description="Choose a date and 30-minute pickup window. We'll have your plants ready when you arrive in Tracy."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <PickupScheduler
            orderId={orderRow.id}
            orderCreatedAt={orderRow.created_at}
            savedPickupDate={orderRow.pickup_date}
            savedPickupTime={orderRow.pickup_time}
            isCancelled={isCancelled}
            blockedSlots={blockedPickupSlots}
          />

          <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/60 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-[#4e5026]">Order {orderRow.id.slice(0, 8).toUpperCase()}</h2>
            <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
              Placed on {new Date(orderRow.created_at).toLocaleDateString()}
            </p>

            <div className="mt-6 grid gap-3">
              {orderRow.order_items.map((item) => (
                <article key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f2eb] p-3">
                  <div>
                    <h3 className="font-black text-[#4e5026]">{item.plant_name}</h3>
                    <p className="mt-1 text-sm font-bold text-[#49392c]/65">{item.quantity}x plant</p>
                  </div>
                  <p className="text-sm font-black text-[#cb6843]">{formatPrice(item.line_total_cents / 100)}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#c8ba7e]/15 pt-5">
              <span className="text-sm font-black text-[#4e5026]">Total</span>
              <span className="text-xl font-black text-[#4e5026]">{formatPrice(orderRow.total_cents / 100)}</span>
            </div>

            <Link
              href="/account/orders"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8ba7e]/25 bg-white px-5 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
            >
              Back to orders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
