"""Router de entrenamiento y métricas."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.ml_schemas import MetricsResponse, TrainResponse
from app.services import inference_service, trainer_service

router = APIRouter(tags=["train"])


@router.post("/train", response_model=TrainResponse)
def train_model():
    result = trainer_service.retrain_from_db()
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    inference_service._predictor = None  # noqa: SLF001
    inference_service._load_error = None  # noqa: SLF001
    return TrainResponse(**result)


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    meta = inference_service.model_metadata()
    return MetricsResponse(available=bool(meta), metadata=meta or None)
