'use client';

// Fondo del bosque con profundidad: luna, bruma y tres capas de pinos.

function pine(cx: number, baseY: number, h: number) {
  const w = h * 0.5;
  const tiers = 3;
  let d = '';
  for (let i = 0; i < tiers; i++) {
    const top = baseY - h + (i * h) / tiers;
    const half = (w * (i + 1.4)) / (tiers + 0.4);
    const bottom = baseY - h + ((i + 1) * h) / tiers + h * 0.06;
    d += `M${cx - half} ${bottom} L${cx} ${top} L${cx + half} ${bottom} Z `;
  }
  d += `M${cx - 5} ${baseY} L${cx + 5} ${baseY} L${cx + 5} ${baseY - h * 0.12} L${cx - 5} ${baseY - h * 0.12} Z`;
  return d;
}

const FAR = [
  [120, 1010, 300],
  [300, 1010, 230],
  [480, 1010, 340],
  [660, 1010, 270],
  [840, 1010, 320],
  [960, 1010, 240],
];
const MID = [
  [60, 1020, 420],
  [260, 1020, 340],
  [520, 1020, 460],
  [740, 1020, 380],
  [920, 1020, 420],
];
const NEAR = [
  [10, 1040, 560],
  [360, 1040, 440],
  [700, 1040, 600],
  [980, 1040, 500],
];

export default function ForestBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(40% 26% at 72% 16%, rgba(200,225,210,0.22), transparent 70%),
                       radial-gradient(60% 45% at 50% 12%, rgba(70,110,85,0.28), transparent 70%),
                       linear-gradient(180deg, #0d1712 0%, #0a120e 55%, #060a08 100%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <radialGradient id="moonGlow">
            <stop offset="0%" stopColor="#eef6ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#eef6ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fc7ad" stopOpacity="0" />
            <stop offset="100%" stopColor="#9fc7ad" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Luna */}
        <circle cx="720" cy="170" r="150" fill="url(#moonGlow)" />
        <circle cx="720" cy="170" r="46" fill="#eef6ee" opacity="0.92" />
        <circle cx="742" cy="158" r="40" fill="#0c1410" opacity="0.35" />

        {/* Pinos: lejos → cerca */}
        <g fill="#0c1a12">
          {FAR.map(([x, y, h], i) => (
            <path key={i} d={pine(x, y, h)} />
          ))}
        </g>
        <g fill="#0a160f">
          {MID.map(([x, y, h], i) => (
            <path key={i} d={pine(x, y, h)} />
          ))}
        </g>
        {/* Bruma entre capas */}
        <rect x="0" y="640" width="1000" height="360" fill="url(#mist)" />
        <g fill="#07110b">
          {NEAR.map(([x, y, h], i) => (
            <path key={i} d={pine(x, y, h)} />
          ))}
        </g>
      </svg>
    </div>
  );
}
