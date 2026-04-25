"""
EXOSYS Python ML service.

A small FastAPI app that exposes the real XGBoost classifier alongside
the existing Node API server.
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.model.predict import predict_one, warmup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("exosys.ml")

app = FastAPI(title="EXOSYS XGBoost Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    orbital_period: float = Field(..., gt=0, description="Days")
    planet_radius: float = Field(..., gt=0, description="Earth radii")
    stellar_temperature: float = Field(..., gt=0, description="Kelvin")
    semi_major_axis: float = Field(..., gt=0, description="AU")
    transit_depth: float = Field(..., gt=0, description="Fractional dimming")


class FeatureContribution(BaseModel):
    feature: str
    contribution: float


class PredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    prediction: int
    probability: float
    feature_contributions: list[FeatureContribution]
    model: str
    model_metrics: dict


class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    status: str
    model: str
    feature_names: list[str]
    metrics: dict
    feature_importances: dict


@app.on_event("startup")
def _on_startup() -> None:
    info = warmup()
    log.info("XGBoost model ready: metrics=%s", info["metrics"])


@app.get("/healthz", response_model=HealthResponse)
def healthz() -> HealthResponse:
    info = warmup()
    return HealthResponse(
        status="ok",
        model="xgboost",
        feature_names=info["feature_names"],
        metrics=info["metrics"],
        feature_importances=info["feature_importances"],
    )


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    result = predict_one(req.model_dump())
    return PredictResponse(**result)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PYTHON_ML_PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")
