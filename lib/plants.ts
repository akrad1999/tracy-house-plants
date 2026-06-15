import { createClient } from "@supabase/supabase-js";

export type Plant = {
  id: string;
  slug: string;
  name: string;
  botanicalName: string;
  price: number;
  shortDescription: string;
  description: string;
  careLevel: "Easy" | "Moderate" | "Hard";
  light: string;
  water: string;
  size: string;
  potSize: number | null;
  humidity: string | null;
  inventory: number;
  featured: boolean;
  tags: string[];
  images: { src: string; alt: string }[];
};

type SupabasePlantRow = {
  id: string;
  slug: string;
  name: string;
  botanical_name: string;
  price_cents: number;
  short_description: string;
  description: string;
  care_level: Plant["careLevel"];
  light: string;
  water: string;
  size: string;
  pot_size: number | null;
  humidity: string | null;
  inventory: number;
  featured: boolean;
  tags: string[];
  plant_images: { src: string; alt: string; sort_order: number }[];
};

const plantSelect = `
  id,
  slug,
  name,
  botanical_name,
  price_cents,
  short_description,
  description,
  care_level,
  light,
  water,
  size,
  pot_size,
  humidity,
  inventory,
  featured,
  tags,
  plant_images (
    src,
    alt,
    sort_order
  )
`;

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });
}

function toPlant(row: SupabasePlantRow): Plant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    botanicalName: row.botanical_name,
    price: row.price_cents / 100,
    shortDescription: row.short_description,
    description: row.description,
    careLevel: row.care_level,
    light: row.light,
    water: row.water,
    size: row.size,
    potSize: row.pot_size,
    humidity: row.humidity,
    inventory: row.inventory,
    featured: row.featured,
    tags: row.tags,
    images: row.plant_images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({ src: image.src, alt: image.alt }))
  };
}

export async function getPlants() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("plants")
    .select(plantSelect)
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true })
    .order("sort_order", { foreignTable: "plant_images", ascending: true });

  if (error) throw new Error(`Failed to load plants: ${error.message}`);

  return (data as SupabasePlantRow[]).map(toPlant);
}

export async function getFeaturedPlants() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("plants")
    .select(plantSelect)
    .eq("active", true)
    .eq("featured", true)
    .order("name", { ascending: true })
    .order("sort_order", { foreignTable: "plant_images", ascending: true });

  if (error) throw new Error(`Failed to load featured plants: ${error.message}`);

  return (data as SupabasePlantRow[]).map(toPlant);
}

export async function getPlantBySlug(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("plants")
    .select(plantSelect)
    .eq("active", true)
    .eq("slug", slug)
    .order("sort_order", { foreignTable: "plant_images", ascending: true })
    .maybeSingle();

  if (error) throw new Error(`Failed to load plant: ${error.message}`);

  return data ? toPlant(data as SupabasePlantRow) : null;
}

export async function getPlantSlugs() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("plants").select("slug").eq("active", true);

  if (error) throw new Error(`Failed to load plant slugs: ${error.message}`);

  return data.map((plant) => plant.slug as string);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2
  }).format(price);
}
