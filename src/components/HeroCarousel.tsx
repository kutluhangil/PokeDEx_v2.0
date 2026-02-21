import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type PokemonBasic } from "@/lib/pokemon";
import PokemonCard from "./PokemonCard";

interface HeroCarouselProps {
  pokemon: PokemonBasic[];
  onSelect: (id: number) => void;
}

const HeroCarousel = ({ pokemon, onSelect }: HeroCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Pick featured pokemon (starters, legendaries, popular)
  const featured = pokemon.filter((p) =>
    [1, 4, 7, 25, 6, 9, 150, 151, 94, 143, 130, 149, 3, 59, 131, 65].includes(p.id)
  );

  return (
    <section className="relative py-12">
      <motion.h2
        className="font-pixel text-sm md:text-base text-center mb-8 text-foreground text-glow-red"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        FEATURED POKÉMON
      </motion.h2>

      <div className="relative group">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-muted/60 backdrop-blur-sm hover:bg-muted transition-colors text-foreground opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-muted/60 backdrop-blur-sm hover:bg-muted transition-colors text-foreground opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-8 md:px-16 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featured.map((p, i) => (
            <div key={p.id} className="snap-center">
              <PokemonCard pokemon={p} onClick={onSelect} variant="hero" index={i} />
            </div>
          ))}
        </div>

        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-[5]" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-[5]" />
      </div>
    </section>
  );
};

export default HeroCarousel;
