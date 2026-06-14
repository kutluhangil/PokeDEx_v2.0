import { Sparkles, Monitor, Shuffle, Tv } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface SettingsBarProps {
  onRandom: () => void;
}

const SettingsBar = ({ onRandom }: SettingsBarProps) => {
  const { theme, setTheme, shiny, setShiny, crt, setCrt } = useSettings();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRandom}
        title="Surprise me"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-all font-pixel text-[8px]"
      >
        <Shuffle className="w-3 h-3" />
        <span className="hidden sm:inline">RANDOM</span>
      </button>

      <button
        onClick={() => setShiny(!shiny)}
        title="Toggle shiny mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all font-pixel text-[8px] ${
          shiny
            ? "bg-secondary/20 border-secondary/50 text-secondary text-glow-yellow"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="hidden sm:inline">SHINY</span>
      </button>

      <button
        onClick={() => setTheme(theme === "neon" ? "ultra-retro" : "neon")}
        title="Toggle ultra retro mode"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all font-pixel text-[8px] ${
          theme === "ultra-retro"
            ? "bg-accent/20 border-accent/50 text-accent"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Monitor className="w-3 h-3" />
        <span className="hidden sm:inline">{theme === "ultra-retro" ? "RETRO" : "NEON"}</span>
      </button>

      <button
        onClick={() => setCrt(!crt)}
        title="Toggle CRT screen effect"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all font-pixel text-[8px] ${
          crt
            ? "bg-primary/20 border-primary/50 text-primary text-glow-red"
            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Tv className="w-3 h-3" />
        <span className="hidden sm:inline">CRT</span>
      </button>
    </div>
  );
};

export default SettingsBar;
