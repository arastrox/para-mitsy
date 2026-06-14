// Variación diaria del mundo floral: la forma de la flor y la paleta cambian
// cada día de forma determinista (estable durante todo el día, nueva al
// siguiente). Pensado para los gustos de Mitsy: flores de pétalos
// independientes, tonos rosa/rojo/magenta con algo de variedad. Nunca rosas.
import { dailyRandom } from './seed';

export type FloralPalette = {
  petal: [string, string, string]; // degradado del pétalo (base → punta)
  center: [string, string, string]; // degradado del centro
  glow: string; // resplandor
  tones: string[]; // colores para pétalos que caen / estallido
};

export type SilhouetteSpec = {
  cx: number;
  cy: number;
  r: number;
  petals: number;
  rot: number;
  tone: string;
  opacity: number;
};

export type FloralVariant = {
  petals: number;
  petalW: number;
  petalLen: number;
  palette: FloralPalette;
  backdrop: SilhouetteSpec[];
};

const FORMS: Omit<FloralVariant, 'palette' | 'backdrop'>[] = [
  { petals: 12, petalW: 12, petalLen: 92 }, // margarita
  { petals: 8, petalW: 18, petalLen: 94 }, // cosmos
  { petals: 16, petalW: 8, petalLen: 98 }, // áster
  { petals: 6, petalW: 24, petalLen: 100 }, // tulipán abierto
  { petals: 10, petalW: 14, petalLen: 92 }, // gerbera
];

const PALETTES: FloralPalette[] = [
  {
    petal: ['#ff4d7d', '#ff9ec1', '#ffe0ec'],
    center: ['#ffe7a8', '#ffb454', '#e67e22'],
    glow: '#ff8fb2',
    tones: ['#ff4d7d', '#ff9ec1', '#ffd1e0', '#ff7aa2'],
  },
  {
    petal: ['#e01e37', '#ff5d73', '#ffd0d6'],
    center: ['#ffe7a8', '#ffcf5a', '#e6a100'],
    glow: '#ff6b6b',
    tones: ['#e01e37', '#ff5d73', '#ffb3bd', '#ff8088'],
  },
  {
    petal: ['#c9184a', '#ff5c8a', '#ffc2d6'],
    center: ['#ffe1a3', '#ffb454', '#d98324'],
    glow: '#ff6f9c',
    tones: ['#c9184a', '#ff5c8a', '#ffa5c2', '#ff85a1'],
  },
  {
    petal: ['#7b2cbf', '#c77dff', '#e7c6ff'],
    center: ['#ffe7a8', '#ffc6ff', '#b15bd6'],
    glow: '#c77dff',
    tones: ['#7b2cbf', '#c77dff', '#e0aaff', '#9d4edd'],
  },
  {
    petal: ['#ff7b00', '#ffb703', '#ffe6a7'],
    center: ['#fff3bf', '#ffd000', '#e08e00'],
    glow: '#ffb703',
    tones: ['#ff7b00', '#ffb703', '#ffd56b', '#ff9e00'],
  },
];

// Puntos de anclaje cerca de bordes/esquinas (viewBox 0..1000) para que las
// siluetas queden periféricas y no estorben el centro.
const ANCHORS = [
  { x: 130, y: 150 },
  { x: 880, y: 850 },
  { x: 960, y: 360 },
  { x: 80, y: 880 },
  { x: 500, y: 60 },
  { x: 520, y: 950 },
  { x: 60, y: 480 },
  { x: 950, y: 620 },
];

function buildBackdrop(r: () => number, palette: FloralPalette): SilhouetteSpec[] {
  const tones = [palette.glow, ...palette.tones];
  const shuffled = ANCHORS.map((a) => ({ a, k: r() }))
    .sort((x, y) => x.k - y.k)
    .map((o) => o.a);
  const count = 3 + Math.floor(r() * 3); // 3..5 siluetas por día
  return shuffled.slice(0, count).map((a) => ({
    cx: a.x + (r() - 0.5) * 120,
    cy: a.y + (r() - 0.5) * 120,
    r: 120 + r() * 160,
    petals: 7 + Math.floor(r() * 7),
    rot: r() * 360,
    tone: tones[Math.floor(r() * tones.length)],
    opacity: 0.1 + r() * 0.1,
  }));
}

export function floralOfTheDay(d = new Date()): FloralVariant {
  const r = dailyRandom(d, 'floral');
  const form = FORMS[Math.floor(r() * FORMS.length)];
  const palette = PALETTES[Math.floor(r() * PALETTES.length)];
  const backdrop = buildBackdrop(r, palette);
  return { ...form, palette, backdrop };
}
