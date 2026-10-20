#!/usr/bin/env python3
"""
Genera Dataset A (riesgo por equipo) desde MySQL.

Uso:
  python ml/scripts/build_dataset.py
  python ml/scripts/build_dataset.py --output ml/data/processed/equipos_riesgo_v1.csv
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from dataset_logic import DATASET_A_COLUMNS, agregar_fila_equipo  # noqa: E402

DEFAULT_OUTPUT = ML_ROOT / "data" / "processed" / "equipos_riesgo_v1.csv"

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
GROUP BY e.id, e.codigo_patrimonial, e.tipo_equipo, e.marca, e.modelo,
         e.ram_gb, e.almacenamiento_gb, e.tipo_disco, e.horas_uso, e.errores_smart,
         e.contador_paginas, e.salud_bateria, e.ultima_temp_cpu, e.ultima_temp_disco,
         e.fecha_adquisicion,
         e.estado_conservacion, e.estado_operativo, e.area_id, a.nombre
ORDER BY e.id
"""


def get_connection():
    import pymysql

    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "gestion_equipos_mpa_v2"),
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def build_from_db(min_rows: int = 200) -> pd.DataFrame:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(EXTRACT_QUERY)
            rows = cur.fetchall()
    finally:
        conn.close()

    if len(rows) < min_rows:
        print(
            f"ADVERTENCIA: solo {len(rows)} equipos en BD (mínimo recomendado: {min_rows}).\n"
            f"Ejecute: python ml/scripts/generate_synthetic.py --rows {min_rows} --seed-db"
        )

    processed = [agregar_fila_equipo(dict(r)) for r in rows]
    return pd.DataFrame(processed, columns=DATASET_A_COLUMNS)


def main():
    parser = argparse.ArgumentParser(description="Construir Dataset A desde MySQL")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--min-rows", type=int, default=200)
    args = parser.parse_args()

    df = build_from_db(min_rows=args.min_rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.output, index=False, encoding="utf-8")

    distribucion = df["nivel_riesgo"].value_counts().to_dict() if len(df) else {}
    print(f"Dataset guardado: {args.output}")
    print(f"Filas: {len(df)}")
    print(f"Distribución nivel_riesgo: {distribucion}")


if __name__ == "__main__":
    main()
