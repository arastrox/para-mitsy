'use client';

import { useEffect, useRef } from 'react';

// Capa de pétalos en canvas. Al florecer (`active` pasa a true) lanza un
// estallido radial de pétalos en todas direcciones con distintos tonos y, a
// continuación, un chubasco de pétalos cayendo desde el cielo que decae poco a
// poco (no es infinito: deja leer la frase y permite que el bucle descanse).

type Props = { active: boolean; colors: string[] };

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  flip: number;
  flipSpeed: number;
  color: string;
  alpha: number;
  fade: number;
  kind: 'fall' | 'burst';
};

export default function PetalField({ active, colors }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const colorsRef = useRef(colors);
  const petalsRef = useRef<Petal[]>([]);
  const burstedRef = useRef(false);
  const runningRef = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  function pick() {
    const c = colorsRef.current;
    return c[(Math.random() * c.length) | 0] || '#ff9ec1';
  }

  function ensureRunning() {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }

  function spawnBurst() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.48;
    const n = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 46;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.25;
      const speed = 8 + Math.random() * 14; // estallido más amplio y expansivo
      petalsRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 1,
        size: 8 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        flip: Math.random(),
        flipSpeed: 0.05 + Math.random() * 0.05,
        color: pick(),
        alpha: 1,
        fade: 0.005 + Math.random() * 0.005, // se desvanece lento → llega más lejos
        kind: 'burst',
      });
    }
    ensureRunning();
  }

  function spawnFalling() {
    petalsRef.current.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: -0.5 + Math.random(),
      vy: 1 + Math.random() * 1.6,
      size: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      flip: Math.random(),
      flipSpeed: 0.02 + Math.random() * 0.03,
      color: pick(),
      alpha: 0.85,
      fade: 0,
      kind: 'fall',
    });
  }

  function loop() {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      runningRef.current = false;
      return;
    }
    frameRef.current++;
    const W = window.innerWidth;
    const H = window.innerHeight;
    ctx.clearRect(0, 0, W, H);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = petalsRef.current;
    const concurrentFalling = list.reduce((a, p) => a + (p.kind === 'fall' ? 1 : 0), 0);
    // Lluvia perpetua mientras la flor está abierta.
    if (activeRef.current && !reduce && concurrentFalling < 28 && frameRef.current % 10 === 0) {
      spawnFalling();
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      if (p.kind === 'burst') {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.05;
        p.alpha -= p.fade;
      } else {
        p.y += p.vy;
        p.x += p.vx + Math.sin((p.y + p.rot * 40) * 0.01) * 0.6;
      }
      p.rot += p.vrot;
      p.flip += p.flipSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.sin(p.flip));
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.5, 0, s);
      ctx.bezierCurveTo(s * 1.2, s * 0.5, s, -s * 0.5, 0, 0);
      ctx.fill();
      ctx.restore();

      if (p.alpha <= 0 || p.y > H + 30 || p.x < -40 || p.x > W + 40) {
        list.splice(i, 1);
      }
    }

    // Descansa solo si la flor está cerrada y no quedan pétalos en pantalla.
    if (list.length === 0 && !activeRef.current) {
      runningRef.current = false;
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  // Dispara el estallido y el chubasco al florecer.
  useEffect(() => {
    activeRef.current = active;
    if (active && !burstedRef.current) {
      burstedRef.current = true;
      spawnBurst();
      ensureRunning();
    }
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    function resize() {
      const c = canvasRef.current;
      const cx = ctxRef.current;
      if (!c || !cx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + 'px';
      c.style.height = window.innerHeight + 'px';
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" aria-hidden />;
}
