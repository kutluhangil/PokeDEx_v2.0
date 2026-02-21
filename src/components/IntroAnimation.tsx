import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onComplete: () => void;
}

const TITLE = "POKEDEX";

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<"dark" | "title" | "subtitle" | "fade">("dark");
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setPhase("title"), 500));

    // Type out letters
    for (let i = 0; i < TITLE.length; i++) {
      timers.push(setTimeout(() => setVisibleLetters(i + 1), 700 + i * 150));
    }

    timers.push(setTimeout(() => setPhase("subtitle"), 700 + TITLE.length * 150 + 300));
    timers.push(setTimeout(() => setPhase("fade"), 700 + TITLE.length * 150 + 2500));
    timers.push(setTimeout(onComplete, 700 + TITLE.length * 150 + 3200));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "fade" ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Pixel grid background */}
          <div className="absolute inset-0 pixel-grid-bg opacity-20" />

          {/* Pokeball spinner */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-16 h-16 relative animate-spin-slow">
              <div className="absolute inset-0 rounded-full border-4 border-primary" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary rounded-t-full" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted rounded-b-full" />
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-background -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-background rounded-full -translate-x-1/2 -translate-y-1/2 border-3 border-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <div className="flex gap-1 mb-6">
            {TITLE.split("").map((letter, i) => (
              <motion.span
                key={i}
                className="font-pixel text-4xl md:text-6xl text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={
                  i < visibleLetters
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.15 }}
                style={{
                  textShadow:
                    i < visibleLetters
                      ? "0 0 20px hsl(4 100% 60% / 0.8), 0 0 40px hsl(4 100% 60% / 0.4)"
                      : "none",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <AnimatePresence>
            {phase === "subtitle" && (
              <motion.p
                className="font-pixel text-xs md:text-sm text-muted-foreground text-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Welcome to the Pokedex.
                <br />
                Explore all Pokémon ever discovered.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none scanline-overlay" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default IntroAnimation;
