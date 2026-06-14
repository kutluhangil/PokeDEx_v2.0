import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, animate } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Search, Trophy, QrCode, Palette, Shuffle } from "lucide-react";
import PixelParticles from "@/components/PixelParticles";
import TypeShowcase from "@/components/landing/TypeShowcase";
import GenerationTimeline from "@/components/landing/GenerationTimeline";
import TrendingNow from "@/components/landing/TrendingNow";
import AudioToggle from "@/components/landing/AudioToggle";
import KonamiEgg from "@/components/landing/KonamiEgg";
import FooterBadges from "@/components/landing/FooterBadges";

// Animated count-up that triggers when scrolled into view
const CountUp = ({
  to,
  suffix = "",
  duration = 2,
  fallback,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  fallback?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView || fallback) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, fallback]);

  return (
    <span ref={ref}>
      {fallback ?? `${val.toLocaleString()}${suffix}`}
    </span>
  );
};

// Cinematic parallax showcase — legendary/iconic Pokémon sprites at varied depths
const SHOWCASE = [
  { id: 150, left: "6%",  top: "18%", size: 200, depth: 60, delay: 0.1, float: 5 }, // Mewtwo
  { id: 6,   left: "82%", top: "14%", size: 180, depth: 50, delay: 0.3, float: 6 }, // Charizard
  { id: 249, left: "12%", top: "62%", size: 220, depth: 70, delay: 0.5, float: 7 }, // Lugia
  { id: 384, left: "78%", top: "58%", size: 200, depth: 55, delay: 0.7, float: 5 }, // Rayquaza
  { id: 25,  left: "44%", top: "8%",  size: 110, depth: 35, delay: 0.9, float: 4 }, // Pikachu
  { id: 448, left: "48%", top: "78%", size: 130, depth: 40, delay: 1.1, float: 5 }, // Lucario
  { id: 94,  left: "26%", top: "32%", size: 90,  depth: 25, delay: 1.3, float: 4 }, // Gengar
  { id: 130, left: "70%", top: "36%", size: 100, depth: 30, delay: 1.5, float: 4 }, // Gyarados
] as const;

const spriteUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const ParallaxSprite = ({
  id,
  left,
  top,
  size,
  depth,
  delay,
  float,
  mx,
  my,
}: {
  id: number;
  left: string;
  top: string;
  size: number;
  depth: number;
  delay: number;
  float: number;
  mx: ReturnType<typeof useMotionValue<number>>;
  my: ReturnType<typeof useMotionValue<number>>;
}) => {
  const tx = useSpring(useTransform(mx, [-1, 1], [-depth, depth]), { stiffness: 60, damping: 20 });
  const ty = useSpring(useTransform(my, [-1, 1], [-depth, depth]), { stiffness: 60, damping: 20 });

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left, top, width: size, height: size, x: tx, y: ty }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: float, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <img
          src={spriteUrl(id)}
          alt=""
          loading="lazy"
          draggable={false}
          className="w-full h-full object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.45)]"
          style={{ imageRendering: "auto" }}
        />
        <div
          className="absolute inset-0 -z-10 rounded-full blur-3xl bg-primary/20"
          style={{ filter: "blur(40px)" }}
        />
      </motion.div>
    </motion.div>
  );
};

const TITLE = "POKEDEX";
const TAGLINE = "A retro-futuristic Pokédex experience.";

// 3D tilt card
const TiltCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-50, 50], [10, -10]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-50, 50], [-10, 10]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingPokeball = ({
  delay = 0,
  size = 60,
  left = "10%",
  top = "20%",
  color = "primary",
}: {
  delay?: number;
  size?: number;
  left?: string;
  top?: string;
  color?: "primary" | "secondary" | "accent";
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left, top, width: size, height: size }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, y: [0, -20, 0], rotate: [0, 360] }}
    transition={{
      opacity: { duration: 1, delay },
      scale: { duration: 0.8, delay },
      y: { duration: 4, delay, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 12, delay, repeat: Infinity, ease: "linear" },
    }}
  >
    <div className="relative w-full h-full">
      <div className={`absolute inset-0 rounded-full border-4 border-${color}`} />
      <div className={`absolute top-0 left-0 right-0 h-1/2 bg-${color} rounded-t-full`} />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted rounded-b-full" />
      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-background -translate-y-1/2" />
      <div
        className={`absolute top-1/2 left-1/2 bg-background rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-${color}`}
        style={{ width: size * 0.28, height: size * 0.28 }}
      />
      <div
        className={`absolute inset-0 rounded-full blur-xl bg-${color} opacity-40 -z-10`}
      />
    </div>
  </motion.div>
);

const Landing = () => {
  const [typed, setTyped] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Global mouse parallax (-1..1)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i <= TITLE.length; i++) {
      timers.push(setTimeout(() => setTyped(i), 400 + i * 120));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const features = [
    {
      icon: Search,
      title: "ALL GENERATIONS",
      desc: "Browse every Pokémon ever discovered, with live data from PokéAPI.",
      color: "primary",
    },
    {
      icon: Sparkles,
      title: "SHINY MODE",
      desc: "Toggle alternate palettes and uncover rare shiny variants on demand.",
      color: "secondary",
    },
    {
      icon: Trophy,
      title: "LIVE LEADERBOARD",
      desc: "Track the most viewed Pokémon — no login required.",
      color: "accent",
    },
    {
      icon: QrCode,
      title: "DEEP LINKS & QR",
      desc: "Share any Pokémon with a scannable QR code or copyable URL.",
      color: "primary",
    },
    {
      icon: Palette,
      title: "ULTRA RETRO",
      desc: "Switch into a monochrome GameBoy-inspired theme with a single tap.",
      color: "secondary",
    },
    {
      icon: Zap,
      title: "RANDOM ENCOUNTER",
      desc: "Surprise yourself — jump to a random Pokémon with one click.",
      color: "accent",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <PixelParticles />
      <div className="fixed inset-0 pixel-grid-bg opacity-[0.07] pointer-events-none z-0" />

      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/60 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-pixel text-sm text-primary text-glow-red">
            POKEDEX
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/quiz"
              className="font-pixel text-[9px] md:text-[10px] px-4 py-2 rounded-md bg-accent/10 border border-accent/40 text-accent hover:bg-accent/25 hover:scale-105 transition-all"
            >
              🎮 QUIZ
            </Link>
            <Link
              to="/explore"
              className="font-pixel text-[9px] md:text-[10px] px-4 py-2 rounded-md bg-primary text-primary-foreground hover:scale-105 transition-transform glow-red"
            >
              ENTER ▶
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-24 overflow-hidden">
        {/* Cinematic parallax sprite showcase */}
        <div className="absolute inset-0 pointer-events-none">
          {SHOWCASE.map((s) => (
            <ParallaxSprite key={s.id} {...s} mx={mx} my={my} />
          ))}
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Vignette so center text stays readable */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.55)_45%,hsl(var(--background)/0.92)_85%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card/40 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-pixel-green animate-glow-pulse" />
            <span className="font-pixel text-[8px] text-muted-foreground tracking-widest">
              POWERED BY POKÉAPI · ALL 1000+ POKÉMON
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="flex justify-center gap-1 md:gap-2 mb-6 flex-wrap">
            {TITLE.split("").map((l, i) => (
              <motion.span
                key={i}
                className="font-pixel text-5xl md:text-8xl text-primary"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={
                  i < typed
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 30, scale: 0.8 }
                }
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                style={{
                  textShadow:
                    i < typed
                      ? "0 0 24px hsl(var(--primary) / 0.7), 0 0 60px hsl(var(--primary) / 0.4)"
                      : "none",
                }}
              >
                {l}
              </motion.span>
            ))}
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="text-lg md:text-2xl text-muted-foreground mb-4 font-body"
          >
            {TAGLINE}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="font-pixel text-[10px] md:text-xs text-foreground/70 mb-12 max-w-xl mx-auto leading-relaxed"
          >
            8-BIT NOSTALGIA × APPLE-CINEMATIC UI
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/explore"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-pixel text-xs glow-red hover:scale-105 transition-transform overflow-hidden"
            >
              <span className="relative z-10">START EXPLORING</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link
              to="/explore?filter=all"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-border/70 bg-card/40 backdrop-blur-md text-foreground font-pixel text-xs hover:bg-card/70 hover:border-primary/60 transition-colors"
            >
              VIEW POKÉDEX
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="font-pixel text-[8px] text-muted-foreground tracking-widest">
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-[2px] h-8 bg-gradient-to-b from-primary to-transparent"
            />
          </motion.div>
        </motion.div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none scanline-overlay" />
      </section>

      {/* STATS */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { to: 1000, suffix: "+", l: "POKÉMON" },
            { to: 9, suffix: "", l: "GENERATIONS" },
            { to: 18, suffix: "", l: "TYPES" },
            { to: 0, suffix: "", l: "POSSIBILITIES", fallback: "∞" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="font-pixel text-2xl md:text-3xl text-primary text-glow-red mb-2">
                <CountUp to={s.to} suffix={s.suffix} fallback={s.fallback} />
              </div>
              <div className="font-pixel text-[9px] text-muted-foreground tracking-widest">
                {s.l}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-pixel text-2xl md:text-4xl text-foreground mb-4 text-glow-cyan">
              FEATURES
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you'd want from a modern Pokédex — wrapped in pixel-perfect
              nostalgia and cinematic motion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
              >
                <TiltCard className="h-full">
                  <div className="glass-card p-8 h-full hover:border-primary/40 transition-colors group relative overflow-hidden">
                    <div
                      className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity bg-${f.color}`}
                    />
                    <div
                      className={`relative w-12 h-12 rounded-lg bg-${f.color}/20 border border-${f.color}/40 flex items-center justify-center mb-6`}
                    >
                      <f.icon className={`w-5 h-5 text-${f.color}`} />
                    </div>
                    <h3 className="font-pixel text-xs mb-3 text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TYPE SHOWCASE */}
      <TypeShowcase />

      {/* GENERATION TIMELINE */}
      <GenerationTimeline />

      {/* TRENDING NOW */}
      <TrendingNow />

      {/* CTA */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 blur-3xl" />
          <div className="relative glass-card p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 pixel-grid-bg opacity-10" />
            <div className="relative">
              {/* Pulsing pokéball */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/40"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.9, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary" />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary rounded-t-full" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-muted rounded-b-full" />
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-background -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-background rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-primary" />
                </motion.div>
              </div>

              <h2 className="font-pixel text-xl md:text-3xl mb-4 text-glow-yellow">
                READY, TRAINER?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
                Step inside the Pokédex and start your journey through every region,
                generation, and creature ever known.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-lg bg-primary text-primary-foreground font-pixel text-sm glow-red hover:scale-105 transition-transform"
                >
                  ENTER POKÉDEX
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {/* Glitchy secondary CTA */}
                <Link
                  to={`/pokemon/${Math.floor(Math.random() * 1000) + 1}`}
                  className="group relative inline-flex items-center gap-2 px-8 py-5 rounded-lg border border-accent/60 bg-accent/10 backdrop-blur-md font-pixel text-xs overflow-hidden hover:border-accent transition-colors"
                  data-text="RANDOM ENCOUNTER"
                >
                  <Shuffle className="w-4 h-4 text-accent" />
                  <span className="relative">
                    <span aria-hidden className="absolute inset-0 text-accent opacity-0 group-hover:opacity-100 animate-[glitch_0.6s_steps(2)_infinite] [transform:translate(2px,-1px)]">
                      RANDOM ENCOUNTER
                    </span>
                    <span aria-hidden className="absolute inset-0 text-primary opacity-0 group-hover:opacity-100 animate-[glitch_0.55s_steps(2)_infinite_reverse] [transform:translate(-2px,1px)]">
                      RANDOM ENCOUNTER
                    </span>
                    <span className="relative">RANDOM ENCOUNTER</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER BADGES */}
      <FooterBadges />

      <footer className="relative z-10 border-t border-border/40 py-8 text-center">
        <p className="font-pixel text-[8px] text-muted-foreground">
          DATA FROM POKEAPI.CO • NOT AFFILIATED WITH NINTENDO
        </p>
      </footer>

      {/* Floating chiptune toggle */}
      <AudioToggle />

      {/* Easter egg */}
      <KonamiEgg />
    </div>
  );
};

export default Landing;

