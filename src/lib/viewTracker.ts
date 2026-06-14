import { db } from "./firebase";
import { doc, setDoc, increment } from "firebase/firestore";

const STORAGE_KEY = "pokedex-views";

export type ViewMap = Record<number, number>;

export function getViews(): ViewMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export async function trackView(id: number) {
  // Update local storage
  const views = getViews();
  views[id] = (views[id] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  window.dispatchEvent(new CustomEvent("pokedex-views-updated"));

  // Increment view in Cloud Firestore globally
  try {
    const docRef = doc(db, "views", String(id));
    await setDoc(docRef, {
      id: id,
      count: increment(1)
    }, { merge: true });
  } catch (error) {
    console.error("Failed to track view in Firestore:", error);
  }
}

export function getTopViewed(limit = 10): { id: number; count: number }[] {
  const views = getViews();
  return Object.entries(views)
    .map(([id, count]) => ({ id: Number(id), count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
