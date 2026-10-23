"""Inferencia, dataset y routers con dependencias simuladas."""
from __future__ import annotations

import json
from types import SimpleNamespace

import pandas as pd
import pytest
from fastapi.testclient import TestClient

import app.services.dataset as dataset
import app.services.inference_service as inf
from app.main import app
from scripts.inference import RiesgoPredictor, _score_desde_proba, _top_factores, load_predictor


class Cursor:
    def __init__(self, script):
        self.script = script
        self.calls = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def execute(self, query, params=()):
        self.calls.append((query, params))

    def fetchall(self):
        query = self.calls[-1][0]
        if "cf.nombre" in query:
            return self.script.get("categorias", [])
        return self.script.get("rows", [])

    def fetchone(self):
        return self.script.get("equipo")


class Conn:
    def __init__(self, script):
        self.script = script
        self.closed = False

    def cursor(self):
        return Cursor(self.script)

    def close(self):
        self.closed = True


def test_score_y_factores():
    assert _score_desde_proba(["Bajo", "Raro"], [1, 0]) == 15.0
    assert _score_desde_proba(["Critico"], [2]) == 100.0

    class Prep:
        def get_feature_names_out(self):
            raise RuntimeError("no")

    class Clf:
        feature_importances_ = [0.2, 0.8]

    vacio = SimpleNamespace(named_steps={})
    assert _top_factores(vacio, pd.DataFrame()) == []
    sin_imp = SimpleNamespace(named_steps={"classifier": object(), "preprocessor": Prep()})
    assert _top_factores(sin_imp, pd.DataFrame()) == []
    sin_prep = SimpleNamespace(named_steps={"classifier": Clf(), "preprocessor": None})
    assert _top_factores(sin_prep, pd.DataFrame()) == []
    fallo = SimpleNamespace(named_steps={"classifier": Clf(), "preprocessor": Prep()})
    assert _top_factores(fallo, pd.DataFrame()) == []

    class PrepOk(Prep):
        def get_feature_names_out(self):
            return ["num__a", "cat__b"]

    ok = SimpleNamespace(named_steps={"classifier": Clf(), "preprocessor": PrepOk()})
    factores = _top_factores(ok, pd.DataFrame(), top_n=1)
    assert factores[0]["feature"] == "cat__b"


def test_predictor_y_carga(tmp_path, monkeypatch):
    from scripts.train_model import train

    rows = []
    for nivel in ("Bajo", "Medio", "Alto", "Critico"):
        for i in range(20):
            rows.append({"nivel_riesgo": nivel, "tipo_equipo": "Laptop", "ram_gb": i})
    csv = tmp_path / "datos.csv"
    pd.DataFrame(rows).to_csv(csv, index=False)
    monkeypatch.setattr("scripts.train_model.MODELS_DIR", tmp_path)
    meta = train(csv, test_size=0.25, version="v2")
    assert meta["version"] == "v2"
    modelo = tmp_path / "riesgo_equipo_v2.joblib"
    predictor = RiesgoPredictor(modelo, tmp_path / "metadata_v2.json")
    uno = predictor.predict_one(rows[0])
    assert uno["nivel_riesgo"]
    lote = predictor.predict_batch(pd.DataFrame(rows[:4]))
    assert "nivel_riesgo_pred" in lote.columns

    monkeypatch.setattr("scripts.inference.DEFAULT_MODEL", modelo)
    monkeypatch.setattr("scripts.inference.DEFAULT_METADATA", tmp_path / "metadata_v2.json")
    assert load_predictor().metadata.get("version") == "v2"

    monkeypatch.setattr("scripts.inference.DEFAULT_MODEL", tmp_path / "no-existe.joblib")
    with pytest.raises(FileNotFoundError):
        load_predictor()


def test_dataset_con_conexion_falsa(monkeypatch):
    script = {
        "rows": [{
            "equipo_id": 3,
            "codigo_patrimonial": "P3",
            "fecha_adquisicion": "2022-01-01",
            "tipo_equipo": "Laptop",
        }],
        "equipo": {"tipo_equipo": "Laptop"},
        "categorias": [],
    }
    monkeypatch.setattr(dataset, "_connect", lambda: Conn(script))
    assert dataset.fetch_equipo_row(3)["equipo_id"] == 3
    assert dataset.fetch_equipos_rows(None)[0]["equipo_id"] == 3
    assert len(dataset.fetch_equipos_rows([3, 4], limit=1)) == 1
    assert dataset.build_feature_row(script["rows"][0])["equipo_id"] == 3
    assert len(dataset.build_dataset_df([3])) == 1
    sugerencias = dataset.fetch_categoria_sugerencias(3)
    assert sugerencias[0]["nombre"] == "Limpieza / Rutina"

    script["equipo"] = None
    assert dataset.fetch_categoria_sugerencias(9) == []
    script["equipo"] = {"tipo_equipo": "CPU"}
    script["categorias"] = [
        {"categoria_falla_id": 2, "nombre": "Disco", "severidad": "Alta", "total": 3},
        {"categoria_falla_id": 1, "nombre": "Polvo", "severidad": "Baja", "total": 1},
    ]
    probs = dataset.fetch_categoria_sugerencias(3, top_n=2)
    assert probs[0]["probabilidad"] == 0.75

    script["rows"] = []
    assert dataset.fetch_equipo_row(1) is None


def test_connect_intenta_abrir_mysql():
    try:
        conn = dataset._connect()
    except Exception:
        return
    conn.close()


def test_inferencia_heuristica_y_modelo(monkeypatch, tmp_path):
    inf._predictor = None
    inf._load_error = None
    raw = {
        "equipo_id": 5,
        "codigo_patrimonial": "P5",
        "tipo_equipo": "Laptop",
        "area_nombre": "Sistemas",
        "fecha_adquisicion": "2024-01-01",
    }
    monkeypatch.setattr(dataset, "fetch_equipo_row", lambda equipo_id: raw if equipo_id == 5 else None)
    monkeypatch.setattr(dataset, "fetch_equipos_rows", lambda ids, limit: [raw] if ids != [9] else [])
    monkeypatch.setattr(inf, "DEFAULT_MODEL", tmp_path / "ausente.joblib")
    monkeypatch.setattr(inf, "METADATA_FILE", tmp_path / "sin-meta.json")
    inf._predictor = None
    inf._load_error = None
    assert inf.model_metadata() == {}
    (tmp_path / "meta.json").write_text(json.dumps({"version": "v9", "trained_at": "hoy"}), encoding="utf-8")
    monkeypatch.setattr(inf, "METADATA_FILE", tmp_path / "meta.json")
    assert inf.model_metadata()["version"] == "v9"
    assert inf.is_model_available() is False
    assert inf.predict_equipo(8) is None
    heur = inf.predict_equipo(5)
    assert heur["modo"] == "heuristic"
    lote = inf.predict_batch([5])
    assert lote[0]["modo"] == "heuristic"
    assert inf.predict_batch([9]) == []

    class Falso:
        metadata = {"version": "v3"}

        def predict_one(self, feature):
            return {
                "nivel_riesgo": "Bajo",
                "score_riesgo": 10,
                "probabilidades": {"Bajo": 1},
                "factores": [],
                "modelo_version": "v3",
            }

        def predict_batch(self, frame):
            out = frame.copy()
            out["nivel_riesgo_pred"] = "Alto"
            out["score_riesgo_pred"] = 70
            return out

    inf._predictor = Falso()
    assert inf.predict_equipo(5)["modo"] == "ml"
    assert inf.predict_batch([5])[0]["modo"] == "ml"
    inf._predictor = None
    inf._load_error = "model_not_found"
    assert inf._get_predictor() is None
    import inference

    def _revienta(*args, **kwargs):
        raise RuntimeError("modelo ilegible")

    monkeypatch.setattr(inference, "RiesgoPredictor", _revienta)
    malo = tmp_path / "malo.joblib"
    malo.write_bytes(b"no-es-joblib")
    monkeypatch.setattr(inf, "DEFAULT_MODEL", malo)
    inf._load_error = None
    assert inf._get_predictor() is None
    assert inf._load_error
    inf._predictor = None
    inf._load_error = None


def test_routers(monkeypatch):
    inf._predictor = None
    inf._load_error = "x"
    monkeypatch.setattr(inf, "model_metadata", lambda: {"version": "v1", "trained_at": "hoy"})
    monkeypatch.setattr(inf, "is_model_available", lambda: True)
    monkeypatch.setattr(inf, "predict_equipo", lambda equipo_id: {
        "equipo_id": equipo_id,
        "codigo_patrimonial": "P",
        "nivel_riesgo": "Bajo",
        "score_riesgo": 10,
        "probabilidades": {},
        "factores": [],
        "modelo_version": "v1",
        "modo": "heuristic",
    } if equipo_id == 1 else None)
    monkeypatch.setattr(inf, "predict_batch", lambda ids, limit: [{
        "equipo_id": 1,
        "codigo_patrimonial": "P",
        "nivel_riesgo": "Bajo",
        "score_riesgo": 10,
        "probabilidades": {},
        "factores": [],
        "modelo_version": "v1",
        "modo": "heuristic",
    }])
    monkeypatch.setattr(dataset, "fetch_equipo_row", lambda equipo_id: {"tipo_equipo": "Laptop"} if equipo_id == 1 else None)
    monkeypatch.setattr(dataset, "fetch_categoria_sugerencias", lambda equipo_id: [{
        "categoria_falla_id": 1,
        "nombre": "Polvo",
        "severidad": "Baja",
        "probabilidad": 0.5,
    }])

    import app.services.trainer_service as trainer
    monkeypatch.setattr(trainer, "retrain_from_db", lambda: {"success": True, "message": "ok", "metadata": {"version": "v1"}})

    client = TestClient(app)
    assert client.get("/health").json()["modelo_version"] == "v1"
    assert client.post("/predict/riesgo", json={"equipo_id": 1}).status_code == 200
    assert client.post("/predict/riesgo", json={"equipo_id": 2}).status_code == 404
    assert client.post("/predict/riesgo/batch", json={"limit": 1}).status_code == 200
    assert client.post("/predict/categoria", json={"equipo_id": 1}).status_code == 200
    assert client.post("/predict/categoria", json={"equipo_id": 2}).status_code == 404
    assert client.get("/metrics").json()["available"] is True
    assert client.post("/train").json()["success"] is True

    monkeypatch.setattr(inf, "model_metadata", lambda: {})
    assert client.get("/metrics").json()["available"] is False
    monkeypatch.setattr(trainer, "retrain_from_db", lambda: {"success": False, "message": "poco"})
    assert client.post("/train").status_code == 400
