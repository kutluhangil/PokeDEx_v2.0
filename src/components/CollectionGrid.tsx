import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { type PokemonBasic } from "@/lib/pokemon";
import PokemonCard from "./PokemonCard";

interface CollectionGridProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

type FilterMode = "all" | "gen1" | "gen2" | "gen3" | "legendary" | "mythical";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "gen1", label: "GEN I" },
  { key: "gen2", label: "GEN II" },
  { key: "gen3", label: "GEN III" },
  { key: "legendary", label: "LEGENDARY" },
  { key: "mythical", label: "MYTHICAL" },
];

const VALID: FilterMode[] = ["all", "gen1", "gen2", "gen3", "legendary", "mythical"];

const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const CollectionGrid = ({ pokemon, onSelect }: CollectionGridProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") as FilterMode | null;
  const filter: FilterMode = filterParam && VALID.includes(filterParam) ? filterParam : "all";

  const typesParam = searchParams.get("types") ?? "";
  const selectedTypes = useMemo(
    () => typesParam.split(",").filter((t) => ALL_TYPES.includes(t)),
    [typesParam]
  );

  const setFilter = (next: FilterMode) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    setSearchParams(params, { replace: true });
  };

  const toggleType = (type: string) => {
    const params = new URLSearchParams(searchParams);
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    if (next.length === 0) params.delete("types");
    else params.set("types", next.join(","));
    setSearchParams(params, { replace: true });
  };

  const clearTypes = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("types");
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = pokemon;
    switch (filter) {
      case "gen1": list = list.filter((p) => p.generation === 1); break;
      case "gen2": list = list.filter((p) => p.generation === 2); break;
      case "gen3": list = list.filter((p) => p.generation === 3); break;
      case "legendary": list = list.filter((p) => p.isLegendary); break;
      case "mythical": list = list.filter((p) => p.isMythical); break;
    }
    if (selectedTypes.length > 0) {
      list = list.filter((p) => p.types.some((t) => selectedTypes.includes(t)));
    }
    return list;
  }, [pokemon, filter, selectedTypes]);

  return (
    <section id="collection-section" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-pixel text-lg md:text-xl text-center mb-8 text-accent text-glow-cyan"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          COLLECTION
        </motion.h2>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`font-pixel text-[8px] px-4 py-2 rounded-lg border transition-all ${
                filter === f.key
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-muted/20 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Type Filters (multi-select) */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {ALL_TYPES.map((t) => {
            const active = selectedTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`font-pixel text-[7px] uppercase px-3 py-1.5 rounded-full border transition-all ${
                  active
                    ? "bg-secondary/30 border-secondary/60 text-secondary"
                    : "bg-muted/10 border-border text-muted-foreground hover:border-secondary/40 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              onClick={clearTypes}
              className="font-pixel text-[7px] px-3 py-1.5 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all"
            >
              CLEAR ✕
            </button>
          )}
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          layout
        >
          {filtered.map((p, i) => (
            <PokemonCard key={p.id} pokemon={p} onClick={onSelect} index={i} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="font-pixel text-[10px] text-center text-muted-foreground mt-8">
            NO POKÉMON IN THIS CATEGORY
          </p>
        )}
      </div>
    </section>
  );
};

export default CollectionGrid;
