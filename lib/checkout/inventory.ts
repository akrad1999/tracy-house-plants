import type Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CheckoutCartItem = {
  plantId: string;
  quantity: number;
};

type PlantCheckoutRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  inventory: number;
};

export type ValidatedCheckoutItem = {
  plantId: string;
  slug: string;
  plantName: string;
  quantity: number;
  unitPriceCents: number;
};

export function parseCheckoutCartItems(value: unknown): CheckoutCartItem[] {
  if (!Array.isArray(value)) throw new Error("Cart items are required.");

  return value.map((item) => {
    if (typeof item !== "object" || item === null) throw new Error("Invalid cart item.");

    const plantId = "plantId" in item ? item.plantId : null;
    const quantity = "quantity" in item ? item.quantity : null;

    if (typeof plantId !== "string" || !Number.isInteger(quantity)) throw new Error("Invalid cart item.");

    return { plantId, quantity };
  });
}

export async function validateCheckoutInventory(cartItems: CheckoutCartItem[]) {
  if (cartItems.length === 0) throw new Error("Your cart is empty.");

  const quantityByPlantId = new Map<string, number>();

  for (const item of cartItems) {
    if (item.quantity <= 0) throw new Error("Cart quantities must be greater than zero.");
    quantityByPlantId.set(item.plantId, (quantityByPlantId.get(item.plantId) ?? 0) + item.quantity);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("plants")
    .select("id, slug, name, price_cents, inventory")
    .in("id", [...quantityByPlantId.keys()])
    .eq("active", true);

  if (error) throw new Error(`Unable to validate inventory: ${error.message}`);
  if (!data || data.length !== quantityByPlantId.size) throw new Error("One or more plants are no longer available.");

  return (data as PlantCheckoutRow[]).map((plant) => {
    const quantity = quantityByPlantId.get(plant.id) ?? 0;

    if (plant.inventory <= 0) throw new Error(`${plant.name} is sold out.`);
    if (quantity > plant.inventory) throw new Error(`Only ${plant.inventory} ${plant.name} available.`);

    return {
      plantId: plant.id,
      slug: plant.slug,
      plantName: plant.name,
      quantity,
      unitPriceCents: plant.price_cents
    };
  });
}

export function toStripeLineItems(items: ValidatedCheckoutItem[]): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: item.unitPriceCents,
      product_data: {
        name: item.plantName,
        metadata: {
          plant_id: item.plantId,
          slug: item.slug
        }
      }
    }
  }));
}
