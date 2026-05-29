import { useQuery } from "@tanstack/react-query";

export interface PokemonNameEntry {
  id: number;
  name: string;
  sprite: string;
}

async function fetchAllNames(): Promise<PokemonNameEntry[]> {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1302");
  const data = await res.json();
  return (data.results as { name: string; url: string }[])
    .map((r) => {
      const id = parseInt(r.url.split("/").filter(Boolean).pop()!, 10);
      return {
        id,
        name: r.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    })
    .filter((p) => p.id <= 1025);
}

export function useAllPokemonNames() {
  return useQuery<PokemonNameEntry[]>({
    queryKey: ["pokemon-all-names"],
    queryFn: fetchAllNames,
    staleTime: Infinity,
  });
}
