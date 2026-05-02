const STORAGE_KEY = "pokedex-views";

export type ViewMap = Record<number, number>;

export function getViews(): ViewMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function trackView(id: number) {
  const views = getViews();
  views[id] = (views[id] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  window.dispatchEvent(new CustomEvent("pokedex-views-updated"));
}

export function getTopViewed(limit = 10): { id: number; count: number }[] {
  const views = getViews();
  return Object.entries(views)
    .map(([id, count]) => ({ id: Number(id), count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
