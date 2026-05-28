import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEQUENCE = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

const MEW = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png";

const KonamiEgg = () => {
  const [show, setShow] = useState(false);
  const [drops, setDrops] = useState<{ id: number; left: number; size: number; delay: number; rot: number }[]>([]);

  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQUENCE[idx]) {
        idx++;
        if (idx === SEQUENCE.length) {
          idx = 0;
          trigger();
        }
      } else {
        idx = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trigger = () => {
    const next = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 60 + Math.random() * 120,
      delay: Math.random() * 1.2,
      rot: (Math.random() - 0.5) * 360,
    }));
    setDrops(next);
    setShow(true);
    setTimeout(() => setShow(false), 6500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
        >
          {/* banner */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg bg-accent border-2 border-accent shadow-[0_0_40px_hsl(var(--accent)/0.7)]"
          >
            <span className="font-pixel text-xs text-accent-foreground tracking-widest">
              ✦ MEW APPEARED! ✦
            </span>
          </motion.div>

          {drops.map((d) => (
            <motion.img
              key={d.id}
              src={MEW}
              alt=""
              initial={{ y: -200, x: 0, rotate: 0, opacity: 0 }}
              animate={{ y: typeof window !== "undefined" ? window.innerHeight + 200 : 1200, rotate: d.rot, opacity: [0, 1, 1, 0.3] }}
              transition={{ duration: 4.5, delay: d.delay, ease: "easeIn" }}
              style={{ left: `${d.left}%`, width: d.size, height: d.size }}
              className="absolute drop-shadow-[0_0_25px_hsl(var(--accent)/0.8)]"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KonamiEgg;
