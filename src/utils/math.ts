// ============================================================
// SnowRush — Math Utilities
// ============================================================

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export function damp(current: number, target: number, speed: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-speed * dt));
}

export function dampVector3(
  current: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  speed: number,
  dt: number,
): { x: number; y: number; z: number } {
  return {
    x: damp(current.x, target.x, speed, dt),
    y: damp(current.y, target.y, speed, dt),
    z: damp(current.z, target.z, speed, dt),
  };
}

// Simple hash-based pseudo-random for deterministic generation
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// 2D Simplex-like noise (value noise with smoothing)
export function noise2D(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);

  const n00 = seededRandom(ix + iz * 157);
  const n10 = seededRandom(ix + 1 + iz * 157);
  const n01 = seededRandom(ix + (iz + 1) * 157);
  const n11 = seededRandom(ix + 1 + (iz + 1) * 157);

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);

  return lerp(nx0, nx1, sz);
}

// Fractal Brownian Motion (layered noise)
export function fbm(x: number, z: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, z * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return (meters / 1000).toFixed(1) + ' km';
  return Math.floor(meters) + ' m';
}
