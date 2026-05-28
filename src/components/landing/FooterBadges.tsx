import { motion } from "framer-motion";

const BADGES = [
  { label: "PokéAPI", color: "primary",   url: "https://pokeapi.co" },
  { label: "React 18", color: "accent",   url: "https://react.dev" },
  { label: "Vite",     color: "secondary",url: "https://vitejs.dev" },
  { label: "Tailwind", color: "accent",   url: "https://tailwindcss.com" },
  { label: "Motion",   color: "primary",  url: "https://www.framer.com/motion/" },
  { label: "shadcn/ui",color: "secondary",url: "https://ui.shadcn.com" },
];

const FooterBadges = () => (
  <section className="relative z-10 py-16 px-6 border-t border-border/40">
    <div className="max-w-5xl mx-auto text-center">
      <p className="font-pixel text-[9px] tracking-widest text-muted-foreground mb-6">
        BUILT WITH
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {BADGES.map((b, i) => (
          <motion.a
            key={b.label}
            href={b.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.06, y: -2 }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full border border-${b.color}/40 bg-card/40 backdrop-blur-md hover:border-${b.color} transition-colors`}
          >
            <span className={`w-2 h-2 rounded-full bg-${b.color} animate-glow-pulse`} />
            <span className="font-pixel text-[9px] tracking-widest text-foreground/80">
              {b.label.toUpperCase()}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default FooterBadges;
