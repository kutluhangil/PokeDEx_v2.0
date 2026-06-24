import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Trash2, Share2, QrCode, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { type PokemonBasic, getTypeColor } from "@/lib/pokemon";
import { useTeam } from "@/contexts/TeamContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getDefensiveMultipliers, TYPE_LIST } from "@/lib/typeMatchup";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface TeamBuilderProps {
  pokemonList: PokemonBasic[];
}

export default function TeamBuilder({ pokemonList }: TeamBuilderProps) {
  const { teamIds, removeFromTeam, clearTeam } = useTeam();
  const { shiny } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Resolve team members from IDs
  const teamMembers = useMemo(() => {
    return teamIds
      .map((id) => pokemonList.find((p) => p.id === id))
      .filter((p): p is PokemonBasic => !!p);
  }, [teamIds, pokemonList]);

  // Calculate defensive analysis (weaknesses and resistances)
  const defensiveAnalysis = useMemo(() => {
    const totals: Record<string, number> = {};
    TYPE_LIST.forEach((t) => {
      totals[t] = 0;
    });

    teamMembers.forEach((p) => {
      const mults = getDefensiveMultipliers(p.types);
      Object.entries(mults).forEach(([type, mult]) => {
        if (mult > 1.0) totals[type] += 1;
        else if (mult < 1.0) totals[type] -= 1;
      });
    });

    // Group types
    const weaknesses = Object.entries(totals)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]); // Strongest weaknesses first

    const resistances = Object.entries(totals)
      .filter(([_, score]) => score < 0)
      .sort((a, b) => a[1] - b[1]); // Strongest resistances first

    return { weaknesses, resistances };
  }, [teamMembers]);

  const shareUrl = useMemo(() => {
    if (teamIds.length === 0) return "";
    const origin = window.location.origin;
    return `${origin}/explore?team=${teamIds.join(",")}`;
  }, [teamIds]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Team link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  if (teamIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-6xl mx-auto w-full pointer-events-auto">
        <motion.div
          className="glass-card overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-primary/30"
          initial={{ y: 150 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
          {/* Header */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-6 py-3 bg-card/80 backdrop-blur-md cursor-pointer border-b border-border/40 select-none hover:bg-card transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-5 h-5 animate-spin-slow">
                <div className="absolute inset-0 rounded-full border-2 border-primary" />
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary rounded-t-full" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted rounded-b-full" />
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-background -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-background rounded-full -translate-x-1/2 -translate-y-1/2 border border-primary" />
              </div>
              <span className="font-pixel text-[10px] text-primary text-glow-red">
                TRAINER TEAM ({teamMembers.length}/6)
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Mini preview of team sprites */}
              <div className="flex -space-x-3 overflow-hidden">
                {teamMembers.map((p) => (
                  <img
                    key={p.id}
                    src={p.sprite}
                    alt={p.name}
                    className="w-8 h-8 object-contain drop-shadow"
                    style={{ imageRendering: "pixelated" }}
                  />
                ))}
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-card/95 backdrop-blur-lg overflow-y-auto max-h-[70vh] md:max-h-[50vh] border-t border-border/40"
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left & Middle - Slots */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-pixel text-[9px] text-muted-foreground">ACTIVE ROSTER</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const p = teamMembers[idx];
                        if (p) {
                          const sprite = shiny ? p.shinySprite : p.sprite;
                          return (
                            <div
                              key={p.id}
                              className="relative flex flex-col items-center p-3 rounded-xl bg-muted/20 border border-primary/20 hover:border-primary/40 transition-all group"
                            >
                              <button
                                onClick={() => removeFromTeam(p.id)}
                                className="absolute top-1 right-1 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground transition-all sm:opacity-0 group-hover:opacity-100"
                                title="Remove member"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <img
                                src={sprite}
                                alt={p.name}
                                className="w-14 h-14 object-contain mb-2"
                                style={{ imageRendering: "pixelated" }}
                              />
                              <span className="font-pixel text-[7px] text-foreground capitalize truncate w-full text-center">
                                {p.name}
                              </span>
                              <div className="flex gap-1 mt-1.5">
                                {p.types.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[5px] px-1 py-0.5 rounded border capitalize font-pixel"
                                    style={{
                                      backgroundColor: `hsl(${getTypeColor(t)} / 0.15)`,
                                      borderColor: `hsl(${getTypeColor(t)} / 0.3)`,
                                      color: `hsl(${getTypeColor(t)})`,
                                    }}
                                  >
                                    {t.substring(0, 3)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={idx}
                              className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border/60 bg-muted/5 min-h-[105px]"
                            >
                              <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center mb-2">
                                <span className="font-pixel text-[8px] text-muted-foreground/40">+</span>
                              </div>
                              <span className="font-pixel text-[6px] text-muted-foreground/40">EMPTY SLOT</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>

                  {/* Right - Analysis & Share */}
                  <div className="space-y-5 lg:border-l lg:border-border/30 lg:pl-6">
                    <div>
                      <h3 className="font-pixel text-[9px] text-muted-foreground mb-3">DEFENSIVE COVERAGE</h3>
                      
                      {/* Weaknesses */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-1.5 text-destructive font-pixel text-[7px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>WEAK AGAINST:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defensiveAnalysis.weaknesses.length > 0 ? (
                            defensiveAnalysis.weaknesses.map(([type, score]) => (
                              <span
                                key={type}
                                className="font-pixel text-[6px] px-2 py-1 rounded border capitalize"
                                style={{
                                  backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                                  borderColor: `hsl(${getTypeColor(type)} / 0.5)`,
                                  color: `hsl(${getTypeColor(type)})`,
                                }}
                                title={`Team has ${score} more weaknesses than resistances to ${type}`}
                              >
                                {type} +{score}
                              </span>
                            ))
                          ) : (
                            <span className="text-[8px] text-muted-foreground font-pixel">None</span>
                          )}
                        </div>
                      </div>

                      {/* Resistances */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-pixel-green font-pixel text-[7px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>RESISTANT TO:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {defensiveAnalysis.resistances.length > 0 ? (
                            defensiveAnalysis.resistances.map(([type, score]) => (
                              <span
                                key={type}
                                className="font-pixel text-[6px] px-2 py-1 rounded border capitalize"
                                style={{
                                  backgroundColor: `hsl(${getTypeColor(type)} / 0.25)`,
                                  borderColor: `hsl(${getTypeColor(type)} / 0.5)`,
                                  color: `hsl(${getTypeColor(type)})`,
                                }}
                                title={`Team has ${Math.abs(score)} more resistances than weaknesses to ${type}`}
                              >
                                {type} {score}
                              </span>
                            ))
                          ) : (
                            <span className="text-[8px] text-muted-foreground font-pixel">None</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions & Sharing */}
                    <div className="border-t border-border/30 pt-4 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyLink}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 min-h-[44px] bg-primary text-primary-foreground font-pixel text-[7px] rounded-lg hover:scale-[1.02] transition-transform"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>SHARE LINK</span>
                        </button>
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className={`px-3 min-h-[44px] rounded-lg border font-pixel text-[7px] flex items-center justify-center gap-1.5 transition-colors ${
                            showQR ? "bg-accent/20 border-accent/60 text-accent" : "bg-muted/30 border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR CODE</span>
                        </button>
                        <button
                          onClick={clearTeam}
                          title="Clear whole team"
                          className="px-3 min-h-[44px] flex items-center justify-center rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* QR Display */}
                      {showQR && (
                        <motion.div
                          className="p-3 bg-white rounded-lg flex flex-col items-center justify-center gap-2 max-w-[150px] mx-auto"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <QRCode value={shareUrl} size={90} />
                          <span className="text-[5px] font-pixel text-slate-800">SCAN TO LOAD TEAM</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
