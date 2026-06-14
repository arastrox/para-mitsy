/**
 * Genera los íconos de la PWA a partir de un SVG (corazón con destello sobre
 * cielo nocturno). Reutilizable: `node scripts/make-icons.mjs`.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/icons', { recursive: true });

const svg = (heartScale) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="36%" r="80%">
      <stop offset="0%" stop-color="#2a1530"/>
      <stop offset="60%" stop-color="#140d1c"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff86b3" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ff86b3" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="262" r="170" fill="url(#glow)"/>
  <g transform="translate(256,256) scale(${heartScale}) translate(-256,-256)">
    <path d="M256 446 C256 446 64 322 64 192 C64 126 112 94 160 94 C201 94 233 126 256 160 C279 126 311 94 352 94 C400 94 448 126 448 192 C448 322 256 446 256 446 Z" fill="#ff6b9d"/>
  </g>
  <g fill="#ffe2b0">
    <path d="M372 120 l10 26 26 10 -26 10 -10 26 -10 -26 -26 -10 26 -10 z"/>
    <circle cx="150" cy="150" r="6"/>
    <circle cx="406" cy="300" r="5"/>
  </g>
</svg>`;

const targets = [
  ['icon-192.png', 192, 0.82],
  ['icon-512.png', 512, 0.82],
  ['maskable-512.png', 512, 0.66],
  ['apple-touch-icon.png', 180, 0.9],
];

for (const [name, size, scale] of targets) {
  await sharp(Buffer.from(svg(scale))).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log('✓', name);
}
console.log('Íconos listos.');
