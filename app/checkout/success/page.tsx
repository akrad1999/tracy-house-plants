import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { PickupScheduler } from "@/components/checkout/PickupScheduler";
import { PageHero } from "@/components/PageHero";
import { formatPrice } from "@/lib/plants";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  title: "Checkout Success",
  description: "Your Tracy House Plants payment was received."
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

type OrderItemRow = {
  id: string;
  plant_id: string | null;
  plant_name: string;
  quantity: number;
  line_total_cents: number;
};

type OrderRow = {
  id: string;
  stripe_session_id: string | null;
  total_cents: number;
  created_at: string;
  pickup_date: string | null;
  pickup_time: string | null;
  order_items: OrderItemRow[];
};

async function getOrder(sessionId?: string) {
  if (!sessionId) return null;

  const supabase = createSupabaseServiceRoleClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      stripe_session_id,
      total_cents,
      created_at,
      pickup_date,
      pickup_time,
      order_items (
        id,
        plant_id,
        plant_name,
        quantity,
        line_total_cents
      )
    `
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error || !order) return null;

  return order as OrderRow;
}

async function getFeaturedImages(items: OrderItemRow[]) {
  const plantIds = items.map((item) => item.plant_id).filter(Boolean) as string[];
  if (plantIds.length === 0) return new Map<string, { src: string; alt: string }>();

  const supabase = createSupabaseServiceRoleClient();
  const { data } = await supabase
    .from("plant_images")
    .select("plant_id, src, alt, sort_order")
    .in("plant_id", plantIds)
    .order("sort_order", { ascending: true });

  const imageByPlantId = new Map<string, { src: string; alt: string }>();
  for (const image of data ?? []) {
    if (!imageByPlantId.has(image.plant_id)) {
      imageByPlantId.set(image.plant_id, { src: image.src, alt: image.alt });
    }
  }

  return imageByPlantId;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = await getOrder(sessionId);
  const imageByPlantId = order ? await getFeaturedImages(order.order_items) : new Map<string, { src: string; alt: string }>();

  return (
    <>
      <ClearCartOnMount />
      <PageHero
        eyebrow="Paid"
        title="Thank you!"
        description="Your payment was received. Schedule a pickup time below so we can have your plants ready."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {!order ? (
          <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/60 p-6 text-center shadow-sm sm:p-8">
            <h1 className="text-2xl font-black text-[#4e5026]">Order received.</h1>
            <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
              If your order details do not appear right away, refresh this page in a few seconds.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/account"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c]"
              >
                View Orders
              </Link>
              <Link
                href="/plants"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/25 bg-white/45 px-6 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/60 p-6 shadow-sm sm:p-8">
              <h1 className="text-2xl font-black text-[#4e5026]">Order received.</h1>
              <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
                Please choose a pickup time. All displayed slots are currently available.
              </p>

              <div className="mt-6 grid gap-3">
                {order.order_items.map((item) => {
                  const image = item.plant_id ? imageByPlantId.get(item.plant_id) : null;
                  return (
                    <article key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f2eb] p-3">
                      <div>
                        <h2 className="font-black text-[#4e5026]">{item.plant_name}</h2>
                        <p className="mt-1 text-sm font-bold text-[#49392c]/65">
                          {item.quantity} x plant
                        </p>
                        <p className="mt-1 text-sm font-black text-[#cb6843]">{formatPrice(item.line_total_cents / 100)}</p>
                      </div>
                      {image ? (
                        <div className="relative size-20 overflow-hidden rounded-2xl bg-[#c8ba7e]">
                          <Image src={image.src} alt={image.alt} fill sizes="80px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex size-20 items-center justify-center rounded-2xl bg-[#c8ba7e] text-[10px] font-black uppercase tracking-[0.16em] text-[#4e5026]/50">
                          Photo
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#c8ba7e]/15 pt-5">
                <span className="text-sm font-black text-[#4e5026]">Amount paid</span>
                <span className="text-xl font-black text-[#4e5026]">{formatPrice(order.total_cents / 100)}</span>
              </div>
            </div>

            <PickupScheduler
              orderId={order.id}
              orderCreatedAt={order.created_at}
              savedPickupDate={order.pickup_date}
              savedPickupTime={order.pickup_time}
            />
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c]"
            >
              View Orders
            </Link>
            <Link
              href="/plants"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/25 bg-white/45 px-6 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
            >
              Continue Shopping
            </Link>
          </div>
      </section>
    </>
  );
}
