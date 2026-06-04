// components/layout/AuthBackground/AuthBackground.tsx
// Layer 4 — PRESENTATIONAL: Animated background for auth pages

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-br from-[#f5f5f5] via-[#e8f5f0] to-[#fef8ee]">
      {/* Animated blob 1 - Dark Green */}
      <div 
        className="absolute w-150 h-150 rounded-full blur-3xl animate-blob"
        style={{
          top: '-15%',
          left: '-10%',
          background: 'rgba(26, 92, 53, 0.4)',
          filter: 'blur(80px)'
        }}
      />

      {/* Animated blob 2 - Gold */}
      <div 
        className="absolute w-150 h-150 rounded-full blur-3xl animation-delay-2000"
        style={{
          bottom: '-15%',
          right: '-10%',
          background: 'rgba(201, 168, 76, 0.4)',
          filter: 'blur(80px)',
          animation: 'blob 7s infinite 2s'
        }}
      />

      {/* Animated blob 3 - Light Green */}
      <div 
        className="absolute w-150 h-150 rounded-full blur-3xl animation-delay-4000"
        style={{
          top: '40%',
          left: '30%',
          background: 'rgba(45, 125, 79, 0.3)',
          filter: 'blur(80px)',
          animation: 'blob 7s infinite 4s'
        }}
      />

      {/* Grid overlay for subtle texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(to right, #1A5C35 1px, transparent 1px), linear-gradient(to bottom, #1A5C35 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
