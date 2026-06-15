"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, type Plant } from "@/lib/plants";

type PlantCardProps = {
  plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { items } = useCart();
  const primaryImage = plant.images[0];
  const selectedImage = plant.images[selectedImageIndex] ?? primaryImage;
  const quantityInCart = items.find((item) => item.plantId === plant.id)?.quantity ?? 0;
  const availableToAdd = Math.max(plant.inventory - quantityInCart, 0);
  const availabilityLabel = availableToAdd > 0 ? `${availableToAdd} available` : "Sold out";
  const cartPlant = {
    id: plant.id,
    slug: plant.slug,
    name: plant.name,
    price: plant.price,
    inventory: plant.inventory,
    image: primaryImage?.src
  };

  useEffect(() => {
    if (!isPreviewOpen) return;
    setSelectedQuantity((currentQuantity) => Math.max(1, Math.min(currentQuantity, Math.max(availableToAdd, 1))));
  }, [availableToAdd, isPreviewOpen]);

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
            <p className={`mt-2 text-xs font-semibold ${availableToAdd > 0 ? "text-[#4e5026]/80" : "text-gray-500"}`}>
              {availabilityLabel}
            </p>
          </div>
        </button>
      </article>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#49392c]/55 px-4 py-4 sm:items-center">
          <div className="relative w-full max-w-md rounded-[2rem] bg-[#f6f2eb] p-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close plant preview"
              className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#49392c] shadow-sm transition hover:bg-white hover:text-[#4e5026]"
            >
              ×
            </button>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#c8ba7e]">
              {selectedImage ? (
                <Image src={selectedImage.src} alt={selectedImage.alt} fill sizes="100vw" className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-black uppercase tracking-[0.18em] text-[#4e5026]/55">
                  Photo soon
                </div>
              )}
            </div>
            {plant.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {plant.images.slice(0, 3).map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl bg-[#c8ba7e] ring-2 transition ${
                      selectedImageIndex === index ? "ring-[#4e5026]" : "ring-transparent"
                    }`}
                    aria-label={`Show ${plant.name} photo ${index + 1}`}
                  >
                    <Image src={image.src} alt={image.alt} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="pt-4">
              <div className="flex items-start justify-between gap-3 border-b border-[#c8ba7e]/25 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-[#4e5026]">{plant.name}</h2>
                  <p className="mt-1 text-sm text-[#49392c]/65">{plant.botanicalName}</p>
                  <p className="mt-2 text-2xl font-black text-[#cb6843]">{formatPrice(plant.price)}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#4e5026]">{plant.careLevel} care</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#49392c]/75">{plant.shortDescription}</p>
              <div className="mt-4 rounded-3xl bg-white/65 p-4">
                <p className={`text-sm font-black ${availableToAdd > 0 ? "text-[#4e5026]" : "text-gray-500"}`}>
                  {availableToAdd > 0 ? "In stock" : "Sold out"}
                </p>
                <p className="mt-1 text-sm text-[#49392c]/70">
                  {availableToAdd > 0 ? `Only ${availableToAdd} available` : "No more available for your cart"}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <p className="text-sm font-bold text-[#49392c]/70">Quantity</p>
                <div className="inline-flex w-40 items-center justify-between rounded-2xl border border-[#c8ba7e]/45 bg-white px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((quantity) => Math.max(1, quantity - 1))}
                    disabled={availableToAdd <= 0 || selectedQuantity <= 1}
                    className="inline-flex size-8 items-center justify-center rounded-full text-lg font-black text-[#4e5026] transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:text-gray-300"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm font-black text-[#4e5026]">{availableToAdd > 0 ? selectedQuantity : 0}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((quantity) => Math.min(availableToAdd, quantity + 1))}
                    disabled={availableToAdd <= 0 || selectedQuantity >= availableToAdd}
                    className="inline-flex size-8 items-center justify-center rounded-full text-lg font-black text-[#4e5026] transition hover:bg-[#f6f2eb] disabled:cursor-not-allowed disabled:text-gray-300"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <AddToCartButton
                  plant={cartPlant}
                  quantity={selectedQuantity}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#4e5026] px-5 text-sm font-black text-[#f6f2eb] transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-gray-400"
                />
                <div className="rounded-3xl bg-[#eef2df] p-4">
                  <p className="font-black text-[#4e5026]">Pickup in Tracy, CA</p>
                  <p className="mt-1 text-sm leading-5 text-[#49392c]/70">
                    Local pickup only. We&apos;ll text you to coordinate pickup after checkout.
                  </p>
                </div>
              </div>
              <Link
                href={`/plants/${plant.slug}`}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border-t border-[#c8ba7e]/25 pt-4 text-sm font-black text-[#4e5026] transition hover:text-[#49392c]"
              >
                View full details <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
