import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Share2, QrCode, AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
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

const PokemonModal = ({ pokemonId, onClose, onNavigate }: PokemonModalProps) => {
  const isInvalid = pokemonId === -1;
  const fetchId = isInvalid ? null : pokemonId;
  const { data: pokemon, isLoading } = usePokemonDetail(fetchId);
  const { shiny } = useSettings();
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (pokemonId && !isInvalid) trackView(pokemonId);
  }, [pokemonId, isInvalid]);

  useEffect(() => {
    setShowQR(false);
  }, [pokemonId]);

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
            {isInvalid ? (
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-10 gap-4">
                <AlertTriangle className="w-12 h-12 text-primary" />
                <h2 className="font-pixel text-sm text-foreground">POKÉMON NOT FOUND</h2>
                <p className="font-body text-sm text-muted-foreground max-w-sm">
                  The link you opened doesn't match any Pokémon in the Pokédex.
                  Try searching or pick one from the collection.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 font-pixel text-[10px] px-5 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
                >
                  BACK TO POKÉDEX
                </button>
                <button
                  onClick={onClose}
                  title="Close"
                  className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : isLoading || !pokemon ? (
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

                {/* Action buttons */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={() => setShowQR((v) => !v)}
                    title="Show QR code"
                    className={`p-2 rounded-lg transition-colors text-foreground ${
                      showQR ? "bg-primary/30" : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/pokemon/${pokemon.id}`;
                      const showCopiedToast = () =>
                        toast.success("Link copied!", { description: url });
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: `Pokédex — ${pokemon.name}`,
                            text: `Check out ${pokemon.name} on Pokédex!`,
                            url,
                          });
                          toast.success("Link shared!", { description: url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          showCopiedToast();
                        }
                      } catch {
                        try {
                          await navigator.clipboard.writeText(url);
                          showCopiedToast();
                        } catch {
                          toast.error("Could not copy link", { description: url });
                        }
                      }
                    }}
                    title="Share link"
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    title="Close"
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* QR Code overlay */}
                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      className="absolute top-16 right-4 z-20 glass-card p-4 flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    >
                      <div className="bg-white p-2 rounded">
                        <QRCode
                          value={`${window.location.origin}/pokemon/${pokemon.id}`}
                          size={128}
                        />
                      </div>
                      <span className="font-pixel text-[7px] text-muted-foreground">
                        SCAN TO OPEN
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left - Image */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <motion.img
                        key={shiny ? "shiny" : "normal"}
                        src={shiny ? pokemon.shinyOfficialArtwork : pokemon.officialArtwork}
                        alt={pokemon.name}
                        className={`w-64 h-64 object-contain ${shiny ? "saturate-150" : ""}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                          filter: `drop-shadow(0 0 30px hsl(${
                            shiny ? "47 100% 55%" : getTypeColor(pokemon.types[0])
                          } / 0.5))`,
                        }}
                      />
                      {shiny && (
                        <Sparkles className="absolute top-2 right-2 w-6 h-6 text-secondary animate-pulse" />
                      )}
                    </div>

                    {/* Animated sprite */}
                    {pokemon.animatedSprite && pokemon.animatedSprite !== pokemon.sprite && (
                      <img
                        src={
                          shiny
                            ? pokemon.shinyAnimatedSprite || pokemon.shinySprite
                            : pokemon.animatedSprite
                        }
                        alt={`${pokemon.name} animated`}
                        className="w-20 h-20 mt-2"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}

                    {/* Evolution Chain — clickable mini-map */}
                    {pokemon.evolutionChain.length > 1 && (
                      <div className="mt-6 w-full">
                        <h4 className="font-pixel text-[10px] text-muted-foreground mb-3 text-center">
                          EVOLUTION MAP
                        </h4>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {pokemon.evolutionChain.map((evo, i) => (
                            <div key={evo.id} className="flex items-center gap-2">
                              <button
                                onClick={() => evo.id !== pokemon.id && onNavigate?.(evo.id)}
                                disabled={evo.id === pokemon.id}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                                  evo.id === pokemon.id
                                    ? "bg-primary/20 border border-primary/50 cursor-default"
                                    : "bg-muted/30 hover:bg-muted/60 hover:scale-110 cursor-pointer border border-transparent hover:border-primary/30"
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
                              </button>
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
