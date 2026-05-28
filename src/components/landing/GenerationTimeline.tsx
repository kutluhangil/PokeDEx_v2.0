import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const GENERATIONS = [
  { gen: 1, region: "Kanto",   year: "1996", id: 6,   name: "Charizard", color: "20 100% 55%" },
  { gen: 2, region: "Johto",   year: "1999", id: 249, name: "Lugia",     color: "220 80% 60%" },
  { gen: 3, region: "Hoenn",   year: "2002", id: 384, name: "Rayquaza",  color: "142 60% 50%" },
  { gen: 4, region: "Sinnoh",  year: "2006", id: 483, name: "Dialga",    color: "200 70% 55%" },
  { gen: 5, region: "Unova",   year: "2010", id: 643, name: "Reshiram",  color: "0 0% 90%" },
  { gen: 6, region: "Kalos",   year: "2013", id: 716, name: "Xerneas",   color: "200 90% 60%" },
  { gen: 7, region: "Alola",   year: "2016", id: 791, name: "Solgaleo",  color: "47 100% 55%" },
  { gen: 8, region: "Galar",   year: "2019", id: 888, name: "Zacian",    color: "260 70% 65%" },
  { gen: 9, region: "Paldea",  year: "2022", id: 1007,name: "Koraidon",  color: "0 80% 55%" },
];

const art = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const Row = ({
  gen, region, year, id, name, color, index,
}: typeof GENERATIONS[number] & { index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.05, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);
  const reverse = index % 2 === 1;

  return (
    <div ref={ref} className="relative min-h-[60vh] flex items-center py-12">
      {/* Center spine dot */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          style={{ scale }}
          className="w-5 h-5 rounded-full border-2 border-background"
          {...{ "data-color": color }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{ background: `hsl(${color})`, boxShadow: `0 0 20px hsl(${color} / 0.9)` }}
          />
        </motion.div>
      </div>

      <div className={`relative w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${reverse ? "md:[direction:rtl]" : ""}`}>
        {/* Text */}
        <motion.div style={{ opacity }} className="md:[direction:ltr] text-center md:text-left md:px-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/40 backdrop-blur-md mb-4"
            style={{ borderColor: `hsl(${color} / 0.5)` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${color})`, boxShadow: `0 0 10px hsl(${color})` }} />
            <span className="font-pixel text-[8px] tracking-widest text-muted-foreground">{year} · {region.toUpperCase()}</span>
          </div>
          <h3 className="font-pixel text-2xl md:text-4xl mb-3" style={{ color: `hsl(${color})`, textShadow: `0 0 20px hsl(${color} / 0.5)` }}>
            GEN {gen.toString().padStart(2, "0")}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            The {region} region introduced new mechanics, evolutions, and iconic creatures — anchored by <span className="text-foreground font-medium capitalize">{name}</span>.
          </p>
          <Link
            to={`/explore?filter=generation-${gen}`}
            className="inline-flex items-center gap-2 font-pixel text-[10px] px-4 py-2 rounded-md border border-border/60 hover:border-foreground/40 transition-colors"
          >
            EXPLORE GEN {gen} →
          </Link>
        </motion.div>

        {/* Sprite */}
        <motion.div style={{ y, scale }} className="md:[direction:ltr] flex justify-center">
          <div className="relative w-56 h-56 md:w-72 md:h-72">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{ background: `hsl(${color} / 0.5)` }}
            />
            <img
              src={art(id)}
              alt={name}
              loading="lazy"
              className="relative w-full h-full object-contain drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const GenerationTimeline = () => {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-pixel text-2xl md:text-4xl mb-3 text-glow-yellow">TIMELINE</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nine generations of monsters, one continuous adventure.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical spine */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
          {GENERATIONS.map((g, i) => (
            <Row key={g.gen} {...g} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenerationTimeline;
