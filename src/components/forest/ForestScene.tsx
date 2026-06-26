'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ForestBackdrop from './ForestBackdrop';
import Lantern from './Lantern';
import SparkleCanvas from '../SparkleCanvas';
import Particles from '../Particles';
import Atmosphere from '../Atmosphere';
import { useParallax, requestGyro } from '@/lib/parallax';
import { useDailyPhrase } from '@/lib/useDailyPhrase';

// Mundo del bosque (mecánica propia): guías/arrastras las luciérnagas hacia el
// farol; cada una que entra lo enciende un poco más; al reunirlas todas, estalla
// en luz y revela la frase del día.

const TOTAL = 6;

export default function ForestScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  useParallax(rootRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [collected, setCollected] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const pressing = useRef(false);
  const ptr = useRef({ x: 0, y: 0 });

  const phrase = useDailyPhrase();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioStarted = useRef(false);
  const [muted, setMuted] = useState(false);

  const p = revealed ? 1 : collected / TOTAL;

  function startAudio() {
    const a = audioRef.current;
    if (!a || audioStarted.current) return;
    audioStarted.current = true;
    a.volume = 0.45;
    a.play().catch(() => {});
  }

  function onDown(e: React.PointerEvent) {
    if (revealedRef.current) return;
    requestGyro();
    startAudio();
    pressing.current = true;
    ptr.current = { x: e.clientX, y: e.clientY };
  }
  function onMove(e: React.PointerEvent) {
    ptr.current = { x: e.clientX, y: e.clientY };
  }
  function onUp() {
    pressing.current = false;
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }

  // Simulación de luciérnagas en canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    function resize() {
      const c = canvasRef.current;
      const cx = ctx;
      if (!c || !cx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + 'px';
      c.style.height = window.innerHeight + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    let flies = Array.from({ length: TOTAL }, () => ({
      x: Math.random() * W(),
      y: H() * 0.12 + Math.random() * H() * 0.7,
      vx: 0,
      vy: 0,
      ph: Math.random() * 6,
    }));
    let count = 0;
    let orbiters: { ang: number; r: number; sp: number; ph: number; wob: number; size: number }[] = [];
    let t = 0;

    function loop() {
      if (!ctx) return;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.46; // centro del farol

      for (let i = flies.length - 1; i >= 0; i--) {
        const f = flies[i];
        f.vx += (Math.random() - 0.5) * 0.06;
        f.vy += (Math.random() - 0.5) * 0.06;
        if (pressing.current && !reduce) {
          const dx = ptr.current.x - f.x;
          const dy = ptr.current.y - f.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 260) {
            f.vx += (dx / d) * 0.6;
            f.vy += (dy / d) * 0.6;
          }
        }
        f.vx *= 0.93;
        f.vy *= 0.93;
        f.x += f.vx;
        f.y += f.vy;
        f.ph += 0.08;
        if (f.x < 12) { f.x = 12; f.vx *= -0.5; }
        if (f.x > w - 12) { f.x = w - 12; f.vx *= -0.5; }
        if (f.y < 12) { f.y = 12; f.vy *= -0.5; }
        if (f.y > h - 12) { f.y = h - 12; f.vy *= -0.5; }

        if (Math.hypot(f.x - cx, f.y - cy) < 48) {
          flies.splice(i, 1);
          count++;
          setCollected(count);
          if (count >= TOTAL && !revealedRef.current) {
            revealedRef.current = true;
            setRevealed(true);
            orbiters = Array.from({ length: 20 }, (_, k) => ({
              ang: (k / 20) * Math.PI * 2,
              r: 64 + Math.random() * 78,
              sp: (0.004 + Math.random() * 0.006) * (Math.random() < 0.5 ? 1 : -1),
              ph: Math.random() * 6.28,
              wob: 6 + Math.random() * 12,
              size: 2.4 + Math.random() * 2.2,
            }));
          }
          continue;
        }

        const glow = 0.6 + 0.4 * Math.sin(f.ph);
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.shadowBlur = 16 * glow;
        ctx.shadowColor = '#ffe8a0';
        ctx.fillStyle = '#fff4c0';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3.2 + glow * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // luciérnagas orbitando el farol tras encenderlo
      t += 0.016;
      for (const o of orbiters) {
        o.ang += o.sp;
        const rad = o.r + Math.sin(t * 1.3 + o.ph) * o.wob;
        const ox = cx + Math.cos(o.ang) * rad;
        const oy = cy + Math.sin(o.ang) * rad * 0.72;
        const glow = 0.55 + 0.45 * Math.sin(t * 3 + o.ph);
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.4 * glow;
        ctx.shadowBlur = 14 * glow;
        ctx.shadowColor = '#ffe8a0';
        ctx.fillStyle = '#fff4c0';
        ctx.beginPath();
        ctx.arc(ox, oy, o.size + glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative h-dvh w-full overflow-hidden select-none">
      <div className="absolute inset-[-8%]" style={{ transform: 'translate3d(calc(var(--mx,0) * 22px), calc(var(--my,0) * 18px), 0)' }}>
        <ForestBackdrop />
        <SparkleCanvas colorA="#a7e0a8" colorB="#d8efb4" countA={40} countB={18} />
      </div>
      <Atmosphere tint="rgba(120,180,140,0.5)" tint2="rgba(80,140,110,0.45)" rays={false} />

      {/* charco de luz que crece con el progreso */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '70vmin',
          height: '70vmin',
          background: 'radial-gradient(circle, rgba(255,200,110,0.35), transparent 60%)',
          opacity: p,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* farol (se enciende con el progreso) */}
      <div className="absolute inset-0 z-[6] flex items-center justify-center" style={{ transform: 'translate3d(calc(var(--mx,0) * -10px), calc(var(--my,0) * -8px), 0)' }}>
        <div className="sway relative h-[min(78vw,400px)] w-[min(78vw,400px)]">
          <Lantern p={p} />
        </div>
      </div>

      {/* luciérnagas (canvas) */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[8]" aria-hidden />

      {/* capa que captura el gesto */}
      {!revealed && (
        <div
          className="absolute inset-0 z-[12] touch-none"
          style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          onContextMenu={(e) => e.preventDefault()}
          role="button"
          aria-label="Guía las luciérnagas hacia el farol"
        />
      )}

      {/* hojas al encender */}
      <Particles active={revealed} colors={['#3a6652', '#5b8a6a', '#86b08a', '#c79a4a']} shape="leaf" />

      <AnimatePresence>
        {!revealed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute top-[13%] left-0 right-0 z-20 text-center text-sm uppercase tracking-[0.35em] text-white/70"
          >
            Para ti, amorcito
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0.7, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-[46%] z-[5] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,210,130,0.6), transparent 60%)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="absolute bottom-[14%] left-0 right-0 z-20 flex flex-col items-center gap-3 px-10"
          >
            <p className="text-center text-sm text-white/70">
              {collected > 0 ? 'Llévalas al farol… 🪰' : 'Guía las luciérnagas hacia el farol 🪰'}
            </p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#ffd27a]" style={{ width: `${p * 100}%`, transition: 'width 0.3s ease' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute bottom-[9%] left-0 right-0 z-20 px-8 text-center"
          >
            <p className="mx-auto max-w-md font-serif text-2xl leading-relaxed text-white sm:text-3xl">{phrase}</p>
            <p className="mt-4 text-sm tracking-wide text-white/60">— Pablo</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMute}
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        className="absolute right-5 top-5 z-30 rounded-full bg-white/10 p-3 text-base leading-none backdrop-blur transition hover:bg-white/20"
      >
        {muted ? '🔇' : '🎵'}
      </button>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0 z-40 bg-[#08070c]"
      />

      <audio ref={audioRef} src="/audio/forest-placeholder.mp3" loop preload="auto" />
    </div>
  );
}
