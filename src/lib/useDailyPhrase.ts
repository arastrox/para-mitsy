'use client';

import { useEffect, useState } from 'react';
import { phraseOfTheDay } from './phrases';

// Devuelve la frase del día. Arranca al instante con una del pool (por fecha) y,
// si la Action ya generó la de hoy con IA, la reemplaza al cargar /api/daily.

function todayCL() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}

export function useDailyPhrase() {
  const [phrase, setPhrase] = useState(() => phraseOfTheDay());

  useEffect(() => {
    let cancelled = false;
    fetch('/api/daily')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d || !d.message) return;
        if (d.date && d.date === todayCL()) setPhrase(d.message);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return phrase;
}
