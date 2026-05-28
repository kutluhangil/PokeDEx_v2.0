import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Generates a looping chiptune via the Web Audio API — no external file needed.
 * Plays a simple square-wave melody with a soft bass line.
 */
const MELODY = [
  // [midi, beats]
  [76, 1], [74, 1], [72, 1], [74, 1],
  [76, 1], [76, 1], [76, 2],
  [74, 1], [74, 1], [74, 2],
  [76, 1], [79, 1], [79, 2],
  [76, 1], [74, 1], [72, 1], [74, 1],
  [76, 1], [76, 1], [76, 1], [76, 1],
  [74, 1], [74, 1], [76, 1], [74, 1], [72, 4],
] as const;
const BASS = [60, 60, 65, 67, 60, 60, 65, 67] as const;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

const AudioToggle = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
  }, []);

  const start = useCallback(async () => {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);

    const bpm = 132;
    const beat = 60 / bpm;
    let t = ctx.currentTime + 0.05;

    const playNote = (
      freq: number, start: number, dur: number, type: OscillatorType, vol = 1
    ) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.9);
      osc.connect(g).connect(master);
      osc.start(start);
      osc.stop(start + dur);
    };

    let cancelled = false;
    const loopOnce = () => {
      let cursor = t;
      MELODY.forEach(([n, b]) => {
        playNote(midi(n), cursor, beat * b, "square", 0.7);
        cursor += beat * b;
      });
      // bass on every beat
      let bassCursor = t;
      const total = MELODY.reduce((a, [, b]) => a + b, 0);
      for (let i = 0; i < total; i++) {
        playNote(midi(BASS[i % BASS.length] - 12), bassCursor, beat * 0.95, "triangle", 0.5);
        bassCursor += beat;
      }
      t = cursor;
    };

    loopOnce();
    const interval = setInterval(() => {
      if (cancelled) return;
      if (t - ctx.currentTime < 2) loopOnce();
    }, 500);

    stopRef.current = () => {
      cancelled = true;
      clearInterval(interval);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      setTimeout(() => master.disconnect(), 300);
    };
  }, []);

  useEffect(() => () => stop(), [stop]);

  const toggle = async () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      await start();
      setOn(true);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5 }}
      onClick={toggle}
      aria-label={on ? "Mute chiptune" : "Play chiptune"}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-3 rounded-full bg-card/80 backdrop-blur-md border border-border/60 hover:border-primary/60 transition-colors group glow-red"
    >
      <span className="relative flex items-center justify-center w-6 h-6">
        {on ? (
          <Volume2 className="w-5 h-5 text-primary" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
        )}
        {on && (
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
        )}
      </span>
      <span className="font-pixel text-[8px] tracking-widest pr-1 hidden sm:inline">
        {on ? "CHIPTUNE ON" : "CHIPTUNE"}
      </span>
    </motion.button>
  );
};

export default AudioToggle;
