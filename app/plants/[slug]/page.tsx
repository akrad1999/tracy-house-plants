import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice, getPlantBySlug, getPlantSlugs } from "@/lib/plants";

export const revalidate = 60;

type PlantDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPlantSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PlantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);

  if (!plant) return { title: "Plant Not Found" };

  return {
    title: plant.name,
    description: plant.shortDescription
  };
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { slug } = await params;
  const plant = await getPlantBySlug(slug);

  if (!plant) notFound();

  return (
    <article className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
      <div className="grid gap-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-[10px] border-[#f6f2eb] bg-[#c8ba7e] shadow-xl shadow-[#49392c]/15">
          {plant.images[0] ? (
            <Image
              src={plant.images[0].src}
              alt={plant.images[0].alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.2em] text-[#4e5026]/45">
              Photo soon
            </div>
          )}
        </div>
      </div>

      <div>
        <Link href="/plants" className="text-sm font-black text-[#4e5026] underline-offset-4 hover:underline">
          Back to catalog
        </Link>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.22em] text-[#cb6843]">{plant.careLevel} care</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#4e5026] sm:text-5xl">{plant.name}</h1>
        <p className="mt-2 text-lg italic text-[#49392c]/75">{plant.botanicalName}</p>
        <p className="mt-6 text-3xl font-black text-[#4e5026]">{formatPrice(plant.price)}</p>
        <p className="mt-6 text-base leading-8 text-[#49392c]/70">{plant.description}</p>

        <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/55 p-5 shadow-sm">
          {[
            ["Light", plant.light],
            ["Water", plant.water],
            ["Size", plant.size],
            ["Inventory", `${plant.inventory} available for pickup`]
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 border-b border-[#c8ba7e]/10 py-3 last:border-0 sm:flex-row sm:justify-between"
            >
              <span className="text-sm font-black text-[#4e5026]">{label}</span>
              <span className="text-sm text-[#49392c]/65 sm:text-right">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <AddToCartButton
            plant={{
              id: plant.id,
              slug: plant.slug,
              name: plant.name,
              price: plant.price,
              inventory: plant.inventory,
              image: plant.images[0]?.src
            }}
          />
        </div>
      </div>
    </article>
  );
}
