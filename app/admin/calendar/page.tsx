import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PickupCalendarManager } from "@/components/admin/PickupCalendarManager";
import { PageHero } from "@/components/PageHero";
import { isAdminUser } from "@/lib/admin";
import { buildPickupDays, buildPickupSlots, formatDayLabel, getBlackoutSlotKey, getPickupWindowDateValues, toDateInputValue } from "@/lib/pickup";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Calendar",
  description: "Block Tracy House Plants pickup availability."
};

export default async function AdminCalendarPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/admin/calendar");
  if (!(await isAdminUser(supabase, user))) redirect("/account");

  const windowCreatedAt = new Date().toISOString();
  const dateValues = getPickupWindowDateValues(windowCreatedAt);
  const serviceSupabase = createSupabaseServiceRoleClient();

  const [{ data: blackoutRows, error: blackoutError }, { data: occupiedRows, error: occupiedError }] = await Promise.all([
    serviceSupabase.from("pickup_blackout_slots").select("pickup_date, pickup_time").in("pickup_date", dateValues),
    serviceSupabase
      .from("orders")
      .select("pickup_date, pickup_time")
      .in("pickup_date", dateValues)
      .neq("status", "cancelled")
      .not("pickup_date", "is", null)
      .not("pickup_time", "is", null)
  ]);

  if (blackoutError) throw new Error(`Unable to load blocked pickup slots: ${blackoutError.message}`);
  if (occupiedError) throw new Error(`Unable to load scheduled pickup slots: ${occupiedError.message}`);

  const days = buildPickupDays(windowCreatedAt).map((day) => {
    const value = toDateInputValue(day);
    return {
      value,
      label: formatDayLabel(day),
      slots: buildPickupSlots(windowCreatedAt, value)
    };
  });
  const blockedSlots = (blackoutRows ?? []).map((row) => getBlackoutSlotKey(row.pickup_date, String(row.pickup_time)));
  const occupiedSlots = (occupiedRows ?? []).map((row) => getBlackoutSlotKey(row.pickup_date, String(row.pickup_time)));

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Manage pickup calendar"
        description="Block 30-minute pickup slots or full days for the upcoming customer scheduling window."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/admin" className="mb-5 inline-flex text-sm font-black text-[#4e5026] hover:underline">
          Back to Admin
        </Link>
        <PickupCalendarManager
          days={days}
          blockedSlots={blockedSlots}
          occupiedSlots={occupiedSlots}
        />
      </section>
    </>
  );
}
