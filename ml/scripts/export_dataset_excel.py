#!/usr/bin/env python3
"""
Exporta el dataset sintético (o procesado) a Excel (.xlsx).

Uso:
  python ml/scripts/export_dataset_excel.py
  python ml/scripts/export_dataset_excel.py --input ml/data/processed/equipos_riesgo_v1.csv
  python ml/scripts/export_dataset_excel.py --output reportes/dataset_200.xlsx
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
DEFAULT_INPUT = ML_ROOT / "data" / "synthetic" / "equipos_riesgo_v200.csv"
DEFAULT_OUTPUT = ML_ROOT / "data" / "synthetic" / "equipos_riesgo_v200.xlsx"


def export_to_excel(csv_path: Path, xlsx_path: Path) -> None:
    if not csv_path.exists():
        raise FileNotFoundError(f"No existe el CSV: {csv_path}")

    df = pd.read_csv(csv_path)
    xlsx_path.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Equipos", index=False)
        ws = writer.sheets["Equipos"]
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            letter = col[0].column_letter
            ws.column_dimensions[letter].width = min(max_len + 2, 40)

    print(f"Filas exportadas: {len(df)}")
    print(f"Archivo: {xlsx_path.resolve()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Exportar dataset ML a Excel")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    output = args.output or args.input.with_suffix(".xlsx")

    try:
        export_to_excel(args.input, output)
    except ImportError:
        print("Instale openpyxl: pip install openpyxl")
        sys.exit(1)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        print("Genere el CSV con: python ml/scripts/generate_synthetic.py --rows 200")
        sys.exit(1)


if __name__ == "__main__":
    main()
