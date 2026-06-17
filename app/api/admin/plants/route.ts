import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const careLevels = ["Easy", "Moderate", "Hard"] as const;
const lightOptions = ["Low Light", "Bright Indirect", "Direct Sun"] as const;
const waterOptions = ["Keep Moist", "Twice Weekly", "Weekly", "Every 2-3 Weeks"] as const;
const potSizes = [4, 6, 8, 10, 12, 14, 16] as const;
const humidityOptions = ["Low Humidity", "Moderate Humidity", "High Humidity"] as const;

type PlantImagePayload = {
  src: string;
  storagePath: string;
  index: number;
};

type CreatePlantPayload = {
  slug?: string;
  name?: string;
  botanicalName?: string;
  priceCents?: string | number;
  shortDescription?: string;
  description?: string;
  careLevel?: string;
  light?: string;
  water?: string;
  size?: string;
  inventory?: string | number;
  featured?: boolean;
  active?: boolean;
  potSize?: string | number;
  humidity?: string;
  featuredImageIndex?: string | number;
  images?: PlantImagePayload[];
};

type AdminCreatePlantResponse = {
  ok: boolean;
  message: string;
  stage: string;
  requestId: string;
  slug?: string;
};

function jsonResponse(response: AdminCreatePlantResponse, status = 200) {
  return NextResponse.json(response, { status });
}

function logInfo(requestId: string, stage: string, details: Record<string, unknown> = {}) {
  console.info("[admin-create-plant]", { requestId, stage, ...details });
}

function logError(requestId: string, stage: string, error: unknown, details: Record<string, unknown> = {}) {
  console.error("[admin-create-plant]", {
    requestId,
    stage,
    error: error instanceof Error ? error.message : String(error),
    ...details
  });
}

function getRequiredString(payload: CreatePlantPayload, name: keyof CreatePlantPayload) {
  const value = String(payload[name] ?? "").trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function getInteger(payload: CreatePlantPayload, name: keyof CreatePlantPayload) {
  const value = Number.parseInt(String(payload[name] ?? ""), 10);
  if (!Number.isFinite(value)) throw new Error(`${name} must be a number.`);
  return value;
}

function getOption<T extends readonly (string | number)[]>(payload: CreatePlantPayload, name: keyof CreatePlantPayload, options: T): T[number] {
  const value = String(payload[name] ?? "").trim();
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

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let stage = "start";

  try {
    stage = "auth";
    logInfo(requestId, stage);
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return jsonResponse({ ok: false, message: "Please sign in before using admin tools.", stage, requestId }, 401);
    }

    if (!(await isAdminUser(supabase, user))) {
      return jsonResponse({ ok: false, message: "This account is not authorized for admin tools.", stage, requestId }, 403);
    }

    stage = "parse-json";
    logInfo(requestId, stage);
    const payload = (await request.json()) as CreatePlantPayload;
    const name = getRequiredString(payload, "name");
    const slug = slugify(getRequiredString(payload, "slug"));
    const botanicalName = getRequiredString(payload, "botanicalName");
    const priceCents = getInteger(payload, "priceCents");
    const shortDescription = getRequiredString(payload, "shortDescription");
    const description = getRequiredString(payload, "description");
    const careLevel = getOption(payload, "careLevel", careLevels);
    const light = getOption(payload, "light", lightOptions);
    const water = getOption(payload, "water", waterOptions);
    const size = getRequiredString(payload, "size");
    const inventory = getInteger(payload, "inventory");
    const potSize = getOption(payload, "potSize", potSizes);
    const humidity = getOption(payload, "humidity", humidityOptions);
    const featured = Boolean(payload.featured);
    const active = Boolean(payload.active);
    const requestedFeaturedImageIndex = Math.max(0, getInteger(payload, "featuredImageIndex"));
    const images = payload.images ?? [];

    if (!slug) throw new Error("Slug must contain letters or numbers.");
    if (priceCents < 0) throw new Error("Price cents must be 0 or greater.");
    if (inventory < 0) throw new Error("Inventory must be 0 or greater.");
    if (images.length === 0) throw new Error("Upload at least one plant image.");

    const featuredImageIndex = Math.min(requestedFeaturedImageIndex, images.length - 1);

    for (const image of images) {
      if (!image.src || !image.storagePath) throw new Error("Uploaded image metadata is missing.");
    }

    logInfo(requestId, "validated", {
      slug,
      imageCount: images.length,
      featuredImageIndex
    });

    stage = "service-client";
    const serviceSupabase = createSupabaseServiceRoleClient();

    stage = "insert-plant";
    logInfo(requestId, stage, { slug });
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

    const uploadedPaths = images.map((image) => image.storagePath);

    try {
      stage = "insert-image-rows";
      const imageRows = images.map((image, index) => {
        const sortOrder = index === featuredImageIndex ? 0 : index < featuredImageIndex ? index + 1 : index;

        return {
          plant_id: plant.id,
          src: image.src,
          alt: `${name} plant photo ${index + 1}`,
          sort_order: sortOrder
        };
      });
      logInfo(requestId, stage, { imageRows: imageRows.length });
      const { error: imageError } = await serviceSupabase.from("plant_images").insert(imageRows);
      if (imageError) throw new Error(imageError.message);
    } catch (error) {
      logError(requestId, stage, error, { slug, uploadedPaths });
      if (uploadedPaths.length > 0) {
        await serviceSupabase.storage.from("plant-images").remove(uploadedPaths);
      }
      await serviceSupabase.from("plants").delete().eq("id", plant.id);
      throw error;
    }

    stage = "revalidate";
    revalidatePath("/");
    revalidatePath("/plants");
    revalidatePath(`/plants/${plant.slug}`);
    logInfo(requestId, "success", { slug });

    return jsonResponse({ ok: true, message: "Plant listing created.", stage: "success", requestId, slug });
  } catch (error) {
    logError(requestId, stage, error);
    return jsonResponse(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to create plant listing.",
        stage,
        requestId
      },
      500
    );
  }
}
