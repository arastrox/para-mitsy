'use client';

import { clamp, easeInOutCubic, lerp } from '@/lib/ease';

// Gatito que despierta al mantenerlo presionado: abre los ojitos, las orejas se
// alzan, el "Zzz" se desvanece y aparece un corazón. `p` va de 0 a 1.

export default function Cat({ p }: { p: number }) {
  const e = easeInOutCubic(clamp(p));
  const eyeOpen = e;
  const sleepO = clamp(1 - p / 0.4);
  const earPerk = lerp(0, 12, e);
  const heartO = clamp((p - 0.4) / 0.5);
  const heartRise = lerp(0, -22, clamp((p - 0.4) / 0.6));
  const fur = '#2c2c33';
  const furDark = '#202026';

  return (
    <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
      {/* glow suave */}
      <defs>
        <radialGradient id="catGlow">
          <stop offset="0%" stopColor="#ffb38f" stopOpacity={0.5 * e} />
          <stop offset="100%" stopColor="#ffb38f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="20" r="135" fill="url(#catGlow)" />

      {/* Cola */}
      <path d="M96 96 C 150 86 150 26 110 36 C 132 44 120 74 96 70 Z" fill={furDark} />

      {/* Cuerpo (loaf) */}
      <ellipse cx="0" cy="74" rx="112" ry="54" fill={fur} />

      {/* Cabeza */}
      <circle cx="0" cy="6" r="62" fill={fur} />

      {/* Orejas */}
      <g transform={`rotate(${-earPerk} -40 -44)`}>
        <path d="M-58 -40 L-30 -78 L-14 -44 Z" fill={fur} />
        <path d="M-48 -44 L-32 -66 L-23 -46 Z" fill="#ff8fb2" opacity="0.8" />
      </g>
      <g transform={`rotate(${earPerk} 40 -44)`}>
        <path d="M58 -40 L30 -78 L14 -44 Z" fill={fur} />
        <path d="M48 -44 L32 -66 L23 -46 Z" fill="#ff8fb2" opacity="0.8" />
      </g>

      {/* Ojos cerrados (dormido) */}
      <g stroke="#0e0e12" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity={sleepO}>
        <path d="M-34 0 Q -22 12 -10 0" />
        <path d="M10 0 Q 22 12 34 0" />
      </g>

      {/* Ojos abiertos (despierto) */}
      <g opacity={eyeOpen}>
        <ellipse cx="-22" cy="-2" rx="11" ry="15" fill="#ffe39a" />
        <ellipse cx="22" cy="-2" rx="11" ry="15" fill="#ffe39a" />
        <ellipse cx="-22" cy="-2" rx="3.2" ry="13" fill="#15150f" />
        <ellipse cx="22" cy="-2" rx="3.2" ry="13" fill="#15150f" />
      </g>

      {/* Nariz y boca */}
      <path d="M-6 20 L6 20 L0 28 Z" fill="#ff8fb2" />
      <path d="M0 28 Q -8 36 -16 30 M0 28 Q 8 36 16 30" stroke="#0e0e12" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Bigotes */}
      <g stroke="#d7d2c8" strokeWidth="2" opacity="0.7" strokeLinecap="round">
        <line x1="-30" y1="22" x2="-92" y2="14" />
        <line x1="-30" y1="30" x2="-90" y2="34" />
        <line x1="30" y1="22" x2="92" y2="14" />
        <line x1="30" y1="30" x2="90" y2="34" />
      </g>

      {/* Zzz */}
      <g opacity={sleepO} fill="#cfd8ff" fontFamily="serif">
        <text x="60" y="-58" fontSize="22">z</text>
        <text x="78" y="-74" fontSize="28">z</text>
        <text x="100" y="-92" fontSize="34">z</text>
      </g>

      {/* Corazón al despertar */}
      <g opacity={heartO} transform={`translate(0 ${-92 + heartRise})`}>
        <path
          d="M0 10 C 0 0 -14 -3 -14 7 C -14 16 0 24 0 30 C 0 24 14 16 14 7 C 14 -3 0 0 0 10 Z"
          fill="#ff5c8a"
        />
      </g>
    </svg>
  );
}
