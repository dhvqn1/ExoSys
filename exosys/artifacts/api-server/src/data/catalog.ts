export interface CatalogPlanet {
  id: string;
  name: string;
  kind: string;
  massEarth: number;
  radiusEarth: number;
  orbitalPeriodDays: number;
  equilibriumTempK: number;
  semiMajorAxisAU: number;
  discoveryYear: number;
  habitabilityIndex: number;
  description: string;
  hostStar: {
    name: string;
    spectralType: string;
    temperatureK: number;
    radiusSun: number;
    massSun: number;
  };
}

export const CATALOG: CatalogPlanet[] = [
  {
    id: "kepler-186f",
    name: "Kepler-186f",
    kind: "rocky",
    massEarth: 1.44,
    radiusEarth: 1.17,
    orbitalPeriodDays: 129.9,
    equilibriumTempK: 188,
    semiMajorAxisAU: 0.432,
    discoveryYear: 2014,
    habitabilityIndex: 0.61,
    description:
      "First Earth-sized planet discovered in the habitable zone of another star. Orbits a cool red dwarf, receiving roughly a third of Earth's stellar flux.",
    hostStar: {
      name: "Kepler-186",
      spectralType: "M1V",
      temperatureK: 3788,
      radiusSun: 0.47,
      massSun: 0.48,
    },
  },
  {
    id: "proxima-b",
    name: "Proxima Centauri b",
    kind: "rocky",
    massEarth: 1.07,
    radiusEarth: 1.03,
    orbitalPeriodDays: 11.18,
    equilibriumTempK: 234,
    semiMajorAxisAU: 0.0485,
    discoveryYear: 2016,
    habitabilityIndex: 0.87,
    description:
      "Closest known exoplanet to the Solar System, orbiting our nearest stellar neighbor. Tidally locked but potentially capable of liquid water on its day side.",
    hostStar: {
      name: "Proxima Centauri",
      spectralType: "M5.5Ve",
      temperatureK: 3042,
      radiusSun: 0.154,
      massSun: 0.122,
    },
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e",
    kind: "rocky",
    massEarth: 0.69,
    radiusEarth: 0.92,
    orbitalPeriodDays: 6.1,
    equilibriumTempK: 251,
    semiMajorAxisAU: 0.029,
    discoveryYear: 2017,
    habitabilityIndex: 0.95,
    description:
      "One of seven Earth-sized worlds around the ultracool dwarf TRAPPIST-1. The most Earth-like in the system, well-positioned for a thin temperate atmosphere.",
    hostStar: {
      name: "TRAPPIST-1",
      spectralType: "M8V",
      temperatureK: 2566,
      radiusSun: 0.121,
      massSun: 0.0898,
    },
  },
  {
    id: "kepler-22b",
    name: "Kepler-22b",
    kind: "ocean",
    massEarth: 9.1,
    radiusEarth: 2.4,
    orbitalPeriodDays: 289.9,
    equilibriumTempK: 262,
    semiMajorAxisAU: 0.849,
    discoveryYear: 2011,
    habitabilityIndex: 0.71,
    description:
      "First confirmed planet in the habitable zone of a Sun-like star. Likely a water world with a deep global ocean beneath thick clouds.",
    hostStar: {
      name: "Kepler-22",
      spectralType: "G5V",
      temperatureK: 5518,
      radiusSun: 0.979,
      massSun: 0.97,
    },
  },
  {
    id: "hd-209458b",
    name: "HD 209458 b",
    kind: "gas-giant",
    massEarth: 219,
    radiusEarth: 15.5,
    orbitalPeriodDays: 3.52,
    equilibriumTempK: 1449,
    semiMajorAxisAU: 0.047,
    discoveryYear: 1999,
    habitabilityIndex: 0.04,
    description:
      "First exoplanet observed transiting its star. A puffed hot Jupiter with an evaporating hydrogen atmosphere streaming off into space.",
    hostStar: {
      name: "HD 209458",
      spectralType: "G0V",
      temperatureK: 6065,
      radiusSun: 1.203,
      massSun: 1.148,
    },
  },
  {
    id: "55-cancri-e",
    name: "55 Cancri e",
    kind: "lava",
    massEarth: 7.99,
    radiusEarth: 1.875,
    orbitalPeriodDays: 0.7365,
    equilibriumTempK: 1958,
    semiMajorAxisAU: 0.01544,
    discoveryYear: 2004,
    habitabilityIndex: 0.02,
    description:
      "A super-Earth so close to its star that its dayside is a molten silicate ocean. JWST has detected a tenuous atmosphere of CO and CO2.",
    hostStar: {
      name: "55 Cancri",
      spectralType: "K0IV-V",
      temperatureK: 5172,
      radiusSun: 0.943,
      massSun: 0.905,
    },
  },
  {
    id: "gj-1214b",
    name: "GJ 1214 b",
    kind: "ice-giant",
    massEarth: 6.55,
    radiusEarth: 2.742,
    orbitalPeriodDays: 1.58,
    equilibriumTempK: 596,
    semiMajorAxisAU: 0.01411,
    discoveryYear: 2009,
    habitabilityIndex: 0.18,
    description:
      "A warm sub-Neptune with a hazy hydrogen-rich envelope obscuring whatever lies beneath. A leading laboratory for understanding mini-Neptunes.",
    hostStar: {
      name: "GJ 1214",
      spectralType: "M4.5V",
      temperatureK: 3026,
      radiusSun: 0.215,
      massSun: 0.181,
    },
  },
  {
    id: "kepler-452b",
    name: "Kepler-452b",
    kind: "super-earth",
    massEarth: 5.0,
    radiusEarth: 1.63,
    orbitalPeriodDays: 384.8,
    equilibriumTempK: 265,
    semiMajorAxisAU: 1.046,
    discoveryYear: 2015,
    habitabilityIndex: 0.83,
    description:
      "An older, slightly larger cousin of Earth, orbiting a Sun-like star at near-Earth distance. A 1.5 billion-year glimpse of Earth's possible future.",
    hostStar: {
      name: "Kepler-452",
      spectralType: "G2V",
      temperatureK: 5757,
      radiusSun: 1.11,
      massSun: 1.04,
    },
  },
  {
    id: "wasp-12b",
    name: "WASP-12b",
    kind: "gas-giant",
    massEarth: 463,
    radiusEarth: 20.4,
    orbitalPeriodDays: 1.0914,
    equilibriumTempK: 2516,
    semiMajorAxisAU: 0.02340,
    discoveryYear: 2008,
    habitabilityIndex: 0.01,
    description:
      "An ultra-hot Jupiter being devoured by its star. The planet is distorted into an egg shape and bleeds gas at thousands of tonnes per second.",
    hostStar: {
      name: "WASP-12",
      spectralType: "G0V",
      temperatureK: 6300,
      radiusSun: 1.657,
      massSun: 1.434,
    },
  },
  {
    id: "toi-700d",
    name: "TOI-700 d",
    kind: "rocky",
    massEarth: 1.72,
    radiusEarth: 1.144,
    orbitalPeriodDays: 37.42,
    equilibriumTempK: 268,
    semiMajorAxisAU: 0.1633,
    discoveryYear: 2020,
    habitabilityIndex: 0.93,
    description:
      "TESS's first Earth-sized world in the habitable zone of its star. A small rocky planet orbiting a quiet M-dwarf, well-suited to host a stable atmosphere.",
    hostStar: {
      name: "TOI-700",
      spectralType: "M2V",
      temperatureK: 3480,
      radiusSun: 0.420,
      massSun: 0.416,
    },
  },
];
