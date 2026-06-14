// Aleatorio determinista por fecha, compartido por el sistema floral y la
// rotación de temas. Mismo día → misma secuencia; día siguiente → nueva.

export function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromDate(d = new Date(), salt = '') {
  const s = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${salt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generador sembrado por la fecha (con sal opcional para secuencias independientes). */
export function dailyRandom(d = new Date(), salt = '') {
  return mulberry32(seedFromDate(d, salt));
}
