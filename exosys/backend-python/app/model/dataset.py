"""
Synthetic training dataset for the EXOSYS exoplanet classifier.

We do not have raw NASA Kepler/TESS DR tables in this environment, so we
build a physics-grounded synthetic catalog with four classes of signal:

    1. Confirmed planet transits        — label 1
    2. Eclipsing binary contaminants    — label 0
    3. Background blended events        — label 0
    4. Pure detector noise              — label 0

Features (in order):

    orbital_period       (days)
    planet_radius        (Earth radii)
    stellar_temperature  (K)
    semi_major_axis      (AU)
    transit_depth        (fractional dimming during transit)
"""

from __future__ import annotations

import numpy as np

FEATURE_NAMES: list[str] = [
    "orbital_period",
    "planet_radius",
    "stellar_temperature",
    "semi_major_axis",
    "transit_depth",
]

# Solar units we use for the geometry sanity-check.
R_SUN_IN_R_EARTH = 109.2


def _sample_planets(rng: np.random.Generator, n: int) -> np.ndarray:
    """Real-planet-like transits."""
    period = np.exp(rng.normal(np.log(20.0), 1.4, n)).clip(0.4, 800.0)
    radius = np.exp(rng.normal(np.log(2.0), 0.9, n)).clip(0.4, 22.0)
    teff = rng.normal(5500.0, 900.0, n).clip(2700.0, 8000.0)

    # Kepler's third law with M_star ~ (T_eff/5778)^0.7 (rough main-seq scaling).
    m_star = (teff / 5778.0) ** 0.7
    a = (m_star * (period / 365.25) ** 2) ** (1.0 / 3.0)

    # Stellar radius from a similar power law.
    r_star = (teff / 5778.0) ** 0.8

    depth = (radius / (r_star * R_SUN_IN_R_EARTH)) ** 2
    depth *= rng.normal(1.0, 0.08, n).clip(0.6, 1.4)
    depth = depth.clip(1e-6, 0.05)

    return np.stack([period, radius, teff, a, depth], axis=1)


def _sample_eclipsing_binaries(rng: np.random.Generator, n: int) -> np.ndarray:
    """Stellar companions masquerading as planets — much deeper events."""
    period = np.exp(rng.normal(np.log(5.0), 1.0, n)).clip(0.3, 200.0)
    # An EB looks like a "huge planet" (companion star) so the radius proxy
    # is very large: 10–80 R_earth equivalent.
    radius = rng.uniform(10.0, 80.0, n)
    teff = rng.normal(5800.0, 1100.0, n).clip(2700.0, 9000.0)
    m_star = (teff / 5778.0) ** 0.7
    a = (m_star * (period / 365.25) ** 2) ** (1.0 / 3.0)
    # Eclipses are deep: 1% – 30%.
    depth = rng.uniform(0.01, 0.30, n)
    return np.stack([period, radius, teff, a, depth], axis=1)


def _sample_blends(rng: np.random.Generator, n: int) -> np.ndarray:
    """Background blended events: shallow, geometry inconsistent with depth."""
    period = np.exp(rng.normal(np.log(15.0), 1.5, n)).clip(0.4, 700.0)
    # Reported radius doesn't match actual depth — geometry is off.
    radius = np.exp(rng.normal(np.log(3.0), 0.9, n)).clip(0.5, 20.0)
    teff = rng.normal(5400.0, 1000.0, n).clip(2700.0, 8500.0)
    m_star = (teff / 5778.0) ** 0.7
    a = (m_star * (period / 365.25) ** 2) ** (1.0 / 3.0)
    # Depth disconnected from radius, with extra dilution → much shallower.
    depth = np.exp(rng.normal(np.log(2e-4), 0.7, n)).clip(1e-6, 5e-3)
    return np.stack([period, radius, teff, a, depth], axis=1)


def _sample_noise(rng: np.random.Generator, n: int) -> np.ndarray:
    """Pure detector noise — wide, uncorrelated."""
    period = np.exp(rng.uniform(np.log(0.3), np.log(800.0), n))
    radius = np.exp(rng.uniform(np.log(0.3), np.log(25.0), n))
    teff = rng.uniform(2700.0, 9000.0, n)
    a = np.exp(rng.uniform(np.log(0.005), np.log(3.0), n))
    depth = np.exp(rng.uniform(np.log(1e-6), np.log(0.05), n))
    return np.stack([period, radius, teff, a, depth], axis=1)


def make_dataset(n_total: int = 6000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """
    Build a balanced training matrix `X` and binary label vector `y`.

    Class mix (n_total = 6000 default):
        50% planets    → label 1
        20% eclipsing binaries → label 0
        20% background blends  → label 0
        10% noise              → label 0
    """
    rng = np.random.default_rng(seed)

    n_planet = n_total // 2
    n_eb = n_total // 5
    n_blend = n_total // 5
    n_noise = n_total - n_planet - n_eb - n_blend

    x_planet = _sample_planets(rng, n_planet)
    x_eb = _sample_eclipsing_binaries(rng, n_eb)
    x_blend = _sample_blends(rng, n_blend)
    x_noise = _sample_noise(rng, n_noise)

    x = np.concatenate([x_planet, x_eb, x_blend, x_noise], axis=0).astype(np.float32)
    y = np.concatenate(
        [
            np.ones(n_planet, dtype=np.int32),
            np.zeros(n_eb, dtype=np.int32),
            np.zeros(n_blend, dtype=np.int32),
            np.zeros(n_noise, dtype=np.int32),
        ],
        axis=0,
    )

    # Shuffle.
    idx = rng.permutation(x.shape[0])
    return x[idx], y[idx]
