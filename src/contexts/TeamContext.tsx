import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface TeamContextValue {
  teamIds: number[];
  addToTeam: (id: number) => boolean;
  removeFromTeam: (id: number) => void;
  clearTeam: () => void;
  isAdded: (id: number) => boolean;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teamIds, setTeamIds] = useState<number[]>(() => {
    try {
      // Check if team is deep-linked first
      const params = new URLSearchParams(window.location.search);
      const teamParam = params.get("team");
      if (teamParam) {
        const ids = teamParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id) && id > 0 && id <= 1025);
        if (ids.length > 0) {
          return ids.slice(0, 6);
        }
      }
      return JSON.parse(localStorage.getItem("pokedex-team") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pokedex-team", JSON.stringify(teamIds));
  }, [teamIds]);

  const isAdded = (id: number) => teamIds.includes(id);

  const addToTeam = (id: number): boolean => {
    if (teamIds.includes(id)) {
      toast.error("This Pokémon is already in your team.");
      return false;
    }
    if (teamIds.length >= 6) {
      toast.error("Your team is full! Remove a Pokémon first.");
      return false;
    }
    setTeamIds((prev) => [...prev, id]);
    toast.success("Added to your team!");
    return true;
  };

  const removeFromTeam = (id: number) => {
    setTeamIds((prev) => prev.filter((x) => x !== id));
    toast.success("Removed from your team.");
  };

  const clearTeam = () => {
    setTeamIds([]);
    toast.success("Team cleared.");
  };

  return (
    <TeamContext.Provider
      value={{
        teamIds,
        addToTeam,
        removeFromTeam,
        clearTeam,
        isAdded,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within TeamProvider");
  return ctx;
};
