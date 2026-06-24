import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, Filter } from "lucide-react";
import { type PokemonBasic } from "@/lib/pokemon";
import { useAllPokemonNames, type PokemonNameEntry } from "@/hooks/useAllPokemonNames";
import { useTranslation } from "react-i18next";

interface SearchSectionProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

const GENERATIONS = [
  { labelKey: "filter.all_gens", max: 1025, min: 1 },
  { labelKey: "Gen 1 (Kanto)", max: 151, min: 1 },
  { labelKey: "Gen 2 (Johto)", max: 251, min: 152 },
  { labelKey: "Gen 3 (Hoenn)", max: 386, min: 252 },
  { labelKey: "Gen 4 (Sinnoh)", max: 493, min: 387 },
  { labelKey: "Gen 5 (Unova)", max: 649, min: 494 },
  { labelKey: "Gen 6 (Kalos)", max: 721, min: 650 },
  { labelKey: "Gen 7 (Alola)", max: 809, min: 722 },
  { labelKey: "Gen 8 (Galar)", max: 905, min: 810 },
  { labelKey: "Gen 9 (Paldea)", max: 1025, min: 906 },
];

const SortOptions = [
  { labelKey: "sort.id_asc", value: "id-asc" },
  { labelKey: "sort.id_desc", value: "id-desc" },
  { labelKey: "sort.name_asc", value: "name-asc" },
  { labelKey: "sort.name_desc", value: "name-desc" },
];

const SearchSection = ({ pokemon, onSelect }: SearchSectionProps) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const genFilter = searchParams.get("gen") ?? "filter.all_gens";
  const sortOrder = searchParams.get("sort") ?? "id-asc";
  const { data: allNames = [], isLoading } = useAllPokemonNames();

  const [showFilters, setShowFilters] = useState(false);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params, { replace: true });
  };

  const setQuery = (v: string) => updateParams({ q: v });

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
    let filtered = merged;
    const q = query.trim().toLowerCase();
    
    // Apply Generation Filter
    const gen = GENERATIONS.find(g => g.labelKey === genFilter);
    if (gen && gen.labelKey !== "filter.all_gens") {
      filtered = filtered.filter(p => p.id >= gen.min && p.id <= gen.max);
    }

    // Apply Search Query
    if (q) {
      const isNum = /^\d+$/.test(q);
      filtered = filtered.filter((p) => {
        if (isNum) return String(p.id).includes(q);
        return (
          p.name.includes(q) ||
          String(p.id).includes(q) ||
          (p.types?.some((t) => t.includes(q)) ?? false)
        );
      });
    }

    if (!q && genFilter === "filter.all_gens" && sortOrder === "id-asc") {
       return [];
    }

    // Sort Results
    filtered = filtered.sort((a, b) => {
      if (q) {
        const an = a.name.startsWith(q) ? 0 : 1;
        const bn = b.name.startsWith(q) ? 0 : 1;
        if (an !== bn) return an - bn;
      }
      
      switch (sortOrder) {
        case "id-desc": return b.id - a.id;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "id-asc":
        default:
          return a.id - b.id;
      }
    });

    return filtered.slice(0, 60);
  }, [query, merged, genFilter, sortOrder]);

  return (
    <section id="search-section" className="relative py-16 px-4 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-pixel text-lg md:text-xl text-center mb-2 text-secondary text-glow-yellow"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t("app.title")}
        </motion.h2>
        <motion.p
          className="font-pixel text-[8px] text-center text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t("app.search")}
        </motion.p>

        {/* Search input */}
        <motion.div
          className="relative max-w-xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="pokedex-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("app.placeholder")}
                className="w-full pl-12 pr-12 py-4 bg-muted/30 border border-border rounded-xl font-pixel text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-xl border transition-all ${
                showFilters || genFilter !== "filter.all_gens" || sortOrder !== "id-asc"
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute inset-0 scanline-overlay pointer-events-none rounded-xl opacity-10" />
          
          {/* Filters Dropdown */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-sm"
            >
              <div>
                <label className="block font-pixel text-[8px] text-muted-foreground mb-2">{t("filter.gen")}</label>
                <select
                  value={genFilter}
                  onChange={(e) => updateParams({ gen: e.target.value === "filter.all_gens" ? null : e.target.value })}
                  className="w-full min-h-[44px] bg-background border border-border/50 rounded-lg p-3 text-foreground focus:border-primary/50 outline-none"
                >
                  {GENERATIONS.map(g => (
                    <option key={g.labelKey} value={g.labelKey}>{t(g.labelKey, g.labelKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-pixel text-[8px] text-muted-foreground mb-2">{t("filter.sort")}</label>
                <select
                  value={sortOrder}
                  onChange={(e) => updateParams({ sort: e.target.value === "id-asc" ? null : e.target.value })}
                  className="w-full min-h-[44px] bg-background border border-border/50 rounded-lg p-3 text-foreground focus:border-primary/50 outline-none"
                >
                  {SortOptions.map(s => (
                    <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {(query || genFilter !== "filter.all_gens" || sortOrder !== "id-asc") && (
            <p className="font-pixel text-[8px] text-muted-foreground mt-4 text-center uppercase">
              {results.length === 1 ? t("app.results", { count: results.length }) : t("app.results_plural", { count: results.length })}
              {results.length === 60 ? ` ${t("app.showing_top")}` : ""}
            </p>
          )}
        </motion.div>

        {/* Results — lightweight grid */}
        {results.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {results.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="group relative flex flex-col items-center gap-1 p-3 min-h-[44px] rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/40 hover:border-primary/50 transition-all"
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

        {(query || genFilter !== "filter.all_gens" || sortOrder !== "id-asc") && !isLoading && results.length === 0 && (
          <p className="font-pixel text-[10px] text-center text-muted-foreground mt-8 uppercase">
            {t("app.no_pokemon_found")}
          </p>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
