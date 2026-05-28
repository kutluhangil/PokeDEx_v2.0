import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { getTopViewed } from "@/lib/viewTracker";

const art = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const TrendingNow = () => {
  const [items, setItems] = useState<{ id: number; count: number; name?: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const top = getTopViewed(10);
      if (top.length === 0) return setItems([]);
      const enriched = await Promise.all(
        top.map(async (t) => {
          try {
            const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${t.id}`);
            const d = await r.json();
            return { ...t, name: d.name as string };
          } catch {
            return { ...t, name: `#${t.id}` };
          }
        })
      );
      setItems(enriched);
    };
    load();
    const handler = () => load();
    window.addEventListener("pokedex-views-updated", handler);
    return () => window.removeEventListener("pokedex-views-updated", handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pixel-green/40 bg-pixel-green/10 mb-3">
              <span className="w-2 h-2 rounded-full bg-pixel-green animate-glow-pulse" />
              <span className="font-pixel text-[8px] tracking-widest text-pixel-green">LIVE</span>
            </div>
            <h2 className="font-pixel text-2xl md:text-4xl flex items-center gap-3 text-glow-red">
              <Flame className="w-7 h-7" /> TRENDING NOW
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              The Pokémon you've been viewing the most on this device.
            </p>
          </div>
        </motion.div>

        <div className="relative -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4 min-w-min">
            {items.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/pokemon/${p.id}`}
                  className="group block w-44 shrink-0 glass-card p-4 hover:border-primary/60 transition-colors relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 z-10 font-pixel text-[8px] px-2 py-0.5 rounded-full bg-background/80 border border-border">
                    #{i + 1}
                  </div>
                  <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-3xl bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                  <div className="relative aspect-square mb-3 flex items-center justify-center">
                    <img
                      src={art(p.id)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    />
                  </div>
                  <div className="font-pixel text-[10px] uppercase truncate text-center">{p.name}</div>
                  <div className="font-pixel text-[8px] text-muted-foreground text-center mt-1">
                    {p.count} VIEW{p.count > 1 ? "S" : ""}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingNow;
