'use client';

// Fondo nocturno: degradado índigo/violeta + nebulosas suaves.

export default function StarsBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(55% 40% at 22% 18%, rgba(123,108,255,0.22), transparent 70%),
                       radial-gradient(50% 40% at 82% 30%, rgba(214,120,255,0.18), transparent 70%),
                       radial-gradient(60% 45% at 60% 88%, rgba(70,90,200,0.16), transparent 70%),
                       linear-gradient(180deg, #0c0b1e 0%, #0a0917 55%, #070611 100%)`,
        }}
      />
    </div>
  );
}
