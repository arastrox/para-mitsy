'use client';

import { useEffect, useRef } from 'react';

// Partículas en canvas reutilizables por todos los temas. Al activarse lanza un
// estallido radial amplio desde el centro y, a continuación, una lluvia perpetua
// que cae desde el cielo. La forma (pétalo, hoja, estrella, corazón) y los
// colores los define cada tema. El bucle descansa cuando está inactivo y vacío.

export type ParticleShape = 'petal' | 'leaf' | 'star' | 'heart';

type Props = { active: boolean; colors: string[]; shape?: ParticleShape };

type P = {
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

function path(ctx: CanvasRenderingContext2D, shape: ParticleShape, s: number) {
  ctx.beginPath();
  if (shape === 'petal') {
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.5, 0, s);
    ctx.bezierCurveTo(s * 1.2, s * 0.5, s, -s * 0.5, 0, 0);
  } else if (shape === 'leaf') {
    ctx.moveTo(0, -s * 1.2);
    ctx.quadraticCurveTo(s * 0.75, 0, 0, s * 1.2);
    ctx.quadraticCurveTo(-s * 0.75, 0, 0, -s * 1.2);
  } else if (shape === 'star') {
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? s : s * 0.45;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    // heart
    const w = s * 1.3;
    const h = s * 1.3;
    ctx.moveTo(0, h * 0.35);
    ctx.bezierCurveTo(0, h * 0.05, -w * 0.5, -h * 0.1, -w * 0.5, h * 0.15);
    ctx.bezierCurveTo(-w * 0.5, h * 0.45, -w * 0.05, h * 0.6, 0, h * 0.9);
    ctx.bezierCurveTo(w * 0.05, h * 0.6, w * 0.5, h * 0.45, w * 0.5, h * 0.15);
    ctx.bezierCurveTo(w * 0.5, -h * 0.1, 0, h * 0.05, 0, h * 0.35);
  }
  ctx.fill();
}

export default function Particles({ active, colors, shape = 'petal' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const colorsRef = useRef(colors);
  const listRef = useRef<P[]>([]);
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
    return c[(Math.random() * c.length) | 0] || '#ffffff';
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
      const speed = 8 + Math.random() * 14;
      listRef.current.push({
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
        fade: 0.005 + Math.random() * 0.005,
        kind: 'burst',
      });
    }
    ensureRunning();
  }

  function spawnFalling() {
    listRef.current.push({
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
    if (!ctx) {
      runningRef.current = false;
      return;
    }
    frameRef.current++;
    const W = window.innerWidth;
    const H = window.innerHeight;
    ctx.clearRect(0, 0, W, H);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const list = listRef.current;
    const falling = list.reduce((a, p) => a + (p.kind === 'fall' ? 1 : 0), 0);
    if (activeRef.current && !reduce && falling < 28 && frameRef.current % 10 === 0) {
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
      path(ctx, shape, p.size);
      ctx.restore();

      if (p.alpha <= 0 || p.y > H + 30 || p.x < -40 || p.x > W + 40) list.splice(i, 1);
    }

    if (list.length === 0 && !activeRef.current) {
      runningRef.current = false;
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }

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
