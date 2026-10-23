"""Entrenamiento, exportación y reentrenamiento sin escribir el modelo real."""
from __future__ import annotations

from pathlib import Path

import pandas as pd
import pytest

import app.services.trainer_service as trainer
from scripts.export_dataset_excel import export_to_excel, main as export_main
from scripts.train_model import build_pipeline, main as train_main, model_paths, train


def _csv(path: Path, n: int = 20) -> None:
    rows = []
    for nivel in ("Bajo", "Medio", "Alto", "Critico"):
        for i in range(n):
            rows.append({"nivel_riesgo": nivel, "tipo_equipo": "CPU", "ram_gb": i})
    pd.DataFrame(rows).to_csv(path, index=False)


def test_train_errores_y_rutas(tmp_path, monkeypatch):
    import scripts.train_model as modulo

    monkeypatch.setattr(modulo, "MODELS_DIR", tmp_path)
    assert model_paths("")[0].name == "riesgo_equipo_v1.joblib"
    assert build_pipeline() is not None

    malo = tmp_path / "malo.csv"
    pd.DataFrame({"x": [1]}).to_csv(malo, index=False)
    with pytest.raises(ValueError, match="nivel_riesgo"):
        train(malo)

    chico = tmp_path / "chico.csv"
    pd.DataFrame({"nivel_riesgo": ["Bajo"] * 10}).to_csv(chico, index=False)
    with pytest.raises(ValueError, match="pequeño"):
        train(chico)

    datos = tmp_path / "datos.csv"
    _csv(datos, 15)
    meta = train(datos, version="v1")
    assert meta["n_samples"] == 60
    assert (tmp_path / "riesgo_equipo_v1.joblib").exists()
    assert (tmp_path / "metadata.json").exists()


def test_train_main(tmp_path, monkeypatch):
    import scripts.train_model as modulo

    monkeypatch.setattr(modulo, "MODELS_DIR", tmp_path)
    faltante = tmp_path / "no.csv"
    monkeypatch.setattr("sys.argv", ["train_model.py", "--dataset", str(faltante)])
    with pytest.raises(SystemExit):
        train_main()

    datos = tmp_path / "datos.csv"
    _csv(datos)
    monkeypatch.setattr("sys.argv", ["train_model.py", "--dataset", str(datos), "--version", "v1"])
    train_main()


def test_export(tmp_path, monkeypatch):
    csv = tmp_path / "datos.csv"
    pd.DataFrame({"a": ["hola"], "b": [None]}).to_csv(csv, index=False)
    xlsx = tmp_path / "out" / "datos.xlsx"
    export_to_excel(csv, xlsx)
    assert xlsx.exists()
    with pytest.raises(FileNotFoundError):
        export_to_excel(tmp_path / "no.csv", xlsx)

    monkeypatch.setattr("sys.argv", ["export_dataset_excel.py", "--input", str(tmp_path / "no.csv")])
    with pytest.raises(SystemExit):
        export_main()
    monkeypatch.setattr("sys.argv", ["export_dataset_excel.py", "--input", str(csv), "--output", str(tmp_path / "b.xlsx")])
    export_main()


def test_retrain(monkeypatch, tmp_path):
    import scripts.train_model as modulo

    monkeypatch.setattr(modulo, "MODELS_DIR", tmp_path)
    monkeypatch.setattr(trainer, "MIN_TRAIN_ROWS", 4)
    monkeypatch.setattr(trainer, "build_from_db", lambda min_rows=0: pd.DataFrame({"nivel_riesgo": ["Bajo"]}))
    corto = trainer.retrain_from_db()
    assert corto["success"] is False

    def suficiente(min_rows=0):
        rows = []
        for nivel in ("Bajo", "Medio", "Alto", "Critico"):
            rows.extend({"nivel_riesgo": nivel, "tipo_equipo": "Laptop"} for _ in range(15))
        return pd.DataFrame(rows)

    monkeypatch.setattr(trainer, "build_from_db", suficiente)
    ok = trainer.retrain_from_db()
    assert ok["success"] is True
    assert ok["metadata"]["n_samples"] == 60
