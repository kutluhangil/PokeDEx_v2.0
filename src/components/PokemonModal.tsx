import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { usePokemonDetail } from "@/hooks/usePokemon";
import { getTypeColor, getTypeGradient } from "@/lib/pokemon";
import { useSettings } from "@/contexts/SettingsContext";
import { trackView } from "@/lib/viewTracker";

interface PokemonModalProps {
  pokemonId: number | null;
  onClose: () => void;
  onNavigate?: (id: number) => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.ATK",
  "special-defense": "SP.DEF",
  speed: "SPD",
};

const PokemonModal = ({ pokemonId, onClose }: PokemonModalProps) => {
  const { data: pokemon, isLoading } = usePokemonDetail(pokemonId);

  return (
    <AnimatePresence>
      {pokemonId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {isLoading || !pokemon ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* BG gradient */}
                <div
                  className="absolute inset-0 opacity-20 rounded-xl"
                  style={{ background: getTypeGradient(pokemon.types) }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left - Image */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.img
                      src={pokemon.officialArtwork}
                      alt={pokemon.name}
                      className="w-64 h-64 object-contain"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={{
                        filter: `drop-shadow(0 0 30px hsl(${getTypeColor(pokemon.types[0])} / 0.5))`,
                      }}
                    />

                    {/* Animated sprite */}
                    {pokemon.animatedSprite && pokemon.animatedSprite !== pokemon.sprite && (
                      <img
                        src={pokemon.animatedSprite}
                        alt={`${pokemon.name} animated`}
                        className="w-20 h-20 mt-2"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}

                    {/* Evolution Chain */}
                    {pokemon.evolutionChain.length > 1 && (
                      <div className="mt-6 w-full">
                        <h4 className="font-pixel text-[10px] text-muted-foreground mb-3 text-center">
                          EVOLUTION
                        </h4>
                        <div className="flex items-center justify-center gap-2">
                          {pokemon.evolutionChain.map((evo, i) => (
                            <div key={evo.id} className="flex items-center gap-2">
                              <div
                                className={`flex flex-col items-center p-2 rounded-lg ${
                                  evo.id === pokemon.id
                                    ? "bg-primary/20 border border-primary/30"
                                    : "bg-muted/30"
                                }`}
                              >
                                <img
                                  src={evo.sprite}
                                  alt={evo.name}
                                  className="w-12 h-12"
                                  style={{ imageRendering: "pixelated" }}
                                />
                                <span className="font-pixel text-[6px] capitalize mt-1 text-foreground">
                                  {evo.name}
                                </span>
                              </div>
                              {i < pokemon.evolutionChain.length - 1 && (
                                <span className="text-muted-foreground text-lg">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right - Info */}
                  <div className="space-y-5">
                    <div>
                      <span className="font-pixel text-xs text-muted-foreground">
                        #{String(pokemon.id).padStart(3, "0")}
                      </span>
                      <h2 className="font-pixel text-xl md:text-2xl text-foreground capitalize mt-1">
                        {pokemon.name}
                      </h2>
                    </div>

                    {/* Types */}
                    <div className="flex gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="type-badge text-[10px] px-4 py-1.5"
                          style={{
                            backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                            color: `hsl(${getTypeColor(type)})`,
                            border: `1px solid hsl(${getTypeColor(type)} / 0.4)`,
                          }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {pokemon.description}
                    </p>

                    {/* Physical */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <span className="font-pixel text-[8px] text-muted-foreground block">HEIGHT</span>
                        <span className="font-body text-sm text-foreground">{pokemon.height / 10} m</span>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <span className="font-pixel text-[8px] text-muted-foreground block">WEIGHT</span>
                        <span className="font-body text-sm text-foreground">{pokemon.weight / 10} kg</span>
                      </div>
                    </div>

                    {/* Abilities */}
                    <div>
                      <h4 className="font-pixel text-[10px] text-muted-foreground mb-2">ABILITIES</h4>
                      <div className="flex flex-wrap gap-2">
                        {pokemon.abilities.map((ability) => (
                          <span
                            key={ability}
                            className="px-3 py-1 bg-muted/40 rounded-full font-body text-xs capitalize text-foreground"
                          >
                            {ability.replace("-", " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <h4 className="font-pixel text-[10px] text-muted-foreground mb-3">BASE STATS</h4>
                      <div className="space-y-2">
                        {pokemon.stats.map((stat) => (
                          <div key={stat.name} className="flex items-center gap-3">
                            <span className="font-pixel text-[7px] text-muted-foreground w-14 text-right">
                              {STAT_LABELS[stat.name] || stat.name}
                            </span>
                            <span className="font-body text-xs text-foreground w-8 text-right">
                              {stat.value}
                            </span>
                            <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: `hsl(${getTypeColor(pokemon.types[0])})`,
                                  ["--stat-width" as string]: `${Math.min(100, (stat.value / 255) * 100)}%`,
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min(100, (stat.value / 255) * 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-20 rounded-xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PokemonModal;
