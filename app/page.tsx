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
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#cb6843]">Tracy, California</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#4e5026] sm:text-6xl">
              Aunty&apos;s house plants.
            </h1>
            <div className="mx-auto mt-6 w-full max-w-xs rounded-[2rem] border border-[#c8ba7e]/50 bg-[#f6f2eb]/70 p-3 shadow-xl shadow-[#49392c]/10 sm:max-w-sm">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#c8ba7e]">
                <Image
                  src="/auntys-plants-logo.png"
                  alt="Aunty's Plants Tracy"
                  width={520}
                  height={520}
                  priority
                  className="w-full object-cover"
                />
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#49392c]/75">
              Bringing a little more green into your home, one plant at a time. Every plant is carefully cared for and ready for its next home.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/plants"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-[#f6f2eb] transition hover:bg-[#49392c]"
              >
                View Plants
              </Link>
              <Link
                href="/cart"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/70 bg-[#f6f2eb]/70 px-6 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
              >
                Go to Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#cb6843]">Fresh shelf</p>
            <h2 className="mt-2 text-3xl font-black text-[#4e5026]">Best Sellers</h2>
          </div>
          <Link
            href="/plants"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4e5026] px-5 text-sm font-black text-[#f6f2eb] transition hover:bg-[#49392c]"
          >
            See All
          </Link>
        </div>
        {featuredPlants.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
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
