"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice, type Plant } from "@/lib/plants";

type PlantCardProps = {
  plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const primaryImage = plant.images[0];
  const cartPlant = {
    id: plant.id,
    slug: plant.slug,
    name: plant.name,
    price: plant.price,
    inventory: plant.inventory,
    image: primaryImage?.src
  };

  return (
    <>
      <article className="group rounded-xl bg-[#f6f2eb] p-2 shadow-md shadow-[#49392c]/10 ring-1 ring-[#c8ba7e]/45 transition hover:-translate-y-0.5 hover:shadow-lg">
        <button type="button" onClick={() => setIsPreviewOpen(true)} className="block w-full text-left">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-[#c8ba7e]">
            {primaryImage ? (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 45vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center p-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#4e5026]/55">
                Photo soon
              </div>
            )}
          </div>
          <div className="px-1.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-[#4e5026]">{plant.name}</h3>
                <p className="mt-0.5 truncate text-xs text-[#49392c]/60">{plant.botanicalName}</p>
              </div>
              <p className="shrink-0 rounded-full bg-[#c8ba7e] px-2 py-1 text-xs font-black text-[#49392c]">
                {formatPrice(plant.price)}
              </p>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#4e5026]/80">{plant.inventory} available</p>
          </div>
        </button>
      </article>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#49392c]/55 px-4 py-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-[#f6f2eb] p-4 shadow-2xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#c8ba7e]">
              {primaryImage ? (
                <Image src={primaryImage.src} alt={primaryImage.alt} fill sizes="100vw" className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-black uppercase tracking-[0.18em] text-[#4e5026]/55">
                  Photo soon
                </div>
              )}
            </div>
            <div className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#4e5026]">{plant.name}</h2>
                  <p className="mt-1 text-sm text-[#49392c]/65">{plant.botanicalName}</p>
                </div>
                <p className="rounded-full bg-[#cb6843] px-3 py-1 text-sm font-black text-white">{formatPrice(plant.price)}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#49392c]/75">{plant.shortDescription}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4e5026]">
                {plant.inventory} available
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/plants/${plant.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8ba7e] bg-white/65 px-5 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
                >
                  View details
                </Link>
                <AddToCartButton
                  plant={cartPlant}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4e5026] px-5 text-sm font-black text-[#f6f2eb] transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-[#4e5026]/40"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="mt-4 w-full text-center text-sm font-bold text-[#49392c]/70 underline-offset-4 hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
