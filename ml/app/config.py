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

def _env(*keys: str, default: str = "") -> str:
    for key in keys:
        value = os.getenv(key)
        if value is not None and value != "":
            return value
    return default


# Railway MySQL inyecta MYSQL*; local usa DB_*
DB_HOST = _env("DB_HOST", "MYSQLHOST", "MYSQL_HOST", default="localhost")
DB_PORT = int(_env("DB_PORT", "MYSQLPORT", "MYSQL_PORT", default="3306"))
DB_USER = _env("DB_USER", "MYSQLUSER", "MYSQL_USER", default="root")
DB_PASSWORD = _env("DB_PASSWORD", "MYSQLPASSWORD", "MYSQL_PASSWORD", default="")
DB_NAME = _env("DB_NAME", "MYSQLDATABASE", "MYSQL_DATABASE", default="gestion_equipos_mpa_v2")

MIN_TRAIN_ROWS = int(os.getenv("ML_MIN_TRAIN_ROWS", "50"))
