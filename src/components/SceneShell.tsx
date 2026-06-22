'use client';

import { type ReactNode, useRef, useState } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import Particles, { type ParticleShape } from './Particles';
import Atmosphere from './Atmosphere';
import { useParallax, requestGyro } from '@/lib/parallax';
import { useDailyPhrase } from '@/lib/useDailyPhrase';

// Estructura común a todos los temas: el objeto se abre manteniéndolo presionado
// y, al completarse, revela la frase del día y suena el lofi del tema. Incluye
// atmósfera compartida (niebla/rayos/viñeta/grano), parallax e intro.

type AtmosphereProps = {
  tint?: string;
  tint2?: string;
  ray?: string;
  rays?: boolean;
  grain?: boolean;
};

type Props = {
  audioSrc: string;
  ambientSrc?: string;
  hint: string;
  particleShape: ParticleShape;
  particleColors: string[];
  burstColor?: string;
  atmosphere?: AtmosphereProps;
  background: ReactNode;
  opener: (p: number, bloomed: boolean) => ReactNode;
  openerLabel?: string;
};

const PARALLAX_BG = 'translate3d(calc(var(--mx,0) * 22px), calc(var(--my,0) * 18px), 0)';
const PARALLAX_FG = 'translate3d(calc(var(--mx,0) * -10px), calc(var(--my,0) * -8px), 0)';

export default function SceneShell({
  audioSrc,
  ambientSrc,
  hint,
  particleShape,
  particleColors,
  burstColor = 'rgba(255,160,190,0.5)',
  atmosphere,
  background,
  opener,
  openerLabel = 'Mantén presionado para abrir',
}: Props) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  useParallax(rootRef);

  const mv = useMotionValue(0);
  const [p, setP] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setP(v));

  const [bloomed, setBloomed] = useState(false);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const audioStarted = useRef(false);
  const [muted, setMuted] = useState(false);

  const phrase = useDailyPhrase();

  function playAudio() {
    if (audioStarted.current) return;
    audioStarted.current = true;
    audioRef.current?.play().catch(() => {});
    if (ambientRef.current) {
      ambientRef.current.volume = 0.3;
      ambientRef.current.play().catch(() => {});
    }
  }

  function begin() {
    if (bloomed) return;
    requestGyro();
    playAudio();
    anim.current?.stop();
    anim.current = animate(mv, 1, {
      duration: reduce ? 0.4 : 1.7,
      ease: 'easeInOut',
      onComplete: () => setBloomed(true),
    });
  }

  function cancel() {
    if (bloomed) return;
    anim.current?.stop();
    anim.current = animate(mv, 0, { duration: 0.5, ease: 'easeOut' });
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
    if (ambientRef.current) ambientRef.current.muted = next;
  }

  return (
    <div ref={rootRef} className="relative h-dvh w-full overflow-hidden select-none">
      {/* fondo (con parallax, ligeramente sobredimensionado para no dejar bordes) */}
      <div className="absolute inset-[-8%]" style={{ transform: PARALLAX_BG }}>
        {background}
      </div>

      <Atmosphere {...atmosphere} />
      <Particles active={bloomed} colors={particleColors} shape={particleShape} />

      <AnimatePresence>
        {!bloomed && (
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
        {bloomed && (
          <motion.div
            key="burst"
            initial={{ opacity: 0.6, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.3 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `radial-gradient(circle, ${burstColor}, transparent 60%)` }}
          />
        )}
      </AnimatePresence>

      {/* objeto interactivo (con parallax inverso para dar profundidad) */}
      <div className="absolute inset-0 z-[6] flex items-center justify-center" style={{ transform: PARALLAX_FG }}>
        <div
          className="relative h-[min(78vw,400px)] w-[min(78vw,400px)] cursor-pointer touch-none"
          style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
          onPointerDown={begin}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(ev) => ev.preventDefault()}
          role="button"
          aria-label={openerLabel}
        >
          {opener(p, bloomed)}
        </div>
      </div>

      <AnimatePresence>
        {!bloomed && p < 0.02 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            exit={{ opacity: 0, transition: { duration: 0.35, repeat: 0 } }}
            transition={{ duration: 2.6, repeat: Infinity }}
            className="absolute bottom-[15%] left-0 right-0 z-20 text-center text-sm text-white/70"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bloomed && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute bottom-[9%] left-0 right-0 z-20 px-8 text-center"
          >
            <p className="mx-auto max-w-md font-serif text-2xl leading-relaxed text-white sm:text-3xl">
              {phrase}
            </p>
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

      {/* intro: fundido desde negro */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-40 bg-[#08070c]"
        />
      )}

      <audio ref={audioRef} src={audioSrc} loop preload="auto" />
      {ambientSrc && <audio ref={ambientRef} src={ambientSrc} loop preload="auto" />}
    </div>
  );
}
