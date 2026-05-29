import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { type PokemonBasic } from "@/lib/pokemon";
import { useAllPokemonNames, type PokemonNameEntry } from "@/hooks/useAllPokemonNames";

interface SearchSectionProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

const SearchSection = ({ pokemon, onSelect }: SearchSectionProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: allNames = [], isLoading } = useAllPokemonNames();

  const setQuery = (v: string) => {
    const params = new URLSearchParams(searchParams);
    if (v) params.set("q", v);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };

  // Merge loaded basics (for types) with the full name index
  const merged = useMemo(() => {
    const map = new Map<number, PokemonNameEntry & { types?: string[]; sprite: string }>();
    allNames.forEach((p) => map.set(p.id, { ...p }));
    pokemon.forEach((p) => {
      const existing = map.get(p.id);
      map.set(p.id, {
        id: p.id,
        name: p.name,
        sprite: p.sprite || existing?.sprite || "",
        types: p.types,
      });
    });
    return Array.from(map.values());
  }, [allNames, pokemon]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const isNum = /^\d+$/.test(q);
    return merged
      .filter((p) => {
        if (isNum) return String(p.id).includes(q);
        return (
          p.name.includes(q) ||
          String(p.id).includes(q) ||
          (p.types?.some((t) => t.includes(q)) ?? false)
        );
      })
      .sort((a, b) => {
        // Exact / starts-with first
        const an = a.name.startsWith(q) ? 0 : 1;
        const bn = b.name.startsWith(q) ? 0 : 1;
        if (an !== bn) return an - bn;
        return a.id - b.id;
      })
      .slice(0, 60);
  }, [query, merged]);

  return (
    <section id="search-section" className="relative py-16 px-4 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
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
          SEARCH ALL {allNames.length || 1025} POKÉMON BY NAME OR NUMBER
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
              id="pokedex-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. pikachu, 25, char…"
              className="w-full pl-12 pr-12 py-4 bg-muted/30 border border-border rounded-xl font-pixel text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <div className="absolute inset-0 scanline-overlay pointer-events-none rounded-xl opacity-10" />
          {query && (
            <p className="font-pixel text-[8px] text-muted-foreground mt-2 text-center">
              {results.length} RESULT{results.length === 1 ? "" : "S"}
              {results.length === 60 ? " (SHOWING TOP 60)" : ""}
            </p>
          )}
        </motion.div>

        {/* Results — lightweight grid */}
        {results.length > 0 && (
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {results.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="group relative flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/40 hover:border-primary/50 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-pixel text-[7px] text-muted-foreground">
                  #{String(p.id).padStart(4, "0")}
                </span>
                <img
                  src={p.sprite}
                  alt={p.name}
                  loading="lazy"
                  className="w-16 h-16 object-contain group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] transition-all"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <span className="font-pixel text-[8px] text-foreground capitalize text-center truncate w-full">
                  {p.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {query && !isLoading && results.length === 0 && (
          <p className="font-pixel text-[10px] text-center text-muted-foreground mt-4">
            NO POKÉMON FOUND
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
