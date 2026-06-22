"""Schemas Pydantic para la API ML."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class RiesgoRequest(BaseModel):
    equipo_id: int = Field(..., gt=0)


class RiesgoBatchRequest(BaseModel):
    equipo_ids: list[int] | None = None
    limit: int | None = Field(default=None, ge=1, le=500)


class CategoriaRequest(BaseModel):
    equipo_id: int = Field(..., gt=0)


class FactorItem(BaseModel):
    feature: str
    importancia: float


class RiesgoResponse(BaseModel):
    equipo_id: int
    codigo_patrimonial: str | None = None
    nivel_riesgo: str
    score_riesgo: float
    probabilidades: dict[str, float] = Field(default_factory=dict)
    factores: list[dict[str, Any]] = Field(default_factory=list)
    modelo_version: str = "heuristic"
    modo: str = "ml"


class CategoriaSugerida(BaseModel):
    categoria_falla_id: int
    nombre: str
    severidad: str
    probabilidad: float


class CategoriaResponse(BaseModel):
    equipo_id: int
    sugerencias: list[CategoriaSugerida]
    modo: str = "heuristic"


class HealthResponse(BaseModel):
    status: str
    modelo_version: str | None = None
    modelo_disponible: bool
    trained_at: str | None = None


class TrainResponse(BaseModel):
    success: bool
    message: str
    metadata: dict[str, Any] | None = None


class MetricsResponse(BaseModel):
    available: bool
    metadata: dict[str, Any] | None = None
