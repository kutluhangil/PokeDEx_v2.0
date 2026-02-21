export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  animatedSprite: string;
  officialArtwork: string;
  types: string[];
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
}

export interface PokemonDetail extends PokemonBasic {
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  description: string;
  evolutionChain: { id: number; name: string; sprite: string }[];
}

const TYPE_COLORS: Record<string, string> = {
  normal: "168 5% 55%",
  fire: "20 100% 55%",
  water: "220 80% 55%",
  electric: "47 100% 52%",
  grass: "142 60% 45%",
  ice: "187 60% 60%",
  fighting: "2 70% 45%",
  poison: "280 60% 50%",
  ground: "40 50% 50%",
  flying: "250 60% 70%",
  psychic: "340 80% 60%",
  bug: "80 60% 45%",
  rock: "45 40% 40%",
  ghost: "265 40% 45%",
  dragon: "260 80% 55%",
  dark: "240 5% 30%",
  steel: "220 15% 60%",
  fairy: "330 60% 65%",
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || "0 0% 50%";
}

export function getTypeGradient(types: string[]): string {
  if (types.length === 1) {
    const c = getTypeColor(types[0]);
    return `linear-gradient(135deg, hsl(${c}) 0%, hsl(${c} / 0.6) 100%)`;
  }
  const c1 = getTypeColor(types[0]);
  const c2 = getTypeColor(types[1]);
  return `linear-gradient(135deg, hsl(${c1}) 0%, hsl(${c2}) 100%)`;
}

function getGeneration(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

const pokemonCache = new Map<number, PokemonBasic>();
const detailCache = new Map<number, PokemonDetail>();

export async function fetchPokemonList(limit = 151, offset = 0): Promise<PokemonBasic[]> {
  const cached: PokemonBasic[] = [];
  const toFetch: number[] = [];

  for (let i = offset + 1; i <= offset + limit; i++) {
    if (pokemonCache.has(i)) {
      cached.push(pokemonCache.get(i)!);
    } else {
      toFetch.push(i);
    }
  }

  if (toFetch.length === 0) return cached;

  const results = await Promise.all(
    toFetch.map(async (id) => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await res.json();
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        const pokemon: PokemonBasic = {
          id: data.id,
          name: data.name,
          sprite: data.sprites.front_default || "",
          animatedSprite:
            data.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
            data.sprites.front_default || "",
          officialArtwork:
            data.sprites.other?.["official-artwork"]?.front_default ||
            data.sprites.front_default || "",
          types: data.types.map((t: any) => t.type.name),
          generation: getGeneration(data.id),
          isLegendary: speciesData.is_legendary,
          isMythical: speciesData.is_mythical,
        };

        pokemonCache.set(id, pokemon);
        return pokemon;
      } catch {
        return null;
      }
    })
  );

  return [...cached, ...results.filter(Boolean)] as PokemonBasic[];
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  if (detailCache.has(id)) return detailCache.get(id)!;

  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  const data = await pokemonRes.json();
  const speciesData = await speciesRes.json();

  const descEntry = speciesData.flavor_text_entries.find(
    (e: any) => e.language.name === "en"
  );

  // Fetch evolution chain
  let evolutionChain: { id: number; name: string; sprite: string }[] = [];
  try {
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    const extractChain = (chain: any) => {
      const speciesName = chain.species.name;
      const speciesUrl = chain.species.url;
      const speciesId = parseInt(speciesUrl.split("/").filter(Boolean).pop());
      evolutionChain.push({
        id: speciesId,
        name: speciesName,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      });
      if (chain.evolves_to.length > 0) {
        extractChain(chain.evolves_to[0]);
      }
    };
    extractChain(evoData.chain);
  } catch {}

  const detail: PokemonDetail = {
    id: data.id,
    name: data.name,
    sprite: data.sprites.front_default || "",
    animatedSprite:
      data.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
      data.sprites.front_default || "",
    officialArtwork:
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default || "",
    types: data.types.map((t: any) => t.type.name),
    generation: getGeneration(data.id),
    isLegendary: speciesData.is_legendary,
    isMythical: speciesData.is_mythical,
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a: any) => a.ability.name),
    stats: data.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    description: descEntry?.flavor_text?.replace(/\f/g, " ") || "No description available.",
    evolutionChain,
  };

  detailCache.set(id, detail);
  return detail;
}
