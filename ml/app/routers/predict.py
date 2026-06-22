"""Router de predicciones."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.ml_schemas import (
    CategoriaRequest,
    CategoriaResponse,
    CategoriaSugerida,
    RiesgoBatchRequest,
    RiesgoRequest,
    RiesgoResponse,
)
from app.services import dataset, inference_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/riesgo", response_model=RiesgoResponse)
def predict_riesgo(body: RiesgoRequest):
    result = inference_service.predict_equipo(body.equipo_id)
    if not result:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")
    return RiesgoResponse(**result)


@router.post("/riesgo/batch", response_model=list[RiesgoResponse])
def predict_riesgo_batch(body: RiesgoBatchRequest):
    results = inference_service.predict_batch(body.equipo_ids, body.limit)
    return [RiesgoResponse(**r) for r in results]


@router.post("/categoria", response_model=CategoriaResponse)
def predict_categoria(body: CategoriaRequest):
    raw = dataset.fetch_equipo_row(body.equipo_id)
    if not raw:
        raise HTTPException(status_code=404, detail="Equipo no encontrado.")

    sugerencias = dataset.fetch_categoria_sugerencias(body.equipo_id)
    return CategoriaResponse(
        equipo_id=body.equipo_id,
        sugerencias=[CategoriaSugerida(**s) for s in sugerencias],
        modo="heuristic",
    )
