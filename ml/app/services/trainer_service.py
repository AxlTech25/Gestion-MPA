"""Reentrenamiento del modelo desde MySQL."""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from typing import Any

from app.config import MIN_TRAIN_ROWS, ML_ROOT, SCRIPTS_DIR

sys.path.insert(0, str(SCRIPTS_DIR))

from build_dataset import build_from_db  # noqa: E402
from train_model import train  # noqa: E402


def retrain_from_db() -> dict[str, Any]:
    df = build_from_db(min_rows=MIN_TRAIN_ROWS)
    if len(df) < MIN_TRAIN_ROWS:
        return {
            "success": False,
            "message": f"Dataset insuficiente ({len(df)} equipos). Mínimo: {MIN_TRAIN_ROWS}.",
        }

    tmp = Path(tempfile.gettempdir()) / "equipos_riesgo_retrain.csv"
    df.to_csv(tmp, index=False, encoding="utf-8")
    metadata = train(tmp)
    return {
        "success": True,
        "message": "Modelo reentrenado correctamente.",
        "metadata": metadata,
    }
