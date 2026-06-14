import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Share2, QrCode, AlertTriangle, Link as LinkIcon, ChevronLeft, ChevronRight, Volume2, VolumeX, GitCompare, Scale } from "lucide-react";
import QRCode from "react-qr-code";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePokemonDetail } from "@/hooks/usePokemon";
import { useAllPokemonNames } from "@/hooks/useAllPokemonNames";
import { getTypeColor, getTypeGradient } from "@/lib/pokemon";
import { useSettings } from "@/contexts/SettingsContext";
import { trackView } from "@/lib/viewTracker";
import { sfx, setSfxMuted, isSfxMuted } from "@/lib/sfx";
import { setDynamicTheme, resetDynamicTheme } from "@/lib/dynamicTheme";
import { useTeam } from "@/contexts/TeamContext";
import { getDefensiveMultipliers } from "@/lib/typeMatchup";
import TypePixelIcon from "./ui/TypePixelIcon";

interface PokemonModalProps {
  pokemonId: number | null;
  invalidId?: string | null;
  onClose: () => void;
  onNavigate?: (id: number) => void;
  onGoToSearch?: (prefill?: string) => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SP.ATK",
  "special-defense": "SP.DEF",
  speed: "SPD",
};

const MIN_ID = 1;
const MAX_ID = 1025;

const PokemonModal = ({ pokemonId, invalidId, onClose, onNavigate, onGoToSearch }: PokemonModalProps) => {
  const isInvalid = pokemonId === -1;
  const fetchId = isInvalid ? null : pokemonId;
  const { data: pokemon, isLoading } = usePokemonDetail(fetchId);
  const { shiny } = useSettings();
  const { isAdded, addToTeam, removeFromTeam } = useTeam();
  const location = useLocation();
  const [showQR, setShowQR] = useState(false);
  const [muted, setMutedState] = useState(isSfxMuted());
  const [activeTab, setActiveTab] = useState<"stats" | "moves">("stats");
  const [compareMode, setCompareMode] = useState(false);
  const [compareId, setCompareId] = useState<number | null>(null);
  const [compareSearch, setCompareSearch] = useState("");
  const { data: comparePokemon, isLoading: isCompareLoading } = usePokemonDetail(compareId);
  const { data: allNames = [] } = useAllPokemonNames();

  const filteredSearch = useMemo(() => {
    const q = compareSearch.trim().toLowerCase();
    if (!q) return [];
    return allNames
      .filter((p) => p.name.includes(q) || String(p.id) === q)
      .slice(0, 5);
  }, [compareSearch, allNames]);

  useEffect(() => {
    setActiveTab("stats");
    setCompareMode(false);
    setCompareId(null);
    setCompareSearch("");
  }, [pokemonId]);

  const toggleMute = () => {
    const next = !muted;
    setSfxMuted(next);
    setMutedState(next);
  };

  const buildShareUrl = (id: number) =>
    `${window.location.origin}/pokemon/${id}${location.search}`;

  const goPrev = () => {
    if (!pokemonId || pokemonId <= MIN_ID || !onNavigate) return;
    sfx.prev();
    onNavigate(pokemonId - 1);
  };
  const goNext = () => {
    if (!pokemonId || pokemonId >= MAX_ID || !onNavigate) return;
    sfx.next();
    onNavigate(pokemonId + 1);
  };
  const handleClose = () => {
    sfx.close();
    onClose();
  };

  useEffect(() => {
    if (pokemonId && !isInvalid) {
      trackView(pokemonId);
      sfx.select();
    }
  }, [pokemonId, isInvalid]);

  useEffect(() => {
    setShowQR(false);
  }, [pokemonId]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (pokemon) {
      setDynamicTheme(pokemon.types);
      if (pokemon.cries?.latest) {
        t = setTimeout(() => sfx.playCry(pokemon.cries!.latest), 350);
      }
    }
    return () => {
      if (t) clearTimeout(t);
      resetDynamicTheme();
    };
  }, [pokemon]);

  useEffect(() => {
    if (!pokemonId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  return (
    <AnimatePresence>
      {pokemonId && (
        <motion.div
          data-modal-open="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={handleClose}
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
                  {invalidId && (
                    <>
                      {" "}
                      <span className="text-foreground">"{invalidId}"</span> isn't a valid ID.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <button
                    onClick={handleClose}
                    className="font-pixel text-[10px] px-5 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
                  >
                    BACK TO POKÉDEX
                  </button>
                  {onGoToSearch && (
                    <button
                      onClick={() => onGoToSearch(invalidId ?? undefined)}
                      className="font-pixel text-[10px] px-5 py-2 rounded-lg bg-secondary/20 border border-secondary/50 text-secondary hover:bg-secondary/30 transition-colors"
                    >
                      GO TO SEARCH
                    </button>
                  )}
                </div>
                <button
                  onClick={handleClose}
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

                {/* Prev / Next nav arrows */}
                {onNavigate && (
                  <>
                    <button
                      onClick={goPrev}
                      onMouseEnter={() => !muted && sfx.hover()}
                      disabled={pokemon.id <= MIN_ID}
                      title="Previous Pokémon (←)"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-muted/60 hover:bg-primary/30 hover:scale-110 transition-all text-foreground disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goNext}
                      onMouseEnter={() => !muted && sfx.hover()}
                      disabled={pokemon.id >= MAX_ID}
                      title="Next Pokémon (→)"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-muted/60 hover:bg-primary/30 hover:scale-110 transition-all text-foreground disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Action buttons */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    title={muted ? "Unmute SFX" : "Mute SFX"}
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                  >
                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
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
                      const url = buildShareUrl(pokemon.id);
                      try {
                        await navigator.clipboard.writeText(url);
                        toast.success("Link copied!", { description: url });
                      } catch {
                        toast.error("Could not copy link", { description: url });
                      }
                    }}
                    title="Copy link"
                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-foreground"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      const url = buildShareUrl(pokemon.id);
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
                    onClick={() => {
                      setCompareMode((v) => !v);
                      !muted && sfx.select();
                    }}
                    title={compareMode ? "Show details" : "Compare Pokémon"}
                    className={`p-2 rounded-lg transition-colors text-foreground ${
                      compareMode ? "bg-primary/30" : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <GitCompare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleClose}
                    title="Close (Esc)"
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
                          value={buildShareUrl(pokemon.id)}
                          size={128}
                        />
                      </div>
                      <span className="font-pixel text-[7px] text-muted-foreground">
                        SCAN TO OPEN
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {compareMode ? (
                  <div className="relative z-10 p-6 md:p-8 space-y-6">
                    {/* Compare Mode Header */}
                    <div className="flex items-center justify-between border-b border-border/30 pb-4">
                      <div className="flex flex-col">
                        <span className="font-pixel text-[8px] text-accent text-glow-cyan mb-1.5">COMPARE MODE</span>
                        <h3 className="font-pixel text-xs text-foreground">SIDE-BY-SIDE ANALYZER</h3>
                      </div>
                      <button
                        onClick={() => setCompareMode(false)}
                        className="font-pixel text-[7px] px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                      >
                        ◀ BACK TO DETAILS
                      </button>
                    </div>

                    {/* Compare Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Pokemon A */}
                      <div className="glass-card p-5 flex flex-col items-center justify-center text-center relative">
                        <span className="absolute top-4 left-4 font-pixel text-[8px] text-muted-foreground">
                          #{String(pokemon.id).padStart(3, "0")}
                        </span>
                        <img
                          src={shiny ? pokemon.shinyOfficialArtwork : pokemon.officialArtwork}
                          alt={pokemon.name}
                          className="w-32 h-32 object-contain"
                          style={{
                            filter: `drop-shadow(0 0 20px hsl(${getTypeColor(pokemon.types[0])} / 0.45))`,
                          }}
                        />
                        <h4 className="font-pixel text-[10px] text-foreground capitalize mt-3">{pokemon.name}</h4>
                        <div className="flex gap-1.5 mt-2">
                          {pokemon.types.map((type) => (
                            <span
                              key={type}
                              className="type-badge text-[8px] px-2 py-0.5 flex items-center gap-1"
                              style={{
                                backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                                color: `hsl(${getTypeColor(type)})`,
                                border: `1px solid hsl(${getTypeColor(type)} / 0.4)`,
                              }}
                            >
                              <TypePixelIcon type={type} className="w-2 h-2" glow={false} />
                              <span className="capitalize">{type}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Pokemon B */}
                      <div className="glass-card p-5 flex flex-col items-center justify-center text-center relative min-h-[200px]">
                        {compareId ? (
                          isCompareLoading || !comparePokemon ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setCompareId(null);
                                  setCompareSearch("");
                                  !muted && sfx.close();
                                }}
                                className="absolute top-4 right-4 p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/25 text-destructive font-pixel text-[8px] line-none"
                                title="Clear comparison"
                              >
                                ✕
                              </button>
                              <span className="absolute top-4 left-4 font-pixel text-[8px] text-muted-foreground">
                                #{String(comparePokemon.id).padStart(3, "0")}
                              </span>
                              <img
                                src={shiny ? comparePokemon.shinyOfficialArtwork : comparePokemon.officialArtwork}
                                alt={comparePokemon.name}
                                className="w-32 h-32 object-contain"
                                style={{
                                  filter: `drop-shadow(0 0 20px hsl(${getTypeColor(comparePokemon.types[0])} / 0.45))`,
                                }}
                              />
                              <h4 className="font-pixel text-[10px] text-foreground capitalize mt-3">{comparePokemon.name}</h4>
                              <div className="flex gap-1.5 mt-2">
                                {comparePokemon.types.map((type) => (
                                  <span
                                    key={type}
                                    className="type-badge text-[8px] px-2 py-0.5 flex items-center gap-1"
                                    style={{
                                      backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                                      color: `hsl(${getTypeColor(type)})`,
                                      border: `1px solid hsl(${getTypeColor(type)} / 0.4)`,
                                    }}
                                  >
                                    <TypePixelIcon type={type} className="w-2 h-2" glow={false} />
                                    <span className="capitalize">{type}</span>
                                  </span>
                                ))}
                              </div>
                            </>
                          )
                        ) : (
                          <div className="w-full py-4 flex flex-col items-center justify-center">
                            <span className="font-pixel text-[8px] text-muted-foreground mb-3">SELECT POKÉMON B</span>
                            <div className="relative w-full max-w-xs">
                              <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={compareSearch}
                                onChange={(e) => setCompareSearch(e.target.value)}
                                className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl font-pixel text-[8px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all text-center"
                              />
                              {compareSearch.trim().length > 0 && filteredSearch.length > 0 && (
                                <div className="absolute left-0 right-0 top-11 z-30 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                                  {filteredSearch.map((p) => (
                                    <button
                                      key={p.id}
                                      onClick={() => {
                                        setCompareId(p.id);
                                        setCompareSearch("");
                                        !muted && sfx.select();
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/80 transition-colors text-left"
                                    >
                                      <img src={p.sprite} alt="" className="w-6 h-6 object-contain" style={{ imageRendering: "pixelated" }} />
                                      <span className="font-pixel text-[7px] capitalize text-foreground">{p.name}</span>
                                      <span className="font-pixel text-[6px] text-muted-foreground ml-auto">#{p.id}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Both Selected Comparisons */}
                    {comparePokemon && (
                      <div className="space-y-6 border-t border-border/30 pt-6">
                        
                        {/* 1. Size Comparison */}
                        <div className="glass-card p-5">
                          <h4 className="font-pixel text-[8px] text-muted-foreground text-center mb-4">SIZE COMPARISON</h4>
                          <div className="flex items-end justify-center gap-12 h-36 relative px-4">
                            {/* Left Pokemon */}
                            <div className="flex flex-col items-center justify-end h-full">
                              <img
                                src={shiny ? pokemon.shinyOfficialArtwork : pokemon.officialArtwork}
                                alt=""
                                className="object-contain max-w-[120px]"
                                style={{
                                  height: (() => {
                                    const hA = pokemon.height / 10;
                                    const hB = comparePokemon.height / 10;
                                    const maxH = Math.max(1.7, hA, hB);
                                    return `${(hA / maxH) * 110}px`;
                                  })(),
                                  filter: `drop-shadow(0 0 10px hsl(${getTypeColor(pokemon.types[0])} / 0.5)) brightness(0) opacity(0.35)`,
                                }}
                              />
                              <span className="font-pixel text-[6px] text-muted-foreground mt-2">{pokemon.height / 10}m</span>
                            </div>

                            {/* Human Trainer */}
                            <div className="flex flex-col items-center justify-end h-full">
                              <svg
                                className="text-muted-foreground/25 w-12"
                                style={{
                                  height: (() => {
                                    const hA = pokemon.height / 10;
                                    const hB = comparePokemon.height / 10;
                                    const maxH = Math.max(1.7, hA, hB);
                                    return `${(1.7 / maxH) * 110}px`;
                                  })()
                                }}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 7h-1v4h-1v8h-4v-8h-1V9H8V7c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2z" />
                              </svg>
                              <span className="font-pixel text-[6px] text-muted-foreground/45 mt-2">Trainer (1.7m)</span>
                            </div>

                            {/* Right Pokemon */}
                            <div className="flex flex-col items-center justify-end h-full">
                              <img
                                src={shiny ? comparePokemon.shinyOfficialArtwork : comparePokemon.officialArtwork}
                                alt=""
                                className="object-contain max-w-[120px]"
                                style={{
                                  height: (() => {
                                    const hA = pokemon.height / 10;
                                    const hB = comparePokemon.height / 10;
                                    const maxH = Math.max(1.7, hA, hB);
                                    return `${(hB / maxH) * 110}px`;
                                  })(),
                                  filter: `drop-shadow(0 0 10px hsl(${getTypeColor(comparePokemon.types[0])} / 0.5)) brightness(0) opacity(0.35)`,
                                }}
                              />
                              <span className="font-pixel text-[6px] text-muted-foreground mt-2">{comparePokemon.height / 10}m</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Stats Head-to-Head */}
                        <div className="glass-card p-5 space-y-3">
                          <h4 className="font-pixel text-[8px] text-muted-foreground text-center mb-4">BASE STATS VS</h4>
                          {pokemon.stats.map((stat) => {
                            const valA = stat.value;
                            const valB = comparePokemon.stats.find((s) => s.name === stat.name)?.value || 0;
                            const label = STAT_LABELS[stat.name] || stat.name;
                            
                            const maxVal = 255;
                            const pctA = (valA / maxVal) * 100;
                            const pctB = (valB / maxVal) * 100;
                            
                            return (
                              <div key={stat.name} className="flex items-center gap-3 font-pixel">
                                {/* Left value */}
                                <span className="text-[9px] w-8 text-right text-foreground font-body">{valA}</span>
                                
                                {/* Left Bar (anchored right) */}
                                <div className="flex-1 h-3 bg-muted/30 rounded-l-md overflow-hidden flex justify-end">
                                  <motion.div
                                    className="h-full rounded-l-md"
                                    style={{
                                      backgroundColor: `hsl(${getTypeColor(pokemon.types[0])})`,
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${pctA}%` }}
                                    transition={{ duration: 0.6 }}
                                  />
                                </div>

                                {/* Stat Name Label */}
                                <span className="text-[7px] text-muted-foreground w-16 text-center whitespace-nowrap bg-muted/60 py-1 rounded-md border border-border/30">
                                  {label}
                                </span>

                                {/* Right Bar (anchored left) */}
                                <div className="flex-1 h-3 bg-muted/30 rounded-r-md overflow-hidden flex justify-start">
                                  <motion.div
                                    className="h-full rounded-r-md"
                                    style={{
                                      backgroundColor: `hsl(${getTypeColor(comparePokemon.types[0])})`,
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${pctB}%` }}
                                    transition={{ duration: 0.6 }}
                                  />
                                </div>

                                {/* Right value */}
                                <span className="text-[9px] w-8 text-left text-foreground font-body">{valB}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* 3. Defensive Matchup Analysis */}
                        <div className="glass-card p-5">
                          <h4 className="font-pixel text-[8px] text-muted-foreground text-center mb-4">DEFENSIVE MATCHUPS</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(() => {
                              const multsA = getDefensiveMultipliers(pokemon.types);
                              const multsB = getDefensiveMultipliers(comparePokemon.types);
                              
                              return Object.keys(multsA).map((type) => {
                                const mA = multsA[type];
                                const mB = multsB[type];
                                
                                return (
                                  <div key={type} className="flex flex-col p-2 bg-muted/15 border border-border/20 rounded-lg text-center font-pixel text-[6px]">
                                    <span className="capitalize text-foreground mb-1">{type}</span>
                                    <div className="grid grid-cols-2 gap-1 font-body text-[8px]">
                                      <span className={`${mA > 1 ? "text-destructive" : mA < 1 ? "text-pixel-green font-semibold" : "text-muted-foreground"}`}>
                                        {mA === 0.5 ? "½" : mA === 0.25 ? "¼" : mA}x
                                      </span>
                                      <span className={`${mB > 1 ? "text-destructive" : mB < 1 ? "text-pixel-green font-semibold" : "text-muted-foreground"}`}>
                                        {mB === 0.5 ? "½" : mB === 0.25 ? "¼" : mB}x
                                      </span>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                ) : (
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
                          <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                            {pokemon.evolutionChain.map((evo, i) => (
                              <div key={evo.id} className="flex items-center gap-2 md:gap-4">
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
                                  <div className="flex flex-col items-center justify-center min-w-[50px] relative px-1">
                                    {/* SVG Connector with running dash animation */}
                                    <svg className="w-12 h-6 overflow-visible" viewBox="0 0 48 24">
                                      <path
                                        d="M 0 12 L 48 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-muted-foreground/30"
                                      />
                                      <path
                                        d="M 0 12 L 48 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        className="text-primary animate-[dash_1s_linear_infinite]"
                                      />
                                      <polygon
                                        points="42,8 48,12 42,16"
                                        fill="currentColor"
                                        className="text-primary"
                                      />
                                    </svg>
                                    {/* Condition text */}
                                    <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                      {(() => {
                                        const nextEvo = pokemon.evolutionChain[i + 1];
                                        if (!nextEvo) return null;
                                        if (nextEvo.minLevel) {
                                          return (
                                            <span className="font-pixel text-[5px] text-accent block tracking-tighter">
                                              LVL {nextEvo.minLevel}
                                            </span>
                                          );
                                        }
                                        if (nextEvo.triggerName === "use-item" && nextEvo.itemName) {
                                          return (
                                            <span className="font-pixel text-[4.5px] text-secondary block tracking-tighter capitalize max-w-[50px] truncate" title={nextEvo.itemName}>
                                              {nextEvo.itemName}
                                            </span>
                                          );
                                        }
                                        if (nextEvo.triggerName === "trade") {
                                          return (
                                            <span className="font-pixel text-[5px] text-primary block tracking-tighter">
                                              TRADE
                                            </span>
                                          );
                                        }
                                        return (
                                          <span className="font-pixel text-[5px] text-muted-foreground block tracking-tighter">
                                            AUTO
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
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
                        <div className="flex items-center gap-3 mt-1">
                          <h2 className="font-pixel text-xl md:text-2xl text-foreground capitalize">
                            {pokemon.name}
                          </h2>
                          {pokemon.cries?.latest && (
                            <button
                              onClick={() => sfx.playCry(pokemon.cries!.latest)}
                              title="Play Cry"
                              className="p-1.5 rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Types */}
                      <div className="flex gap-2 flex-wrap items-center">
                        {pokemon.types.map((type) => (
                          <span
                            key={type}
                            className="type-badge text-[10px] px-4 py-1.5 flex items-center gap-1.5"
                            style={{
                              backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                              color: `hsl(${getTypeColor(type)})`,
                              border: `1px solid hsl(${getTypeColor(type)} / 0.4)`,
                            }}
                          >
                            <TypePixelIcon type={type} className="w-2.5 h-2.5" glow={false} />
                            <span className="capitalize">{type}</span>
                          </span>
                        ))}
                        
                        {/* Team Builder Button */}
                        <button
                          onClick={() => {
                            if (isAdded(pokemon.id)) {
                              removeFromTeam(pokemon.id);
                            } else {
                              addToTeam(pokemon.id);
                            }
                            !muted && sfx.select();
                          }}
                          className={`font-pixel text-[7px] px-3 py-1.5 rounded-lg border transition-all md:ml-auto ${
                            isAdded(pokemon.id)
                              ? "bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30"
                              : "bg-pixel-green/20 border-pixel-green/50 text-pixel-green hover:bg-pixel-green/30"
                          }`}
                        >
                          {isAdded(pokemon.id) ? "REMOVE FROM TEAM ✕" : "ADD TO TEAM +"}
                        </button>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex border-b border-border/40 font-pixel text-[8px] gap-2 pb-1">
                        <button
                          onClick={() => {
                            setActiveTab("stats");
                            !muted && sfx.hover();
                          }}
                          className={`pb-1.5 px-2 border-b-2 transition-all ${
                            activeTab === "stats"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          STATS & INFO
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("moves");
                            !muted && sfx.hover();
                          }}
                          className={`pb-1.5 px-2 border-b-2 transition-all ${
                            activeTab === "moves"
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          MOVE SET ({pokemon.moves.length})
                        </button>
                      </div>

                      {activeTab === "stats" ? (
                        <div className="space-y-5">
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
                      ) : (
                        /* Moves Tab */
                        <div className="space-y-4">
                          <div className="font-pixel text-[7px] text-muted-foreground grid grid-cols-3 border-b border-border/30 pb-2 px-1">
                            <span>MOVE</span>
                            <span className="text-center">METHOD</span>
                            <span className="text-right">LEVEL</span>
                          </div>
                          <div className="max-h-[280px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                            {pokemon.moves.map((move, i) => (
                              <div key={i} className="grid grid-cols-3 items-center py-2 px-1 bg-muted/15 hover:bg-muted/30 border border-border/20 rounded-lg transition-colors font-body text-xs">
                                <span className="capitalize font-medium text-foreground">{move.name}</span>
                                <span className="text-center font-pixel text-[6px] text-muted-foreground uppercase">
                                  <span className={`px-1.5 py-0.5 rounded border ${
                                    move.method === "level-up" ? "bg-accent/10 border-accent/30 text-accent" :
                                    move.method === "machine" ? "bg-secondary/10 border-secondary/30 text-secondary" :
                                    move.method === "egg" ? "bg-primary/10 border-primary/30 text-primary" :
                                    "bg-muted border-border text-muted-foreground"
                                  }`}>
                                    {move.method === "level-up" ? "lvl" : move.method}
                                  </span>
                                </span>
                                <span className="text-right font-pixel text-[7px] text-foreground">
                                  {move.level > 0 ? `Lvl ${move.level}` : "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
