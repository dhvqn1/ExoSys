# EXOSYS — Python XGBoost Service

A small FastAPI service that runs the **real** `xgboost.XGBClassifier`
behind a `POST /predict` endpoint. It is started alongside the Node API
server; the Node server proxies its `/api/predict` route here so the
front-end transparently uses the Python prediction.

## Layout

```
backend-python/
├── app/
│   ├── main.py            # FastAPI app + routes
│   └── model/
│       ├── dataset.py     # Synthetic, physics-grounded training set
│       ├── train.py       # Trains XGBoost and pickles the model
│       └── predict.py     # Loads model and exposes predict_one()
├── requirements.txt
└── README.md
```

## Endpoints

### `GET /healthz`

Returns model metadata, training metrics, and global feature importances.

### `POST /predict`

```json
{
  "orbital_period": 365.0,
  "planet_radius": 1.0,
  "stellar_temperature": 5778,
  "semi_major_axis": 1.0,
  "transit_depth": 0.0001
}
```

Returns:

```json
{
  "prediction": 1,
  "probability": 0.91,
  "feature_contributions": [
    {"feature": "planet_radius", "contribution": 0.31},
    ...
  ],
  "model": "xgboost",
  "model_metrics": {
    "accuracy": 0.97, "log_loss": 0.10, "roc_auc": 0.99,
    "n_train": 4800, "n_test": 1200
  }
}
```

`feature_contributions` are per-prediction SHAP-style attributions
returned by XGBoost's `pred_contribs=True` mode, normalised so they sum
to 1.

## Running locally

```bash
pip install -r requirements.txt
python -m app.model.train         # one-off: train + pickle model
uvicorn app.main:app --port 8088  # start the service
```

The first request to `/predict` will train and pickle the model
automatically if `app/model/exoplanet_xgb.pkl` doesn't exist yet.
