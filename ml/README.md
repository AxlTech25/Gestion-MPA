# Microservicio ML — Gestión MPA (Sprint 6)

## Dataset A (implementado)

Pipeline de datos para predicción de **riesgo por equipo**.

### Inicio rápido

```bash
# 1. Dependencias Python
pip install -r ml/requirements.txt

# 2. Generar CSV sintético (200 equipos) — no requiere MySQL
python ml/scripts/generate_synthetic.py --rows 200

# 3. (Opcional) Cargar sintéticos en MySQL
python ml/scripts/generate_synthetic.py --rows 200 --seed-db

# 4. Exportar dataset procesado desde BD
python ml/scripts/build_dataset.py

# 5. Entrenar modelo Random Forest
python ml/scripts/train_model.py

# 6. Probar predicciones
python ml/scripts/predict_cli.py --equipo-id 9001

# 7. Iniciar microservicio FastAPI (puerto 8000)
cd ml
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Microservicio FastAPI

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado y versión del modelo |
| `/predict/riesgo` | POST | Predicción por `equipo_id` |
| `/predict/riesgo/batch` | POST | Predicción masiva |
| `/predict/categoria` | POST | Sugerencia heurística de categoría |
| `/train` | POST | Reentrenar desde MySQL |
| `/metrics` | GET | Métricas del último entrenamiento |

El backend PHP expone `/api/v2/ml/*` como proxy autenticado (JWT). Variable `ML_SERVICE_URL` (default `http://127.0.0.1:8000`).

### Estructura

```text
ml/
├── data/
│   ├── synthetic/     # CSV sintéticos versionados
│   ├── processed/     # Exportaciones desde MySQL
│   └── README.md      # Diccionario de columnas
├── scripts/
│   ├── dataset_logic.py
│   ├── features.py
│   ├── generate_synthetic.py
│   ├── build_dataset.py
│   ├── train_model.py
│   ├── inference.py
│   └── predict_cli.py
├── models/
│   ├── riesgo_equipo_v1.joblib   # generado al entrenar
│   └── metadata.json
├── app/                 # Microservicio FastAPI
│   ├── main.py
│   ├── routers/
│   └── services/
├── requirements.txt
└── README.md
```

### Variables de entorno (MySQL)

| Variable | Default |
|----------|---------|
| `DB_HOST` | localhost |
| `DB_USER` | root |
| `DB_PASSWORD` | *(vacío)* |
| `DB_NAME` | gestion_equipos_mpa_v2 |

### Sprint 6 — estado

- [x] Dataset A sintético (200 equipos) + scripts de exportación
- [x] Entrenamiento Scikit-learn (`ml/scripts/train_model.py`)
- [x] Inferencia local (`ml/scripts/inference.py`, `predict_cli.py`)
- [x] Microservicio FastAPI (`ml/app/`)
- [x] Proxy PHP `/api/v2/ml/*`
- [x] UI badges de riesgo en inventario + alertas dashboard

Ver `documents/sprints/sprint_6.md`.
