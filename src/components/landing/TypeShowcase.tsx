import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getTypeColor } from "@/lib/pokemon";
import TypePixelIcon from "../ui/TypePixelIcon";

const TYPES = [
  "normal","fire","water","electric","grass","ice","fighting","poison","ground",
  "flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
];

const TypeShowcase = () => {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-pixel text-2xl md:text-4xl mb-3 text-glow-cyan">TYPE INDEX</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tap any element to filter the Pokédex by that type instantly.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
          {TYPES.map((t, i) => {
            const c = getTypeColor(t);
            return (
              <motion.div
                key={t}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 200 }}
              >
                <Link
                  to={`/explore?types=${t}`}
                  className="group relative flex flex-col items-center justify-center aspect-square rounded-xl border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden hover:border-transparent transition-all hover:-translate-y-1"
                  style={{ ["--tc" as any]: `hsl(${c})` }}
                >
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, hsl(${c} / 0.55), transparent 70%)`,
                    }}
                  />
                  <span
                    className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-80 blur-xl transition-opacity -z-10"
                    style={{ background: `hsl(${c} / 0.6)` }}
                  />
                  <TypePixelIcon
                    type={t}
                    className="w-7 h-7 md:w-9 md:h-9 mb-2 transition-transform group-hover:scale-110"
                    style={{
                      color: `hsl(${c})`,
                      filter: `drop-shadow(0 0 8px hsl(${c} / 0.7))`
                    }}
                  />
                  <span className="font-pixel text-[8px] md:text-[9px] tracking-widest text-foreground/80 group-hover:text-foreground uppercase relative">
                    {t}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TypeShowcase;
