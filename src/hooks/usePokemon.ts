import { useQuery } from "@tanstack/react-query";
import { fetchPokemonList, fetchPokemonDetail, type PokemonBasic } from "@/lib/pokemon";

export function usePokemonList(limit = 151, offset = 0) {
  return useQuery<PokemonBasic[]>({
    queryKey: ["pokemon-list", limit, offset],
    queryFn: () => fetchPokemonList(limit, offset),
    staleTime: Infinity,
  });
}

export function usePokemonDetail(id: number | null) {
  return useQuery({
    queryKey: ["pokemon-detail", id],
    queryFn: () => fetchPokemonDetail(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useAllPokemon() {
  // Load first 151 initially, then load more
  const gen1 = usePokemonList(151, 0);
  return gen1;
}
