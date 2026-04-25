import { gauss, logNormal, mulberry32, uniform } from "./rng";

/**
 * Synthesize a physically-grounded labelled dataset of candidate transit signals.
 *
 * Features (in order):
 *   0 orbitalPeriod  (days)
 *   1 planetRadius   (Earth radii)
 *   2 stellarTemperature (K)
 *   3 semiMajorAxis  (AU)
 *   4 transitDepth   (parts per million)
 *
 * Positives (label=1) are drawn from distributions matching the population of
 * confirmed transiting exoplanets. The transit depth is consistent with
 * (Rp/R*)^2 from the planet and stellar radii (with realistic noise), and the
 * semi-major axis is consistent with Kepler's third law given the host mass
 * implied by the spectral temperature. This means a real classifier learns the
 * underlying physical relationships, not random noise.
 *
 * Negatives (label=0) simulate common false-positive populations:
 *   - eclipsing binaries (very deep "transits", inconsistent with Rp^2/R*^2)
 *   - background blends (depth/period mismatched with body size)
 *   - instrumental / single-event noise (random period × random depth)
 *
 * The result is a dataset where the right answer requires combining all five
 * features physically — exactly what gradient boosted trees do well.
 */

export interface Sample {
  features: number[];
  label: 0 | 1;
}

const FEATURE_NAMES = [
  "orbitalPeriod",
  "planetRadius",
  "stellarTemperature",
  "semiMajorAxis",
  "transitDepth",
] as const;

export const FEATURES = FEATURE_NAMES;

const SUN_RADIUS_M = 6.957e8;
const EARTH_RADIUS_M = 6.371e6;
const AU_M = 1.496e11;
const G = 6.6743e-11;
const SUN_MASS_KG = 1.989e30;

function stellarRadiusFromTemp(tempK: number, rng: () => number): number {
  // Empirical-ish main-sequence relation: cooler stars are smaller.
  // M-dwarfs (~3000K): ~0.2 R_sun, K (~4500K): ~0.7, G (~5800K): ~1.0,
  // F (~6500K): ~1.3.
  const base = Math.max(0.12, 0.000295 * tempK - 0.7);
  return base * Math.exp(gauss(rng, 0, 0.07));
}

function stellarMassFromTemp(tempK: number): number {
  // Rough main-sequence mass-temperature; used for Kepler's 3rd law.
  return Math.max(0.1, 0.000288 * tempK - 0.71);
}

function semiMajorAxisFromKepler(periodDays: number, massSun: number): number {
  const periodSec = periodDays * 86400;
  const massKg = massSun * SUN_MASS_KG;
  const a3 = (G * massKg * periodSec * periodSec) / (4 * Math.PI * Math.PI);
  return Math.cbrt(a3) / AU_M;
}

function transitDepthPpm(planetR_earth: number, starR_sun: number): number {
  const rp = planetR_earth * EARTH_RADIUS_M;
  const rs = starR_sun * SUN_RADIUS_M;
  return ((rp * rp) / (rs * rs)) * 1e6;
}

function samplePositive(rng: () => number): Sample {
  // Realistic distributions of confirmed transiting planets.
  // Periods log-normal centered around ~10 days (transit-survey bias).
  const period = Math.min(800, Math.max(0.4, logNormal(rng, Math.log(10), 1.4)));
  // Planet radius: bimodal — small terrestrials and inflated gas giants.
  const isGiant = rng() < 0.35;
  const radius = isGiant
    ? Math.min(22, Math.max(4, logNormal(rng, Math.log(11), 0.35)))
    : Math.min(3.5, Math.max(0.4, logNormal(rng, Math.log(1.4), 0.45)));
  // Host star temperatures: mostly FGK with a long M-dwarf tail.
  const stellarT = Math.min(7500, Math.max(2700, gauss(rng, 5400, 900)));
  const starR = stellarRadiusFromTemp(stellarT, rng);
  const massSun = stellarMassFromTemp(stellarT);
  const a = semiMajorAxisFromKepler(period, massSun);
  // Depth consistent with Rp^2/R*^2 plus mild noise (limb darkening, grazing).
  const depthClean = transitDepthPpm(radius, starR);
  const depth = Math.max(20, depthClean * Math.exp(gauss(rng, 0, 0.18)));
  return { features: [period, radius, stellarT, a, depth], label: 1 };
}

function sampleEclipsingBinary(rng: () => number): Sample {
  // Eclipsing binaries mimic a transit but the "secondary" is stellar-sized.
  // Depth is enormous (often >5–30%, i.e. 50_000–300_000 ppm) and
  // inconsistent with any plausible planetary radius.
  const period = Math.min(50, Math.max(0.3, logNormal(rng, Math.log(2.5), 1.0)));
  const radius = Math.min(35, Math.max(8, logNormal(rng, Math.log(15), 0.4)));
  const stellarT = Math.min(7500, Math.max(3000, gauss(rng, 5500, 800)));
  const massSun = stellarMassFromTemp(stellarT);
  const a = semiMajorAxisFromKepler(period, massSun);
  // Implausibly deep for a planet.
  const depth = Math.min(400000, Math.max(50000, logNormal(rng, Math.log(120000), 0.5)));
  return { features: [period, radius, stellarT, a, depth], label: 0 };
}

function sampleBackgroundBlend(rng: () => number): Sample {
  // A faint background eclipsing binary diluted by a foreground star —
  // depth and radius look "planet-like" but are inconsistent with each other.
  const period = Math.min(200, Math.max(0.5, logNormal(rng, Math.log(8), 1.2)));
  const radius = Math.min(8, Math.max(1, logNormal(rng, Math.log(2.2), 0.5)));
  const stellarT = Math.min(7500, Math.max(3000, gauss(rng, 5500, 900)));
  const starR = stellarRadiusFromTemp(stellarT, rng);
  const massSun = stellarMassFromTemp(stellarT);
  const a = semiMajorAxisFromKepler(period, massSun);
  const expected = transitDepthPpm(radius, starR);
  // Force a 4x–25x mismatch with what the radius implies.
  const factor = uniform(rng, 4, 25);
  const depth = Math.max(50, expected * factor * Math.exp(gauss(rng, 0, 0.2)));
  return { features: [period, radius, stellarT, a, depth], label: 0 };
}

function sampleNoise(rng: () => number): Sample {
  // Pure instrumental / spurious detections — features uncorrelated.
  const period = Math.min(900, Math.max(0.3, logNormal(rng, Math.log(40), 1.6)));
  const radius = uniform(rng, 0.3, 18);
  const stellarT = uniform(rng, 2700, 7500);
  const a = uniform(rng, 0.005, 5);
  const depth = Math.max(10, logNormal(rng, Math.log(800), 1.5));
  return { features: [period, radius, stellarT, a, depth], label: 0 };
}

export function buildDataset(seed = 13371337, n = 4000): Sample[] {
  const rng = mulberry32(seed);
  const samples: Sample[] = [];
  const halfN = Math.floor(n / 2);
  for (let i = 0; i < halfN; i++) samples.push(samplePositive(rng));
  // Mix of negative populations
  const negPerKind = Math.ceil((n - halfN) / 3);
  for (let i = 0; i < negPerKind; i++) samples.push(sampleEclipsingBinary(rng));
  for (let i = 0; i < negPerKind; i++) samples.push(sampleBackgroundBlend(rng));
  for (let i = 0; i < negPerKind; i++) samples.push(sampleNoise(rng));
  // Shuffle
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = samples[i]!;
    samples[i] = samples[j]!;
    samples[j] = tmp;
  }
  return samples;
}
