"""Servicio de inferencia de riesgo."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from app.config import DEFAULT_MODEL, METADATA_FILE, SCRIPTS_DIR
from app.services import dataset

sys.path.insert(0, str(SCRIPTS_DIR))

from dataset_logic import calcular_nivel_riesgo, nivel_a_score  # noqa: E402

_predictor = None
_load_error: str | None = None


def _get_predictor():
    global _predictor, _load_error
    if _predictor is not None:
        return _predictor
    if _load_error:
        return None
    try:
        from inference import RiesgoPredictor  # noqa: E402

        if not DEFAULT_MODEL.exists():
            _load_error = "model_not_found"
            return None
        _predictor = RiesgoPredictor()
        return _predictor
    except Exception as exc:
        _load_error = str(exc)
        return None


def model_metadata() -> dict[str, Any]:
    if METADATA_FILE.exists():
        return json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    return {}


def is_model_available() -> bool:
    return DEFAULT_MODEL.exists() and _get_predictor() is not None


def _heuristic_prediction(row: dict[str, Any]) -> dict[str, Any]:
    feature = dataset.build_feature_row(row)
    nivel = feature["nivel_riesgo"]
    return {
        "nivel_riesgo": nivel,
        "score_riesgo": feature["score_riesgo"],
        "probabilidades": {nivel: 1.0},
        "factores": [
            {"feature": "correctivos_12m", "importancia": float(feature["correctivos_12m"])},
            {"feature": "fallas_altas_criticas_12m", "importancia": float(feature["fallas_altas_criticas_12m"])},
            {"feature": "antiguedad_meses", "importancia": float(feature["antiguedad_meses"])},
        ],
        "modelo_version": "heuristic",
        "modo": "heuristic",
    }


def predict_equipo(equipo_id: int) -> dict[str, Any] | None:
    raw = dataset.fetch_equipo_row(equipo_id)
    if not raw:
        return None

    predictor = _get_predictor()
    if predictor:
        feature = dataset.build_feature_row(raw)
        result = predictor.predict_one(feature)
        result["modo"] = "ml"
        result["equipo_id"] = equipo_id
        result["codigo_patrimonial"] = raw.get("codigo_patrimonial")
        return result

    result = _heuristic_prediction(raw)
    result["equipo_id"] = equipo_id
    result["codigo_patrimonial"] = raw.get("codigo_patrimonial")
    return result


def predict_batch(equipo_ids: list[int] | None = None, limit: int | None = None) -> list[dict[str, Any]]:
    rows = dataset.fetch_equipos_rows(equipo_ids, limit)
    if not rows:
        return []

    predictor = _get_predictor()
    results: list[dict[str, Any]] = []

    if predictor:
        import pandas as pd

        features = [dataset.build_feature_row(r) for r in rows]
        df = pd.DataFrame(features)
        batch = predictor.predict_batch(df)
        for i, raw in enumerate(rows):
            row = batch.iloc[i]
            results.append(
                {
                    "equipo_id": int(raw["equipo_id"]),
                    "codigo_patrimonial": raw.get("codigo_patrimonial"),
                    "tipo_equipo": raw.get("tipo_equipo"),
                    "area_nombre": raw.get("area_nombre"),
                    "nivel_riesgo": row["nivel_riesgo_pred"],
                    "score_riesgo": float(row["score_riesgo_pred"]),
                    "probabilidades": {},
                    "factores": [],
                    "modelo_version": predictor.metadata.get("version", "v1"),
                    "modo": "ml",
                }
            )
        return results

    for raw in rows:
        pred = _heuristic_prediction(raw)
        pred["equipo_id"] = int(raw["equipo_id"])
        pred["codigo_patrimonial"] = raw.get("codigo_patrimonial")
        pred["tipo_equipo"] = raw.get("tipo_equipo")
        pred["area_nombre"] = raw.get("area_nombre")
        results.append(pred)

    return results
