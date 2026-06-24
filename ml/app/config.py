"""Configuración del microservicio ML."""
from __future__ import annotations

import os
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ML_ROOT / "scripts"
MODELS_DIR = ML_ROOT / "models"
MODEL_V2 = MODELS_DIR / "riesgo_equipo_v2.joblib"
MODEL_V1 = MODELS_DIR / "riesgo_equipo_v1.joblib"
DEFAULT_MODEL = MODEL_V2 if MODEL_V2.exists() else MODEL_V1
METADATA_FILE = MODELS_DIR / ("metadata_v2.json" if MODEL_V2.exists() else "metadata.json")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "gestion_equipos_mpa_v2")

MIN_TRAIN_ROWS = int(os.getenv("ML_MIN_TRAIN_ROWS", "50"))
