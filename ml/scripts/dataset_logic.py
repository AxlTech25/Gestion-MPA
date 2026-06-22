"""
Lógica compartida para Dataset A (riesgo por equipo) — Sprint 6.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any

SEVERIDAD_ORDEN = {"Baja": 1, "Media": 2, "Alta": 3, "Critica": 4}

NIVEL_RIESGO_ORDEN = {"Bajo": 0, "Medio": 1, "Alto": 2, "Critico": 3}

DATASET_A_COLUMNS = [
    "equipo_id",
    "codigo_patrimonial",
    "tipo_equipo",
    "marca",
    "modelo",
    "ram_gb",
    "almacenamiento_gb",
    "tipo_disco",
    "antiguedad_meses",
    "estado_conservacion",
    "estado_operativo",
    "area_id",
    "area_nombre",
    "total_mantenimientos",
    "correctivos_12m",
    "preventivos_12m",
    "dias_desde_ultimo_mantenimiento",
    "severidad_max_historica",
    "fallas_altas_criticas_12m",
    "nivel_riesgo",
    "score_riesgo",
]


def antiguedad_meses(fecha_adquisicion: date | datetime | str | None, ref: date | None = None) -> int:
    if fecha_adquisicion is None:
        return 0
    ref = ref or date.today()
    if isinstance(fecha_adquisicion, datetime):
        fa = fecha_adquisicion.date()
    elif isinstance(fecha_adquisicion, date):
        fa = fecha_adquisicion
    elif isinstance(fecha_adquisicion, str):
        if not fecha_adquisicion or fecha_adquisicion.startswith("0000"):
            return 0
        fa = datetime.strptime(fecha_adquisicion[:10], "%Y-%m-%d").date()
    else:
        return 0
    if fa.year <= 1:
        return 0
    return max(0, (ref.year - fa.year) * 12 + (ref.month - fa.month))


def calcular_nivel_riesgo(
    *,
    antiguedad_m: int,
    estado_conservacion: str,
    estado_operativo: str,
    correctivos_12m: int,
    fallas_altas_criticas_12m: int,
) -> str:
    if estado_operativo == "Dañado" or fallas_altas_criticas_12m >= 2:
        return "Critico"
    if fallas_altas_criticas_12m >= 1 or correctivos_12m >= 3:
        return "Alto"
    if antiguedad_m > 48 or estado_conservacion in ("Regular", "Malo"):
        return "Medio"
    return "Bajo"


def nivel_a_score(nivel: str) -> float:
    mapping = {"Bajo": 15.0, "Medio": 40.0, "Alto": 65.0, "Critico": 90.0}
    return mapping.get(nivel, 25.0)


def agregar_fila_equipo(raw: dict[str, Any]) -> dict[str, Any]:
    """Construye una fila del Dataset A a partir de datos crudos agregados."""
    ant_m = antiguedad_meses(raw.get("fecha_adquisicion"))
    nivel = calcular_nivel_riesgo(
        antiguedad_m=ant_m,
        estado_conservacion=raw.get("estado_conservacion") or "Bueno",
        estado_operativo=raw.get("estado_operativo") or "Operativo",
        correctivos_12m=int(raw.get("correctivos_12m") or 0),
        fallas_altas_criticas_12m=int(raw.get("fallas_altas_criticas_12m") or 0),
    )
    return {
        "equipo_id": raw.get("equipo_id"),
        "codigo_patrimonial": raw.get("codigo_patrimonial"),
        "tipo_equipo": raw.get("tipo_equipo"),
        "marca": raw.get("marca"),
        "modelo": raw.get("modelo"),
        "ram_gb": raw.get("ram_gb"),
        "almacenamiento_gb": raw.get("almacenamiento_gb"),
        "tipo_disco": raw.get("tipo_disco"),
        "antiguedad_meses": ant_m,
        "estado_conservacion": raw.get("estado_conservacion"),
        "estado_operativo": raw.get("estado_operativo"),
        "area_id": raw.get("area_id"),
        "area_nombre": raw.get("area_nombre"),
        "total_mantenimientos": int(raw.get("total_mantenimientos") or 0),
        "correctivos_12m": int(raw.get("correctivos_12m") or 0),
        "preventivos_12m": int(raw.get("preventivos_12m") or 0),
        "dias_desde_ultimo_mantenimiento": raw.get("dias_desde_ultimo_mantenimiento"),
        "severidad_max_historica": int(raw.get("severidad_max_historica") or 0),
        "fallas_altas_criticas_12m": int(raw.get("fallas_altas_criticas_12m") or 0),
        "nivel_riesgo": nivel,
        "score_riesgo": nivel_a_score(nivel),
    }
