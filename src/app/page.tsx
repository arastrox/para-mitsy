'use client';

import dynamic from 'next/dynamic';

// La escena 3D vive solo en cliente (sin SSR) para evitar errores de WebGL.
const FloralScene = dynamic(() => import('@/components/floral/FloralScene'), {
  ssr: false,
  loading: () => <div className="h-dvh w-full bg-[#0a0a0f]" />,
});

export default function Home() {
  return <FloralScene />;
}
