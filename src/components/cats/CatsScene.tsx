'use client';

import SceneShell from '../SceneShell';
import SparkleCanvas from '../SparkleCanvas';
import CozyBackdrop from './CozyBackdrop';
import Cat from './Cat';

export default function CatsScene() {
  return (
    <SceneShell
      audioSrc="/audio/lofi-placeholder.mp3"
      hint="Mantén presionado para despertarlo 🐱"
      openerLabel="Mantén presionado para despertar al gatito"
      particleShape="heart"
      particleColors={['#ff5c8a', '#ff9ec1', '#ffd0d6', '#ffe6a7']}
      burstColor="rgba(255,150,170,0.5)"
      background={
        <>
          <CozyBackdrop />
          <SparkleCanvas colorA="#ffd0a8" colorB="#ff9ec1" countA={50} countB={22} />
        </>
      }
      opener={(p) => <Cat p={p} />}
    />
  );
}
