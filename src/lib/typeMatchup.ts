// Complete Pokemon Type Matchup Matrix
export const TYPE_LIST = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// Key matches: attacker -> { defender: multiplier }
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, flying: 2, ground: 0, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, bug: 0.5, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

/**
 * Calculates defensive multipliers against a pokemon with the given types.
 * Returns a map of attackerType -> damageMultiplier (e.g. { fire: 2.0, grass: 0.5 })
 */
export function getDefensiveMultipliers(types: string[]): Record<string, number> {
  const multipliers: Record<string, number> = {};
  
  // Default to 1.0 for all types
  TYPE_LIST.forEach((t) => {
    multipliers[t] = 1.0;
  });

  if (!types || types.length === 0) return multipliers;

  // For each attacking type, multiply the defensive matchups
  TYPE_LIST.forEach((attacker) => {
    let multiplier = 1.0;
    types.forEach((defender) => {
      const chart = TYPE_CHART[attacker];
      if (chart && chart[defender] !== undefined) {
        multiplier *= chart[defender];
      }
    });
    multipliers[attacker] = multiplier;
  });

  return multipliers;
}

/**
 * Returns cumulative defensive summary for a team of pokemon:
 * - weak: list of types where the team has more weak members than resistant/immune
 * - resistant: list of types where the team has more resistant members than weak
 */
export function getTeamDefensiveAnalysis(pokemonTypesList: string[][]) {
  const totals: Record<string, number> = {};
  TYPE_LIST.forEach((t) => {
    totals[t] = 0; // positive means team is weak, negative means team is resistant
  });

  pokemonTypesList.forEach((types) => {
    const mults = getDefensiveMultipliers(types);
    Object.entries(mults).forEach(([type, mult]) => {
      if (mult > 1.0) {
        totals[type] += 1; // weak point
      } else if (mult < 1.0) {
        totals[type] -= 1; // resistance/immunity
      }
    });
  });

  return totals;
}
