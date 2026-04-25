import { Router, type IRouter } from "express";
import healthRouter from "./health";
import predictRouter from "./predict";
import catalogRouter from "./catalog";
import simulationRouter from "./simulation";
import { getModel } from "../ml/model";

const router: IRouter = Router();

router.use(healthRouter);
router.use(predictRouter);
router.use(catalogRouter);
router.use(simulationRouter);

// Warm up the ML model at startup so the first /predict call is instant.
getModel();

export default router;
