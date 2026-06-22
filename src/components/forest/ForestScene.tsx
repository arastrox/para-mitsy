'use client';

import SceneShell from '../SceneShell';
import SparkleCanvas from '../SparkleCanvas';
import ForestBackdrop from './ForestBackdrop';
import Lantern from './Lantern';

export default function ForestScene() {
  return (
    <SceneShell
      audioSrc="/audio/forest-placeholder.mp3"
      hint="Mantén presionado para encender el farol 🌿"
      openerLabel="Mantén presionado para encender el farol"
      particleShape="leaf"
      particleColors={['#3a6652', '#5b8a6a', '#86b08a', '#c79a4a']}
      burstColor="rgba(150,200,160,0.45)"
      atmosphere={{ tint: 'rgba(120,180,140,0.5)', tint2: 'rgba(80,140,110,0.45)', ray: 'rgba(190,225,175,0.06)', rays: true }}
      background={
        <>
          <ForestBackdrop />
          <SparkleCanvas colorA="#a7e0a8" colorB="#d8efb4" countA={60} countB={26} />
        </>
      }
      opener={(p) => <Lantern p={p} />}
    />
  );
}
