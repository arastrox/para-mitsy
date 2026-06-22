'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CozyBackdrop from './CozyBackdrop';
import LottieCat from './LottieCat';
import SparkleCanvas from '../SparkleCanvas';
import Particles from '../Particles';
import { useDailyPhrase } from '@/lib/useDailyPhrase';
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

  const phrase = useDailyPhrase();

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
              initial={{ scale: 0.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.55, ease: [0.34, 1.4, 0.64, 1] }}
            >
              <HeartReveal phrase={phrase} />
            </motion.div>
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

// Corazón del collar, ampliado: la frase aparece DENTRO del corazón.
function HeartReveal({ phrase }: { phrase: string }) {
  const heart =
    'M50 86 C 8 56 2 28 22 14 C 37 3 50 15 50 27 C 50 15 63 3 78 14 C 98 28 92 56 50 86 Z';
  return (
    <div
      className="relative"
      style={{ width: 'min(94vw, 460px)', aspectRatio: '100 / 92', filter: 'drop-shadow(0 12px 34px rgba(0,0,0,0.55))' }}
    >
      <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9184a" />
            <stop offset="100%" stopColor="#7a1030" />
          </linearGradient>
          <radialGradient id="heartShine" cx="50%" cy="32%" r="55%">
            <stop offset="0%" stopColor="#ff9ec1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff9ec1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={heart} fill="url(#heartFill)" stroke="#f5c451" strokeWidth="1.8" />
        <path d={heart} fill="url(#heartShine)" />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: '22% 19% 25%' }}
      >
        <p className="font-serif leading-snug text-white" style={{ fontSize: 'clamp(0.85rem, 3.6vw, 1.2rem)' }}>
          {phrase}
        </p>
        <p className="mt-2 text-xs tracking-wide text-white/70">— Pablo</p>
      </div>
    </div>
  );
}
