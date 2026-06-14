import { getTypeColor } from "./pokemon";

export function setDynamicTheme(types: string[]) {
  if (!types || types.length === 0) return;
  const root = document.documentElement;
  const t1 = types[0];
  const t2 = types[1] || t1;
  const c1 = getTypeColor(t1);
  const c2 = getTypeColor(t2);

  root.style.setProperty("--primary", c1);
  root.style.setProperty("--secondary", c2);
  root.style.setProperty("--ring", c1);
  
  // Custom glow property updates
  root.style.setProperty(
    "--glow-red",
    `0 0 20px hsl(${c1} / 0.45), 0 0 40px hsl(${c1} / 0.25)`
  );
  root.style.setProperty(
    "--glow-yellow",
    `0 0 20px hsl(${c2} / 0.45), 0 0 40px hsl(${c2} / 0.25)`
  );
}

export function resetDynamicTheme() {
  const root = document.documentElement;
  const theme = root.dataset.theme || "neon";

  if (theme === "ultra-retro") {
    root.style.setProperty("--primary", "88 90% 55%");
    root.style.setProperty("--secondary", "70 80% 55%");
    root.style.setProperty("--ring", "88 90% 55%");
    root.style.setProperty(
      "--glow-red",
      "0 0 20px hsl(88 90% 55% / 0.5), 0 0 50px hsl(88 90% 55% / 0.3)"
    );
    root.style.setProperty(
      "--glow-yellow",
      "0 0 20px hsl(70 80% 55% / 0.5), 0 0 50px hsl(70 80% 55% / 0.3)"
    );
  } else {
    // Neon (default)
    root.style.setProperty("--primary", "4 100% 60%");
    root.style.setProperty("--secondary", "47 100% 52%");
    root.style.setProperty("--ring", "4 100% 60%");
    root.style.setProperty(
      "--glow-red",
      "0 0 20px hsl(4 100% 60% / 0.4), 0 0 40px hsl(4 100% 60% / 0.2)"
    );
    root.style.setProperty(
      "--glow-yellow",
      "0 0 20px hsl(47 100% 52% / 0.4), 0 0 40px hsl(47 100% 52% / 0.2)"
    );
  }
}
