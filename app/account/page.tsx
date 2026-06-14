import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/account/actions";
import { PageHero } from "@/components/PageHero";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Tracy House Plants account."
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { saved } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
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

  return (
    <>
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
                <span className="text-sm font-black text-green-950">Profile picture URL</span>
                <input
                  name="avatarUrl"
                  type="url"
                  defaultValue={avatarUrl}
                  placeholder="https://..."
                  className="min-h-12 rounded-2xl border border-green-900/15 bg-[#fbf7ef] px-4 text-base text-green-950 outline-none transition placeholder:text-green-950/40 focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
                />
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
            <div className="mt-6 rounded-3xl border border-dashed border-green-900/20 bg-[#fbf7ef] p-6">
              <p className="font-black text-green-950">View your pickup orders</p>
              <p className="mt-2 text-sm leading-6 text-green-950/65">
                Paid Stripe orders appear after the webhook confirms payment and creates the order in Supabase.
              </p>
              <Link
                href="/account/orders"
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
              >
                View orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
