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
    <article className="group overflow-hidden rounded-[2rem] border border-green-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/plants/${plant.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-green-100">
          {primaryImage ? (
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.2em] text-green-900/45">
              Image coming soon
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-green-950">{plant.name}</h3>
              <p className="mt-1 text-sm italic text-green-800/75">{plant.botanicalName}</p>
            </div>
            <p className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-950">
              {formatPrice(plant.price)}
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-green-950/70">{plant.shortDescription}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              {plant.careLevel}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">
              {plant.inventory} available
            </span>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5">
        <AddToCartButton
          plant={{
            id: plant.id,
            slug: plant.slug,
            name: plant.name,
            price: plant.price,
            inventory: plant.inventory,
            image: primaryImage?.src
          }}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-green-950 px-5 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-950/40"
        />
      </div>
    </article>
  );
}
