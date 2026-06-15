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

function SproutIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21v-8" strokeLinecap="round" />
      <path d="M12 13c-4.5 0-7-2.5-7-7 4.5 0 7 2.5 7 7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13c0-4.5 2.5-7 7-7 0 4.5-2.5 7-7 7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LightIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function WaterIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3.5S6.5 10 6.5 14.2a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CareIcon({ className = "size-5" }: { className?: string }) {
  return <SproutIcon className={className} />;
}

function PickupPlantBox() {
  return (
    <svg aria-hidden="true" viewBox="0 0 88 88" className="size-16 shrink-0">
      <path d="M24 37h40l6 10v25H18V47l6-10Z" fill="#d8b06a" />
      <path d="M18 47h52l-8 9H26l-8-9Z" fill="#c69a57" />
      <path d="M33 72V58h22v14" fill="#b38245" opacity=".55" />
      <path d="M31 37c-1-13 5-22 13-26 8 4 14 13 13 26" fill="#eef2df" />
      <path d="M44 37V15" stroke="#4e5026" strokeWidth="3" strokeLinecap="round" />
      <path d="M43 24c-8-2-13-7-15-15 9 0 15 5 15 15Z" fill="#8fc36a" />
      <path d="M45 24c8-2 13-7 15-15-9 0-15 5-15 15Z" fill="#9ccc77" />
      <path d="M43 35c-7-1-12-5-14-12 8 0 13 4 14 12Z" fill="#78ad58" />
      <path d="M45 35c7-1 12-5 14-12-8 0-13 4-14 12Z" fill="#88bc64" />
      <path d="M28 52h10M50 52h10" stroke="#8a6a3a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PlantCard({ plant }: PlantCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
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

  function showPreviousImage() {
    if (plant.images.length <= 1) return;
    setSelectedImageIndex((index) => (index - 1 + plant.images.length) % plant.images.length);
  }

  function showNextImage() {
    if (plant.images.length <= 1) return;
    setSelectedImageIndex((index) => (index + 1) % plant.images.length);
  }

  function handleImageTouchEnd(touchEndX: number) {
    if (touchStartX === null) return;

    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance > 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }
    setTouchStartX(null);
  }

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#49392c]/55 px-3 py-3 sm:px-4 sm:py-4">
          <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-sm overflow-y-auto rounded-[1.5rem] bg-[#f6f2eb] p-3 shadow-2xl sm:max-w-md sm:rounded-[2rem] sm:p-4">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close plant preview"
              className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-xl font-black text-[#49392c] shadow-sm transition hover:bg-white hover:text-[#4e5026] sm:size-10"
            >
              ×
            </button>
            <div
              className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#c8ba7e] sm:aspect-[4/3] sm:rounded-3xl"
              onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
              onTouchEnd={(event) => handleImageTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
            >
              {selectedImage ? (
                <Image src={selectedImage.src} alt={selectedImage.alt} fill sizes="100vw" className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-black uppercase tracking-[0.18em] text-[#4e5026]/55">
                  Photo soon
                </div>
              )}
              {plant.images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Show previous plant photo"
                    className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-black text-[#4e5026] shadow-md transition hover:bg-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Show next plant photo"
                    className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-black text-[#4e5026] shadow-md transition hover:bg-white"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>
            {plant.images.length > 1 ? (
              <div className="mt-2 flex gap-2 sm:mt-3">
                {plant.images.slice(0, 3).map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative size-14 overflow-hidden rounded-xl bg-[#c8ba7e] ring-2 transition sm:size-16 ${
                      selectedImageIndex === index ? "ring-[#4e5026]" : "ring-transparent"
                    }`}
                    aria-label={`Show ${plant.name} photo ${index + 1}`}
                  >
                    <Image src={image.src} alt={image.alt} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="pt-2 sm:pt-3">
              <div className="flex items-start justify-between gap-3 border-b border-[#c8ba7e]/25 pb-2 sm:pb-3">
                <div>
                  <h2 className="pr-8 text-xl font-black text-[#4e5026] sm:text-2xl">{plant.name}</h2>
                  <p className="mt-0.5 text-xs text-[#49392c]/65 sm:mt-1 sm:text-sm">{plant.botanicalName}</p>
                  <p className="mt-1 text-xl font-black text-[#cb6843] sm:mt-2 sm:text-2xl">{formatPrice(plant.price)}</p>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-[#4e5026]">{plant.careLevel} care</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: plant.light, icon: <LightIcon className="size-4" /> },
                  { label: plant.water, icon: <WaterIcon className="size-4" /> },
                  { label: `${plant.careLevel} Care`, icon: <CareIcon className="size-4" /> }
                ].map((item) => (
                  <div key={item.label} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl bg-[#eef2df] px-2 py-2 text-center text-[11px] font-black leading-tight text-[#4e5026]">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 rounded-3xl bg-white/65 p-3 sm:mt-3">
                <p className={`flex items-center gap-2 text-base font-black ${availableToAdd > 0 ? "text-[#4e5026]" : "text-gray-500"}`}>
                  <span className={`size-3 rounded-full ${availableToAdd > 0 ? "bg-[#9ccc77]" : "bg-gray-400"}`} />
                  {availableToAdd > 0 ? "In Stock" : "Sold Out"}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#49392c]/70">
                  <SproutIcon className="size-5 text-[#4e5026]" />
                  {availableToAdd > 0 ? (
                    <>
                      Only <span className="font-black text-[#cb6843]">{availableToAdd}</span> available
                    </>
                  ) : (
                    "No more available for your cart"
                  )}
                </p>
              </div>

              <div className="mt-2 grid gap-1.5 sm:mt-3">
                <p className="text-sm font-bold text-[#49392c]/70">Quantity</p>
                <div className="inline-flex w-36 items-center justify-between rounded-2xl border border-[#c8ba7e]/45 bg-white px-2 py-1.5 sm:w-40 sm:py-2">
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

              <div className="mt-2 grid gap-2 sm:mt-3">
                <AddToCartButton
                  plant={cartPlant}
                  quantity={selectedQuantity}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#4e5026] px-5 text-sm font-black text-[#f6f2eb] transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-gray-400"
                />
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-[#eef2df] p-3">
                  <div>
                    <p className="font-black text-[#4e5026]">Pickup in Tracy, CA</p>
                    <p className="mt-1 text-sm leading-5 text-[#49392c]/70">
                      We&apos;ll text you to coordinate pickup.
                    </p>
                  </div>
                  <PickupPlantBox />
                </div>
              </div>
              <Link
                href={`/plants/${plant.slug}`}
                className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 border-t border-[#c8ba7e]/25 pt-2 text-sm font-black text-[#4e5026] transition hover:text-[#49392c] sm:mt-3 sm:min-h-11 sm:pt-3"
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
