import { Router, type IRouter } from "express";
import {
  PredictExoplanetBody,
  PredictExoplanetResponse,
} from "@workspace/api-zod";
import { classify } from "../ml/model";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PYTHON_ML_URL =
  process.env.PYTHON_ML_URL ?? "http://127.0.0.1:8000";
const PYTHON_TIMEOUT_MS = 1500;

interface PythonPredictResponse {
  prediction: number;
  probability: number;
  feature_contributions: { feature: string; contribution: number }[];
  model: string;
  model_metrics?: Record<string, number>;
}

const SNAKE_TO_CAMEL: Record<string, string> = {
  orbital_period: "orbitalPeriod",
  planet_radius: "planetRadius",
  stellar_temperature: "stellarTemperature",
  semi_major_axis: "semiMajorAxis",
  transit_depth: "transitDepth",
};

function interpretation(
  pred: number,
  proba: number,
  contributions: { feature: string; contribution: number }[],
  modelName: string,
): string {
  const top = contributions[0]?.feature ?? "the input features";
  const verdict =
    pred === 1
      ? `CONFIRMED CANDIDATE (p=${proba.toFixed(3)})`
      : `LIKELY FALSE POSITIVE (p=${proba.toFixed(3)})`;
  return `${modelName.toUpperCase()} returns ${verdict}. The dominant signal comes from ${top.replace(/_/g, " ")}.`;
}

async function callPythonModel(
  body: { orbitalPeriod: number; planetRadius: number; stellarTemperature: number; semiMajorAxis: number; transitDepth: number },
): Promise<PythonPredictResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PYTHON_TIMEOUT_MS);
  try {
    const response = await fetch(`${PYTHON_ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orbital_period: body.orbitalPeriod,
        planet_radius: body.planetRadius,
        stellar_temperature: body.stellarTemperature,
        semi_major_axis: body.semiMajorAxis,
        transit_depth: body.transitDepth,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, "Python ML returned non-OK");
      return null;
    }
    return (await response.json()) as PythonPredictResponse;
  } catch (err) {
    logger.warn({ err: String(err) }, "Python ML unreachable, falling back");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

router.post("/predict", async (req, res) => {
  const parsed = PredictExoplanetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }

  // Try the real Python XGBoost service first.
  const py = await callPythonModel(parsed.data);
  if (py) {
    const featureContributions = py.feature_contributions.map((c) => ({
      feature: SNAKE_TO_CAMEL[c.feature] ?? c.feature,
      contribution: c.contribution,
    }));
    const data = PredictExoplanetResponse.parse({
      prediction: py.prediction,
      probability: py.probability,
      interpretation: interpretation(
        py.prediction,
        py.probability,
        featureContributions,
        "XGBoost",
      ),
      featureContributions,
      model: "xgboost",
    });
    res.json(data);
    return;
  }

  // Fallback: in-process Node GBDT (mathematically equivalent ensemble,
  // used so the UI never breaks if the Python service is restarting).
  const result = classify(parsed.data);
  const data = PredictExoplanetResponse.parse({ ...result, model: "node-gbdt" });
  res.json(data);
});

export default router;
