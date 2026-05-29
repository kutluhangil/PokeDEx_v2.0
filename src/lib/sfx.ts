// Lightweight Web Audio SFX — no asset files needed
let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setSfxMuted(value: boolean) {
  muted = value;
}

export function isSfxMuted() {
  return muted;
}

interface Tone {
  freq: number;
  duration: number;
  type?: OscillatorType;
  delay?: number;
  gain?: number;
}

function playTones(tones: Tone[]) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  tones.forEach((t) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = t.type ?? "square";
    osc.frequency.setValueAtTime(t.freq, now + (t.delay ?? 0));
    const peak = (t.gain ?? 0.08);
    g.gain.setValueAtTime(0, now + (t.delay ?? 0));
    g.gain.linearRampToValueAtTime(peak, now + (t.delay ?? 0) + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + (t.delay ?? 0) + t.duration);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now + (t.delay ?? 0));
    osc.stop(now + (t.delay ?? 0) + t.duration + 0.02);
  });
}

export const sfx = {
  select: () => playTones([{ freq: 880, duration: 0.08 }, { freq: 1320, duration: 0.1, delay: 0.05 }]),
  next: () => playTones([{ freq: 660, duration: 0.06 }, { freq: 990, duration: 0.08, delay: 0.04 }]),
  prev: () => playTones([{ freq: 990, duration: 0.06 }, { freq: 660, duration: 0.08, delay: 0.04 }]),
  close: () => playTones([{ freq: 440, duration: 0.08 }, { freq: 220, duration: 0.12, delay: 0.05 }]),
  hover: () => playTones([{ freq: 1500, duration: 0.04, gain: 0.04 }]),
};
