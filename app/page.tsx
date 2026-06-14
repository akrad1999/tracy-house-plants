import Link from "next/link";
import { PlantCard } from "@/components/PlantCard";
import { getFeaturedPlants } from "@/lib/plants";

export const revalidate = 60;

export default async function Home() {
  const featuredPlants = await getFeaturedPlants();

  return (
    <>
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_#cfe8ca,_transparent_32%),linear-gradient(135deg,_#fbf7ef,_#eff8ec)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-green-800">
              Houseplants homegrown locally in Tracy, California!
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-tight text-green-950 sm:text-6xl">
              Healthy plants, ready for their next home.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-green-950/70">
              Browse small-batch houseplants, reserve favorites, and pick them up locally when checkout launches.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/plants"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-6 text-sm font-black text-white transition hover:bg-green-800"
              >
                Browse plants
              </Link>
              <Link
                href="/account"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-green-950/20 px-6 text-sm font-black text-green-950 transition hover:border-green-950"
              >
                Account preview
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-green-900/10 bg-white p-5 shadow-2xl shadow-green-950/10">
            <div className="rounded-[2rem] bg-green-950 p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-100/70">MVP focus</p>
              <div className="mt-8 grid gap-4">
                {["Browse plants", "View details", "Local pickup", "Cart and checkout later"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 p-4 text-lg font-black">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-green-800">Featured</p>
            <h2 className="mt-3 text-3xl font-black text-green-950">New additions this week!</h2>
          </div>
          <Link href="/plants" className="text-sm font-black text-green-900 underline-offset-4 hover:underline">
            View full catalog
          </Link>
        </div>
        {featuredPlants.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {featuredPlants.map((plant) => (
              <PlantCard key={plant.slug} plant={plant} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[2rem] border border-dashed border-green-900/20 bg-white p-8 text-center">
            <p className="text-lg font-black text-green-950">No featured plants yet.</p>
            <p className="mt-2 text-sm text-green-950/65">
              Add Supabase environment variables and run the migrations to populate the storefront.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
