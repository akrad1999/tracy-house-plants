"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

const careLevels = ["Easy", "Moderate", "Hard"] as const;
const lightOptions = ["Low Light", "Bright Indirect", "Direct Sun"] as const;
const waterOptions = ["Keep Moist", "Twice Weekly", "Weekly", "Every 2-3 Weeks"] as const;
const potSizes = [4, 6, 8, 10, 12, 14, 16] as const;
const humidityOptions = ["Low Humidity", "Moderate Humidity", "High Humidity"] as const;
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSize = 10 * 1024 * 1024;

function getRequiredString(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function getInteger(formData: FormData, name: string) {
  const value = Number.parseInt(String(formData.get(name) ?? ""), 10);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number.`);
  return value;
}

function getOption<T extends readonly (string | number)[]>(formData: FormData, name: string, options: T): T[number] {
  const value = String(formData.get(name) ?? "").trim();
  const normalizedValue = typeof options[0] === "number" ? Number(value) : value;
  if (!options.includes(normalizedValue as T[number])) throw new Error(`${name} has an invalid value.`);
  return normalizedValue as T[number];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export async function createPlantListing(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) redirect("/sign-in?next=/admin");
  if (!(await isAdminUser(supabase, user))) redirect("/account");

  try {
    const name = getRequiredString(formData, "name");
    const slug = slugify(getRequiredString(formData, "slug"));
    const botanicalName = getRequiredString(formData, "botanicalName");
    const priceCents = getInteger(formData, "priceCents");
    const shortDescription = getRequiredString(formData, "shortDescription");
    const description = getRequiredString(formData, "description");
    const careLevel = getOption(formData, "careLevel", careLevels);
    const light = getOption(formData, "light", lightOptions);
    const water = getOption(formData, "water", waterOptions);
    const size = getRequiredString(formData, "size");
    const inventory = getInteger(formData, "inventory");
    const potSize = getOption(formData, "potSize", potSizes);
    const humidity = getOption(formData, "humidity", humidityOptions);
    const featured = formData.get("featured") === "on";
    const active = formData.get("active") === "on";
    const requestedFeaturedImageIndex = Math.max(0, getInteger(formData, "featuredImageIndex"));
    const images = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

    if (!slug) throw new Error("Slug must contain letters or numbers.");
    if (priceCents < 0) throw new Error("Price cents must be 0 or greater.");
    if (inventory < 0) throw new Error("Inventory must be 0 or greater.");
    if (images.length === 0) throw new Error("Upload at least one plant image.");
    const featuredImageIndex = Math.min(requestedFeaturedImageIndex, images.length - 1);

    for (const image of images) {
      if (!imageTypes.includes(image.type)) throw new Error("Images must be JPEG, PNG, WebP, or GIF files.");
      if (image.size > maxImageSize) throw new Error("Each image must be 10MB or smaller.");
    }

    const serviceSupabase = createSupabaseServiceRoleClient();
    const { data: plant, error: plantError } = await serviceSupabase
      .from("plants")
      .insert({
        slug,
        name,
        botanical_name: botanicalName,
        price_cents: priceCents,
        short_description: shortDescription,
        description,
        care_level: careLevel,
        light,
        water,
        size,
        inventory,
        featured,
        active,
        pot_size: potSize,
        humidity,
        tags: []
      })
      .select("id, slug")
      .single();

    if (plantError || !plant) throw new Error(plantError?.message ?? "Unable to create plant.");

    const uploadedPaths: string[] = [];

    try {
      const imageRows = await Promise.all(
        images.map(async (image, index) => {
          const filePath = `${slug}/${Date.now()}-${index}-${sanitizeFileName(image.name)}`;
          const { error: uploadError } = await serviceSupabase.storage.from("plant-images").upload(filePath, image, {
            contentType: image.type,
            upsert: false
          });

          if (uploadError) throw new Error(uploadError.message);
          uploadedPaths.push(filePath);

          const { data: publicUrl } = serviceSupabase.storage.from("plant-images").getPublicUrl(filePath);
          const sortOrder = index === featuredImageIndex ? 0 : index < featuredImageIndex ? index + 1 : index;

          return {
            plant_id: plant.id,
            src: publicUrl.publicUrl,
            alt: `${name} plant photo ${index + 1}`,
            sort_order: sortOrder
          };
        })
      );

      const { error: imageError } = await serviceSupabase.from("plant_images").insert(imageRows);
      if (imageError) throw new Error(imageError.message);
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await serviceSupabase.storage.from("plant-images").remove(uploadedPaths);
      }
      await serviceSupabase.from("plants").delete().eq("id", plant.id);
      throw error;
    }

    revalidatePath("/");
    revalidatePath("/plants");
    revalidatePath(`/plants/${plant.slug}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create plant listing.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?created=1");
}
