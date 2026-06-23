"""Pruebas unitarias del pipeline de features ML."""
from __future__ import annotations

import pandas as pd
import pytest

from scripts.features import (
    CATEGORICAL_FEATURES,
    FEATURE_COLUMNS,
    NUMERIC_FEATURES,
    preparar_dataframe,
)


class TestFeatureColumns:
    def test_feature_columns_count(self):
        assert len(FEATURE_COLUMNS) == len(NUMERIC_FEATURES) + len(CATEGORICAL_FEATURES)

    def test_telemetria_sprint7_en_numericas(self):
        for col in (
            "horas_uso",
            "errores_smart",
            "salud_bateria",
            "contador_paginas",
            "ultima_temp_cpu",
            "ultima_temp_disco",
        ):
            assert col in NUMERIC_FEATURES


class TestPrepararDataframe:
    def test_rellena_numericas_faltantes_con_cero(self):
        df = pd.DataFrame({"equipo_id": [1]})
        out = preparar_dataframe(df)

        for col in NUMERIC_FEATURES:
            assert col in out.columns
            assert out[col].iloc[0] == 0

    def test_rellena_categoricas_faltantes_con_desconocido(self):
        df = pd.DataFrame({"equipo_id": [1]})
        out = preparar_dataframe(df)

        for col in CATEGORICAL_FEATURES:
            assert out[col].iloc[0] == "Desconocido"

    def test_convierte_nulos_numericos(self):
        df = pd.DataFrame({
            "ram_gb": [None],
            "horas_uso": [""],
            "tipo_equipo": ["Laptop"],
        })
        out = preparar_dataframe(df)

        assert out["ram_gb"].iloc[0] == 0
        assert out["horas_uso"].iloc[0] == 0
        assert out["tipo_equipo"].iloc[0] == "Laptop"

    def test_no_modifica_dataframe_original(self):
        df = pd.DataFrame({"ram_gb": [8], "tipo_equipo": ["CPU"]})
        original_ram = df["ram_gb"].iloc[0]
        preparar_dataframe(df)

        assert df["ram_gb"].iloc[0] == original_ram
