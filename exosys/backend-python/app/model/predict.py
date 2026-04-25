"""
Loads the trained XGBoost model from disk (training it on the fly the
first time if no pickle is present) and exposes a single predict()
helper plus per-feature attribution.
"""

from __future__ import annotations

import pickle
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np

from .dataset import FEATURE_NAMES
from .train import MODEL_PATH, train_and_save

_lock = Lock()
_payload: dict[str, Any] | None = None


def _load() -> dict[str, Any]:
    global _payload
    if _payload is not None:
        return _payload
    with _lock:
        if _payload is not None:
            return _payload
        if not MODEL_PATH.exists():
            train_and_save(MODEL_PATH)
        with MODEL_PATH.open("rb") as f:
            _payload = pickle.load(f)
        return _payload


def warmup() -> dict[str, Any]:
    p = _load()
    return {
        "feature_names": p["feature_names"],
        "metrics": p["metrics"],
        "feature_importances": p["feature_importances"],
    }


def predict_one(features: dict[str, float]) -> dict[str, Any]:
    """Predict on a single record. Returns prediction, probability, and
    a normalised feature_contributions list using XGBoost's SHAP values
    when available (per-prediction attributions). Falls back to global
    feature importances otherwise.
    """
    payload = _load()
    model = payload["model"]
    feature_names: list[str] = payload["feature_names"]

    x = np.array(
        [[float(features[name]) for name in feature_names]], dtype=np.float32
    )

    proba = float(model.predict_proba(x)[0, 1])
    pred = int(proba >= 0.5)

    # Per-row feature attributions via SHAP.
    contributions: list[dict[str, float]] = []
    try:
        # pred_contribs returns shape (1, n_features + 1) — last column is bias.
        contribs = model.get_booster().predict(
            _to_dmatrix(x), pred_contribs=True
        )
        attr = np.abs(contribs[0, :-1])
        if attr.sum() > 0:
            attr = attr / attr.sum()
        for name, value in sorted(
            zip(feature_names, attr), key=lambda kv: -kv[1]
        ):
            contributions.append({"feature": name, "contribution": float(value)})
    except Exception:
        importances = payload["feature_importances"]
        for name, value in sorted(importances.items(), key=lambda kv: -kv[1]):
            contributions.append({"feature": name, "contribution": float(value)})

    return {
        "prediction": pred,
        "probability": proba,
        "feature_contributions": contributions,
        "model": "xgboost",
        "model_metrics": payload["metrics"],
    }


def _to_dmatrix(x: np.ndarray):
    import xgboost as xgb

    return xgb.DMatrix(x, feature_names=FEATURE_NAMES)
