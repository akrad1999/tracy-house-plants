import { adminEmails } from "@/lib/admin";
import {
  sendAdminNewOrderEmail,
  sendPickupConfirmedEmail,
  sendScheduleReminderEmail
} from "@/lib/email/order-emails";
import type { OrderEmailPayload } from "@/lib/email/shared";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

type OrderRow = {
  id: string;
  customer_email: string;
  customer_name: string | null;
  profile_id: string | null;
  total_cents: number;
  created_at: string;
  status: string;
  pickup_date: string | null;
  pickup_time: string | null;
  schedule_reminder_due_at: string | null;
  schedule_reminder_email_sent_at: string | null;
  admin_notification_email_sent_at: string | null;
  order_items: {
    plant_name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[];
};

const REMINDER_DELAY_MS = 10 * 60 * 1000;

export function getScheduleReminderDueAt(fromDate = new Date()) {
  return new Date(fromDate.getTime() + REMINDER_DELAY_MS).toISOString();
}

export async function getAdminRecipientEmails() {
  const supabase = createSupabaseServiceRoleClient();
  const recipients = new Set<string>(adminEmails.map((email) => email.toLowerCase()));

  const { data: profiles, error } = await supabase.from("profiles").select("email").eq("role", "admin");
  if (error) throw new Error(error.message);

  for (const profile of profiles ?? []) {
    if (profile.email) recipients.add(profile.email.toLowerCase());
  }

  return [...recipients];
}

async function loadOrderEmailPayload(orderId: string): Promise<OrderEmailPayload | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_email,
      customer_name,
      profile_id,
      total_cents,
      created_at,
      status,
      pickup_date,
      pickup_time,
      order_items (
        plant_name,
        quantity,
        unit_price_cents,
        line_total_cents
      )
    `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  let customerPhone: string | null = null;
  if (order.profile_id) {
    const { data: profile } = await supabase.from("profiles").select("phone").eq("id", order.profile_id).maybeSingle();
    customerPhone = profile?.phone ?? null;
  }

  return mapOrderRowToPayload(order as OrderRow, customerPhone);
}

function mapOrderRowToPayload(order: OrderRow, customerPhone: string | null): OrderEmailPayload {
  return {
    orderId: order.id,
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    customerPhone,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    pickupDate: order.pickup_date,
    pickupTime: order.pickup_time,
    items: (order.order_items ?? []).map((item) => ({
      plantName: item.plant_name,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      lineTotalCents: item.line_total_cents
    }))
  };
}

export async function initializeOrderEmailSchedule(orderId: string, createdAt: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("orders")
    .update({
      schedule_reminder_due_at: getScheduleReminderDueAt(new Date(createdAt))
    })
    .eq("id", orderId)
    .is("schedule_reminder_due_at", null);

  if (error) throw new Error(error.message);
}

export async function recordCheckoutSuccessView(orderId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const viewedAt = new Date().toISOString();
  const dueAt = getScheduleReminderDueAt(new Date(viewedAt));

  const { data: order, error: loadError } = await supabase
    .from("orders")
    .select("checkout_success_viewed_at")
    .eq("id", orderId)
    .maybeSingle();

  if (loadError || !order) return;
  if (order.checkout_success_viewed_at) return;

  const { error } = await supabase
    .from("orders")
    .update({
      checkout_success_viewed_at: viewedAt,
      schedule_reminder_due_at: dueAt
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function sendAdminOrderNotification(orderId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: order, error: loadError } = await supabase
    .from("orders")
    .select("id, status, admin_notification_email_sent_at")
    .eq("id", orderId)
    .maybeSingle();

  if (loadError || !order || order.status === "cancelled" || order.admin_notification_email_sent_at) return;

  const payload = await loadOrderEmailPayload(orderId);
  if (!payload) throw new Error("Unable to load order for admin notification.");

  try {
    const recipients = await getAdminRecipientEmails();
    await sendAdminNewOrderEmail(payload, recipients);

    await supabase
      .from("orders")
      .update({
        admin_notification_email_sent_at: new Date().toISOString(),
        admin_notification_email_last_error: null
      })
      .eq("id", orderId);
  } catch (error) {
    await supabase
      .from("orders")
      .update({
        admin_notification_email_last_error: error instanceof Error ? error.message : "Unable to send admin notification."
      })
      .eq("id", orderId);
    throw error;
  }
}

export async function sendPickupConfirmationForOrder(orderId: string, isUpdate: boolean) {
  const supabase = createSupabaseServiceRoleClient();
  const payload = await loadOrderEmailPayload(orderId);
  if (!payload || !payload.pickupDate || !payload.pickupTime) {
    throw new Error("Unable to load scheduled pickup for confirmation email.");
  }

  try {
    await sendPickupConfirmedEmail(payload, isUpdate);

    await supabase
      .from("orders")
      .update({
        confirmation_email_sent_at: new Date().toISOString(),
        confirmation_email_last_error: null,
        pickup_confirmation_email_last_error: null
      })
      .eq("id", orderId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send pickup confirmation email.";
    await supabase.from("orders").update({ pickup_confirmation_email_last_error: message }).eq("id", orderId);
    throw error;
  }
}

export async function processDueScheduleReminderEmails() {
  // Called once per day by /api/cron/order-emails (Vercel Hobby cron limit).
  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id")
    .is("pickup_date", null)
    .is("schedule_reminder_email_sent_at", null)
    .neq("status", "cancelled")
    .not("schedule_reminder_due_at", "is", null)
    .lte("schedule_reminder_due_at", now)
    .limit(25);

  if (error) throw new Error(error.message);

  let sentCount = 0;

  for (const order of orders ?? []) {
    const payload = await loadOrderEmailPayload(order.id);
    if (!payload) continue;

    try {
      await sendScheduleReminderEmail(payload);

      await supabase
        .from("orders")
        .update({
          schedule_reminder_email_sent_at: new Date().toISOString(),
          schedule_reminder_email_last_error: null,
          confirmation_email_sent_at: new Date().toISOString(),
          confirmation_email_last_error: null
        })
        .eq("id", order.id);

      sentCount += 1;
    } catch (emailError) {
      await supabase
        .from("orders")
        .update({
          schedule_reminder_email_last_error:
            emailError instanceof Error ? emailError.message : "Unable to send schedule reminder email."
        })
        .eq("id", order.id);
    }
  }

  return sentCount;
}
