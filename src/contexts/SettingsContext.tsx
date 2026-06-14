import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { resetDynamicTheme } from "@/lib/dynamicTheme";

type Theme = "neon" | "ultra-retro";

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  shiny: boolean;
  setShiny: (s: boolean) => void;
  crt: boolean;
  setCrt: (c: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("pokedex-theme") as Theme) || "neon";
  });
  const [shiny, setShinyState] = useState<boolean>(() => {
    return localStorage.getItem("pokedex-shiny") === "true";
  });
  const [crt, setCrtState] = useState<boolean>(() => {
    return localStorage.getItem("pokedex-crt") === "true";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pokedex-theme", theme);
    resetDynamicTheme();
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pokedex-shiny", String(shiny));
  }, [shiny]);

  useEffect(() => {
    localStorage.setItem("pokedex-crt", String(crt));
    if (crt) {
      document.documentElement.classList.add("crt-screen");
    } else {
      document.documentElement.classList.remove("crt-screen");
    }
  }, [crt]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: setThemeState,
        shiny,
        setShiny: setShinyState,
        crt,
        setCrt: setCrtState,
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
