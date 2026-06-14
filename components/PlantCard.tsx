import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice, type Plant } from "@/lib/plants";

type PlantCardProps = {
  plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
  const primaryImage = plant.images[0];

  return (
    <article className="group rounded-[1.25rem] bg-[#fffaf0] p-3 shadow-lg shadow-[#5f4b24]/12 ring-1 ring-[#7a5c2f]/10 transition hover:-translate-y-1 hover:rotate-[-0.5deg] hover:shadow-xl">
      <Link href={`/plants/${plant.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#dfd0aa]">
          {primaryImage ? (
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.2em] text-[#31551f]/45">
              Photo soon
            </div>
          )}
        </div>
        <div className="px-2 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-[#31551f]">{plant.name}</h3>
              <p className="mt-1 text-sm italic text-[#6b5636]/75">{plant.botanicalName}</p>
            </div>
            <p className="rounded-full bg-[#e7d7b6] px-3 py-1 text-sm font-black text-[#31551f]">
              {formatPrice(plant.price)}
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#4d3d24]/70">{plant.shortDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f1e4c8] px-3 py-1 text-xs font-bold text-[#73551f]">
              {plant.careLevel}
            </span>
            <span className="rounded-full bg-[#dbe7c0] px-3 py-1 text-xs font-bold text-[#31551f]">
              {plant.inventory} available
            </span>
          </div>
        </div>
      </Link>
      <div className="px-2 pb-2">
        <AddToCartButton
          plant={{
            id: plant.id,
            slug: plant.slug,
            name: plant.name,
            price: plant.price,
            inventory: plant.inventory,
            image: primaryImage?.src
          }}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#31551f] px-5 text-sm font-black text-white transition hover:bg-[#243f18] disabled:cursor-not-allowed disabled:bg-[#31551f]/40"
        />
      </div>
    </article>
  );
}
