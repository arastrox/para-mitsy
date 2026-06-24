'use client';

import { clamp, easeInOutCubic, lerp } from '@/lib/ease';

// Farol que se enciende al mantenerlo presionado: la llama crece y la luz cálida
// llena el cristal mientras `p` va de 0 a 1.

export default function Lantern({ p }: { p: number }) {
  const e = easeInOutCubic(clamp(p));
  const flame = lerp(0.25, 1, e);
  const glowR = lerp(28, 150, e);
  const glowO = lerp(0.08, 0.7, e);
  const lightO = lerp(0, 0.85, e);

  return (
    <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="lanternGlow">
          <stop offset="0%" stopColor="#ffcf6e" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffcf6e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glassLight" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff9a2e" />
          <stop offset="100%" stopColor="#ffe9a8" />
        </linearGradient>
        <radialGradient id="flameGrad">
          <stop offset="0%" stopColor="#fff6c8" />
          <stop offset="55%" stopColor="#ffae33" />
          <stop offset="100%" stopColor="#ff6a00" />
        </radialGradient>
      </defs>

      <circle cx="0" cy="6" r={glowR} fill="url(#lanternGlow)" opacity={glowO} />

      {/* Colgante */}
      <circle cx="0" cy="-118" r="10" fill="none" stroke="#6b5640" strokeWidth="5" />
      <line x1="0" y1="-108" x2="0" y2="-96" stroke="#6b5640" strokeWidth="4" />

      {/* Tapa */}
      <path d="M-44 -96 L44 -96 L30 -74 L-30 -74 Z" fill="#5b4a36" />

      {/* Cuerpo */}
      <rect x="-40" y="-74" width="80" height="150" rx="14" fill="#241d15" stroke="#6b5640" strokeWidth="4" />

      {/* Luz cálida dentro del cristal */}
      <rect x="-32" y="-66" width="64" height="134" rx="10" fill="url(#glassLight)" opacity={lightO} />

      {/* Mecha */}
      <line x1="0" y1="46" x2="0" y2="60" stroke="#3a2a18" strokeWidth="3" />

      {/* Llama: anclada en la base (0,0 local) → crece hacia arriba desde la mecha */}
      <g transform={`translate(0 48) scale(${flame})`}>
        <path d="M0 0 C 16 -14 11 -36 0 -48 C -11 -36 -16 -14 0 0 Z" fill="url(#flameGrad)" />
        <path d="M0 -6 C 8 -16 5 -30 0 -38 C -5 -30 -8 -16 0 -6 Z" fill="#fff3c0" opacity="0.9" />
      </g>

      {/* Barras del cristal */}
      <line x1="0" y1="-66" x2="0" y2="68" stroke="#6b5640" strokeWidth="3" opacity="0.45" />

      {/* Base */}
      <path d="M-44 76 L44 76 L34 96 L-34 96 Z" fill="#5b4a36" />
    </svg>
  );
}
