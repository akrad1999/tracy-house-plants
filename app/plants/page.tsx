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
        eyebrow="Catalog"
        title="Browse pickup-ready houseplants"
        description="Search locally available plants by name, care style, or light needs."
      />
      <PlantCatalog plants={plants} />
    </>
  );
}
