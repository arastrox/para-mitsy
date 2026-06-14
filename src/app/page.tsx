'use client';

import dynamic from 'next/dynamic';

// El 3D vive solo en el cliente (sin SSR) para evitar errores de WebGL en build.
const Hero = dynamic(() => import('@/components/Hero'), {
  ssr: false,
  loading: () => <div className="h-dvh w-full bg-[#0a0a0f]" />,
});

export default function Home() {
  return <Hero />;
}
