'use client';

import { clamp, easeInOutCubic, lerp } from '@/lib/ease';

// Constelación que se enciende al mantener presionado: las líneas se dibujan y
// las estrellas brillan a medida que `p` va de 0 a 1. Guiño a Sagitario (Mitsy).

const STARS: [number, number, number][] = [
  // x, y, tamaño relativo
  [-92, 44, 1],
  [-48, 16, 1.3],
  [-6, -16, 1],
  [34, -34, 1.6],
  [74, -8, 1.1],
  [40, 30, 1],
  [2, 56, 1.2],
  [-30, -52, 0.9],
];
const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [5, 6],
  [2, 7],
];

export default function Constellation({ p }: { p: number }) {
  const e = easeInOutCubic(clamp(p));
  const lineO = clamp((p - 0.1) / 0.6);
  const starGlow = lerp(0.25, 1, e);
  const coreScale = lerp(0.6, 1, e);

  return (
    <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="starHalo">
          <stop offset="0%" stopColor="#fff4c2" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffd86b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g stroke="#cfd8ff" strokeWidth="1.6" strokeLinecap="round" opacity={lineO * 0.8}>
        {LINES.map(([a, b], i) => (
          <line key={i} x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]} />
        ))}
      </g>

      {STARS.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={26 * s} fill="url(#starHalo)" opacity={starGlow * 0.7} />
          <circle r={3.4 * s * coreScale} fill="#fff6d8" />
          <circle r={1.6 * s * coreScale} fill="#ffffff" />
        </g>
      ))}
    </svg>
  );
}
