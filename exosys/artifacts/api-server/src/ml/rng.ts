/**
 * Deterministic seeded RNG for reproducible model training and procedural generation.
 * Mulberry32 — fast, well-distributed, sufficient for Monte-Carlo dataset synthesis.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(rng: () => number, mean = 0, sd = 1): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * sd;
}

export function logNormal(rng: () => number, mu: number, sigma: number): number {
  return Math.exp(gauss(rng, mu, sigma));
}

export function uniform(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}
