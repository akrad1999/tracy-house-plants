import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin tools for Tracy House Plants."
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/admin");
  if (!(await isAdminUser(supabase, user))) redirect("/account");

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Admin tools"
        description="Manage catalog listings and pickup availability for Tracy House Plants."
      />
      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <Link
          href="/admin/plants/new"
          className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4e5026]/30 hover:shadow-md"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#cb6843]">Catalog</p>
          <h2 className="mt-3 text-2xl font-black text-[#4e5026]">New Plant Upload</h2>
          <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
            Create a new plant listing, add catalog fields, and upload storefront images.
          </p>
        </Link>
        <Link
          href="/admin/calendar"
          className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4e5026]/30 hover:shadow-md"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#cb6843]">Pickup</p>
          <h2 className="mt-3 text-2xl font-black text-[#4e5026]">Manage Calendar</h2>
          <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
            Block or unblock pickup slots so customers only choose times you are available.
          </p>
        </Link>
      </section>
    </>
  );
}
