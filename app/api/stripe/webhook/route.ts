import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { initializeOrderEmailSchedule, processDueScheduleReminderEmails, sendAdminOrderNotification } from "@/lib/email/order-email-service";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type FinalizeOrderItem = {
  plant_id: string;
  plant_name: string;
  quantity: number;
  unit_price_cents: number;
};

type FinalizedOrderRow = {
  id: string;
  created_at: string;
  admin_notification_email_sent_at: string | null;
};

function getPaymentIntentId(paymentIntent: Stripe.Checkout.Session["payment_intent"]) {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

function getProductMetadata(product: string | Stripe.Product | Stripe.DeletedProduct | null) {
  if (!product || typeof product === "string" || product.deleted) return {};
  return product.metadata;
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  /*
    Payment-confirmed order flow:
    1. Stripe sends checkout.session.completed after payment succeeds.
    2. We reload line items from Stripe so the browser cannot forge prices or product ids.
    3. A Supabase service-role RPC creates the order/items and decrements inventory in one transaction.
    4. The RPC is idempotent on stripe_session_id, so duplicate webhooks return the existing order.
  */
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
      limit: 100
    });
    const orderItems: FinalizeOrderItem[] = lineItems.data.map((lineItem) => {
      const metadata = getProductMetadata(lineItem.price?.product ?? null);
      const plantId = metadata.plant_id;

      if (!plantId || !lineItem.price?.unit_amount || !lineItem.quantity) {
        throw new Error("Stripe line item is missing plant metadata, price, or quantity.");
      }

      return {
        plant_id: plantId,
        plant_name: lineItem.description ?? "Plant",
        quantity: lineItem.quantity,
        unit_price_cents: lineItem.price.unit_amount
      };
    });
    const supabase = createSupabaseServiceRoleClient();
    const profileId = session.metadata?.user_id || null;
    const customerEmail = session.customer_details?.email ?? session.customer_email;

    if (!customerEmail) throw new Error("Stripe session is missing a customer email.");

    const { data: orderId, error } = await supabase.rpc("finalize_stripe_checkout_order", {
      p_stripe_session_id: session.id,
      p_stripe_payment_intent_id: getPaymentIntentId(session.payment_intent),
      p_profile_id: profileId,
      p_customer_email: customerEmail,
      p_customer_name: session.customer_details?.name ?? null,
      p_total_cents: session.amount_total ?? 0,
      p_items: orderItems
    });

    if (error) throw new Error(`Unable to finalize Stripe order: ${error.message}`);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, created_at, admin_notification_email_sent_at")
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Unable to load finalized order: ${orderError.message}`);

    const finalizedOrder = order as FinalizedOrderRow;

    await initializeOrderEmailSchedule(finalizedOrder.id, finalizedOrder.created_at);

    if (!finalizedOrder.admin_notification_email_sent_at) {
      try {
        await sendAdminOrderNotification(finalizedOrder.id);
      } catch (adminEmailError) {
        console.error("[stripe-webhook] admin notification failed", adminEmailError);
      }
    }

    try {
      await processDueScheduleReminderEmails();
    } catch (reminderEmailError) {
      console.error("[stripe-webhook] schedule reminder sweep failed", reminderEmailError);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process Stripe webhook." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
