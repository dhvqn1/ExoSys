import { logger } from "../lib/logger";
import { buildDataset, FEATURES } from "./dataset";
import {
  type GBDTModel,
  evaluateAccuracy,
  featureContributions,
  predictProba,
  train,
} from "./gbdt";

let _model: GBDTModel | null = null;

export function getModel(): GBDTModel {
  if (_model) return _model;
  const t0 = Date.now();
  const data = buildDataset();
  const X = data.map((s) => s.features);
  const y = data.map((s) => s.label as number);
  // Hold out 20% for evaluation
  const split = Math.floor(X.length * 0.8);
  const Xtr = X.slice(0, split);
  const ytr = y.slice(0, split);
  const Xte = X.slice(split);
  const yte = y.slice(split);
  const model = train(Xtr, ytr, {
    rounds: 120,
    maxDepth: 4,
    learningRate: 0.1,
    lambda: 1.0,
    minChild: 12,
    subsample: 0.85,
    seed: 7,
    featureNames: FEATURES,
  });
  const eval_ = evaluateAccuracy(model, Xte, yte);
  logger.info(
    {
      ms: Date.now() - t0,
      rounds: model.trees.length,
      accuracy: eval_.accuracy,
      logLoss: eval_.logLoss,
    },
    "EXOSYS gradient boosted classifier trained",
  );
  _model = model;
  return _model;
}

export function classify(input: {
  orbitalPeriod: number;
  planetRadius: number;
  stellarTemperature: number;
  semiMajorAxis: number;
  transitDepth: number;
}): {
  prediction: 0 | 1;
  probability: number;
  interpretation: string;
  featureContributions: { feature: string; contribution: number }[];
} {
  const model = getModel();
  const x = [
    input.orbitalPeriod,
    input.planetRadius,
    input.stellarTemperature,
    input.semiMajorAxis,
    input.transitDepth,
  ];
  const probability = predictProba(model, x);
  const prediction: 0 | 1 = probability >= 0.5 ? 1 : 0;
  const contribRaw = featureContributions(model, x);
  const totalAbs = contribRaw.reduce((a, b) => a + Math.abs(b), 0) || 1;
  const contributions = FEATURES.map((feature, i) => ({
    feature,
    contribution: contribRaw[i]! / totalAbs,
  })).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const interpretation = interpret(input, prediction, probability, contributions);

  return {
    prediction,
    probability,
    interpretation,
    featureContributions: contributions,
  };
}

function interpret(
  input: {
    orbitalPeriod: number;
    planetRadius: number;
    stellarTemperature: number;
    semiMajorAxis: number;
    transitDepth: number;
  },
  prediction: 0 | 1,
  probability: number,
  contribs: { feature: string; contribution: number }[],
): string {
  const top = contribs[0]!;
  const conf =
    probability > 0.85 || probability < 0.15
      ? "high confidence"
      : probability > 0.7 || probability < 0.3
        ? "moderate confidence"
        : "marginal confidence";

  // Physical sanity: transit depth implied by Rp^2/R*^2 (using a rough star
  // radius from the temperature) compared to observed.
  const SUN_R = 6.957e8;
  const EARTH_R = 6.371e6;
  const starR = Math.max(0.12, 0.000295 * input.stellarTemperature - 0.7);
  const expectedDepth =
    ((input.planetRadius * EARTH_R) ** 2 /
      (starR * SUN_R) ** 2) *
    1e6;
  const ratio = input.transitDepth / Math.max(1, expectedDepth);

  const consistency =
    ratio > 5
      ? "Transit depth is far deeper than the candidate's radius would produce — consistent with an eclipsing binary or background blend."
      : ratio < 0.2
        ? "Transit depth is shallower than the radius implies — the geometry may be grazing or the radius overestimated."
        : "Depth and radius are physically consistent.";

  if (prediction === 1) {
    return `Classifier returns CONFIRMED CANDIDATE with ${conf} (p=${probability.toFixed(3)}). The dominant signal comes from ${friendlyFeature(top.feature)}. ${consistency} Recommend follow-up radial velocity to constrain mass.`;
  }
  return `Classifier returns FALSE POSITIVE with ${conf} (p=${probability.toFixed(3)}). The dominant deciding factor was ${friendlyFeature(top.feature)}. ${consistency} The signal is unlikely to be a planetary transit at this geometry.`;
}

function friendlyFeature(f: string): string {
  switch (f) {
    case "orbitalPeriod":
      return "orbital period";
    case "planetRadius":
      return "candidate radius";
    case "stellarTemperature":
      return "host star temperature";
    case "semiMajorAxis":
      return "semi-major axis";
    case "transitDepth":
      return "transit depth";
    default:
      return f;
  }
}
