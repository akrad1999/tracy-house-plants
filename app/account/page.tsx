import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/account/actions";
import { FinishAccountModal } from "@/components/account/FinishAccountModal";
import { PageHero } from "@/components/PageHero";
import { formatPrice } from "@/lib/plants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountPageProps = {
  searchParams: Promise<{ saved?: string; checkout?: string; error?: string; setup?: string; next?: string }>;
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
  order_items: OrderItemRow[];
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Tracy House Plants account."
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { saved, checkout, error, next } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, phone, address_line1, address_line2, city, state, postal_code, country")
    .eq("id", user.id)
    .maybeSingle();
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      pickup_status,
      total_cents,
      created_at,
      order_items (
        id,
        plant_name,
        quantity,
        line_total_cents
      )
    `
    )
    .order("created_at", { ascending: false });

  if (ordersError) throw new Error(`Unable to load orders: ${ordersError.message}`);

  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : "Plant friend";
  const metadataAvatarUrl =
    typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : "";
  const displayName = profile?.full_name ?? metadataName;
  const avatarUrl = profile?.avatar_url ?? metadataAvatarUrl;
  const phone = profile?.phone ?? "";
  const addressLine1 = profile?.address_line1 ?? "";
  const addressLine2 = profile?.address_line2 ?? "";
  const city = profile?.city ?? "";
  const state = profile?.state ?? "";
  const postalCode = profile?.postal_code ?? "";
  const country = profile?.country ?? "United States";
  const orders = (ordersData ?? []) as OrderRow[];
  const showSetupModal = !phone;

  return (
    <>
      {showSetupModal ? (
        <FinishAccountModal
          displayName={displayName}
          phone={phone}
          addressLine1={addressLine1}
          addressLine2={addressLine2}
          city={city}
          state={state}
          postalCode={postalCode}
          country={country}
          nextPath={next}
        />
      ) : null}
      <PageHero
        eyebrow="Account"
        title={`Welcome, ${displayName}`}
        description="Manage your local pickup details and review order history."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-green-950">Profile</h2>
            {saved === "1" ? (
              <p className="mt-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-950">
                Profile saved.
              </p>
            ) : null}
            {checkout === "phone_required" ? (
              <p className="mt-4 rounded-2xl bg-[#fff4d8] px-4 py-3 text-sm font-bold text-[#49392c]">
                Add a phone number before checkout so pickup can be coordinated.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-[#fbf7ef] p-5">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-16 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-xl font-black text-green-950">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-black text-green-950">{displayName}</p>
                <p className="mt-1 text-sm text-green-950/65">{user.email}</p>
              </div>
            </div>
            <form action={updateProfile} className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-green-950">Display name</span>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={displayName}
                  className="min-h-12 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 text-base text-green-950 outline-none transition focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black text-green-950">Phone number</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  defaultValue={phone}
                  placeholder="10 digits required"
                  minLength={10}
                  className="min-h-12 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 text-base text-green-950 outline-none transition placeholder:text-green-950/40 focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
                />
                <span className="text-xs font-bold text-green-950/55">A valid 10-digit phone number is required before your account can be saved.</span>
              </label>
              <div className="grid gap-3 rounded-3xl bg-[#fbf7ef] p-4">
                <p className="text-sm font-black text-green-950">Address optional</p>
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-green-950/65">Address line 1</span>
                  <input name="addressLine1" defaultValue={addressLine1} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-green-950/65">Address line 2</span>
                  <input name="addressLine2" defaultValue={addressLine2} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-green-950/65">City</span>
                    <input name="city" defaultValue={city} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-green-950/65">State/Province/Region</span>
                    <input name="state" defaultValue={state} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-green-950/65">ZIP/Postal code</span>
                    <input name="postalCode" defaultValue={postalCode} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-green-950/65">Country</span>
                    <input name="country" defaultValue={country} className="min-h-11 rounded-2xl border border-green-900/15 bg-white px-4 text-sm text-green-950 outline-none focus:border-green-800 focus:ring-4 focus:ring-green-900/10" />
                  </label>
                </div>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-black text-green-950">Profile picture</span>
                <input
                  name="avatarFile"
                  type="file"
                  accept="image/*"
                  className="rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 py-3 text-sm text-green-950 file:mr-4 file:rounded-full file:border-0 file:bg-green-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                />
                <span className="text-xs text-green-950/55">JPG, PNG, WebP, or GIF under 5MB.</span>
              </label>
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800 sm:w-auto"
              >
                Save profile
              </button>
            </form>
            <form action="/auth/sign-out" method="post" className="mt-6">
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-green-950/20 px-6 text-sm font-black text-green-950 transition hover:border-green-950 sm:w-auto"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-green-900/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-green-950">Order history</h2>
            {orders.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-green-900/20 bg-[#fbf7ef] p-6">
                <p className="font-black text-green-950">No orders yet.</p>
                <p className="mt-2 text-sm leading-6 text-green-950/65">
                  Paid pickup orders will show here.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-3xl bg-[#fbf7ef] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-800">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <h3 className="mt-2 text-lg font-black text-green-950">Order {order.id.slice(0, 8)}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-950">
                          {order.status}
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-950">
                          {order.pickup_status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 border-t border-green-900/10 pt-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between gap-4 text-sm">
                          <span className="font-semibold text-green-950">
                            {item.quantity} x {item.plant_name}
                          </span>
                          <span className="font-black text-green-950">{formatPrice(item.line_total_cents / 100)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between border-t border-green-900/10 pt-4">
                      <span className="text-sm font-black text-green-950">Total</span>
                      <span className="text-lg font-black text-green-950">{formatPrice(order.total_cents / 100)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
