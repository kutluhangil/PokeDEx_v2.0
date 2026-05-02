import { useEffect, useState } from "react";
import { getTopViewed } from "@/lib/viewTracker";

export function useTopViewed(limit = 10) {
  const [top, setTop] = useState(() => getTopViewed(limit));

  useEffect(() => {
    const update = () => setTop(getTopViewed(limit));
    window.addEventListener("pokedex-views-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("pokedex-views-updated", update);
      window.removeEventListener("storage", update);
    };
  }, [limit]);

  return top;
}
