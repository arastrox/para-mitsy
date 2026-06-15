'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CozyBackdrop from './CozyBackdrop';
import LottieCat from './LottieCat';
import SparkleCanvas from '../SparkleCanvas';
import Particles from '../Particles';
import { phraseOfTheDay } from '@/lib/phrases';
import { clamp } from '@/lib/ease';

// Mundo de los gatitos (mecánica propia): acaricia al gato (arrastra sobre él),
// se va acercando y, al completarse el cariño, la cámara hace zoom al dije de su
// collar, que se abre y revela la frase del día.

export default function CatsScene() {
  const [pet, setPet] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const pettingRef = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioStarted = useRef(false);
  const [muted, setMuted] = useState(false);

  const phrase = phraseOfTheDay();

  function startAudio() {
    const a = audioRef.current;
    if (!a || audioStarted.current) return;
    a.volume = 0.45;
    a.play().then(() => {
      audioStarted.current = true;
    }).catch(() => {});
  }

  function reveal() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
  }

  function onDown(e: React.PointerEvent) {
    if (revealedRef.current) return;
    startAudio();
    pettingRef.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
  }
  function onMove(e: React.PointerEvent) {
    if (!pettingRef.current || revealedRef.current) return;
    const last = lastPt.current;
    if (!last) return;
    const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
    lastPt.current = { x: e.clientX, y: e.clientY };
    setPet((p) => {
      const np = clamp(p + dist * 0.0013);
      if (np >= 1) reveal();
      return np;
    });
  }
  function endPet() {
    pettingRef.current = false;
    lastPt.current = null;
  }

  // Decaimiento suave del cariño si dejas de acariciar (sensación de caricia).
  useEffect(() => {
    const id = setInterval(() => {
      if (pettingRef.current || revealedRef.current) return;
      setPet((p) => (p > 0 ? Math.max(0, p - 0.02) : 0));
    }, 120);
    return () => clearInterval(id);
  }, []);

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }

  const catScale = 1 + pet * 0.16;

  return (
    <div className="relative h-dvh w-full overflow-hidden select-none">
      <CozyBackdrop />
      <SparkleCanvas colorA="#ffd0a8" colorB="#ff9ec1" countA={50} countB={22} />
      <Particles active={revealed} colors={['#ff5c8a', '#ff9ec1', '#ffd0d6', '#ffe6a7']} shape="heart" />

      <AnimatePresence>
        {!revealed && (
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

      {/* Escena del gato (acariciable) */}
      <motion.div
        className="absolute inset-0 z-[6] flex items-center justify-center touch-none"
        style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endPet}
        onPointerLeave={endPet}
        onPointerCancel={endPet}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        aria-label="Acaricia al gatito para que se acerque"
        animate={revealed ? { scale: 1.9, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      >
        <div
          className="relative h-[min(82vw,420px)] w-[min(82vw,420px)]"
          style={{ transform: `scale(${catScale})`, transition: 'transform 0.12s linear' }}
        >
          <LottieCat />
          {/* dije del collar (anticipo) */}
          <div className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2">
            <Pendant size={26} glow={0.4 + pet * 0.6} />
          </div>
        </div>
      </motion.div>

      {/* Pista + medidor de cariño */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="absolute bottom-[14%] left-0 right-0 z-20 flex flex-col items-center gap-3 px-10"
          >
            <p className="text-center text-sm text-white/70">
              {pet > 0.05 ? 'Sigue acariciándolo… 🐾' : 'Acarícialo para que se acerque 🐾'}
            </p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#ff9ec1]"
                style={{ width: `${pet * 100}%`, transition: 'width 0.12s linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revelado: zoom al dije del collar + frase */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="absolute inset-0 z-[12] flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-6"
            >
              <Pendant size={84} glow={1} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="mx-auto max-w-md font-serif text-2xl leading-relaxed text-white sm:text-3xl"
            >
              {phrase}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-4 text-sm tracking-wide text-white/60"
            >
              — Pablo
            </motion.p>
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

      <audio ref={audioRef} src="/audio/lofi-placeholder.mp3" loop preload="auto" />
    </div>
  );
}

function Pendant({ size, glow }: { size: number; glow: number }) {
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="pendantGlow">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity={0.9 * glow} />
          <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="50%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#caa12f" />
        </linearGradient>
      </defs>
      <circle cx="0" cy="0" r="48" fill="url(#pendantGlow)" />
      <path
        d="M0 30 C 0 14 -26 6 -26 -12 C -26 -28 -8 -30 0 -16 C 8 -30 26 -28 26 -12 C 26 6 0 14 0 30 Z"
        fill="url(#gold)"
        stroke="#fff3c8"
        strokeWidth="1.5"
      />
      <path d="M-9 -12 C -9 -18 -2 -19 0 -13 C 2 -19 9 -18 9 -12 C 9 -5 0 0 0 4 C 0 0 -9 -5 -9 -12 Z" fill="#fff6d8" opacity="0.5" />
    </svg>
  );
}
