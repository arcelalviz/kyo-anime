import type { CSSProperties } from "react";

// Fixed, deterministic positioning: no client-side random values or hydration mismatch.
const particles = Array.from({ length: 25 }, (_, index) => {
  const i = index + 1;
  return {
    x: (i * 67.11 + 13) % 100,
    y: (i * 43.89 + 9) % 100,
    size: 1 + (i % 4) * 0.65,
    delay: -(i % 13) * 1.7,
    duration: 14 + (i % 8) * 2.3,
    shade: i % 4 === 0 ? "var(--pink)" : i % 3 === 0 ? "var(--violet)" : "#e6d2e3",
  };
});

export function AmbientParticles() {
  return <div className="ambient-particles" aria-hidden="true">
    {particles.map((p, i) => <i key={i} className="ambient-particle" style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--size": `${p.size}px`, "--delay": `${p.delay}s`, "--duration": `${p.duration}s`, "--shade": p.shade } as CSSProperties}/>)}
  </div>;
}
