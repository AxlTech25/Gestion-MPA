"""Pruebas unitarias de schemas Pydantic ML."""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.ml_schemas import (
    CategoriaRequest,
    HealthResponse,
    RiesgoBatchRequest,
    RiesgoRequest,
)


class TestRiesgoRequest:
    def test_equipo_id_positivo(self):
        req = RiesgoRequest(equipo_id=42)
        assert req.equipo_id == 42

    def test_rechaza_equipo_id_cero(self):
        with pytest.raises(ValidationError):
            RiesgoRequest(equipo_id=0)

    def test_rechaza_equipo_id_negativo(self):
        with pytest.raises(ValidationError):
            RiesgoRequest(equipo_id=-1)


class TestRiesgoBatchRequest:
    def test_limit_en_rango(self):
        req = RiesgoBatchRequest(equipo_ids=[1, 2], limit=100)
        assert req.limit == 100

    def test_rechaza_limit_mayor_500(self):
        with pytest.raises(ValidationError):
            RiesgoBatchRequest(limit=501)

    def test_ids_opcional(self):
        req = RiesgoBatchRequest()
        assert req.equipo_ids is None


class TestCategoriaRequest:
    def test_valida_como_riesgo_request(self):
        req = CategoriaRequest(equipo_id=5)
        assert req.equipo_id == 5


class TestHealthResponse:
    def test_modelo_no_disponible(self):
        res = HealthResponse(status="ok", modelo_disponible=False)
        assert res.modelo_version is None
        assert res.status == "ok"
