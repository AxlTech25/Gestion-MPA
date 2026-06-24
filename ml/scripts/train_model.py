#!/usr/bin/env python3
"""
Entrena el clasificador de riesgo por equipo (Dataset A).

Uso:
  python ml/scripts/train_model.py
  python ml/scripts/train_model.py --dataset ml/data/processed/equipos_riesgo_v1.csv
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

SCRIPT_DIR = Path(__file__).resolve().parent
ML_ROOT = SCRIPT_DIR.parent
sys.path.insert(0, str(SCRIPT_DIR))

from features import CATEGORICAL_FEATURES, FEATURE_COLUMNS, NUMERIC_FEATURES, TARGET_COLUMN  # noqa: E402
from features import preparar_dataframe  # noqa: E402

DEFAULT_DATASET = ML_ROOT / "data" / "synthetic" / "equipos_riesgo_v200.csv"
MODELS_DIR = ML_ROOT / "models"


def model_paths(version: str) -> tuple[Path, Path]:
    suffix = version if version else "v1"
    model_file = MODELS_DIR / f"riesgo_equipo_{suffix}.joblib"
    return model_file, model_file


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Desconocido")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def train(dataset_path: Path, test_size: float = 0.2, version: str = "v1") -> dict:
    df = pd.read_csv(dataset_path)
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"El dataset debe incluir la columna '{TARGET_COLUMN}'")

    if len(df) < 50:
        raise ValueError(f"Dataset muy pequeño ({len(df)} filas). Mínimo recomendado: 200.")

    prepared = preparar_dataframe(df)
    X = prepared[FEATURE_COLUMNS]
    y = prepared[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average="macro")
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    MODEL_FILE, _ = model_paths(version)
    METADATA_FILE = MODELS_DIR / ("metadata_v2.json" if version == "v2" else "metadata.json")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_FILE)

    metadata = {
        "version": version,
        "model_file": MODEL_FILE.name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": str(dataset_path.relative_to(ML_ROOT.parent))
        if dataset_path.is_relative_to(ML_ROOT.parent)
        else str(dataset_path),
        "n_samples": len(df),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "classes": sorted(y.unique().tolist()),
        "metrics": {
            "accuracy": round(float(accuracy), 4),
            "f1_macro": round(float(f1_macro), 4),
            "classification_report": report,
        },
        "features": FEATURE_COLUMNS,
    }

    METADATA_FILE.write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")

    return metadata


def main():
    parser = argparse.ArgumentParser(description="Entrenar modelo de riesgo por equipo")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--version", choices=["v1", "v2"], default="v1")
    args = parser.parse_args()

    if not args.dataset.exists():
        print(f"ERROR: no existe {args.dataset}")
        print("Ejecute: python ml/scripts/generate_synthetic.py --rows 200")
        sys.exit(1)

    print(f"Entrenando con: {args.dataset}")
    meta = train(args.dataset, test_size=args.test_size, version=args.version)
    model_file, _ = model_paths(args.version)
    metadata_file = MODELS_DIR / ("metadata_v2.json" if args.version == "v2" else "metadata.json")

    print(f"\nModelo guardado: {model_file}")
    print(f"Métricas: {metadata_file}")
    print(f"  Muestras:   {meta['n_samples']}")
    print(f"  Accuracy:   {meta['metrics']['accuracy']}")
    print(f"  F1 macro:   {meta['metrics']['f1_macro']}")
    print(f"  Clases:     {meta['classes']}")


if __name__ == "__main__":
    main()
