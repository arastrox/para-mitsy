'use client';

import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { motion } from 'framer-motion';

/**
 * Cascarón visual de la Fase 0: cielo estrellado en 3D (R3F) + texto animado.
 * Sirve para validar el "wow", las fuentes y el pipe de despliegue.
 */
export default function Hero() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Canvas className="!absolute inset-0" camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        <Stars radius={60} depth={60} count={2800} factor={4} saturation={0} fade speed={0.6} />
      </Canvas>

      {/* viñeta para enfocar el centro */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,transparent_40%,#0a0a0f_100%)]" />

      <main className="relative z-10 flex h-dvh flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-4 text-sm uppercase tracking-[0.35em] text-pink-200/70"
        >
          Para ti
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          className="font-serif text-4xl font-medium leading-tight text-pink-50 sm:text-6xl"
        >
          Algo hermoso
          <br />
          está naciendo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1 }}
          className="mt-6 max-w-sm text-sm text-pink-100/50"
        >
          Un rincón que cambiará cada día… solo para ti, amorcito.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: 'backOut' }}
          className="mt-10 text-2xl"
          aria-hidden
        >
          ❤
        </motion.div>
      </main>
    </div>
  );
}
