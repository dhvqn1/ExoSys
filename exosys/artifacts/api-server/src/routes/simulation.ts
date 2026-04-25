import { Router, type IRouter } from "express";
import {
  GeneratePlanetBody,
  GeneratePlanetResponse,
  SimulateHabitabilityBody,
  SimulateHabitabilityResponse,
} from "@workspace/api-zod";
import { generatePlanet, simulateHabitability } from "../services/simulation";

const router: IRouter = Router();

router.post("/simulation/generate", (req, res) => {
  const parsed = GeneratePlanetBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const seed = parsed.data.seed ?? Math.floor(Math.random() * 2 ** 31);
  const planet = generatePlanet(seed);
  const data = GeneratePlanetResponse.parse(planet);
  res.json(data);
});

router.post("/simulation/habitability", (req, res) => {
  const parsed = SimulateHabitabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const result = simulateHabitability(parsed.data);
  const data = SimulateHabitabilityResponse.parse(result);
  res.json(data);
});

export default router;
