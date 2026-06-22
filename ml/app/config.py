"""Configuración del microservicio ML."""
from __future__ import annotations

import os
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ML_ROOT / "scripts"
MODELS_DIR = ML_ROOT / "models"
DEFAULT_MODEL = MODELS_DIR / "riesgo_equipo_v1.joblib"
METADATA_FILE = MODELS_DIR / "metadata.json"

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "gestion_equipos_mpa_v2")

MIN_TRAIN_ROWS = int(os.getenv("ML_MIN_TRAIN_ROWS", "50"))
