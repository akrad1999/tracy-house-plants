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
    <section className="mx-auto max-w-5xl px-3 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#c8ba7e]/45 bg-[#f6f2eb]/75 p-3 shadow-sm sm:p-4">
        <label htmlFor="plant-search" className="text-xs font-black uppercase tracking-[0.2em] text-[#4e5026]">
          Search plants
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="plant-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Monstera, trailing, bright light..."
            className="min-h-11 flex-1 rounded-full border border-[#c8ba7e]/55 bg-white/70 px-4 text-sm text-[#49392c] outline-none transition placeholder:text-[#49392c]/40 focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
          />
          <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4e5026] px-4 text-sm font-bold text-[#f6f2eb]">
            {filteredPlants.length} result{filteredPlants.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {filteredPlants.map((plant) => (
          <PlantCard key={plant.slug} plant={plant} />
        ))}
      </div>

      {filteredPlants.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#c8ba7e]/25 bg-white/55 p-8 text-center">
          <p className="text-lg font-black text-[#4e5026]">No plants matched that search.</p>
          <p className="mt-2 text-sm text-[#49392c]/65">Try another plant name.</p>
        </div>
      ) : null}
    </section>
  );
}
