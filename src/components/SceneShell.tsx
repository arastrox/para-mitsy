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
import { phraseOfTheDay } from '@/lib/phrases';

// Estructura común a todos los temas: el objeto se abre manteniéndolo presionado
// y, al completarse, revela la frase del día y suena el lofi del tema. Cada tema
// aporta su fondo y su "objeto que se abre" (opener) reactivo a `p` (0..1).

type Props = {
  audioSrc: string;
  hint: string;
  particleShape: ParticleShape;
  particleColors: string[];
  burstColor?: string;
  background: ReactNode;
  opener: (p: number, bloomed: boolean) => ReactNode;
  openerLabel?: string;
};

export default function SceneShell({
  audioSrc,
  hint,
  particleShape,
  particleColors,
  burstColor = 'rgba(255,160,190,0.5)',
  background,
  opener,
  openerLabel = 'Mantén presionado para abrir',
}: Props) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [p, setP] = useState(0);
  useMotionValueEvent(mv, 'change', (v) => setP(v));

  const [bloomed, setBloomed] = useState(false);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioStarted = useRef(false);
  const [muted, setMuted] = useState(false);

  const phrase = phraseOfTheDay();

  function playAudio() {
    const a = audioRef.current;
    if (!a || audioStarted.current) return;
    a.volume = 0.45;
    a.play().then(() => {
      audioStarted.current = true;
    }).catch(() => {});
  }

  function begin() {
    if (bloomed) return;
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
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      {background}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_30%,transparent_55%,rgba(6,6,12,0.5)_100%)]" />
      <Particles active={bloomed} colors={particleColors} shape={particleShape} />

      <AnimatePresence>
        {!bloomed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 1 }}
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

      <div className="absolute inset-0 z-[6] flex items-center justify-center">
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

      <audio ref={audioRef} src={audioSrc} loop preload="auto" />
    </div>
  );
}
