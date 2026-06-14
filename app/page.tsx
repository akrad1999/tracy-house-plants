import Image from "next/image";
import Link from "next/link";
import { PlantCard } from "@/components/PlantCard";
import { getFeaturedPlants } from "@/lib/plants";

export const revalidate = 60;

export default async function Home() {
  const featuredPlants = await getFeaturedPlants();

  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#6f7d2d]">Tracy, California</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#31551f] sm:text-6xl">
              Aunty&apos;s backyard plants.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4d3d24]/75">
              Homegrown houseplants for local pickup.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/plants"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#31551f] px-6 text-sm font-black text-white transition hover:bg-[#243f18]"
              >
                Shop plants
              </Link>
              <Link
                href="/cart"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#7a5c2f]/25 bg-white/45 px-6 text-sm font-black text-[#31551f] transition hover:border-[#31551f]"
              >
                View cart
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#7a5c2f]/15 bg-white/55 p-3 shadow-xl shadow-[#5f4b24]/10">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#f4e8cf]">
              <Image
                src="/auntys-plants-logo.png"
                alt="Aunty's Plants Tracy"
                width={900}
                height={900}
                priority
                className="w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#f8f0df]/90 p-4 text-[#31551f] shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Local pickup</p>
                <p className="mt-1 text-lg font-black">Simple, healthy, homey.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#6f7d2d]">Fresh shelf</p>
            <h2 className="mt-2 text-3xl font-black text-[#31551f]">New this week</h2>
          </div>
          <Link href="/plants" className="text-sm font-black text-[#31551f] underline-offset-4 hover:underline">
            See all
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
