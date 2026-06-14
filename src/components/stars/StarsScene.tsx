'use client';

import SceneShell from '../SceneShell';
import SparkleCanvas from '../SparkleCanvas';
import StarsBackdrop from './StarsBackdrop';
import Constellation from './Constellation';

export default function StarsScene() {
  return (
    <SceneShell
      audioSrc="/audio/stars-placeholder.mp3"
      hint="Mantén presionado para encender el cielo ✨"
      openerLabel="Mantén presionado para encender la constelación"
      particleShape="star"
      particleColors={['#fff6d8', '#ffd86b', '#cfd8ff', '#d6a5ff']}
      burstColor="rgba(207,216,255,0.5)"
      background={
        <>
          <StarsBackdrop />
          <SparkleCanvas colorA="#ffffff" colorB="#cdb8ff" countA={120} countB={40} sizeA={2} sizeB={4} />
        </>
      }
      opener={(p) => <Constellation p={p} />}
    />
  );
}
