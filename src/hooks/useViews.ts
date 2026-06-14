import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getTopViewed } from "@/lib/viewTracker";

export function useTopViewed(limitCount = 10) {
  const [top, setTop] = useState<{ id: number; count: number }[]>(() => getTopViewed(limitCount));

  useEffect(() => {
    // Sync with global Firestore leaderboard in real-time
    const q = query(
      collection(db, "views"),
      orderBy("count", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const globalViews = snapshot.docs.map((doc) => ({
          id: Number(doc.id),
          count: doc.data().count as number,
        }));
        if (globalViews.length > 0) {
          setTop(globalViews);
        }
      },
      (error) => {
        console.error("Firestore leaderboard listen error:", error);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return top;
}
