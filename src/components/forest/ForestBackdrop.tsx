'use client';

// Fondo del bosque: bruma verde-azulada + siluetas de pinos en la base.

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
  [180, 1010, 340],
  [380, 1010, 260],
  [560, 1010, 380],
  [760, 1010, 300],
  [930, 1010, 250],
];
const NEAR = [
  [90, 1030, 460],
  [320, 1030, 380],
  [640, 1030, 520],
  [880, 1030, 420],
];

export default function ForestBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 45% at 50% 14%, rgba(70,110,85,0.28), transparent 70%),
                       radial-gradient(40% 30% at 50% 40%, rgba(120,150,110,0.12), transparent 70%),
                       linear-gradient(180deg, #0c1510 0%, #0a120e 55%, #060a08 100%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <g fill="#0c1a12">
          {FAR.map(([x, y, h], i) => (
            <path key={i} d={pine(x, y, h)} />
          ))}
        </g>
        <g fill="#0a140e">
          {NEAR.map(([x, y, h], i) => (
            <path key={i} d={pine(x, y, h)} />
          ))}
        </g>
      </svg>
    </div>
  );
}
