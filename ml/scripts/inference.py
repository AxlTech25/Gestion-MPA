"""
Carga del modelo entrenado e inferencia de riesgo por equipo.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

ML_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ML_ROOT / "models"
DEFAULT_MODEL = MODELS_DIR / "riesgo_equipo_v1.joblib"
DEFAULT_METADATA = MODELS_DIR / "metadata.json"

from features import FEATURE_COLUMNS, preparar_dataframe  # noqa: E402
from dataset_logic import NIVEL_RIESGO_ORDEN, nivel_a_score  # noqa: E402


def _score_desde_proba(clases: list[str], proba: list[float]) -> float:
    """Convierte probabilidades en score 0–100."""
    total = 0.0
    pesos = {"Bajo": 15, "Medio": 40, "Alto": 65, "Critico": 90}
    for cls, p in zip(clases, proba):
        total += pesos.get(cls, 25) * p
    return round(min(100.0, max(0.0, total)), 2)


def _top_factores(pipeline, row: pd.DataFrame, top_n: int = 3) -> list[dict]:
    """Importancias globales del Random Forest como explicación simple."""
    clf = pipeline.named_steps.get("classifier")
    if clf is None or not hasattr(clf, "feature_importances_"):
        return []

    prep = pipeline.named_steps.get("preprocessor")
    if prep is None:
        return []

    try:
        names = prep.get_feature_names_out()
    except Exception:
        return []

    importances = clf.feature_importances_
    pairs = sorted(zip(names, importances), key=lambda x: x[1], reverse=True)
    return [
        {"feature": str(name), "importancia": round(float(imp), 4)}
        for name, imp in pairs[:top_n]
    ]


class RiesgoPredictor:
    def __init__(self, model_path: Path | None = None, metadata_path: Path | None = None):
        self.model_path = model_path or DEFAULT_MODEL
        self.metadata_path = metadata_path or DEFAULT_METADATA
        self.pipeline = joblib.load(self.model_path)
        self.metadata = {}
        if self.metadata_path.exists():
            self.metadata = json.loads(self.metadata_path.read_text(encoding="utf-8"))

    def predict_one(self, row: dict[str, Any]) -> dict[str, Any]:
        df = preparar_dataframe(pd.DataFrame([row]))
        X = df[FEATURE_COLUMNS]

        pred = self.pipeline.predict(X)[0]
        proba = self.pipeline.predict_proba(X)[0]
        clases = list(self.pipeline.classes_)

        return {
            "nivel_riesgo": pred,
            "score_riesgo": _score_desde_proba(clases, proba.tolist()),
            "probabilidades": {c: round(float(p), 4) for c, p in zip(clases, proba)},
            "factores": _top_factores(self.pipeline, X),
            "modelo_version": self.metadata.get("version", "v1"),
        }

    def predict_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        prepared = preparar_dataframe(df)
        X = prepared[FEATURE_COLUMNS]
        preds = self.pipeline.predict(X)
        probas = self.pipeline.predict_proba(X)
        clases = list(self.pipeline.classes_)

        scores = [_score_desde_proba(clases, p.tolist()) for p in probas]
        result = prepared.copy()
        result["nivel_riesgo_pred"] = preds
        result["score_riesgo_pred"] = scores
        return result


def load_predictor() -> RiesgoPredictor:
    if not DEFAULT_MODEL.exists():
        raise FileNotFoundError(
            f"No se encontró el modelo en {DEFAULT_MODEL}. "
            "Ejecute: python ml/scripts/train_model.py"
        )
    return RiesgoPredictor()
