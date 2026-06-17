import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewPlantForm } from "@/components/admin/NewPlantForm";
import { PageHero } from "@/components/PageHero";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Admin",
  description: "Create Tracy House Plants catalog listings."
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { created, error } = await searchParams;
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
        title="Create a new plant listing"
        description="Upload plant photos and publish new catalog items directly to the storefront."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {created === "1" ? (
          <p className="mb-5 rounded-2xl bg-green-100 px-4 py-3 text-sm font-black text-green-950">
            Plant listing created. It is now available anywhere active plants are shown.
          </p>
        ) : null}
        {error ? (
          <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-800">
            {error}
          </p>
        ) : null}
        <NewPlantForm />
      </section>
    </>
  );
}
