"""Extracción de features desde MySQL."""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import pandas as pd

from app.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, SCRIPTS_DIR

sys.path.insert(0, str(SCRIPTS_DIR))

from dataset_logic import agregar_fila_equipo  # noqa: E402

EXTRACT_QUERY = """
SELECT
    e.id AS equipo_id,
    e.codigo_patrimonial,
    e.tipo_equipo,
    e.marca,
    e.modelo,
    e.ram_gb,
    e.almacenamiento_gb,
    e.tipo_disco,
    e.horas_uso,
    e.errores_smart,
    e.contador_paginas,
    e.salud_bateria,
    e.ultima_temp_cpu,
    e.ultima_temp_disco,
    e.fecha_adquisicion,
    e.estado_conservacion,
    e.estado_operativo,
    e.area_id,
    a.nombre AS area_nombre,
    COUNT(fm.id) AS total_mantenimientos,
    SUM(CASE
        WHEN fm.tipo_mantenimiento = 'Correctivo'
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS correctivos_12m,
    SUM(CASE
        WHEN fm.tipo_mantenimiento = 'Preventivo'
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS preventivos_12m,
    DATEDIFF(NOW(), MAX(fm.fecha_intervencion)) AS dias_desde_ultimo_mantenimiento,
    COALESCE(MAX(
        CASE cf.severidad
            WHEN 'Baja' THEN 1 WHEN 'Media' THEN 2 WHEN 'Alta' THEN 3 WHEN 'Critica' THEN 4 ELSE 0
        END
    ), 0) AS severidad_max_historica,
    SUM(CASE
        WHEN cf.severidad IN ('Alta', 'Critica')
         AND fm.fecha_intervencion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        THEN 1 ELSE 0
    END) AS fallas_altas_criticas_12m
FROM v2_equipos e
LEFT JOIN v2_areas a ON e.area_id = a.id
LEFT JOIN v2_fichas_mantenimiento fm ON fm.equipo_id = e.id
LEFT JOIN v2_categorias_falla cf ON fm.categoria_falla_id = cf.id
{where_clause}
GROUP BY e.id, e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo,
         e.ram_gb, e.almacenamiento_gb, e.tipo_disco, e.horas_uso, e.errores_smart,
         e.contador_paginas, e.salud_bateria, e.ultima_temp_cpu, e.ultima_temp_disco,
         e.fecha_adquisicion,
         e.estado_conservacion, e.estado_operativo, e.area_id, a.nombre
ORDER BY e.id
"""


def _connect():
    import pymysql

    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def _fetch_rows(where_clause: str = "", params: tuple = ()) -> list[dict[str, Any]]:
    query = EXTRACT_QUERY.format(where_clause=where_clause)
    conn = _connect()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return list(cur.fetchall())
    finally:
        conn.close()


def fetch_equipo_row(equipo_id: int) -> dict[str, Any] | None:
    rows = _fetch_rows("WHERE e.id = %s", (equipo_id,))
    return rows[0] if rows else None


def fetch_equipos_rows(equipo_ids: list[int] | None = None, limit: int | None = None) -> list[dict[str, Any]]:
    where = ""
    params: list[Any] = []
    if equipo_ids:
        placeholders = ",".join(["%s"] * len(equipo_ids))
        where = f"WHERE e.id IN ({placeholders})"
        params.extend(equipo_ids)
    rows = _fetch_rows(where, tuple(params))
    if limit is not None:
        rows = rows[:limit]
    return rows


def build_feature_row(raw: dict[str, Any]) -> dict[str, Any]:
    return agregar_fila_equipo(dict(raw))


def build_dataset_df(equipo_ids: list[int] | None = None, limit: int | None = None) -> pd.DataFrame:
    rows = fetch_equipos_rows(equipo_ids, limit)
    return pd.DataFrame([build_feature_row(r) for r in rows])


def fetch_categoria_sugerencias(equipo_id: int, top_n: int = 3) -> list[dict[str, Any]]:
    """Frecuencia histórica de categorías por tipo de equipo (heurístico)."""
    conn = _connect()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT tipo_equipo FROM v2_equipos WHERE id = %s", (equipo_id,))
            eq = cur.fetchone()
            if not eq:
                return []

            cur.execute(
                """
                SELECT cf.id AS categoria_falla_id, cf.nombre, cf.severidad, COUNT(*) AS total
                FROM v2_fichas_mantenimiento fm
                JOIN v2_equipos e ON e.id = fm.equipo_id
                JOIN v2_categorias_falla cf ON cf.id = fm.categoria_falla_id
                WHERE fm.tipo_mantenimiento = 'Correctivo'
                  AND e.tipo_equipo = %s
                GROUP BY cf.id, cf.nombre, cf.severidad
                ORDER BY total DESC
                LIMIT %s
                """,
                (eq["tipo_equipo"], top_n),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        return [
            {
                "categoria_falla_id": 1,
                "nombre": "Limpieza / Rutina",
                "severidad": "Baja",
                "probabilidad": 0.5,
            }
        ]

    total = sum(int(r["total"]) for r in rows) or 1
    return [
        {
            "categoria_falla_id": int(r["categoria_falla_id"]),
            "nombre": r["nombre"],
            "severidad": r["severidad"],
            "probabilidad": round(int(r["total"]) / total, 4),
        }
        for r in rows
    ]
