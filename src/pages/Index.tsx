import { useState, useCallback } from "react";
import { useAllPokemon } from "@/hooks/usePokemon";
import IntroAnimation from "@/components/IntroAnimation";
import HeroCarousel from "@/components/HeroCarousel";
import SearchSection from "@/components/SearchSection";
import CollectionGrid from "@/components/CollectionGrid";
import PokemonModal from "@/components/PokemonModal";
import PixelParticles from "@/components/PixelParticles";
import SettingsBar from "@/components/SettingsBar";
import Leaderboard from "@/components/Leaderboard";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const { data: pokemon = [], isLoading } = useAllPokemon();

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const handleRandom = useCallback(() => {
    if (pokemon.length === 0) return;
    const random = pokemon[Math.floor(Math.random() * pokemon.length)];
    setSelectedPokemonId(random.id);
  }, [pokemon]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Intro Animation */}
      {!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Background effects */}
      <PixelParticles />
      <div className="fixed inset-0 pixel-grid-bg opacity-5 pointer-events-none z-0" />

      {/* Main content */}
      {introComplete && (
        <main className="relative z-10">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="font-pixel text-sm text-primary text-glow-red">
                  POKEDEX
                </h1>
                <span className="font-pixel text-[8px] text-muted-foreground hidden md:inline">
                  {pokemon.length} POKÉMON
                </span>
              </div>
              <SettingsBar onRandom={handleRandom} />
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-pixel text-xs text-muted-foreground">LOADING POKÉMON...</p>
            </div>
          ) : (
            <>
              <HeroCarousel pokemon={pokemon} onSelect={setSelectedPokemonId} />
              <Leaderboard pokemon={pokemon} onSelect={setSelectedPokemonId} />
              <SearchSection pokemon={pokemon} onSelect={setSelectedPokemonId} />
              <CollectionGrid pokemon={pokemon} onSelect={setSelectedPokemonId} />
            </>
          )}

          {/* Footer */}
          <footer className="border-t border-border/50 py-8 text-center">
            <p className="font-pixel text-[8px] text-muted-foreground">
              DATA FROM POKEAPI.CO • NOT AFFILIATED WITH NINTENDO
            </p>
          </footer>
        </main>
      )}

      {/* Modal */}
      <PokemonModal
        pokemonId={selectedPokemonId}
        onClose={() => setSelectedPokemonId(null)}
        onNavigate={setSelectedPokemonId}
      />
    </div>
  );
};

export default Index;
