import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { type PokemonBasic } from "@/lib/pokemon";
import PokemonCard from "./PokemonCard";

interface SearchSectionProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

const SearchSection = ({ pokemon, onSelect }: SearchSectionProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return pokemon
      .filter(
        (p) =>
          p.name.includes(q) ||
          String(p.id).includes(q) ||
          p.types.some((t) => t.includes(q))
      )
      .slice(0, 20);
  }, [query, pokemon]);

  return (
    <section className="relative py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="font-pixel text-lg md:text-xl text-center mb-2 text-secondary text-glow-yellow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          POKÉDEX
        </motion.h2>
        <motion.p
          className="font-pixel text-[8px] text-center text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          SEARCH YOUR POKÉMON
        </motion.p>

        {/* Search input */}
        <motion.div
          className="relative max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your Pokémon…"
              className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-xl font-pixel text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          {/* Scanline effect on search area */}
          <div className="absolute inset-0 scanline-overlay pointer-events-none rounded-xl opacity-10" />
        </motion.div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {results.map((p, i) => (
              <PokemonCard key={p.id} pokemon={p} onClick={onSelect} index={i} />
            ))}
          </motion.div>
        )}

        {query && results.length === 0 && (
          <p className="font-pixel text-[10px] text-center text-muted-foreground mt-4">
            NO POKÉMON FOUND
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
