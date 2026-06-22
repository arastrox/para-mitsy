'use client';

import { useMemo } from 'react';
import SceneShell from '../SceneShell';
import SparkleCanvas from '../SparkleCanvas';
import FloralBackdrop from './FloralBackdrop';
import Flower from './Flower';
import { floralOfTheDay } from '@/lib/floral';

export default function FloralScene() {
  const variant = useMemo(() => floralOfTheDay(), []);

  return (
    <SceneShell
      audioSrc="/audio/lofi-placeholder.mp3"
      hint="Mantén presionado para abrir 🌸"
      particleShape="petal"
      particleColors={variant.palette.tones}
      burstColor="rgba(255,160,190,0.5)"
      atmosphere={{ tint: variant.palette.glow, tint2: variant.palette.tones[0], ray: 'rgba(255,215,185,0.06)', rays: true }}
      openerLabel="Mantén presionado para abrir la flor"
      background={
        <>
          <FloralBackdrop palette={variant.palette} silhouettes={variant.backdrop} />
          <SparkleCanvas colorA={variant.palette.tones[1]} colorB={variant.palette.glow} />
        </>
      }
      opener={(p) => <Flower p={p} variant={variant} />}
    />
  );
}
