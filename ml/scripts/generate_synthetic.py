#!/usr/bin/env python3
"""
Genera Dataset A sintético (CSV) y opcionalmente inserta en MySQL.

Uso:
  python ml/scripts/generate_synthetic.py --rows 200
  python ml/scripts/generate_synthetic.py --rows 20 --output ml/data/synthetic/equipos_riesgo_sample_20.csv
  python ml/scripts/generate_synthetic.py --rows 200 --seed-db
"""
from __future__ import annotations

import argparse
import os
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from dataset_logic import DATASET_A_COLUMNS, SEVERIDAD_ORDEN, agregar_fila_equipo  # noqa: E402

DEFAULT_OUTPUT = ML_ROOT / "data" / "synthetic" / "equipos_riesgo_v200.csv"

TIPOS = ["Laptop", "CPU", "Monitor", "Impresora", "Otro"]
MARCAS = ["HP", "Dell", "Lenovo", "Acer", "Asus", "Canon", "Epson", "Samsung"]
DISCOS = ["HDD", "SSD", "NVMe"]
CONSERVACION = ["Nuevo", "Bueno", "Regular", "Malo"]
OPERATIVO = ["Operativo", "Dañado", "Excedencia", "Baja"]

AREAS = [
    (10, "Tecnología de la Información", "Ing. Carlos Mendoza"),
    (11, "Recursos Humanos", "Lic. Ana Torres"),
    (12, "Contabilidad", "C.P. Luis Vega"),
    (13, "Logística", "Ing. Pedro Salas"),
    (14, "Dirección General", "Dr. María Ríos"),
]

# id, severidad — alineado con v2_categorias_falla seed
CATEGORIAS = [
    (1, "Baja"), (2, "Baja"), (3, "Baja"),
    (4, "Media"), (5, "Media"),
    (6, "Alta"), (7, "Alta"),
    (8, "Critica"), (9, "Critica"), (10, "Critica"),
]

random.seed(42)


def _fecha_adquisicion(rng: random.Random, perfil: str) -> date:
    hoy = date.today()
    if perfil == "viejo":
        meses = rng.randint(60, 120)
    elif perfil == "medio":
        meses = rng.randint(30, 55)
    else:
        meses = rng.randint(6, 28)
    return hoy - timedelta(days=meses * 30)


def _generar_mantenimientos(
    rng: random.Random, perfil: str, fecha_adq: date
) -> list[dict]:
    if perfil == "critico":
        n = rng.randint(4, 9)
        peso_alta = 0.45
    elif perfil == "alto":
        n = rng.randint(3, 7)
        peso_alta = 0.25
    elif perfil == "medio":
        n = rng.randint(1, 4)
        peso_alta = 0.10
    else:
        n = rng.randint(0, 2)
        peso_alta = 0.05

    registros = []
    for i in range(n):
        dias_atras = rng.randint(15, min(800, (date.today() - fecha_adq).days or 30))
        fecha = datetime.now() - timedelta(days=dias_atras)
        es_correctivo = rng.random() < 0.55
        if es_correctivo and rng.random() < peso_alta:
            cat = rng.choice([c for c in CATEGORIAS if c[1] in ("Alta", "Critica")])
        elif es_correctivo:
            cat = rng.choice([c for c in CATEGORIAS if c[1] in ("Media", "Baja")])
        else:
            cat = rng.choice([c for c in CATEGORIAS if c[1] == "Baja"])

        registros.append({
            "fecha_intervencion": fecha,
            "tipo_mantenimiento": "Correctivo" if es_correctivo else "Preventivo",
            "categoria_falla_id": cat[0],
            "severidad": cat[1],
        })
    return registros


def _agregar_stats_mantenimiento(mants: list[dict]) -> dict:
    hace_12m = datetime.now() - timedelta(days=365)
    total = len(mants)
    correctivos_12m = 0
    preventivos_12m = 0
    fallas_altas = 0
    severidad_max = 0
    ultima: datetime | None = None

    for m in mants:
        f: datetime = m["fecha_intervencion"]
        if ultima is None or f > ultima:
            ultima = f
        sev = SEVERIDAD_ORDEN.get(m["severidad"], 0)
        severidad_max = max(severidad_max, sev)
        if f >= hace_12m:
            if m["tipo_mantenimiento"] == "Correctivo":
                correctivos_12m += 1
            else:
                preventivos_12m += 1
            if m["severidad"] in ("Alta", "Critica"):
                fallas_altas += 1

    dias_ultimo = (datetime.now() - ultima).days if ultima else None
    return {
        "total_mantenimientos": total,
        "correctivos_12m": correctivos_12m,
        "preventivos_12m": preventivos_12m,
        "dias_desde_ultimo_mantenimiento": dias_ultimo,
        "severidad_max_historica": severidad_max,
        "fallas_altas_criticas_12m": fallas_altas,
    }


def generar_filas(n: int, start_id: int = 9001) -> tuple[list[dict], list[tuple]]:
    """Retorna filas del dataset y registros de mantenimiento para seed DB."""
    perfiles = (["bajo"] * 4 + ["medio"] * 3 + ["alto"] * 2 + ["critico"] * 1)
    filas = []
    mantenimientos_db: list[tuple] = []

    for i in range(n):
        rng = random.Random(42 + i)
        perfil = rng.choice(perfiles)
        area = rng.choice(AREAS)
        tipo = rng.choice(TIPOS)
        es_pc = tipo in ("Laptop", "CPU")

        fecha_adq = _fecha_adquisicion(rng, perfil)
        mants = _generar_mantenimientos(rng, perfil, fecha_adq)
        stats = _agregar_stats_mantenimiento(mants)

        if perfil == "critico":
            conservacion = rng.choice(["Regular", "Malo"])
            operativo = rng.choice(["Operativo", "Dañado"])
        elif perfil == "alto":
            conservacion = rng.choice(["Bueno", "Regular"])
            operativo = "Operativo"
        elif perfil == "medio":
            conservacion = rng.choice(["Bueno", "Regular"])
            operativo = "Operativo"
        else:
            conservacion = rng.choice(["Nuevo", "Bueno"])
            operativo = "Operativo"

        equipo_id = start_id + i
        codigo = f"990{equipo_id:09d}"[:12]

        raw = {
            "equipo_id": equipo_id,
            "codigo_patrimonial": codigo,
            "tipo_equipo": tipo,
            "marca": rng.choice(MARCAS),
            "modelo": f"Model-{rng.randint(100, 999)}",
            "ram_gb": rng.choice([4, 8, 16, 32]) if es_pc else None,
            "almacenamiento_gb": rng.choice([256, 512, 1024]) if es_pc else None,
            "tipo_disco": rng.choice(DISCOS) if es_pc else None,
            "fecha_adquisicion": fecha_adq.isoformat(),
            "estado_conservacion": conservacion,
            "estado_operativo": operativo,
            "area_id": area[0],
            "area_nombre": area[1],
            **stats,
        }
        filas.append(agregar_fila_equipo(raw))

        for j, m in enumerate(mants):
            mantenimientos_db.append((
                equipo_id,
                f"ORD-SYN-{equipo_id}-{j+1}",
                m["fecha_intervencion"].strftime("%Y-%m-%d %H:%M:%S"),
                m["tipo_mantenimiento"],
                m["categoria_falla_id"],
            ))

    return filas, mantenimientos_db


def seed_database(filas: list[dict], mantenimientos: list[tuple]) -> None:
    import pymysql

    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "gestion_equipos_mpa_v2"),
        charset="utf8mb4",
    )
    try:
        with conn.cursor() as cur:
            for area_id, nombre, jefe in AREAS:
                cur.execute(
                    """INSERT IGNORE INTO v2_areas (id, nombre, jefe_encargado, descripcion)
                       VALUES (%s, %s, %s, %s)""",
                    (area_id, nombre, jefe, f"Área sintética ML — {nombre}"),
                )

            for f in filas:
                cur.execute(
                    "DELETE FROM v2_fichas_mantenimiento WHERE equipo_id = %s", (f["equipo_id"],)
                )
                cur.execute("DELETE FROM v2_equipos WHERE id = %s", (f["equipo_id"],))

                ant_m = f["antiguedad_meses"]
                fa = (date.today() - timedelta(days=ant_m * 30)).isoformat()
                cur.execute(
                    """INSERT INTO v2_equipos
                       (id, codigo_patrimonial, codigo_identificativo, tipo_equipo, marca, modelo,
                        ram_gb, almacenamiento_gb, tipo_disco, fecha_adquisicion, area_id,
                        ubicacion_fisica, responsable_nombre, estado_conservacion, estado_operativo)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (
                        f["equipo_id"], f["codigo_patrimonial"],
                        str(f["equipo_id"])[-6:].zfill(6),
                        f["tipo_equipo"], f["marca"], f["modelo"],
                        f["ram_gb"], f["almacenamiento_gb"], f["tipo_disco"],
                        fa, f["area_id"], f["area_nombre"],
                        next(a[2] for a in AREAS if a[0] == f["area_id"]),
                        f["estado_conservacion"], f["estado_operativo"],
                    ),
                )

            for m in mantenimientos:
                cur.execute(
                    """INSERT INTO v2_fichas_mantenimiento
                       (nro_orden, equipo_id, fecha_intervencion, tipo_mantenimiento,
                        categoria_falla_id, estado_post_mantenimiento)
                       VALUES (%s,%s,%s,%s,%s,'Operativo')""",
                    (m[1], m[0], m[2], m[3], m[4]),
                )
        conn.commit()
        print(f"Insertados {len(filas)} equipos y {len(mantenimientos)} mantenimientos en MySQL.")
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Generar Dataset A sintético")
    parser.add_argument("--rows", type=int, default=200, help="Número de equipos (mín. 200 recomendado)")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--seed-db", action="store_true", help="Insertar datos en MySQL")
    args = parser.parse_args()

    if args.rows < 200:
        print("NOTA: el mínimo recomendado para entrenamiento es 200 equipos.")

    filas, mants = generar_filas(args.rows)
    df = pd.DataFrame(filas, columns=DATASET_A_COLUMNS)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.output, index=False, encoding="utf-8")

    print(f"CSV sintético: {args.output}")
    print(f"Filas: {len(df)}")
    print(f"Distribución nivel_riesgo: {df['nivel_riesgo'].value_counts().to_dict()}")

    if args.seed_db:
        seed_database(filas, mants)


if __name__ == "__main__":
    main()
