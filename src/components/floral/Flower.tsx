'use client';

import type { FloralVariant } from '@/lib/floral';

// Flor SVG de pétalos independientes cuyo estado de apertura depende de `p`
// (0 = capullo, 1 = flor abierta). La forma y los colores vienen de `variant`
// (cambian cada día). Sin estado propio: la escena conduce `p`.

type Props = { p: number; variant: FloralVariant };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function petalPath(w: number, len: number) {
  return `M0 0 C ${-w} ${-len * 0.3} ${-w} ${-len * 0.72} 0 ${-len} C ${w} ${-len * 0.72} ${w} ${-len * 0.3} 0 0 Z`;
}

export default function Flower({ p, variant }: Props) {
  const { petals: count, petalW, petalLen, palette } = variant;
  const e = easeInOutCubic(clamp(p));
  const spread = lerp(4, 30, e);
  const petalScale = lerp(0.3, 1, e);
  const petalOpacity = clamp((p - 0.05) / 0.5);
  const budOpacity = clamp(1 - p / 0.45);
  const core = lerp(5, 24, e);
  const glowR = lerp(46, 132, e);
  const glowO = lerp(0.12, 0.55, e);

  const d = petalPath(petalW, petalLen);

  const petals = Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count;
    return (
      <g key={i} transform={`rotate(${angle})`}>
        <g transform={`translate(0 ${-spread}) scale(${petalScale})`} opacity={petalOpacity}>
          <path d={d} fill="url(#petalGrad)" />
          <path d={petalPath(petalW * 0.5, petalLen * 0.78)} fill="url(#petalShine)" opacity="0.7" />
        </g>
      </g>
    );
  });

  return (
    <svg viewBox="-150 -150 300 300" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="glowGrad">
          <stop offset="0%" stopColor={palette.glow} stopOpacity="0.9" />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="petalGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={palette.petal[0]} />
          <stop offset="55%" stopColor={palette.petal[1]} />
          <stop offset="100%" stopColor={palette.petal[2]} />
        </linearGradient>
        <radialGradient id="petalShine">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="coreGrad">
          <stop offset="0%" stopColor={palette.center[0]} />
          <stop offset="70%" stopColor={palette.center[1]} />
          <stop offset="100%" stopColor={palette.center[2]} />
        </radialGradient>
        <radialGradient id="budGrad">
          <stop offset="0%" stopColor="#7fb98a" />
          <stop offset="100%" stopColor="#3f6b4e" />
        </radialGradient>
      </defs>

      <circle cx="0" cy="0" r={glowR} fill="url(#glowGrad)" opacity={glowO} />

      <g>{petals}</g>

      <circle cx="0" cy="0" r={core} fill="url(#coreGrad)" opacity={petalOpacity} />

      {/* Capullo cerrado que se desvanece al abrir */}
      <g opacity={budOpacity}>
        <path d="M0 42 C-26 24 -26 -22 0 -46 C26 -22 26 24 0 42 Z" fill="url(#budGrad)" />
        <path d="M0 42 C-10 18 -10 -22 0 -46 C10 -22 10 18 0 42 Z" fill="#345c41" opacity="0.5" />
      </g>
    </svg>
  );
}
