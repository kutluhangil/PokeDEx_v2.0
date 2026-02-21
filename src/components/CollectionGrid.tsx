import { useState, useMemo } from "react";
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

const CollectionGrid = ({ pokemon, onSelect }: CollectionGridProps) => {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    switch (filter) {
      case "gen1": return pokemon.filter((p) => p.generation === 1);
      case "gen2": return pokemon.filter((p) => p.generation === 2);
      case "gen3": return pokemon.filter((p) => p.generation === 3);
      case "legendary": return pokemon.filter((p) => p.isLegendary);
      case "mythical": return pokemon.filter((p) => p.isMythical);
      default: return pokemon;
    }
  }, [pokemon, filter]);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-pixel text-lg md:text-xl text-center mb-8 text-accent text-glow-cyan"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          COLLECTION
        </motion.h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
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
