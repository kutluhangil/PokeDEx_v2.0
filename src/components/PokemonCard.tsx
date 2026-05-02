import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type PokemonBasic, getTypeColor, getTypeGradient } from "@/lib/pokemon";
import { useSettings } from "@/contexts/SettingsContext";

interface PokemonCardProps {
  pokemon: PokemonBasic;
  onClick: (id: number) => void;
  variant?: "hero" | "grid";
  index?: number;
}

const PokemonCard = ({ pokemon, onClick, variant = "grid", index = 0 }: PokemonCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10 * -1);
    setRotateY((x - centerX) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const { shiny } = useSettings();
  const isHero = variant === "hero";
  const primaryType = pokemon.types[0];
  const typeColor = getTypeColor(primaryType);

  const heroImg = shiny ? pokemon.shinyOfficialArtwork : pokemon.officialArtwork;
  const gridImg = shiny
    ? pokemon.shinyAnimatedSprite || pokemon.shinySprite
    : pokemon.animatedSprite || pokemon.sprite;

  return (
    <motion.div
      ref={cardRef}
      className={`relative cursor-pointer group ${
        isHero ? "w-[280px] md:w-[320px] h-[380px] md:h-[420px] flex-shrink-0" : "w-full aspect-[3/4]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      style={{
        perspective: "1000px",
      }}
      onClick={() => onClick(pokemon.id)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full glass-card overflow-hidden relative"
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-60"
          style={{ background: getTypeGradient(pokemon.types) }}
        />

        {/* Animated glow border */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 30px hsl(${typeColor} / 0.3), 0 0 30px hsl(${typeColor} / 0.2)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
          {/* ID */}
          <span className="font-pixel text-[10px] text-muted-foreground mb-2">
            #{String(pokemon.id).padStart(3, "0")}
          </span>

          {/* Sprite */}
          <motion.img
            src={isHero ? heroImg : gridImg}
            alt={pokemon.name}
            className={`${isHero ? "w-48 h-48" : "w-24 h-24"} object-contain drop-shadow-lg ${shiny ? "saturate-150" : ""}`}
            style={{
              imageRendering: isHero ? "auto" : "pixelated",
              filter: isHovered
                ? `drop-shadow(0 0 15px hsl(${shiny ? "47 100% 55%" : typeColor} / 0.7))`
                : shiny
                ? `drop-shadow(0 0 8px hsl(47 100% 55% / 0.5))`
                : "none",
            }}
            animate={isHovered ? { y: -5 } : { y: 0 }}
            loading="lazy"
          />

          {shiny && (
            <Sparkles
              className="absolute top-3 right-3 w-4 h-4 text-secondary animate-pulse"
              style={{ filter: "drop-shadow(0 0 6px hsl(47 100% 55%))" }}
            />
          )}

          {/* Name */}
          <h3
            className={`font-pixel ${
              isHero ? "text-sm" : "text-[8px]"
            } text-foreground mt-3 capitalize text-center`}
          >
            {pokemon.name}
          </h3>

          {/* Types */}
          <div className="flex gap-2 mt-2">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className="type-badge"
                style={{
                  backgroundColor: `hsl(${getTypeColor(type)} / 0.3)`,
                  color: `hsl(${getTypeColor(type)})`,
                  border: `1px solid hsl(${getTypeColor(type)} / 0.5)`,
                }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Scanline */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-30" />
      </motion.div>
    </motion.div>
  );
};

export default PokemonCard;
