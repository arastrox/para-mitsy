// Rotación de temas por día: ponderada (floral el más frecuente) y con fechas
// especiales que fuerzan una escena celebratoria (estrellada).
import { dailyRandom } from './seed';

export type ThemeId = 'floral' | 'forest' | 'stars' | 'cats';

// Fechas clave de Mitsy y Pablo → escena especial. Clave 'MM-DD'.
const SPECIAL: Record<string, ThemeId> = {
  '08-02': 'stars', // aniversario
  '06-08': 'stars', // primer beso
  '12-02': 'stars', // cumpleaños de Mitsy
};

const WEIGHTS: [ThemeId, number][] = [
  ['floral', 0.4],
  ['forest', 0.2],
  ['stars', 0.2],
  ['cats', 0.2],
];

export function themeOfTheDay(d = new Date()): ThemeId {
  const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (SPECIAL[key]) return SPECIAL[key];

  const r = dailyRandom(d, 'theme')();
  let acc = 0;
  for (const [id, w] of WEIGHTS) {
    acc += w;
    if (r < acc) return id;
  }
  return 'floral';
}
