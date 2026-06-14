import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Volume2, Gamepad2, ArrowLeft, Zap } from "lucide-react";
import { usePokemonList } from "@/hooks/usePokemon";
import { fetchPokemonDetail, type PokemonDetail } from "@/lib/pokemon";
import { sfx } from "@/lib/sfx";
import PixelParticles from "@/components/PixelParticles";
import TypePixelIcon from "@/components/ui/TypePixelIcon";

export default function QuizPage() {
  const navigate = useNavigate();
  const { data: pokemonList = [], isLoading: isListLoading } = usePokemonList(151, 0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("pokedex-quiz-high-score") || 0);
  });

  const [targetPokemon, setTargetPokemon] = useState<PokemonDetail | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [muted, setMuted] = useState(false);

  // Generate new quiz question
  const nextQuestion = useCallback(async () => {
    if (pokemonList.length === 0) return;
    setIsLoadingDetail(true);
    setAnswered(false);
    setSelectedName(null);

    // Pick random target pokemon
    const targetBasic = pokemonList[Math.floor(Math.random() * pokemonList.length)];

    try {
      const detail = await fetchPokemonDetail(targetBasic.id);
      setTargetPokemon(detail);

      // Pick 3 distractors
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const candidate = pokemonList[Math.floor(Math.random() * pokemonList.length)];
        if (candidate.name !== detail.name && !distractors.includes(candidate.name)) {
          distractors.push(candidate.name);
        }
      }

      // Mix choices and shuffle
      const allChoices = [detail.name, ...distractors].sort(() => Math.random() - 0.5);
      setChoices(allChoices);

      // Play Pokémon cry as a clue (delay slightly for screen rendering)
      if (detail.cries?.latest) {
        setTimeout(() => {
          sfx.playCry(detail.cries!.latest);
        }, 300);
      }
    } catch (error) {
      console.error("Failed to load quiz details:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [pokemonList]);

  // Load first question when list becomes available
  useEffect(() => {
    if (pokemonList.length > 0 && !targetPokemon) {
      nextQuestion();
    }
  }, [pokemonList, targetPokemon, nextQuestion]);

  const handleSelect = (choice: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedName(choice);

    const isCorrect = choice === targetPokemon?.name;

    if (isCorrect) {
      sfx.correct();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 10 + newStreak * 2); // Bonus score for streaks
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem("pokedex-quiz-high-score", String(newStreak));
      }
    } else {
      sfx.wrong();
      setStreak(0);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col justify-between">
      <PixelParticles />
      <div className="fixed inset-0 pixel-grid-bg opacity-[0.07] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sfx.close();
              navigate("/explore");
            }}
            className="font-pixel text-[8px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">EXIT</span>
          </button>

          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-accent animate-pulse" />
            <h1 className="font-pixel text-xs text-accent text-glow-cyan">RETRO QUIZ</h1>
          </div>

          <div className="flex items-center gap-4 font-pixel text-[8px]">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-secondary" />
              <span className="text-muted-foreground">BEST STREAK:</span>
              <span className="text-secondary text-glow-yellow">{highScore}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 max-w-4xl w-full mx-auto">
        {isListLoading || (!targetPokemon && isLoadingDetail) ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-pixel text-[8px] text-muted-foreground">INITIALIZING SYSTEM...</p>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6">
            {/* Score & Streak display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 text-center border-border/40">
                <span className="font-pixel text-[7px] text-muted-foreground block mb-1">SCORE</span>
                <span className="font-pixel text-lg text-primary text-glow-red">{score}</span>
              </div>
              <div className="glass-card p-3 text-center border-border/40">
                <span className="font-pixel text-[7px] text-muted-foreground block mb-1">STREAK</span>
                <span className={`font-pixel text-lg transition-all duration-300 ${
                  streak > 0 ? "text-pixel-green text-glow-green" : "text-muted-foreground"
                }`}>
                  {streak} 🔥
                </span>
              </div>
            </div>

            {/* Display Monitor Screen */}
            <div className="glass-card border-2 border-border/50 relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center bg-black/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] min-h-[260px]">
              {/* Scanline / CRT effect overlay */}
              <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-25" />

              {isLoadingDetail ? (
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                targetPokemon && (
                  <div className="relative flex flex-col items-center">
                    {/* Shadow/Glow backdrop */}
                    <div
                      className={`absolute w-36 h-36 rounded-full blur-3xl opacity-35 transition-all duration-500 ${
                        answered ? "bg-primary" : "bg-cyan-500"
                      }`}
                    />

                    {/* Silhouette of Artwork */}
                    <motion.img
                      key={targetPokemon.id}
                      src={targetPokemon.officialArtwork}
                      alt="Who's that Pokemon?"
                      className={`w-40 h-40 object-contain transition-all duration-500 select-none ${
                        answered
                          ? "filter-none scale-105"
                          : "brightness-0 opacity-80"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: answered ? 1 : 0.8 }}
                      transition={{ type: "spring", damping: 15 }}
                    />

                    {/* Subtitled hints */}
                    {!answered && (
                      <span className="font-pixel text-[6px] text-muted-foreground animate-pulse mt-4">
                        WHO'S THAT POKÉMON?
                      </span>
                    )}

                    {answered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mt-3 space-y-1"
                      >
                        <h2 className="font-pixel text-sm text-foreground capitalize text-glow-yellow">
                          {targetPokemon.name}
                        </h2>
                        <div className="flex gap-1.5 justify-center">
                          {targetPokemon.types.map((t) => (
                            <span
                              key={t}
                              className="font-pixel text-[5px] px-1.5 py-0.5 rounded border border-border bg-muted/40 capitalize text-muted-foreground flex items-center gap-1"
                            >
                              <TypePixelIcon type={t} className="w-2 h-2" glow={false} />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Play Cry Audio / Hint Button */}
            {targetPokemon && targetPokemon.cries?.latest && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    sfx.playCry(targetPokemon.cries!.latest);
                  }}
                  className="font-pixel text-[7px] flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  REPLAY CRY HINT 🔊
                </button>
              </div>
            )}

            {/* Multiple Choice Answers */}
            <div className="grid grid-cols-2 gap-3">
              {choices.map((choice) => {
                const isSelected = selectedName === choice;
                const isCorrect = choice === targetPokemon?.name;

                let btnStyle = "bg-muted/10 border-border text-foreground hover:bg-muted/30";
                if (answered) {
                  if (isCorrect) {
                    btnStyle = "bg-pixel-green/20 border-pixel-green text-pixel-green text-glow-green scale-105";
                  } else if (isSelected) {
                    btnStyle = "bg-destructive/20 border-destructive text-destructive text-glow-red animate-shake";
                  } else {
                    btnStyle = "bg-muted/5 border-border/20 text-muted-foreground opacity-50";
                  }
                }

                return (
                  <button
                    key={choice}
                    onClick={() => handleSelect(choice)}
                    disabled={answered}
                    className={`font-pixel text-[8px] py-3.5 px-4 rounded-xl border transition-all capitalize select-none ${btnStyle}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {/* Game Feedback & Next Action */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center gap-3 pt-2"
                >
                  <p className={`font-pixel text-[10px] text-center ${
                    selectedName === targetPokemon?.name
                      ? "text-pixel-green text-glow-green"
                      : "text-destructive text-glow-red"
                  }`}>
                    {selectedName === targetPokemon?.name
                      ? "CORRECT! +10 XP"
                      : `WRONG ANSWER! IT WAS ${targetPokemon?.name.toUpperCase()}`}
                  </p>

                  <button
                    onClick={nextQuestion}
                    className="w-full font-pixel text-[9px] py-4 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-all glow-red flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 animate-bounce" />
                    NEXT ROUND ▶
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center mt-12">
        <p className="font-pixel text-[8px] text-muted-foreground">
          WHO'S THAT POKÉMON? MINI-GAME • DATA FROM POKEAPI.CO
        </p>
      </footer>
    </div>
  );
}
