import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAllPokemon } from "@/hooks/usePokemon";
import IntroAnimation from "@/components/IntroAnimation";
import HeroCarousel from "@/components/HeroCarousel";
import SearchSection from "@/components/SearchSection";
import CollectionGrid from "@/components/CollectionGrid";
import PokemonModal from "@/components/PokemonModal";
import PixelParticles from "@/components/PixelParticles";
import SettingsBar from "@/components/SettingsBar";
import Leaderboard from "@/components/Leaderboard";
import TeamBuilder from "@/components/TeamBuilder";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  // -1 = invalid id sentinel (so modal can show a not-found state)
  const selectedPokemonId = id
    ? (/^\d+$/.test(id) ? parseInt(id, 10) : -1)
    : null;

  const { data: pokemon = [], isLoading } = useAllPokemon();
  const [introComplete, setIntroComplete] = useState(true);


  // Persist scroll position when opening/closing the modal
  const savedScrollRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedPokemonId !== null) {
      // Modal opened — remember where we were, then scroll to top
      if (savedScrollRef.current === null) {
        savedScrollRef.current = window.scrollY;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (savedScrollRef.current !== null) {
      // Modal closed — restore previous position
      const y = savedScrollRef.current;
      savedScrollRef.current = null;
      // Wait a tick so layout is in place
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "smooth" }));
    }
  }, [selectedPokemonId]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const openPokemon = useCallback(
    (pid: number) => {
      navigate(`/pokemon/${pid}${location.search}`);
    },
    [navigate, location.search]
  );

  const closePokemon = useCallback(() => {
    navigate(`/explore${location.search}`);
  }, [navigate, location.search]);

  const goToSearch = useCallback(
    (prefill?: string) => {
      const params = new URLSearchParams(location.search);
      if (prefill) params.set("q", prefill);
      const qs = params.toString();
      navigate(`/explore${qs ? `?${qs}` : ""}`);
      // Scroll/focus the search input after navigation
      requestAnimationFrame(() => {
        const el = document.getElementById("pokedex-search-input") as HTMLInputElement | null;
        const section = document.getElementById("search-section");
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => el?.focus(), 400);
      });
    },
    [navigate, location.search]
  );

  const handleRandom = useCallback(() => {
    if (pokemon.length === 0) return;
    const random = pokemon[Math.floor(Math.random() * pokemon.length)];
    openPokemon(random.id);
  }, [pokemon, openPokemon]);

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
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <div className="flex items-center gap-3">
                  <h1
                    className="font-pixel text-sm text-primary text-glow-red cursor-pointer"
                    onClick={() => navigate("/explore")}
                  >
                    POKEDEX
                  </h1>
                  <span className="font-pixel text-[8px] text-muted-foreground hidden lg:inline">
                    {pokemon.length} POKÉMON
                  </span>
                </div>
                <button
                  onClick={() => navigate("/quiz")}
                  className="font-pixel text-[8px] px-2.5 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25 transition-all flex items-center gap-1 md:hidden"
                >
                  🎮 QUIZ
                </button>
                <div className="hidden md:block">
                  <button
                    onClick={() => navigate("/quiz")}
                    className="font-pixel text-[8px] px-2.5 py-1.5 rounded-lg border border-accent/40 bg-accent/15 text-accent hover:bg-accent/25 transition-all flex items-center gap-1"
                  >
                    🎮 QUIZ
                  </button>
                </div>
              </div>
              <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <SettingsBar onRandom={handleRandom} />
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-pixel text-xs text-muted-foreground">LOADING POKÉMON...</p>
            </div>
          ) : (
            <>
              <HeroCarousel pokemon={pokemon} onSelect={openPokemon} />
              <Leaderboard pokemon={pokemon} onSelect={openPokemon} />
              <SearchSection pokemon={pokemon} onSelect={openPokemon} />
              <CollectionGrid pokemon={pokemon} onSelect={openPokemon} />
              <TeamBuilder pokemonList={pokemon} />
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
        invalidId={id && !/^\d+$/.test(id) ? id : null}
        onClose={closePokemon}
        onNavigate={openPokemon}
        onGoToSearch={goToSearch}
      />
    </div>
  );
};

export default Index;
