"""
Train an XGBoost classifier on the EXOSYS synthetic transit dataset and
persist the fitted model with pickle.

Run directly:

    python -m app.model.train
"""

from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from .dataset import FEATURE_NAMES, make_dataset

MODEL_PATH = Path(__file__).parent / "exoplanet_xgb.pkl"


def train_and_save(model_path: Path = MODEL_PATH) -> dict[str, float]:
    x, y = make_dataset(n_total=6000, seed=42)
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.9,
        reg_lambda=1.0,
        objective="binary:logistic",
        eval_metric="logloss",
        tree_method="hist",
        n_jobs=2,
        random_state=42,
    )
    model.fit(x_train, y_train)

    y_pred = model.predict(x_test)
    y_proba = model.predict_proba(x_test)[:, 1]

    metrics = {
        "n_train": int(x_train.shape[0]),
        "n_test": int(x_test.shape[0]),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "log_loss": float(log_loss(y_test, y_proba)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
    }

    importances = dict(
        zip(FEATURE_NAMES, [float(v) for v in model.feature_importances_])
    )

    payload = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "feature_importances": importances,
        "metrics": metrics,
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    with model_path.open("wb") as f:
        pickle.dump(payload, f)

    return metrics


if __name__ == "__main__":
    m = train_and_save()
    print("Trained XGBoost classifier")
    for k, v in m.items():
        print(f"  {k:>10s}: {v}")
