/**
 * Genera la frase del día con IA (Gemini), en la voz de Pablo y personalizada
 * para Mitsy, evitando repetir frases recientes. Escribe:
 *   data/daily.json    -> { date, message }
 *   data/history.json  -> [ ...mensajes ] (para anti-repetición)
 *
 * Si la IA falla o devuelve algo inválido, usa un respaldo determinista del pool.
 * Pensado para GitHub Actions (Node 20+, fetch global). Secreto: GEMINI_API_KEY.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = resolve(root, 'data');
const DAILY = resolve(DATA, 'daily.json');
const HISTORY = resolve(DATA, 'history.json');

const FALLBACK = [
  'Amo tu forma de pensar, y cada día encuentro una razón nueva para admirarte un poquito más.',
  'Me encanta perderme en tus ojitos y ver el brillo que reflejan cuando me miras; ahí cabe todo mi mundo.',
  'Sentirte en mis brazos, tu calor junto al mío, es una sensación que querría sentir una vida entera.',
  'Mi alegría más simple es contemplarte cuando estás distraída; ahí, sin saberlo, eres aún más hermosa.',
  'En el día disfruto tu presencia y en las noches sueño con tu esencia. Siempre tú, amorcito.',
];

const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
const [, mm, dd] = today.split('-');
const mmdd = `${mm}-${dd}`;

const OCCASIONS = {
  '08-02': 'Hoy es su ANIVERSARIO (2 de agosto): celébralo con ternura, sin cliché.',
  '06-08': 'Hoy se cumple un mes-aniversario de su PRIMER BESO (8 de junio): un guiño dulce.',
  '12-02': 'Hoy es el CUMPLEAÑOS de Mitsy (2 de diciembre): hazla sentir celebrada y amada.',
};
let occasion = OCCASIONS[mmdd] || '';
if (!occasion && dd === '02') occasion = 'Hoy es día 2: su "cumplemés" (aniversario mensual del 2 de agosto). Un guiño sutil de celebración.';

function loadHistory() {
  try {
    return JSON.parse(readFileSync(HISTORY, 'utf8'));
  } catch {
    return [];
  }
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-záéíóúñ\s]/gi, '').replace(/\s+/g, ' ').trim();
}

function isValid(msg, recentNorms) {
  if (typeof msg !== 'string') return false;
  const t = msg.trim();
  if (t.length < 15 || t.length > 320) return false;
  if (recentNorms.has(norm(t))) return false; // ya usada
  return true;
}

async function fromGemini(recent) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Falta GEMINI_API_KEY');

  const evitar = recent.slice(-40).map((m) => `- ${m}`).join('\n');
  const prompt = `Escribe UNA frase de amor de Pablo para su pareja Mitsy, para mostrarse hoy.

VOZ DE PABLO (imítala): tierna, poética y sensorial, en presente, romántica pero sin cursilería exagerada; usa diminutivos cariñosos ("ojitos"), expresiones como "Amo…", "me encanta…", "mi alegría es…", imágenes sensoriales (brazos, calor, brillo de la mirada, esencia) y a veces contrastes día/noche.
Ejemplos reales de Pablo:
- "Amo tu forma de pensar."
- "Me encanta mirar tus ojitos y apreciar el brillo que reflejan cuando me miras."
- "Sentirte en mis brazos y tu calor junto al mío es una sensación que podría sentir una vida entera."
- "En el día disfruto tu presencia y en las noches sueño con tu esencia."

SOBRE MITSY (úsalo con sutileza, no la enumeres): le gustan los bosques, los gatos, las flores de pétalos independientes (margaritas, tulipanes) — NUNCA menciones rosas; los colores rojo, negro y rosado; los frutos del bosque, el té e infusiones, las estrellas y la astrología (es Sagitario), los post-it con dibujos tiernos. Apodos posibles: amorcito, mi vida, Mitsy.
${occasion ? 'OCASIÓN: ' + occasion : ''}

REGLAS:
- Tono tierno/alegre/motivador con un toque romántico.
- 20 a 40 palabras, en español.
- Como máximo 1 emoji, opcional, al final.
- NO repitas ni parafrasees estas frases ya usadas:
${evitar || '(ninguna todavía)'}
- Devuelve SOLO la frase, sin comillas, sin markdown, sin texto extra.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return raw.replace(/```/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

function fallback(recentNorms) {
  const free = FALLBACK.filter((m) => !recentNorms.has(norm(m)));
  const pool = free.length ? free : FALLBACK;
  const doy = Math.floor((new Date(today + 'T12:00:00') - new Date(new Date(today).getFullYear(), 0, 0)) / 86400000);
  return pool[doy % pool.length];
}

const history = loadHistory();
const recentNorms = new Set(history.slice(-120).map(norm));

let message;
try {
  for (let attempt = 0; attempt < 3 && !message; attempt++) {
    const m = await fromGemini(history);
    if (isValid(m, recentNorms)) message = m;
  }
  if (!message) throw new Error('Sin frase válida tras 3 intentos');
  console.log('✓ Frase generada por Gemini');
} catch (e) {
  console.warn(`⚠ ${e.message} — usando respaldo`);
  message = fallback(recentNorms);
}

mkdirSync(DATA, { recursive: true });
writeFileSync(DAILY, JSON.stringify({ date: today, message }, null, 2) + '\n');

const nextHistory = [...history, message].slice(-500);
writeFileSync(HISTORY, JSON.stringify(nextHistory, null, 2) + '\n');

console.log(`Escrito daily.json (${today}): ${message}`);
