"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { buildPickupSlots } from "@/lib/pickup";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type CalendarActionResult = {
  ok: boolean;
  message: string;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/admin/calendar");
  if (!(await isAdminUser(supabase, user))) redirect("/account");

  return user;
}

function getDateAndTime(formData: FormData) {
  const pickupDate = String(formData.get("pickupDate") ?? "");
  const pickupTime = String(formData.get("pickupTime") ?? "");

  if (!datePattern.test(pickupDate) || !timePattern.test(pickupTime)) {
    return null;
  }

  return { pickupDate, pickupTime };
}

async function hasExistingOrder(pickupDate: string, pickupTime: string) {
  const serviceSupabase = createSupabaseServiceRoleClient();
  const { data, error } = await serviceSupabase
    .from("orders")
    .select("id")
    .eq("pickup_date", pickupDate)
    .eq("pickup_time", pickupTime)
    .neq("status", "cancelled")
    .limit(1);

  if (error) throw new Error(error.message);
  return Boolean(data?.length);
}

export async function blockPickupSlot(formData: FormData): Promise<CalendarActionResult> {
  const user = await requireAdminUser();
  const slot = getDateAndTime(formData);
  if (!slot) return { ok: false, message: "Choose a valid pickup slot." };

  if (await hasExistingOrder(slot.pickupDate, slot.pickupTime)) {
    return { ok: false, message: "This slot already has a customer pickup and cannot be blocked." };
  }

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { error } = await serviceSupabase.from("pickup_blackout_slots").upsert(
    {
      pickup_date: slot.pickupDate,
      pickup_time: slot.pickupTime,
      created_by: user.id
    },
    { onConflict: "pickup_date,pickup_time" }
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/calendar");
  revalidatePath("/checkout/success");
  return { ok: true, message: "Pickup slot blocked." };
}

export async function unblockPickupSlot(formData: FormData): Promise<CalendarActionResult> {
  await requireAdminUser();
  const slot = getDateAndTime(formData);
  if (!slot) return { ok: false, message: "Choose a valid pickup slot." };

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { error } = await serviceSupabase
    .from("pickup_blackout_slots")
    .delete()
    .eq("pickup_date", slot.pickupDate)
    .eq("pickup_time", slot.pickupTime);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/calendar");
  revalidatePath("/checkout/success");
  return { ok: true, message: "Pickup slot unblocked." };
}

export async function blockPickupDay(formData: FormData): Promise<CalendarActionResult> {
  const user = await requireAdminUser();
  const pickupDate = String(formData.get("pickupDate") ?? "");
  const windowCreatedAt = String(formData.get("windowCreatedAt") ?? new Date().toISOString());
  if (!datePattern.test(pickupDate)) return { ok: false, message: "Choose a valid pickup date." };

  const slots = buildPickupSlots(windowCreatedAt, pickupDate);
  const serviceSupabase = createSupabaseServiceRoleClient();
  let blockedCount = 0;

  for (const pickupTime of slots) {
    if (await hasExistingOrder(pickupDate, pickupTime)) continue;

    const { error } = await serviceSupabase.from("pickup_blackout_slots").upsert(
      {
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        created_by: user.id
      },
      { onConflict: "pickup_date,pickup_time" }
    );

    if (error) return { ok: false, message: error.message };
    blockedCount += 1;
  }

  revalidatePath("/admin/calendar");
  revalidatePath("/checkout/success");
  return {
    ok: true,
    message: blockedCount > 0 ? `Blocked ${blockedCount} open pickup slots.` : "No open pickup slots were available to block."
  };
}

export async function unblockPickupDay(formData: FormData): Promise<CalendarActionResult> {
  await requireAdminUser();
  const pickupDate = String(formData.get("pickupDate") ?? "");
  if (!datePattern.test(pickupDate)) return { ok: false, message: "Choose a valid pickup date." };

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { error } = await serviceSupabase.from("pickup_blackout_slots").delete().eq("pickup_date", pickupDate);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/calendar");
  revalidatePath("/checkout/success");
  return { ok: true, message: "Pickup day unblocked." };
}
