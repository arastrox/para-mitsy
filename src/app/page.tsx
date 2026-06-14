'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { themeOfTheDay } from '@/lib/themes';

const fallback = () => <div className="h-dvh w-full bg-[#0a0a0f]" />;

// Cada escena 3D vive solo en cliente (sin SSR) para evitar errores de WebGL.
const SCENES = {
  floral: dynamic(() => import('@/components/floral/FloralScene'), { ssr: false, loading: fallback }),
  forest: dynamic(() => import('@/components/forest/ForestScene'), { ssr: false, loading: fallback }),
  stars: dynamic(() => import('@/components/stars/StarsScene'), { ssr: false, loading: fallback }),
  cats: dynamic(() => import('@/components/cats/CatsScene'), { ssr: false, loading: fallback }),
};

export default function Home() {
  const theme = useMemo(() => {
    if (typeof window !== 'undefined') {
      const override = new URLSearchParams(window.location.search).get('theme');
      if (override && override in SCENES) return override as keyof typeof SCENES;
    }
    return themeOfTheDay();
  }, []);
  const Scene = SCENES[theme];
  return <Scene />;
}
