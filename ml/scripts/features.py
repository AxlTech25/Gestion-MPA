"""
Definición de features para el modelo de riesgo por equipo.
"""
from __future__ import annotations

TARGET_COLUMN = "nivel_riesgo"

NUMERIC_FEATURES = [
    "ram_gb",
    "almacenamiento_gb",
    "antiguedad_meses",
    "total_mantenimientos",
    "correctivos_12m",
    "preventivos_12m",
    "dias_desde_ultimo_mantenimiento",
    "severidad_max_historica",
    "fallas_altas_criticas_12m",
    "area_id",
    "horas_uso",
    "errores_smart",
    "salud_bateria",
    "contador_paginas",
    "ultima_temp_cpu",
    "ultima_temp_disco",
]

CATEGORICAL_FEATURES = [
    "tipo_equipo",
    "tipo_disco",
    "estado_conservacion",
    "estado_operativo",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

ID_COLUMNS = ["equipo_id", "codigo_patrimonial"]


def preparar_dataframe(df):
    """Rellena nulos y castea columnas para entrenamiento/inferencia."""
    import pandas as pd

    out = df.copy()
    for col in NUMERIC_FEATURES:
        if col not in out.columns:
            out[col] = 0
        out[col] = pd.to_numeric(out[col], errors="coerce").fillna(0)

    for col in CATEGORICAL_FEATURES:
        if col not in out.columns:
            out[col] = "Desconocido"
        out[col] = out[col].fillna("Desconocido").astype(str)

    return out
