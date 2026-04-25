import { Router, type IRouter } from "express";
import {
  GetCatalogSummaryResponse,
  GetDiscoveryTimelineResponse,
  ListCatalogPlanetsResponse,
} from "@workspace/api-zod";
import { CATALOG } from "../data/catalog";
import { TIMELINE } from "../data/timeline";

const router: IRouter = Router();

router.get("/catalog/planets", (_req, res) => {
  const data = ListCatalogPlanetsResponse.parse(CATALOG);
  res.json(data);
});

router.get("/catalog/timeline", (_req, res) => {
  const data = GetDiscoveryTimelineResponse.parse(TIMELINE);
  res.json(data);
});

router.get("/catalog/summary", (_req, res) => {
  const total = CATALOG.length;
  const rocky = CATALOG.filter(
    (p) => p.kind === "rocky" || p.kind === "super-earth",
  ).length;
  const gasGiant = CATALOG.filter(
    (p) => p.kind === "gas-giant" || p.kind === "ice-giant",
  ).length;
  const habitableZone = CATALOG.filter((p) => p.habitabilityIndex >= 0.6).length;
  const meanRadius =
    CATALOG.reduce((a, p) => a + p.radiusEarth, 0) / Math.max(1, total);
  const meanOrbitalPeriod =
    CATALOG.reduce((a, p) => a + p.orbitalPeriodDays, 0) / Math.max(1, total);
  const data = GetCatalogSummaryResponse.parse({
    total,
    rocky,
    gasGiant,
    habitableZone,
    meanRadius: Math.round(meanRadius * 100) / 100,
    meanOrbitalPeriod: Math.round(meanOrbitalPeriod * 100) / 100,
  });
  res.json(data);
});

export default router;
