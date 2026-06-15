'use client';

import { useEffect, useRef, useState } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';

// Carga el gato animado desde public/lottie/cat.json (lo eliges tú en
// LottieFiles). Si aún no existe, muestra una silueta de gato como marcador.

export default function LottieCat() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let cancelled = false;

    fetch('/lottie/cat.json', { cache: 'force-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('sin cat.json');
        return r.json();
      })
      .then((data) => {
        if (cancelled || !ref.current) return;
        anim = lottie.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data,
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  if (failed) return <FallbackCat />;
  return <div ref={ref} className="h-full w-full" aria-hidden />;
}

function FallbackCat() {
  return (
    <svg viewBox="-100 -120 200 240" width="100%" height="100%" aria-hidden>
      <defs>
        <radialGradient id="catEye">
          <stop offset="0%" stopColor="#fff0b0" />
          <stop offset="100%" stopColor="#ffb454" />
        </radialGradient>
      </defs>
      {/* cuerpo sentado */}
      <path d="M-58 104 C -68 36 -40 -6 0 -6 C 40 -6 68 36 58 104 Z" fill="#26262b" />
      {/* cola */}
      <path d="M56 100 C 96 92 92 40 68 50 C 86 60 78 86 56 84 Z" fill="#1d1d22" />
      {/* cabeza */}
      <circle cx="0" cy="-44" r="42" fill="#26262b" />
      {/* orejas */}
      <path d="M-40 -66 L-22 -100 L-6 -70 Z" fill="#26262b" />
      <path d="M40 -66 L22 -100 L6 -70 Z" fill="#26262b" />
      <path d="M-34 -70 L-23 -90 L-14 -72 Z" fill="#ff8fb2" opacity="0.7" />
      <path d="M34 -70 L23 -90 L14 -72 Z" fill="#ff8fb2" opacity="0.7" />
      {/* ojos */}
      <ellipse cx="-16" cy="-46" rx="8" ry="11" fill="url(#catEye)" />
      <ellipse cx="16" cy="-46" rx="8" ry="11" fill="url(#catEye)" />
      <ellipse cx="-16" cy="-46" rx="2.3" ry="9" fill="#15150f" />
      <ellipse cx="16" cy="-46" rx="2.3" ry="9" fill="#15150f" />
      {/* nariz */}
      <path d="M-5 -28 L5 -28 L0 -21 Z" fill="#ff8fb2" />
    </svg>
  );
}
