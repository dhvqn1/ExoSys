# EXOSYS — Exoplanet Intelligence System

A cinematic, browser-based mission console for exploring, classifying,
and simulating exoplanets. EXOSYS pairs a real-time 3D star system with
a real **Python XGBoost** classifier (running as a FastAPI sidecar) and
a small physics engine for habitability and procedural world generation.

The interface is intentionally restrained: deep blue-black space, warm
sunlight, thin typography, slow cinematic motion. There are six contextual
modes — **System**, **Planet Detail**, **Classify**, **Generate**,
**Habitability**, and **Timeline** — and a context-aware Mission AI that
narrates events in the upper right.

---

## Features

- Real-time **3D solar system** rendered with Three.js / React Three Fiber,
  with PBR-shaded planets (procedural albedo + normal + roughness maps),
  a physically-lit central star, atmospheric rim glow, additive bloom, and a
  cinematic camera rig that frames each selected planet.
- A live catalog of **10 real exoplanets** (Kepler-186f, Proxima b,
  TRAPPIST-1e, Kepler-22b, HD 209458 b, 55 Cancri e, GJ 1214 b, Kepler-452b,
  WASP-12b, TOI-700 d) with real host-star data.
- A real **Python XGBoost** classifier (`xgboost.XGBClassifier`) running
  as a FastAPI sidecar at `backend-python/`. Trained on a physics-grounded
  synthetic dataset of 6,000 transit-like signals (planets + eclipsing
  binaries + background blends + noise). Returns probability, per-prediction
  SHAP-style attributions, and a written interpretation. The Node API
  proxies `/api/predict` to it transparently and falls back to an
  in-process Node ensemble if the Python service is unavailable.
- A **procedural planet generator** that produces a full planetary record
  (mass, radius, orbit, equilibrium temperature, surface palette) from a
  short prompt or seed.
- A **habitability simulator** that uses the Stefan–Boltzmann law to
  compute equilibrium temperature given stellar luminosity, distance,
  Bond albedo, and a greenhouse term.
- A **discovery timeline** of confirmed exoplanets per year from 1992 to 2025.
- Context-aware **Mission AI** narration overlay that responds to mode and
  selection changes (it is not a chat).

---

## Repository Layout

EXOSYS lives in a single pnpm monorepo. Three services and the shared
contract are the things you need to know about:

```
EXOSYS/
├── artifacts/
│   ├── exosys/               # React + Vite + Three.js front-end (the UI)
│   │   ├── src/
│   │   │   ├── scene/        # 3D scene: Star, Planet, Starfield, CameraRig
│   │   │   ├── ui/           # Mode panels: Classify, Generate, etc.
│   │   │   ├── ai/           # Mission AI narration
│   │   │   ├── state/        # zustand store + planetPositions registry
│   │   │   └── App.tsx
│   │   └── package.json
│   └── api-server/           # Express 5 + TypeScript back-end (API gateway)
│       ├── src/
│       │   ├── ml/           # Fallback in-process GBDT (used if Python down)
│       │   ├── data/         # Real catalog + discovery timeline
│       │   ├── services/     # Procedural generator, habitability physics
│       │   └── routes/       # /predict (proxy), /catalog/*, /simulation/*
│       └── package.json
├── backend-python/           # FastAPI + real xgboost.XGBClassifier sidecar
│   ├── app/
│   │   ├── main.py           # FastAPI app: GET /healthz, POST /predict
│   │   └── model/
│   │       ├── dataset.py    # Synthetic, physics-grounded training set
│   │       ├── train.py      # Trains XGBoost and pickles the model
│   │       └── predict.py    # Loads model, returns SHAP attributions
│   ├── requirements.txt
│   └── README.md
├── lib/
│   ├── api-spec/             # OpenAPI 3 spec — single source of truth
│   ├── api-zod/              # Generated Zod schemas (server validation)
│   └── api-client-react/     # Generated React Query hooks (client)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

The OpenAPI spec at `lib/api-spec/openapi.yaml` is the contract. Running
`pnpm --filter @workspace/api-spec run codegen` regenerates the Zod schemas
and the typed React Query hooks consumed by both sides.

---

## Tech Stack

| Layer        | Stack                                                          |
| ------------ | -------------------------------------------------------------- |
| 3D / UI      | React 18, Vite, TypeScript, Three.js, @react-three/fiber, drei, @react-three/postprocessing, framer-motion, Tailwind CSS, zustand |
| API          | Node.js 24, Express 5, Pino, Zod, esbuild                      |
| ML (primary) | Python 3.11, FastAPI, **`xgboost.XGBClassifier`**, scikit-learn, NumPy — runs as a sidecar at `backend-python/` |
| ML (fallback)| In-process Node gradient-boosted decision trees (Newton-step splits, logistic loss, L2 leaf regularisation) — used only if the Python sidecar is unreachable |
| Contracts    | OpenAPI 3, Orval (codegen), TanStack Query                     |
| Tooling      | pnpm workspaces, TypeScript project references                 |

---

## Frontend

The front-end lives in `artifacts/exosys/`. The 3D world is composed by:

- **`scene/Scene.tsx`** — the `<Canvas>`, ACES tone mapping, ambient fill,
  hemisphere light, post-processing bloom, and the camera rig.
- **`scene/Star.tsx`** — a non-tone-mapped emissive sphere plus two
  back-side additive halos and a high-intensity `pointLight`. The point
  light casts shadows.
- **`scene/Planet.tsx`** — for each planet: a 96×96 sphere with a
  `MeshStandardMaterial` driven by a procedural **albedo map**, **normal
  map**, and **roughness map**, an atmospheric rim shell, an orbit ring,
  hover/selection labels, and a slow cinematic orbit (log-compressed so
  hot Jupiters don't whirl).
- **`scene/utils/proceduralTexture.ts`** — value-noise / fBm based
  texture generator. Builds a heightfield, derives the normal map by
  finite-differencing it, and shades the albedo from per-kind palettes
  (rocky, super-earth, ocean, gas-giant, ice-giant, lava, desert).
- **`scene/CameraRig.tsx`** — smoothly lerps camera position and
  `OrbitControls.target` to follow the **live world position** of the
  selected planet (read from a small `state/planetPositions.ts`
  registry that `Planet.tsx` writes into every frame via
  `getWorldPosition`). The rig preserves the user's current azimuth, so
  clicking a planet centres on it without yanking the camera, and the
  stand-off distance scales with the planet's visual radius. Top-down
  god's-eye view in `TIMELINE` mode.

The UI is composed of mode panels under `src/ui/`. Mode switching is
driven by the zustand store at `src/state/useExosys.ts`. The Mission AI
overlay at `src/ai/MissionAI.tsx` listens for narration events emitted by
the rest of the app and renders one line at a time with a fade in/out.

All API calls go through generated React Query hooks in
`@workspace/api-client-react`.

---

## Backend

The back-end lives in `artifacts/api-server/`. It is an Express 5 server
that mounts a single router under `/api`. Endpoints:

| Method | Path                       | Purpose                                                         |
| ------ | -------------------------- | --------------------------------------------------------------- |
| GET    | `/api/healthz`             | Liveness check                                                  |
| POST   | `/api/predict`             | Classify a transit signal — returns probability + contributions |
| GET    | `/api/catalog/planets`     | The real-exoplanet catalog (10 entries, full host-star data)    |
| GET    | `/api/catalog/timeline`    | Annual confirmed-exoplanet counts, 1992 – 2025                  |
| GET    | `/api/catalog/summary`     | Aggregated counts (rocky, gas-giant, habitable-zone, …)         |
| POST   | `/api/simulation/generate` | Generate a procedural planet from kind + seed                   |
| POST   | `/api/simulation/habitability` | Stefan–Boltzmann equilibrium-temperature simulator           |

Every request body is validated with Zod schemas generated from the
OpenAPI spec. The classifier is warmed up at process start so the first
`/predict` call is instantaneous.

### Data flow

```
Browser  ──fetch──►  Express  ──Zod validate──►  service
                                                   │
                          ┌────────────────────────┤
                          │                        │
                  catalog (static JSON)     ML (in-memory model)
                          │                        │
                  simulation services       gradient-boosted forest
                                                   │
Browser  ◄─JSON─────────────────────────────── response
```

---

## Machine Learning Architecture

EXOSYS uses two classifiers wired together so the UI sees a single
`POST /api/predict` endpoint:

1. **Primary — real Python XGBoost (`backend-python/`).** A FastAPI
   service that loads a pickled `xgboost.XGBClassifier` and serves
   `POST /predict`. Trained on a 6,000-sample physics-grounded synthetic
   dataset (planet transits + eclipsing binaries + background blends +
   detector noise). Test-set metrics on a fresh seed:

   - **accuracy ≈ 0.95**
   - **log-loss ≈ 0.14**
   - **ROC-AUC ≈ 0.99**

   Per-prediction attributions are real SHAP values from XGBoost's
   `pred_contribs=True`, normalised so they sum to 1. They reflect *this
   particular row*, not just global importance.

2. **Fallback — in-process Node GBDT (`artifacts/api-server/src/ml/`).**
   A from-scratch implementation of the same algorithm (Newton-step
   splits, logistic loss, L2 leaf regularisation) used only if the
   Python sidecar is unreachable. This guarantees the UI keeps working
   during a sidecar restart or in environments where Python isn't
   available.

The Node `/api/predict` route translates camelCase ↔ snake_case between
the front-end contract and the Python service, so the OpenAPI contract
and the React Query hooks never change regardless of which classifier
served the request. The response includes a `model` field
(`"xgboost"` or `"node-gbdt"`) so the UI can show which path was used.

### Python service files

- `backend-python/app/model/dataset.py` — physics-grounded synthetic
  data (Kepler's third law, M-S radius scaling, geometric transit depth
  `(R_p / R_*)^2`, plus three classes of contaminant).
- `backend-python/app/model/train.py` — `XGBClassifier(n_estimators=300,
  max_depth=5, learning_rate=0.08, subsample=0.85, colsample_bytree=0.9,
  tree_method="hist")`, prints metrics, pickles the model.
- `backend-python/app/model/predict.py` — loads the pickle (training on
  first call if no pickle exists yet), serves `predict_one()` with SHAP
  attributions.
- `backend-python/app/main.py` — FastAPI app exposing `GET /healthz` and
  `POST /predict` on port 8000 (`PYTHON_ML_PORT`).

### Inputs / outputs (5 features)

1. `orbitalPeriod`      — days
2. `planetRadius`       — Earth radii
3. `stellarTemperature` — K
4. `semiMajorAxis`      — AU
5. `transitDepth`       — fractional dimming during transit

Response:

- `prediction`            — 0 or 1
- `probability`           — `[0, 1]`
- `featureContributions`  — per-prediction attributions (sum to 1)
- `interpretation`        — short English summary
- `model`                 — `"xgboost"` (primary) or `"node-gbdt"` (fallback)

---

## Physics & Math

### Orbital motion

In the 3D scene, each planet's `semiMajorAxis` (AU) is mapped to a visual
orbit radius and the planet itself is parented to a `<group>` rotated about
the y-axis. Angular speed is log-compressed,
`ω = 0.04 / log10(P + 10)`, so a 0.7-day hot Jupiter and a 385-day
super-Earth both read as cinematic motion rather than blurs or stalls.

### Lighting (PBR)

Planets use Three.js' physically-based `MeshStandardMaterial`. The
sun is a high-intensity `pointLight` at the origin with low decay so its
flux reaches outer orbits, plus a dim `ambientLight` and `hemisphereLight`
for fill so the night side is not pure black. A back-side additive sphere
gives each world an atmospheric rim. Bloom is applied as a post-process
on values above the tone-mapped white point.

### Habitability

Equilibrium temperature is computed from the Stefan–Boltzmann balance
between absorbed stellar flux and re-radiated thermal flux:

```
T_eq = T_star · sqrt(R_star / (2 · a)) · (1 − A)^(1/4)
```

with a small additive greenhouse term `ΔT_GH` for atmospheres. The
habitability index combines distance to the conservative habitable-zone
midpoint, the temperature delta from 288 K, and a planet-mass cut-off.

---

## System Flow

```
User ──► UI mode (e.g. CLASSIFY)
       └─► fills form (5 features)
            └─► React Query hook usePredictExoplanet
                 └─► POST /api/predict   ── Zod validate ──► ML model
                                                              │
                       JSON response (prediction + probability + contributions)
                 ◄──────────────────────────────────────────┘
            └─► UI animates result, Mission AI narrates
```

---

## Local Development

Requirements: Node 24, pnpm 10, Python 3.11.

```bash
pnpm install

# Generate Zod + React Query hooks from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Start the Python XGBoost sidecar (in another terminal)
cd backend-python
pip install -r requirements.txt
python -m app.model.train          # one-off: train + pickle the model
python -m uvicorn app.main:app --port 8000

# Start the front-end + Node API gateway
pnpm dev
```

The web app is served by Vite. The API server is built with esbuild and
run with Node. To run only one:

```bash
pnpm --filter @workspace/exosys dev
pnpm --filter @workspace/api-server dev
```

To type-check the entire monorepo:

```bash
pnpm typecheck
```

---

## ML Model — Inputs and Outputs at a Glance

**Request — `POST /api/predict`**

```json
{
  "orbitalPeriod": 365.0,
  "planetRadius": 1.0,
  "stellarTemperature": 5778,
  "semiMajorAxis": 1.0,
  "transitDepth": 0.0001
}
```

**Response**

```json
{
  "prediction": 1,
  "probability": 0.978,
  "interpretation": "Classifier returns CONFIRMED CANDIDATE …",
  "featureContributions": [
    { "feature": "planetRadius",       "contribution": 0.33 },
    { "feature": "transitDepth",       "contribution": 0.28 },
    { "feature": "stellarTemperature", "contribution": 0.16 },
    { "feature": "orbitalPeriod",      "contribution": 0.13 },
    { "feature": "semiMajorAxis",      "contribution": 0.11 }
  ]
}
```

---

## Future Improvements

- Re-train the Python XGBoost classifier on real NASA Kepler / TESS
  Object of Interest tables instead of synthetic-but-physics-grounded
  data.
- Persist generated worlds and a per-session mission log.
- WebGPU renderer path for higher-resolution planetary detail.
- Atmospheric scattering shader (Rayleigh + Mie) instead of additive rim.
- Stream live exoplanet discovery updates from the NASA Exoplanet Archive.

---

## License

MIT — see `LICENSE`.
