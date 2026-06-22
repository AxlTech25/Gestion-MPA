"""Entrypoint FastAPI — microservicio ML Sprint 6."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict, train
from app.schemas.ml_schemas import HealthResponse
from app.services import inference_service

app = FastAPI(
    title="Gestión MPA — ML Service",
    version="0.7.0",
    description="Predicción de riesgo de falla y sugerencias de categoría",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(train.router)


@app.get("/health", response_model=HealthResponse)
def health():
    meta = inference_service.model_metadata()
    return HealthResponse(
        status="ok",
        modelo_version=meta.get("version"),
        modelo_disponible=inference_service.is_model_available(),
        trained_at=meta.get("trained_at"),
    )
