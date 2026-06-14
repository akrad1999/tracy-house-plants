import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PlantCatalog } from "@/components/PlantCatalog";
import { getPlants } from "@/lib/plants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Plant Catalog",
  description: "Browse available plants from Tracy House Plants."
};

export default async function PlantsPage() {
  const plants = await getPlants();

  return (
    <>
      <PageHero
        eyebrow="Plants"
        title="Pickup-ready plants"
        description="Small plants, simple pickup."
      />
      <PlantCatalog plants={plants} />
    </>
  );
}
