import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FinishAccountModal } from "@/components/account/FinishAccountModal";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PageHero } from "@/components/PageHero";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountPageProps = {
  searchParams: Promise<{ saved?: string; checkout?: string; error?: string; setup?: string; next?: string }>;
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
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
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
            <ProfileForm
              displayName={displayName}
              phone={phone}
              addressLine1={addressLine1}
              addressLine2={addressLine2}
              city={city}
              state={state}
              postalCode={postalCode}
              country={country}
            />
            <form action="/auth/sign-out" method="post" className="mt-6">
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-green-950/20 px-6 text-sm font-black text-green-950 transition hover:border-green-950 sm:w-auto"
              >
                Sign out
              </button>
            </form>
        </div>
      </section>
    </>
  );
}
