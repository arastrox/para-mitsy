'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

/** Fondo ambiente del tema floral: polen/luces flotando, teñido con los
 *  colores del día (R3F + drei). */
export default function Background({ colorA, colorB }: { colorA: string; colorB: string }) {
  return (
    <Canvas className="!absolute inset-0" camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
      <Sparkles count={70} scale={[14, 14, 4]} size={3} speed={0.35} color={colorA} opacity={0.7} />
      <Sparkles count={32} scale={[18, 18, 6]} size={7} speed={0.18} color={colorB} opacity={0.4} />
    </Canvas>
  );
}
