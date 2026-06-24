'use client';

import type { CSSProperties } from 'react';

// Capa de atmósfera compartida: niebla teñida que se desplaza, rayos de luz,
// viñeta y grano. Da "ambiente" y profundidad a cualquier escena.

type Props = {
  tint?: string;
  tint2?: string;
  ray?: string;
  rays?: boolean;
  grain?: boolean;
};

export default function Atmosphere({
  tint = 'rgba(255,255,255,0.5)',
  tint2 = 'rgba(255,255,255,0.4)',
  ray = 'rgba(255,255,255,0.05)',
  rays = true,
  grain = true,
}: Props) {
  const vars = {
    '--atmo-tint': tint,
    '--atmo-tint2': tint2,
    '--atmo-ray': ray,
  } as CSSProperties;

  // Los "rayos" (rays/ray) quedaron como rayas diagonales feas; se eliminaron.
  // Se conservan los props para compatibilidad, pero no se renderizan.
  void rays;

  return (
    <div className="atmo" style={vars} aria-hidden>
      <div className="atmo-fog atmo-fog-a" />
      <div className="atmo-fog atmo-fog-b" />
      <div className="atmo-vignette" />
      {grain && <div className="atmo-grain" />}
    </div>
  );
}
