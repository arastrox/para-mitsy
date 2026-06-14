'use client';

import type { FloralPalette, SilhouetteSpec } from '@/lib/floral';

// Fondo floral suave (no invasivo): un ambiente de color del día + siluetas de
// flores difuminadas. Tanto el color como la composición (cantidad, posición,
// tamaño y pétalos de cada silueta) varían cada día.

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function Silhouette({ cx, cy, r, petals, rot, tone, opacity }: SilhouetteSpec) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.22}
          ry={r * 0.62}
          fill={tone}
          transform={`rotate(${(i * 360) / petals + rot} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.3} fill={tone} />
    </g>
  );
}

export default function FloralBackdrop({
  palette,
  silhouettes,
}: {
  palette: FloralPalette;
  silhouettes: SilhouetteSpec[];
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ambiente de color del día (sustituye el negro plano) */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 14% 12%, ${rgba(palette.glow, 0.16)}, transparent 70%),
                       radial-gradient(55% 45% at 88% 88%, ${rgba(palette.tones[0], 0.14)}, transparent 70%),
                       radial-gradient(50% 40% at 95% 30%, ${rgba(palette.tones[1], 0.1)}, transparent 70%),
                       linear-gradient(180deg, #140a16 0%, #0b0910 55%, #08070c 100%)`,
        }}
      />

      {/* Siluetas florales difuminadas, distintas cada día */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <g filter="url(#softBlur)">
          {silhouettes.map((s, i) => (
            <Silhouette key={i} {...s} />
          ))}
        </g>
      </svg>
    </div>
  );
}
