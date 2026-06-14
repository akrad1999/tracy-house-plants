import { NextResponse, type NextRequest } from "next/server";
import { parseCheckoutCartItems, toStripeLineItems, validateCheckoutInventory } from "@/lib/checkout/inventory";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { items?: unknown };
    const cartItems = parseCheckoutCartItems(payload.items);
    const validatedItems = await validateCheckoutInventory(cartItems);
    const stripe = getStripe();
    const origin = request.nextUrl.origin;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
    }

    /*
      Checkout flow:
      1. The browser sends only plant ids and quantities.
      2. This server route reloads current Supabase price/inventory and rejects sold-out or over-limit quantities.
      3. Stripe Checkout collects payment for local pickup.
      4. No order is created here; the webhook creates the order only after Stripe confirms payment.
    */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: toStripeLineItems(validatedItems),
      customer_email: user.email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=1`,
      metadata: {
        user_id: user.id,
        pickup_method: "local_pickup"
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          pickup_method: "local_pickup"
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout session." },
      { status: 400 }
    );
  }
}
