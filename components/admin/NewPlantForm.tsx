"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPlantListing } from "@/app/admin/actions";

const careLevels = ["Easy", "Moderate", "Hard"];
const lightOptions = ["Low Light", "Bright Indirect", "Direct Sun"];
const waterOptions = ["Keep Moist", "Twice Weekly", "Weekly", "Every 2-3 Weeks"];
const potSizes = [4, 6, 8, 10, 12, 14, 16];
const humidityOptions = ["Low Humidity", "Moderate Humidity", "High Humidity"];

type ImagePreview = {
  id: string;
  file: File;
  url: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
    >
      {pending ? "Creating listing..." : "Create plant listing"}
    </button>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getClientId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NewPlantForm() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImagePreview[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);

  useEffect(() => {
    if (!slugWasEdited) setSlug(slugify(name));
  }, [name, slugWasEdited]);

  useEffect(() => {
    if (!imageInputRef.current || typeof DataTransfer === "undefined") return;

    try {
      const dataTransfer = new DataTransfer();
      images.forEach((image) => dataTransfer.items.add(image.file));
      imageInputRef.current.files = dataTransfer.files;
      imagesRef.current = images;
    } catch {
      imagesRef.current = images;
    }
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  function handleImageSelection(files: FileList | null) {
    if (!files) return;

    const selectedImages = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${getClientId()}`,
      file,
      url: URL.createObjectURL(file)
    }));

    setImages((currentImages) => [...currentImages, ...selectedImages]);
  }

  function removeImage(indexToRemove: number) {
    setImages((currentImages) => {
      const imageToRemove = currentImages[indexToRemove];
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.url);
      return currentImages.filter((_, index) => index !== indexToRemove);
    });
    setFeaturedImageIndex((currentIndex) => {
      if (currentIndex === indexToRemove) return 0;
      return currentIndex > indexToRemove ? currentIndex - 1 : currentIndex;
    });
  }

  return (
    <form action={createPlantListing} className="grid gap-6 rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <h2 className="text-2xl font-black text-[#4e5026]">Upload New Plant</h2>
        <p className="mt-2 text-sm leading-6 text-[#49392c]/65">
          Add the catalog details, upload plant photos, and choose which photo should appear first on the storefront.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Slug</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugWasEdited(true);
              setSlug(slugify(event.target.value));
            }}
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Botanical Name</span>
          <input
            name="botanicalName"
            required
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Price Cents</span>
          <input
            name="priceCents"
            type="number"
            min={0}
            required
            placeholder="125"
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-black text-[#4e5026]">Short Description</span>
        <input
          name="shortDescription"
          required
          className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-[#4e5026]">Description</span>
        <textarea
          name="description"
          required
          rows={5}
          className="rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 py-3 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Care Level</span>
          <select name="careLevel" className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c]">
            {careLevels.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Light</span>
          <select name="light" className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c]">
            {lightOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Water</span>
          <select name="water" className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c]">
            {waterOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Size</span>
          <input
            name="size"
            required
            placeholder="4 inch nursery pot"
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Inventory</span>
          <input
            name="inventory"
            type="number"
            min={0}
            required
            className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Pot Size</span>
          <select name="potSize" className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c]">
            {potSizes.map((option) => (
              <option key={option} value={option}>
                {option} inches
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#4e5026]">Humidity</span>
          <select name="humidity" className="min-h-12 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c]">
            {humidityOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 rounded-3xl bg-[#f6f2eb] p-4">
        <p className="text-sm font-black text-[#4e5026]">Images</p>
        <input ref={imageInputRef} name="images" type="file" accept="image/*" multiple required onChange={(event) => handleImageSelection(event.target.files)} />
        <input type="hidden" name="featuredImageIndex" value={featuredImageIndex} />
        {images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="relative h-36 overflow-hidden rounded-xl bg-[#c8ba7e]">
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm font-black text-[#4e5026]">
                  <input
                    type="radio"
                    name="featuredImagePreview"
                    checked={featuredImageIndex === index}
                    onChange={() => setFeaturedImageIndex(index)}
                  />
                  Featured image
                </label>
                <button type="button" onClick={() => removeImage(index)} className="mt-2 text-sm font-black text-red-700">
                  Remove image
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-[#f6f2eb] p-4 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm font-black text-[#4e5026]">
          <input name="featured" type="checkbox" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-black text-[#4e5026]">
          <input name="active" type="checkbox" defaultChecked />
          Active
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
