import { mulberry32 } from "../ml/rng";

const STEFAN_BOLTZMANN = 5.670374419e-8;
const SUN_RADIUS_M = 6.957e8;
const SUN_LUM = 3.828e26;
const AU_M = 1.496e11;

function stellarLuminosityW(tempK: number, radiusSun: number): number {
  // L = 4πR²σT⁴
  const r = radiusSun * SUN_RADIUS_M;
  return 4 * Math.PI * r * r * STEFAN_BOLTZMANN * Math.pow(tempK, 4);
}

function albedoForAtmosphere(atm: string): number {
  switch (atm) {
    case "none":
      return 0.1;
    case "thin":
      return 0.2;
    case "earth-like":
      return 0.3;
    case "thick":
      return 0.45;
    case "venus-like":
      return 0.77;
    default:
      return 0.3;
  }
}

function greenhouseDeltaK(atm: string): number {
  switch (atm) {
    case "none":
      return 0;
    case "thin":
      return 5;
    case "earth-like":
      return 33;
    case "thick":
      return 90;
    case "venus-like":
      return 510;
    default:
      return 0;
  }
}

export function equilibriumTempK(
  stellarTemperatureK: number,
  stellarRadiusSun: number,
  distanceAU: number,
  albedo: number,
): number {
  const L = stellarLuminosityW(stellarTemperatureK, stellarRadiusSun);
  const d = distanceAU * AU_M;
  const flux = L / (4 * Math.PI * d * d);
  const T4 = ((1 - albedo) * flux) / (4 * STEFAN_BOLTZMANN);
  return Math.pow(T4, 0.25);
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function gaussianAround(value: number, target: number, sigma: number): number {
  const z = (value - target) / sigma;
  return Math.exp(-0.5 * z * z);
}

function colorForTemp(tK: number): string {
  // Cold = pale blue / white. Temperate = blue-green. Hot = red/orange. Inferno = deep red.
  if (tK < 180) return "#cfe6ff";
  if (tK < 240) return "#b6d7ff";
  if (tK < 280) return "#7fb6ff";
  if (tK < 320) return "#5da97a"; // Earth-ish
  if (tK < 380) return "#9aa173";
  if (tK < 500) return "#c39160";
  if (tK < 800) return "#b25b3a";
  if (tK < 1300) return "#8a2a1f";
  return "#4a0d0a";
}

export function habitabilityIndex(
  surfaceTempK: number,
  planetRadiusEarth: number,
): number {
  // Earth Similarity Index-style score on temperature + radius proximity.
  const t = gaussianAround(surfaceTempK, 288, 35); // peaks at Earth's mean
  const r = gaussianAround(planetRadiusEarth, 1.0, 0.6);
  return clamp01(0.65 * t + 0.35 * r);
}

export function classifyZone(surfaceTempK: number): "too-hot" | "habitable" | "too-cold" {
  if (surfaceTempK > 320) return "too-hot";
  if (surfaceTempK < 250) return "too-cold";
  return "habitable";
}

export function simulateHabitability(input: {
  distanceAU: number;
  planetRadiusEarth: number;
  atmosphere: string;
  stellarTemperatureK: number;
  stellarRadiusSun: number;
}) {
  const albedo = albedoForAtmosphere(input.atmosphere);
  const Teq = equilibriumTempK(
    input.stellarTemperatureK,
    input.stellarRadiusSun,
    input.distanceAU,
    albedo,
  );
  const surface = Teq + greenhouseDeltaK(input.atmosphere);
  const habit = habitabilityIndex(surface, input.planetRadiusEarth);
  const zone = classifyZone(surface);
  const color = colorForTemp(surface);

  const interpretation = describeHabitability({
    surface,
    Teq,
    habit,
    zone,
    atmosphere: input.atmosphere,
    distanceAU: input.distanceAU,
    radius: input.planetRadiusEarth,
  });

  return {
    equilibriumTempK: Math.round(Teq * 10) / 10,
    surfaceTempK: Math.round(surface * 10) / 10,
    habitabilityIndex: Math.round(habit * 1000) / 1000,
    zone,
    color,
    interpretation,
  };
}

function describeHabitability(args: {
  surface: number;
  Teq: number;
  habit: number;
  zone: string;
  atmosphere: string;
  distanceAU: number;
  radius: number;
}): string {
  const { surface, habit, zone, atmosphere, distanceAU, radius } = args;
  const tStr = `${Math.round(surface)} K (${Math.round(surface - 273.15)} °C)`;
  if (zone === "habitable") {
    return `At ${distanceAU.toFixed(2)} AU under a ${atmosphere} atmosphere, surface temperature settles near ${tStr}. With a radius of ${radius.toFixed(2)} R⊕, this places the world in the conservative habitable zone (HSI ≈ ${habit.toFixed(2)}). Liquid water on the surface is plausible.`;
  }
  if (zone === "too-hot") {
    return `Stellar flux dominates: surface temperature reaches ${tStr}. Any liquid water inventory would boil; a runaway greenhouse is likely under this ${atmosphere} envelope.`;
  }
  return `Insufficient stellar flux: surface temperature drops to ${tStr}. Surface water would be locked as ice; a much thicker greenhouse atmosphere would be required to remain temperate.`;
}

// ----- Procedural planet generator -----

const NAME_PARTS_A = [
  "Aether", "Nova", "Cygnus", "Lyra", "Eos", "Tycho", "Vega", "Helios",
  "Astraea", "Polaris", "Rigel", "Tau", "Orion", "Mira", "Carina", "Pavo",
  "Hydrus", "Phoenix", "Sirius", "Zenith",
];
const NAME_PARTS_B = [
  "Prime", "Minor", "Major", "Aurora", "Echo", "Drift", "Halo", "Veil",
  "Reach", "Cradle", "Mantle", "Genesis", "Anvil", "Lyre", "Waltz", "Crown",
];

export function generatePlanet(rngSeed: number) {
  const rng = mulberry32(rngSeed);
  const r = (lo: number, hi: number) => lo + rng() * (hi - lo);
  const choice = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)]!;

  // Pick a kind weighted towards smaller worlds.
  const roll = rng();
  const kind: string =
    roll < 0.32
      ? "rocky"
      : roll < 0.48
        ? "super-earth"
        : roll < 0.62
          ? "ocean"
          : roll < 0.78
            ? "gas-giant"
            : roll < 0.9
              ? "ice-giant"
              : "lava";

  let radius = 1;
  let mass = 1;
  let atmosphere = "earth-like";
  let stellarT = 5500;
  let stellarR = 1;
  let distance = 1;

  switch (kind) {
    case "rocky":
      radius = r(0.4, 1.6);
      mass = Math.pow(radius, 3.7) * r(0.7, 1.1);
      atmosphere = choice(["none", "thin", "earth-like"]);
      stellarT = r(3000, 6500);
      stellarR = Math.max(0.15, 0.000295 * stellarT - 0.7);
      distance = r(0.05, 1.6);
      break;
    case "super-earth":
      radius = r(1.4, 2.2);
      mass = Math.pow(radius, 3.7) * r(0.9, 1.4);
      atmosphere = choice(["thin", "earth-like", "thick"]);
      stellarT = r(3500, 6500);
      stellarR = Math.max(0.18, 0.000295 * stellarT - 0.7);
      distance = r(0.1, 2.5);
      break;
    case "ocean":
      radius = r(1.6, 3.0);
      mass = Math.pow(radius, 2.9) * r(0.8, 1.2);
      atmosphere = choice(["thick", "earth-like"]);
      stellarT = r(3500, 6200);
      stellarR = Math.max(0.18, 0.000295 * stellarT - 0.7);
      distance = r(0.4, 2.0);
      break;
    case "gas-giant":
      radius = r(8, 18);
      mass = r(50, 600);
      atmosphere = "thick";
      stellarT = r(4500, 6500);
      stellarR = Math.max(0.5, 0.000295 * stellarT - 0.7);
      distance = r(0.03, 5);
      break;
    case "ice-giant":
      radius = r(3, 6);
      mass = r(10, 25);
      atmosphere = "thick";
      stellarT = r(3000, 6000);
      stellarR = Math.max(0.2, 0.000295 * stellarT - 0.7);
      distance = r(0.5, 5);
      break;
    case "lava":
      radius = r(1.0, 2.4);
      mass = Math.pow(radius, 3.6) * r(0.9, 1.5);
      atmosphere = choice(["none", "thin"]);
      stellarT = r(4500, 6500);
      stellarR = Math.max(0.5, 0.000295 * stellarT - 0.7);
      distance = r(0.005, 0.04);
      break;
  }

  const period =
    Math.sqrt(Math.pow(distance, 3) / Math.max(0.1, 0.000288 * stellarT - 0.71)) * 365.25;
  const albedo = albedoForAtmosphere(atmosphere);
  const Teq = equilibriumTempK(stellarT, stellarR, distance, albedo);
  const surface = Teq + greenhouseDeltaK(atmosphere);
  const habit = habitabilityIndex(surface, radius);
  const color = colorForTemp(surface);
  const id = `gen-${Math.floor(rngSeed).toString(36)}-${Date.now().toString(36).slice(-4)}`;
  const name = `${choice(NAME_PARTS_A)}-${choice(NAME_PARTS_B)} ${String.fromCharCode(98 + Math.floor(rng() * 6))}`;

  return {
    id,
    name,
    kind,
    radiusEarth: Math.round(radius * 1000) / 1000,
    massEarth: Math.round(mass * 100) / 100,
    equilibriumTempK: Math.round(Teq * 10) / 10,
    orbitalPeriodDays: Math.round(period * 100) / 100,
    semiMajorAxisAU: Math.round(distance * 10000) / 10000,
    atmosphere,
    color,
    habitabilityIndex: Math.round(habit * 1000) / 1000,
    description: describeGenerated({ kind, surface, atmosphere, radius, distance }),
  };
}

function describeGenerated(a: {
  kind: string;
  surface: number;
  atmosphere: string;
  radius: number;
  distance: number;
}): string {
  const t = `${Math.round(a.surface)} K`;
  const ae = a.atmosphere === "none" ? "no" : `a ${a.atmosphere}`;
  const family =
    a.kind === "rocky"
      ? "small rocky world"
      : a.kind === "super-earth"
        ? "super-Earth"
        : a.kind === "ocean"
          ? "ocean world"
          : a.kind === "gas-giant"
            ? "gas giant"
            : a.kind === "ice-giant"
              ? "ice giant"
              : "lava world";
  return `A ${family} of ${a.radius.toFixed(2)} R⊕ orbiting at ${a.distance.toFixed(2)} AU under ${ae} atmosphere. Surface conditions hover near ${t}.`;
}
