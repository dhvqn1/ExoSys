export interface TimelineEntry {
  year: number;
  count: number;
  cumulative: number;
  notable: string;
}

const RAW: Array<[number, number, string]> = [
  [1992, 2, "First confirmed exoplanets — pulsar planets around PSR B1257+12"],
  [1995, 1, "51 Pegasi b — first hot Jupiter around a Sun-like star"],
  [1996, 6, "First multi-planet system around a main-sequence star"],
  [1997, 2, ""],
  [1998, 6, ""],
  [1999, 9, "First transiting exoplanet detected: HD 209458 b"],
  [2000, 16, ""],
  [2001, 12, ""],
  [2002, 31, ""],
  [2003, 25, ""],
  [2004, 28, "First imaged exoplanet candidate: 2M1207 b"],
  [2005, 32, ""],
  [2006, 28, ""],
  [2007, 62, ""],
  [2008, 61, "First multi-planet system directly imaged: HR 8799"],
  [2009, 86, "Kepler space telescope launched"],
  [2010, 109, ""],
  [2011, 189, "Kepler-22b — first confirmed planet in a Sun-like habitable zone"],
  [2012, 138, ""],
  [2013, 154, ""],
  [2014, 854, "Kepler verifies 715 planets in a single announcement"],
  [2015, 154, "Kepler-452b — Earth's older cousin"],
  [2016, 1493, "Proxima Centauri b — habitable-zone world at our nearest star"],
  [2017, 156, "TRAPPIST-1: seven Earth-sized worlds around one ultracool dwarf"],
  [2018, 318, "TESS launched — all-sky transit survey"],
  [2019, 192, ""],
  [2020, 280, "TOI-700 d — TESS's first habitable-zone Earth-sized planet"],
  [2021, 521, "James Webb Space Telescope launched"],
  [2022, 200, "JWST first exoplanet atmosphere spectrum: WASP-39 b CO2 detection"],
  [2023, 304, "JWST detects DMS hint at K2-18 b"],
  [2024, 281, "Sub-Neptune atmospheres mapped in unprecedented detail"],
  [2025, 196, "Direct imaging of cooler, longer-period giants from ground+space"],
];

export const TIMELINE: TimelineEntry[] = (() => {
  let cum = 0;
  return RAW.map(([year, count, notable]) => {
    cum += count;
    return { year, count, cumulative: cum, notable };
  });
})();
