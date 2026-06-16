"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type SavePickupResult = {
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

  return { ok: true, message: "Pickup time saved." };
}
