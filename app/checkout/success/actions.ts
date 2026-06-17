"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type SavePickupResult = {
  ok: boolean;
  message: string;
  pickupDate?: string;
  pickupTime?: string;
};

type CancelOrderResult = {
  ok: boolean;
  message: string;
};

const validTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function getSlotDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !validTimePattern.test(time)) return null;
  return new Date(`${date}T${time}:00`);
}

function isValidPickupSlot(createdAt: string, pickupDate: string, pickupTime: string) {
  const orderCreatedAt = new Date(createdAt);
  const slot = getSlotDateTime(pickupDate, pickupTime);

  if (!slot || Number.isNaN(orderCreatedAt.getTime()) || Number.isNaN(slot.getTime())) return false;

  const earliestPickup = new Date(orderCreatedAt.getTime() + 12 * 60 * 60 * 1000);
  const nextDayStart = new Date(orderCreatedAt);
  nextDayStart.setDate(nextDayStart.getDate() + 1);
  nextDayStart.setHours(0, 0, 0, 0);

  const latestPickup = new Date(nextDayStart);
  latestPickup.setDate(latestPickup.getDate() + 7);
  latestPickup.setHours(18, 0, 0, 0);

  const hours = slot.getHours();
  const minutes = slot.getMinutes();

  return slot >= earliestPickup && slot >= nextDayStart && slot <= latestPickup && hours >= 8 && hours <= 18 && (minutes === 0 || minutes === 30);
}

export async function savePickupSlot(formData: FormData): Promise<SavePickupResult> {
  const orderId = String(formData.get("orderId") ?? "");
  const pickupDate = String(formData.get("pickupDate") ?? "");
  const pickupTime = String(formData.get("pickupTime") ?? "");

  if (!orderId || !pickupDate || !pickupTime) {
    return { ok: false, message: "Choose a pickup date and time." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) return { ok: false, message: "Please sign in to schedule pickup." };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, profile_id, created_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order || order.profile_id !== user.id) {
    return { ok: false, message: "Unable to verify this order." };
  }

  if (!isValidPickupSlot(order.created_at, pickupDate, pickupTime)) {
    return { ok: false, message: "Choose a pickup slot within the available pickup window." };
  }

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { error: updateError } = await serviceSupabase
    .from("orders")
    .update({
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      pickup_scheduled_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (updateError) return { ok: false, message: updateError.message };

  revalidatePath("/checkout/success");
  revalidatePath("/account");

  return { ok: true, message: "Pickup time saved.", pickupDate, pickupTime };
}

export async function cancelOrder(formData: FormData): Promise<CancelOrderResult> {
  const orderId = String(formData.get("orderId") ?? "");

  if (!orderId) return { ok: false, message: "Missing order." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) return { ok: false, message: "Please sign in to cancel this order." };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      id,
      profile_id,
      status,
      pickup_date,
      pickup_time,
      order_items (
        plant_id,
        quantity
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order || order.profile_id !== user.id) {
    return { ok: false, message: "Unable to verify this order." };
  }

  if (order.status === "cancelled") {
    return { ok: true, message: "Order has already been cancelled." };
  }

  if (order.pickup_date && order.pickup_time) {
    const pickupTime = String(order.pickup_time).slice(0, 5);
    const pickupDateTime = getSlotDateTime(order.pickup_date, pickupTime);
    if (pickupDateTime && pickupDateTime <= new Date()) {
      return { ok: false, message: "This order can no longer be cancelled because the pickup time has passed." };
    }
  }

  const serviceSupabase = createSupabaseServiceRoleClient();

  for (const item of order.order_items ?? []) {
    if (!item.plant_id || !item.quantity) continue;

    const { error: inventoryError } = await serviceSupabase.rpc("increment_plant_inventory", {
      p_plant_id: item.plant_id,
      p_quantity: item.quantity
    });

    if (inventoryError) {
      const { data: plant } = await serviceSupabase.from("plants").select("inventory").eq("id", item.plant_id).single();
      const { error: fallbackError } = await serviceSupabase
        .from("plants")
        .update({ inventory: (plant?.inventory ?? 0) + item.quantity })
        .eq("id", item.plant_id);

      if (fallbackError) return { ok: false, message: fallbackError.message };
    }
  }

  const { error: updateError } = await serviceSupabase
    .from("orders")
    .update({
      status: "cancelled",
      pickup_status: "Cancelled"
    })
    .eq("id", orderId);

  if (updateError) return { ok: false, message: updateError.message };

  revalidatePath("/checkout/success");
  revalidatePath("/account");

  return { ok: true, message: "Order has been cancelled. Your card will be refunded in 3-5 business days." };
}
