#!/usr/bin/env python3
"""
Prueba de inferencia sobre el CSV sintético o una fila manual.

Uso:
  python ml/scripts/predict_cli.py
  python ml/scripts/predict_cli.py --equipo-id 9001
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from inference import load_predictor  # noqa: E402

DEFAULT_CSV = ML_ROOT / "data" / "synthetic" / "equipos_riesgo_v200.csv"


def main():
    parser = argparse.ArgumentParser(description="Probar predicciones del modelo de riesgo")
    parser.add_argument("--equipo-id", type=int, help="ID de equipo del CSV sintético")
    parser.add_argument("--limit", type=int, default=5, help="Filas a mostrar si no hay --equipo-id")
    args = parser.parse_args()

    predictor = load_predictor()
    df = pd.read_csv(DEFAULT_CSV)

    if args.equipo_id:
        rows = df[df["equipo_id"] == args.equipo_id]
        if rows.empty:
            print(f"No se encontró equipo_id={args.equipo_id}")
            sys.exit(1)
    else:
        rows = df.head(args.limit)

    print(f"Modelo: {predictor.metadata.get('version', '?')} | "
          f"Accuracy: {predictor.metadata.get('metrics', {}).get('accuracy', '?')}\n")

    for _, row in rows.iterrows():
        real = row.get("nivel_riesgo", "?")
        pred = predictor.predict_one(row.to_dict())
        match = "OK" if real == pred["nivel_riesgo"] else "DIFF"
        print(f"Equipo {row['equipo_id']} ({row['codigo_patrimonial']})")
        print(f"  Real: {real} | Pred: {pred['nivel_riesgo']} ({pred['score_riesgo']}) [{match}]")
        print(f"  Prob: {pred['probabilidades']}")
        print(f"  Factores: {pred['factores']}\n")


if __name__ == "__main__":
    main()
