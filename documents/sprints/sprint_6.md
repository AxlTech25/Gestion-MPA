# Resumen - Sprint 6: Machine Learning Predictivo

**Fecha planificada:** 2026-06-21 — 2026-07-15  
**Fecha de cierre:** 2026-06-21  
**Estado:** Completado  
**Versión:** 0.7.0

---

## Objetivos del Sprint

Integrar un **microservicio de Machine Learning** que aproveche los datos estructurados recopilados desde los Sprints 1–5 (y mejoras posteriores) para:

1. **Predecir el riesgo de falla** de cada equipo del inventario.
2. **Sugerir la categoría de falla más probable** ante una intervención correctiva.
3. **Priorizar mantenimiento preventivo** según antigüedad, historial y estado del equipo.
4. **Exponer resultados en el Dashboard e Inventario** mediante indicadores visuales (semáforo de riesgo).

El sprint cierra el ciclo de valor del diseño **ML-ready** definido en `architecture.md` y en `v2_estructura.sql`.

---

## Contexto: datos ya disponibles

Los sprints anteriores dejaron preparado el *dataset* sin texto libre en campos críticos:

| Fuente | Tabla | Campos útiles para ML |
|--------|-------|------------------------|
| Inventario | `v2_equipos` | `tipo_equipo`, `ram_gb`, `almacenamiento_gb`, `tipo_disco`, `fecha_adquisicion`, `estado_conservacion`, `estado_operativo`, `area_id` |
| Mantenimiento | `v2_fichas_mantenimiento` | `equipo_id`, `fecha_intervencion`, `tipo_mantenimiento`, `categoria_falla_id`, `estado_post_mantenimiento`, `costo_reparacion` |
| Catálogo | `v2_categorias_falla` | `nombre`, `severidad` (Baja → Crítica) |
| Ficha técnica | `v2_fichas_tecnicas` | `procesador`, `sistema_operativo`, `fecha_evaluacion` |
| Cronograma *(futuro)* | `v2_cronograma_mantenimiento` | `proxima_fecha`, `prioridad`, `tipo_mantenimiento` |

**Requisito mínimo de datos:** al menos **200 equipos** con historial de mantenimiento agregado en el Dataset A. El repositorio incluye un **CSV sintético de 200 filas** (`ml/data/synthetic/equipos_riesgo_v200.csv`) y scripts para regenerarlo o exportar desde MySQL. Con menos registros reales, usar el sintético o modo **heurístico** hasta acumular más datos.

### Dataset A (implementado)

| Artefacto | Ruta |
|-----------|------|
| CSV sintético 200 equipos | `ml/data/synthetic/equipos_riesgo_v200.csv` |
| CSV muestra 20 equipos | `ml/data/synthetic/equipos_riesgo_sample_20.csv` |
| Export desde MySQL | `ml/data/processed/equipos_riesgo_v1.csv` |
| Generador sintético | `ml/scripts/generate_synthetic.py` |
| Builder desde BD | `ml/scripts/build_dataset.py` |
| Vista SQL | `backend/sql/v2_ml_dataset_view.sql` |
| Diccionario columnas | `ml/data/README.md` |

```bash
pip install -r ml/requirements.txt
python ml/scripts/generate_synthetic.py --rows 200
python ml/scripts/generate_synthetic.py --rows 200 --seed-db   # opcional: cargar a MySQL
python ml/scripts/build_dataset.py
```

---

## Casos de uso

### UC-1: Score de riesgo por equipo
- **Actor:** Técnico / Administrador  
- **Entrada:** `equipo_id`  
- **Salida:** Puntuación 0–100, nivel (`Bajo`, `Medio`, `Alto`, `Crítico`), factores explicativos (top 3 features).  
- **UI:** Badge en tabla de inventario. *(Pendiente Sprint 7: bloque en `FichaTecnicaPanel.jsx`.)*

### UC-2: Predicción de categoría de falla
- **Actor:** Técnico al registrar mantenimiento correctivo  
- **Entrada:** Atributos del equipo + síntomas opcionales  
- **Salida:** Top-3 `categoria_falla_id` sugeridas con probabilidad.  
- **UI:** Pre-selección en `MantenimientoForm.jsx` (el técnico puede corregir).

### UC-3: Lista de equipos prioritarios
- **Actor:** Administrador  
- **Entrada:** Filtros opcionales (área, tipo)  
- **Salida:** Ranking de equipos ordenados por riesgo descendente.  
- **UI:** Sección **"Alertas predictivas"** en `DashboardPage.jsx`.

### UC-4: Reentrenamiento del modelo
- **Actor:** Administrador / cron job  
- **Acción:** Disparar entrenamiento con datos actuales de MySQL.  
- **Salida:** Métricas (accuracy, F1, matriz de confusión) + versión del modelo activa.

---

## Arquitectura técnica

```text
┌─────────────────┐     JWT      ┌──────────────────┐     HTTP      ┌─────────────────────┐
│  React (Vite)   │ ───────────► │  PHP API V2      │ ────────────► │  ML Service         │
│  Dashboard /    │              │  (Proxy / Orquest.)│              │  FastAPI + Scikit   │
│  Inventario     │              │  /api/v2/ml/*    │              │  :8000              │
└─────────────────┘              └────────┬─────────┘              └──────────┬──────────┘
                                          │                                    │
                                          └──────────────┬─────────────────────┘
                                                         ▼
                                              MySQL (gestion_equipos_mpa_v2)
```

### Principios
- **Separación de responsabilidades:** PHP sigue siendo la API principal y **proxy autenticado** hacia el servicio ML.
- **Stateless ML:** El modelo se serializa en disco (`ml/models/`) con versionado (`model_v1.joblib`, `metadata.json`).
- **Sin lógica ML en PHP:** PHP solo orquesta, persiste predicciones y valida JWT.
- **Explicabilidad básica:** Incluir factores que más influyeron (importancia de features o reglas heurísticas documentadas).

---

## Stack del microservicio ML

| Componente | Tecnología |
|------------|------------|
| API ML | **FastAPI** (Python 3.10+) |
| Entrenamiento / inferencia | **Scikit-learn** (Random Forest / Gradient Boosting) |
| Datos | **Pandas**, conector **PyMySQL** o export CSV desde PHP |
| Serialización | **joblib** |
| Validación | **pydantic** (schemas de request/response) |
| Entorno | `ml/requirements.txt` + `venv` |

---

## Modelos propuestos (MVP Sprint 6)

### Modelo A — Clasificador de riesgo de falla
- **Tipo:** Clasificación multiclase → `Bajo`, `Medio`, `Alto`, `Crítico`
- **Target (label):** Derivado del historial:
  - `Crítico`: ≥2 fallas de severidad Alta/Crítica en últimos 12 meses, o `estado_operativo = 'Dañado'`
  - `Alto`: 1 falla Alta/Crítica o ≥3 mantenimientos correctivos en 12 meses
  - `Medio`: antigüedad > 4 años o `estado_conservacion = 'Regular'`
  - `Bajo`: resto operativo sin incidentes recientes
- **Features:**
  - `antiguedad_meses` (desde `fecha_adquisicion`)
  - `ram_gb`, `almacenamiento_gb`
  - `tipo_disco` (one-hot)
  - `tipo_equipo` (one-hot)
  - `total_mantenimientos`, `total_correctivos_12m`
  - `ultima_severidad_max` (numérico 1–4)
  - `estado_conservacion`, `estado_operativo` (ordinal encoded)

### Modelo B — Sugeridor de categoría de falla *(opcional en MVP)*
- **Tipo:** Clasificación multiclase sobre `categoria_falla_id`
- **Entrenamiento:** Solo filas de `v2_fichas_mantenimiento` con `tipo_mantenimiento = 'Correctivo'`
- **Features:** Atributos del equipo + antigüedad + historial previo del mismo equipo

> **Nota:** Si el dataset es pequeño (<100 correctivos), Modelo B se implementa como **reglas + frecuencia histórica por tipo de equipo** y se migra a ML cuando haya más datos.

**Estado Sprint 6:** Modelo B implementado como **heurístico** en `ml/app/services/dataset.py` (`fetch_categoria_sugerencias`) y expuesto vía `/predict/categoria`.

---

## Entregables

### 1. Microservicio Python (`/ml`)

```text
ml/
├── app/
│   ├── main.py              # FastAPI entrypoint
│   ├── config.py            # DB URL, rutas de modelos
│   ├── routers/
│   │   ├── predict.py       # POST /predict/riesgo, /predict/categoria
│   │   └── train.py         # POST /train (reentrenar)
│   ├── services/
│   │   ├── dataset.py           # Extracción y feature engineering
│   │   ├── inference_service.py # Carga modelo + predicción
│   │   └── trainer_service.py   # Reentrenamiento desde MySQL
│   └── schemas/
│       └── ml_schemas.py        # Pydantic models
├── scripts/                     # Pipeline offline (train, CLI, dataset)
│   ├── dataset_logic.py
│   ├── features.py
│   ├── generate_synthetic.py
│   ├── build_dataset.py
│   ├── train_model.py
│   ├── inference.py
│   └── predict_cli.py
├── models/                      # riesgo_equipo_v1.joblib + metadata.json
├── requirements.txt
└── README.md
```

**Arranque del microservicio:**

```bash
cd ml
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Modelo A entrenado (v1):**

| Métrica | Valor |
|---------|-------|
| Dataset | `equipos_riesgo_v200.csv` (200 equipos) |
| Accuracy | 95% |
| F1 macro | 0.92 |
| Artefacto | `ml/models/riesgo_equipo_v1.joblib` |

**Endpoints del microservicio (internos, puerto 8000):**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio y versión del modelo |
| `POST` | `/predict/riesgo` | Predicción para un `equipo_id` |
| `POST` | `/predict/riesgo/batch` | Predicción masiva (inventario completo) |
| `POST` | `/predict/categoria` | Sugerencia de categoría de falla |
| `POST` | `/train` | Reentrenar modelos desde MySQL |
| `GET` | `/metrics` | Métricas del último entrenamiento |

---

### 2. Backend PHP — Puente ML (`/backend/api/v2`)

| Archivo | Responsabilidad |
|---------|-----------------|
| `controllers/MlController.php` | Proxy HTTP hacia FastAPI, manejo de errores |
| `routes/ml.php` | Rutas públicas autenticadas |
| `models/Prediccion.php` | Persistencia en `v2_predicciones_ml` |
| `config/Ml.php` | URL base del microservicio (`ML_SERVICE_URL`, default `http://127.0.0.1:8000`) |
| `backend/tools/migrate_ml_predicciones.php` | Migración de tabla en entornos existentes |
| `backend/tools/verify_sprint6_ml.py` | Verificación automática end-to-end |

**Endpoints expuestos al frontend:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v2/ml/equipos/{id}/riesgo` | Riesgo de un equipo |
| `GET` | `/api/v2/ml/equipos/riesgo` | Listado con scores (inventario) |
| `GET` | `/api/v2/ml/alertas` | Top equipos prioritarios (dashboard) |
| `POST` | `/api/v2/ml/predict/categoria` | Sugerencia al registrar mantenimiento |
| `POST` | `/api/v2/ml/train` | Reentrenar *(solo Administrador)* |
| `GET` | `/api/v2/ml/status` | Health + versión del modelo |

---

### 3. Base de datos — Nueva tabla

```sql
CREATE TABLE IF NOT EXISTS v2_predicciones_ml (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipo_id INT NOT NULL,
  modelo_version VARCHAR(20) NOT NULL,
  score_riesgo DECIMAL(5,2) NOT NULL,          -- 0.00 a 100.00
  nivel_riesgo ENUM('Bajo','Medio','Alto','Critico') NOT NULL,
  factores_json JSON,                          -- explicabilidad
  categoria_sugerida_id INT NULL,
  generado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES v2_equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_sugerida_id) REFERENCES v2_categorias_falla(id) ON DELETE SET NULL,
  INDEX (equipo_id),
  INDEX (nivel_riesgo),
  INDEX (generado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Script de migración: `backend/sql/v2_ml_predicciones.sql`

---

### 4. Frontend React

| Componente / archivo | Cambio | Estado |
|----------------------|--------|--------|
| `src/features/ml/services/mlService.js` | Cliente Axios hacia `/api/v2/ml/*` | ✅ |
| `src/features/ml/components/RiesgoBadge.jsx` | Semáforo visual de riesgo | ✅ |
| `src/features/inventario/components/InventarioPage.jsx` | Columna **Riesgo ML** con badge | ✅ |
| `src/features/dashboard/components/DashboardPage.jsx` | Panel **Alertas predictivas** (top 10) | ✅ |
| `src/features/mantenimiento/components/MantenimientoForm.jsx` | Sugerencia IA de `categoria_falla_id` | ✅ |
| `src/features/inventario/components/FichaTecnicaPanel.jsx` | Bloque **Evaluación predictiva** | ⏳ Sprint 7 |
| `src/App.jsx` + `Navbar.jsx` | Ruta `/v2/predicciones` dedicada | ⏳ Opcional |

**Semáforo visual (convención UI):**

| Nivel | Color Tailwind | Score |
|-------|----------------|-------|
| Bajo | `emerald` | 0–25 |
| Medio | `amber` | 26–50 |
| Alto | `orange` | 51–75 |
| Crítico | `red` | 76–100 |

---

### 5. Documentación

- [x] `architecture.md` — diagrama e integración ML.
- [x] `ml/README.md` — instalación, entrenamiento y arranque FastAPI.
- [x] Registro en `changelog.md` versión **0.7.0**.
- [x] Este documento (`sprint_6.md`) marcado como **Completado**.

---

## Resultado de la verificación (2026-06-21)

Script `backend/tools/verify_sprint6_ml.py` — **9/9 pruebas OK**:

| Prueba | Resultado |
|--------|-----------|
| FastAPI `/health` | Modelo v1 disponible |
| FastAPI `/predict/riesgo` | Predicción individual OK |
| FastAPI `/predict/riesgo/batch` | 207 equipos, score máx. ~89 |
| PHP `/ml/alertas` | Top 10 equipos prioritarios |
| PHP `/ml/equipos/riesgo` | 207 scores para inventario |
| Persistencia BD | Tabla `v2_predicciones_ml` operativa |

**Nota operativa:** FastAPI debe estar en ejecución (`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`). Si el puerto 8000 está ocupado, detener la instancia previa o usar `ML_SERVICE_URL` con otro puerto.

**Corrección aplicada en cierre:** el proxy PHP enviaba `[]` en peticiones batch; FastAPI requiere `{}` (objeto JSON vacío). Sin este fix, inventario y alertas caían a caché parcial.

---

## Pipeline de feature engineering

```text
MySQL
  │
  ├─► JOIN v2_equipos + v2_fichas_mantenimiento + v2_categorias_falla
  │
  ├─► Calcular por equipo:
  │     • antiguedad_meses
  │     • total_mantenimientos
  │     • correctivos_12m
  │     • dias_desde_ultimo_mantenimiento
  │     • severidad_maxima_historica
  │
  ├─► Encoding categóricos (OneHot / Ordinal)
  │
  ├─► Train/Test split (80/20, estratificado por nivel_riesgo)
  │
  └─► RandomForestClassifier → joblib + métricas
```

---

## Criterios de aceptación

- [x] El microservicio FastAPI arranca en `:8000` y responde `/health`.
- [x] PHP proxy autenticado expone `/api/v2/ml/equipos/{id}/riesgo` con JWT válido.
- [x] Inventario muestra badge de riesgo por equipo tras cargar la tabla.
- [x] Dashboard muestra al menos 5 equipos en **Alertas predictivas** (implementado: top 10).
- [x] Al registrar mantenimiento correctivo, se sugiere una categoría de falla (heurístico por tipo de equipo).
- [x] Las predicciones se persisten en `v2_predicciones_ml`.
- [x] `POST /api/v2/ml/train` reentrena y actualiza `modelo_version` *(solo Administrador; endpoint implementado)*.
- [x] Con dataset insuficiente, el sistema responde con modo **heurístico** (`inference_service.py`, campo `modo: heuristic`).
- [x] Documentación de despliegue en `ml/README.md`.

### Pendiente para Sprint 7

- [ ] Bloque **Evaluación predictiva** en `FichaTecnicaPanel.jsx`.
- [ ] Modelo B con clasificador ML (actualmente heurístico por frecuencia histórica).
- [ ] Ruta dedicada `/v2/predicciones` *(opcional)*.

---

## Plan de trabajo sugerido (3 semanas)

| Semana | Foco | Tareas |
|--------|------|--------|
| **1** | Datos + ML core | Feature engineering, Modelo A, scripts CLI, endpoints FastAPI |
| **2** | Integración | Proxy PHP, tabla predicciones, mlService.js, badges en inventario |
| **3** | UI + cierre | Dashboard alertas, sugerencia en mantenimiento, QA, docs |

*Todas las fases completadas el 2026-06-21.*

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Pocos datos históricos | Modo heurístico inicial; mensaje "Modelo en aprendizaje" |
| ML service caído | PHP devuelve 503 graceful; inventario funciona sin badge ML |
| Overfitting | Validación cruzada; métricas en `/metrics`; no desplegar modelos con F1 < 0.5 |
| Explicabilidad insuficiente | `factores_json` con top-3 features por predicción |
| Desincronización PHP ↔ Python | Versionado en `metadata.json`; health check periódico |

---

## Dependencias del Sprint 6

- Sprints 1–5 completados (API V2, inventario, mantenimiento, dashboard).
- Auth JWT operativo (Sprint post-0.5).
- Python 3.10+ instalado en el entorno de desarrollo.
- Extensión `pdo_mysql` en PHP y acceso de lectura del servicio ML a MySQL.

---

## Fuera de alcance (Sprint 7+)

- Deep Learning / redes neuronales.
- Predicción de series temporales (LSTM).
- Integración con cronograma automático (`v2_cronograma_mantenimiento`).
- Notificaciones por correo o WhatsApp por equipos críticos.
- MLOps en producción (Docker, MLflow, CI/CD de modelos).

---

## Referencias internas

- `documents/architecture.md` — Visión V2 y stack ML propuesto.
- `backend/sql/v2_estructura.sql` — Esquema ML-ready.
- `documents/sprints/sprint_3.md` — Dataset de mantenimiento estructurado.
- `documents/sprints/sprint_2.md` — Campos numéricos del inventario.
