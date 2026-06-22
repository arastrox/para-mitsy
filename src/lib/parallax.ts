'use client';

import { useEffect, type RefObject } from 'react';

// Parallax: actualiza las variables CSS --mx / --my (rango ~[-1,1]) en el
// elemento dado, según el movimiento del dedo o la inclinación del iPhone.
// Las capas las consumen con translate3d(calc(var(--mx)*Npx), ...). Suavizado
// con lerp para un movimiento orgánico. No provoca re-renders de React.

export function useParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const onPointer = (e: PointerEvent) => {
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = clamp(e.gamma / 28); // inclinación izq/der
      ty = clamp((e.beta - 45) / 28); // inclinación frente/atrás
    };

    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty('--mx', cx.toFixed(3));
      el.style.setProperty('--my', cy.toFixed(3));
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrient);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, [ref]);
}

// iOS 13+ exige pedir permiso para el giroscopio desde un gesto del usuario.
export function requestGyro() {
  const D = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  if (D && typeof D.requestPermission === 'function') {
    D.requestPermission().catch(() => {});
  }
}
