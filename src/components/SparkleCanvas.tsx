'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

/** Destellos flotando (polen, luciérnagas, estrellas…) teñidos por el tema. */
export default function SparkleCanvas({
  colorA,
  colorB,
  countA = 70,
  countB = 32,
  sizeA = 3,
  sizeB = 7,
}: {
  colorA: string;
  colorB: string;
  countA?: number;
  countB?: number;
  sizeA?: number;
  sizeB?: number;
}) {
  return (
    <Canvas className="!absolute inset-0" camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
      <Sparkles count={countA} scale={[14, 14, 4]} size={sizeA} speed={0.35} color={colorA} opacity={0.7} />
      <Sparkles count={countB} scale={[18, 18, 6]} size={sizeB} speed={0.18} color={colorB} opacity={0.4} />
    </Canvas>
  );
}
