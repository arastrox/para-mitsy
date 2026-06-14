'use client';

// Fondo acogedor: tonos cálidos + bolitas suaves (estilo ovillos/bokeh).

export default function CozyBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 50% 16%, rgba(255,150,110,0.18), transparent 70%),
                       radial-gradient(50% 40% at 16% 84%, rgba(255,120,160,0.16), transparent 70%),
                       radial-gradient(45% 38% at 88% 78%, rgba(255,190,120,0.14), transparent 70%),
                       linear-gradient(180deg, #1a1012 0%, #140c10 55%, #0c080a 100%)`,
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id="cozyBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <g filter="url(#cozyBlur)" opacity="0.16">
          <circle cx="150" cy="170" r="90" fill="#ff9e7a" />
          <circle cx="880" cy="840" r="130" fill="#ff7aa2" />
          <circle cx="930" cy="300" r="70" fill="#ffce8a" />
        </g>
      </svg>
    </div>
  );
}
