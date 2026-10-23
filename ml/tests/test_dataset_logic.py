"""Ramas de la lógica de riesgo y del generador sintético."""
from __future__ import annotations

from datetime import date, datetime, timedelta

import pytest

from scripts.dataset_logic import (
    agregar_fila_equipo,
    antiguedad_meses,
    calcular_nivel_riesgo,
    nivel_a_score,
)
from scripts.generate_synthetic import (
    _agregar_stats_mantenimiento,
    _fecha_adquisicion,
    _generar_mantenimientos,
    generar_filas,
    main,
)


class TestAntiguedad:
    def test_casos_de_fecha(self):
        ref = date(2026, 6, 1)
        assert antiguedad_meses(None, ref) == 0
        assert antiguedad_meses("", ref) == 0
        assert antiguedad_meses("0000-00-00", ref) == 0
        assert antiguedad_meses(date(1, 1, 1), ref) == 0
        assert antiguedad_meses(12, ref) == 0
        assert antiguedad_meses(datetime(2024, 1, 15), ref) == 29
        assert antiguedad_meses("2020-01-01 extra", ref) == 77
        assert antiguedad_meses(date(2030, 1, 1), ref) == 0


class TestNivel:
    def test_escala(self):
        assert calcular_nivel_riesgo(
            antiguedad_m=1, estado_conservacion="Bueno", estado_operativo="Dañado",
            correctivos_12m=0, fallas_altas_criticas_12m=0,
        ) == "Critico"
        assert calcular_nivel_riesgo(
            antiguedad_m=1, estado_conservacion="Bueno", estado_operativo="Operativo",
            correctivos_12m=0, fallas_altas_criticas_12m=2,
        ) == "Critico"
        assert calcular_nivel_riesgo(
            antiguedad_m=1, estado_conservacion="Bueno", estado_operativo="Operativo",
            correctivos_12m=3, fallas_altas_criticas_12m=0,
        ) == "Alto"
        assert calcular_nivel_riesgo(
            antiguedad_m=10, estado_conservacion="Regular", estado_operativo="Operativo",
            correctivos_12m=0, fallas_altas_criticas_12m=0,
        ) == "Medio"
        assert calcular_nivel_riesgo(
            antiguedad_m=49, estado_conservacion="Bueno", estado_operativo="Operativo",
            correctivos_12m=0, fallas_altas_criticas_12m=0,
        ) == "Medio"
        assert calcular_nivel_riesgo(
            antiguedad_m=1, estado_conservacion="Bueno", estado_operativo="Operativo",
            correctivos_12m=0, fallas_altas_criticas_12m=0,
        ) == "Bajo"
        assert nivel_a_score("Alto") == 65.0
        assert nivel_a_score("otro") == 25.0


class TestFila:
    def test_rellena_vacios(self):
        fila = agregar_fila_equipo({"equipo_id": 1})
        assert fila["nivel_riesgo"] == "Bajo"
        assert fila["total_mantenimientos"] == 0
        assert fila["score_riesgo"] == 15.0


class TestSintetico:
    def test_perfiles_de_fecha_y_mantenimiento(self):
        import random

        rng = random.Random(1)
        for perfil in ("viejo", "medio", "nuevo"):
            assert isinstance(_fecha_adquisicion(rng, perfil), date)
        for perfil in ("critico", "alto", "medio", "bajo"):
            mants = _generar_mantenimientos(rng, perfil, date.today() - timedelta(days=400))
            stats = _agregar_stats_mantenimiento(mants)
            assert stats["total_mantenimientos"] == len(mants)
        vacio = _agregar_stats_mantenimiento([])
        assert vacio["dias_desde_ultimo_mantenimiento"] is None

    def test_genera_filas_siembra_y_comando(self, tmp_path, monkeypatch):
        import pymysql
        import scripts.generate_synthetic as gen

        class Cur:
            def execute(self, *args, **kwargs):
                return None

            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

        class Conn:
            def cursor(self):
                return Cur()

            def commit(self):
                return None

            def close(self):
                return None

        monkeypatch.setattr(pymysql, "connect", lambda **kwargs: Conn())
        filas, mants = generar_filas(12, start_id=1)
        assert len(filas) == 12
        assert filas[0]["equipo_id"] == 1
        gen.seed_database(filas, mants)

        salida = tmp_path / "sub" / "datos.csv"
        monkeypatch.setattr(
            "sys.argv",
            ["generate_synthetic.py", "--rows", "12", "--output", str(salida), "--seed-db"],
        )
        main()
        assert salida.exists()
        assert "nivel_riesgo" in salida.read_text(encoding="utf-8")
