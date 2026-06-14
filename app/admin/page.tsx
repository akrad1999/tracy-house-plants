import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin placeholder for Tracy House Plants."
};

export default function AdminPage() {
  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Admin tools will live here"
        description="This placeholder maps the MVP admin workflow without exposing admin controls yet."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-green-900/10 bg-green-950 p-6 text-white shadow-sm sm:p-8">
          <h2 className="text-2xl font-black">Planned admin dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-green-50/70">
            Plant and order management will be protected before this page is linked publicly.
          </p>
        </div>
      </section>
    </>
  );
}
