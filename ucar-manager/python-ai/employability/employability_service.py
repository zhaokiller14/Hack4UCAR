from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "employability_forecast_model.pkl"


class ForecastRequest(BaseModel):
    history: List[float] = Field(
        ...,
        min_length=4,
        description="Historical employability_rate values ordered oldest -> newest.",
    )
    last_reporting_period: date = Field(
        ..., description="Date of the last observed quarter end, e.g. 2026-12-31."
    )
    horizon: int = Field(
        4,
        ge=1,
        le=16,
        description="Number of future quarters to forecast.",
    )


class ForecastPoint(BaseModel):
    reporting_period: date
    forecast_employability_rate: float


class ForecastResponse(BaseModel):
    model_name: str
    target: str
    horizon: int
    forecasts: List[ForecastPoint]


app = FastAPI(
    title="UCAR Employability Forecast API",
    description="FastAPI endpoint to serve the employability rate forecasting model.",
    version="1.0.0",
)


@app.on_event("startup")
def load_artifact() -> None:
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model artifact not found at {MODEL_PATH}. "
            "Run the notebook first to generate employability_forecast_model.pkl"
        )

    artifact = joblib.load(MODEL_PATH)
    required_keys = {"model_name", "target", "feature_cols", "model"}
    if not required_keys.issubset(artifact.keys()):
        raise RuntimeError("Model artifact is missing required keys.")

    app.state.artifact = artifact


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast(request: ForecastRequest) -> ForecastResponse:
    artifact = getattr(app.state, "artifact", None)
    if artifact is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")

    model = artifact["model"]
    feature_cols = artifact["feature_cols"]

    history = list(request.history)
    if len(history) < 4:
        raise HTTPException(status_code=400, detail="history must have at least 4 values")

    future_dates = pd.date_range(
        start=pd.Timestamp(request.last_reporting_period) + pd.offsets.QuarterEnd(),
        periods=request.horizon,
        freq="QE",
    )

    forecasts: List[ForecastPoint] = []

    for step in range(1, request.horizon + 1):
        next_date = future_dates[step - 1]
        quarter = int(next_date.quarter)

        # trend_idx continues from the end of the supplied history
        trend_idx = len(history)

        row = pd.DataFrame(
            [
                {
                    "trend_idx": trend_idx,
                    "lag_1": history[-1],
                    "lag_2": history[-2],
                    "lag_4": history[-4],
                    "q_sin": float(np.sin(2 * np.pi * quarter / 4)),
                    "q_cos": float(np.cos(2 * np.pi * quarter / 4)),
                }
            ]
        )

        missing = [col for col in feature_cols if col not in row.columns]
        if missing:
            raise HTTPException(status_code=500, detail=f"Missing model features: {missing}")

        yhat = float(model.predict(row[feature_cols])[0])
        history.append(yhat)

        forecasts.append(
            ForecastPoint(
                reporting_period=next_date.date(),
                forecast_employability_rate=round(yhat, 6),
            )
        )

    return ForecastResponse(
        model_name=str(artifact["model_name"]),
        target=str(artifact["target"]),
        horizon=request.horizon,
        forecasts=forecasts,
    )
