import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTopViewed } from "@/hooks/useViews";
import { type PokemonBasic } from "@/lib/pokemon";
import { useSettings } from "@/contexts/SettingsContext";

interface LeaderboardProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

const Leaderboard = ({ pokemon, onSelect }: LeaderboardProps) => {
  const top = useTopViewed(10);
  const { shiny } = useSettings();

  if (top.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-pixel text-base md:text-lg text-secondary text-glow-yellow mb-3 flex items-center justify-center gap-3">
            <Trophy className="w-5 h-5" /> TRAINER CHARTS
          </h2>
          <p className="font-pixel text-[8px] text-muted-foreground">
            VIEW POKÉMON TO BUILD YOUR LEADERBOARD
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-pixel text-base md:text-lg text-center mb-2 text-secondary text-glow-yellow flex items-center justify-center gap-3"
        >
          <Trophy className="w-5 h-5" /> TRAINER CHARTS
        </motion.h2>
        <p className="font-pixel text-[8px] text-center text-muted-foreground mb-6">
          MOST VIEWED POKÉMON
        </p>

        <div className="glass-card p-4 md:p-6 space-y-2">
          {top.map((entry, i) => {
            const p = pokemon.find((x) => x.id === entry.id);
            if (!p) return null;
            const sprite = shiny
              ? p.shinyAnimatedSprite || p.shinySprite
              : p.animatedSprite || p.sprite;
            return (
              <motion.button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="w-full flex items-center gap-4 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/50 hover:border-primary/40 transition-all text-left group"
              >
                <span
                  className={`font-pixel text-xs w-8 text-center ${
                    i === 0
                      ? "text-secondary text-glow-yellow"
                      : i < 3
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <img
                  src={sprite}
                  alt={p.name}
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[10px] text-foreground capitalize truncate">
                    {p.name}
                  </p>
                  <p className="font-pixel text-[7px] text-muted-foreground">
                    #{String(p.id).padStart(3, "0")}
                  </p>
                </div>
                <span className="font-pixel text-[9px] text-accent">
                  {entry.count} {entry.count === 1 ? "VIEW" : "VIEWS"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
