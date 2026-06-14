"use client";

import { useMemo, useState } from "react";
import { PlantCard } from "@/components/PlantCard";
import type { Plant } from "@/lib/plants";

type PlantCatalogProps = {
  plants: Plant[];
};

export function PlantCatalog({ plants }: PlantCatalogProps) {
  const [query, setQuery] = useState("");

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return plants;

    return plants.filter((plant) =>
      [plant.name, plant.botanicalName, plant.shortDescription, ...plant.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [plants, query]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-green-900/10 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="plant-search" className="text-sm font-black uppercase tracking-[0.2em] text-green-800">
          Search plants
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="plant-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try monstera, trailing, bright light..."
            className="min-h-12 flex-1 rounded-full border border-green-900/15 bg-[#fbf7ef] px-5 text-base text-green-950 outline-none transition placeholder:text-green-950/40 focus:border-green-800 focus:ring-4 focus:ring-green-900/10"
          />
          <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-950 px-5 text-sm font-bold text-white">
            {filteredPlants.length} result{filteredPlants.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} />
        ))}
      </div>

      {filteredPlants.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-green-900/20 bg-white p-8 text-center">
          <p className="text-lg font-black text-green-950">No plants matched that search.</p>
          <p className="mt-2 text-sm text-green-950/65">Try searching by plant name, care level, or light needs.</p>
        </div>
      ) : null}
    </section>
  );
}
