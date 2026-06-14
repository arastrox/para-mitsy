// Frases placeholder en la voz de Pablo. En la Fase 2 las genera la IA y se
// guardan con historial para no repetir.
export const PHRASES = [
  'Amo tu forma de pensar, y cada día encuentro una razón nueva para admirarte un poquito más.',
  'Me encanta perderme en tus ojitos y ver el brillo que reflejan cuando me miras; ahí cabe todo mi mundo.',
  'Sentirte en mis brazos, tu calor junto al mío, es una sensación que querría sentir una vida entera.',
  'Mi alegría más simple es contemplarte cuando estás distraída; ahí, sin saberlo, eres aún más hermosa.',
  'En el día disfruto tu presencia y en las noches sueño con tu esencia. Siempre tú, amorcito.',
];

export function phraseOfTheDay(d = new Date()): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const doy = Math.floor((d.getTime() - start.getTime()) / 86_400_000);
  return PHRASES[doy % PHRASES.length];
}
