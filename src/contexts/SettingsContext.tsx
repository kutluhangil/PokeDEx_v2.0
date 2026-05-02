import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "neon" | "ultra-retro";

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  shiny: boolean;
  setShiny: (s: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("pokedex-theme") as Theme) || "neon";
  });
  const [shiny, setShinyState] = useState<boolean>(() => {
    return localStorage.getItem("pokedex-shiny") === "true";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pokedex-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pokedex-shiny", String(shiny));
  }, [shiny]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        shiny,
        setShiny: setShinyState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
