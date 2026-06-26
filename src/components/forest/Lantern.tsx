'use client';

import { clamp, easeInOutCubic, lerp } from '@/lib/ease';

// Farol detallado: armazón metálico con sombreado cilíndrico (volumen),
// cúpula, base, barrotes y cristal con reflejo. La llama nace en la mecha y la
// luz cálida llena el cristal a medida que `p` va de 0 a 1.

export default function Lantern({ p }: { p: number }) {
  const e = easeInOutCubic(clamp(p));
  const flame = lerp(0.2, 1, e);
  const glowR = lerp(24, 155, e);
  const glowO = lerp(0.06, 0.75, e);
  const litO = e;

  return (
    <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="lanternGlow">
          <stop offset="0%" stopColor="#ffcf6e" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffcf6e" stopOpacity="0" />
        </radialGradient>
        {/* metal con brillo cilíndrico (horizontal) → da volumen */}
        <linearGradient id="metalH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#191309" />
          <stop offset="20%" stopColor="#6b563a" />
          <stop offset="44%" stopColor="#c5a572" />
          <stop offset="56%" stopColor="#c5a572" />
          <stop offset="80%" stopColor="#6b563a" />
          <stop offset="100%" stopColor="#191309" />
        </linearGradient>
        <linearGradient id="metalV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b27e" />
          <stop offset="100%" stopColor="#4e3f2a" />
        </linearGradient>
        <linearGradient id="glassDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15110b" />
          <stop offset="100%" stopColor="#241a10" />
        </linearGradient>
        <radialGradient id="glassLit" cx="50%" cy="64%" r="62%">
          <stop offset="0%" stopColor="#fff1c4" />
          <stop offset="50%" stopColor="#ffb454" />
          <stop offset="100%" stopColor="#d9791e" />
        </radialGradient>
        <radialGradient id="flameGrad">
          <stop offset="0%" stopColor="#fff6c8" />
          <stop offset="55%" stopColor="#ffae33" />
          <stop offset="100%" stopColor="#ff6a00" />
        </radialGradient>
        <filter id="lanternShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <circle cx="0" cy="8" r={glowR} fill="url(#lanternGlow)" opacity={glowO} />

      <g filter="url(#lanternShadow)">
        {/* colgante */}
        <circle cx="0" cy="-126" r="10" fill="none" stroke="url(#metalV)" strokeWidth="5" />
        <line x1="0" y1="-116" x2="0" y2="-100" stroke="#5b4a36" strokeWidth="5" />

        {/* cúpula */}
        <path d="M-48 -98 Q 0 -120 48 -98 L 33 -80 L -33 -80 Z" fill="url(#metalV)" />
        <ellipse cx="0" cy="-99" rx="48" ry="7" fill="#3a2f22" />

        {/* cristal de fondo + luz cálida */}
        <rect x="-37" y="-80" width="74" height="150" rx="9" fill="url(#glassDark)" />
        <rect x="-37" y="-80" width="74" height="150" rx="9" fill="url(#glassLit)" opacity={litO} />

        {/* mecha + llama (crece hacia arriba desde la base) */}
        <line x1="0" y1="44" x2="0" y2="58" stroke="#3a2a18" strokeWidth="3" />
        <g transform={`translate(0 46) scale(${flame})`}>
          <path d="M0 0 C 16 -14 11 -36 0 -48 C -11 -36 -16 -14 0 0 Z" fill="url(#flameGrad)" />
          <path d="M0 -6 C 8 -16 5 -30 0 -38 C -5 -30 -8 -16 0 -6 Z" fill="#fff3c0" opacity="0.9" />
        </g>

        {/* reflejo en el cristal */}
        <rect x="-28" y="-74" width="11" height="132" rx="5" fill="#ffffff" opacity={0.1 + 0.12 * e} />

        {/* barrotes y armazón (metal cilíndrico) */}
        <rect x="-44" y="-80" width="9" height="150" rx="3" fill="url(#metalH)" />
        <rect x="35" y="-80" width="9" height="150" rx="3" fill="url(#metalH)" />
        <rect x="-2" y="-80" width="4" height="150" fill="#3a2f22" opacity="0.55" />
        <rect x="-37" y="-80" width="74" height="9" rx="3" fill="url(#metalH)" />
        <rect x="-37" y="61" width="74" height="9" rx="3" fill="url(#metalH)" />

        {/* base */}
        <path d="M-48 70 L48 70 L36 92 L-36 92 Z" fill="url(#metalV)" />
        <ellipse cx="0" cy="70" rx="48" ry="6" fill="#3a2f22" />
      </g>
    </svg>
  );
}
