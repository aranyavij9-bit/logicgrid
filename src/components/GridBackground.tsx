import { useEffect, useState, useRef } from 'react';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulse: number;
}

export function GridBackground({ className = '', density = 30 }: { className?: string; density?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const rng = mulberry32(42);
    const initial: Particle[] = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      vx: (rng() - 0.5) * 0.03,
      vy: (rng() - 0.5) * 0.03,
      size: 1.5 + rng() * 3.5,
      opacity: 0.05 + rng() * 0.15,
      pulse: rng() * Math.PI * 2,
    }));
    setParticles(initial);

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setParticles((prev) =>
        prev.map((p) => {
          let nx = p.x + p.vx * dt * 60;
          let ny = p.y + p.vy * dt * 60;
          if (nx < -2) nx = 102;
          if (nx > 102) nx = -2;
          if (ny < -2) ny = 102;
          if (ny > 102) ny = -2;
          return { ...p, x: nx, y: ny, pulse: p.pulse + dt * 0.5 };
        })
      );
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [density]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }}
      />

      {/* Animated particles */}
      {particles.map((p) => {
        const pulseOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        return (
          <div
            key={p.id}
            className="absolute rounded-full bg-accent-400"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: pulseOpacity,
              boxShadow: `0 0 ${p.size * 2}px rgba(34, 211, 238, ${pulseOpacity * 0.5})`,
            }}
          />
        );
      })}

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-base-800 to-transparent" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-base-800 to-transparent" />
    </div>
  );
}
