import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewPlantForm } from "@/components/admin/NewPlantForm";
import { PageHero } from "@/components/PageHero";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Plant Upload",
  description: "Create Tracy House Plants catalog listings."
};

export default async function NewPlantUploadPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/admin/plants/new");
  if (!(await isAdminUser(supabase, user))) redirect("/account");

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Create a new plant listing"
        description="Upload plant photos and publish new catalog items directly to the storefront."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/admin" className="mb-5 inline-flex text-sm font-black text-[#4e5026] hover:underline">
          Back to Admin
        </Link>
        <NewPlantForm />
      </section>
    </>
  );
}
