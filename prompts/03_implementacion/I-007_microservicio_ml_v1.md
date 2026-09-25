# I-007 — Microservicio ML y proxy autenticado

| Campo | Valor |
|-------|-------|
| **Código** | I-007 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (dataset → modelo → FastAPI → proxy PHP → UI) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-06-21 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | 0.7.0 (documento `incremento_6.md`) |
| **Historias** | HU-ML-001, HU-ML-002, HU-ML-004, HU-ML-005, HU-INV-006, HU-MNT-009 |
| **ADR** | ADR-001 (PHP único cliente de FastAPI) |
| **Alias histórico** | [I-002-ML](./I-002_microservicio_ml_v1.md) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Telemetría, ficha predictiva, `v2_metricas_equipo` y modelo v2 son **I-008**.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero de ML aplicado y backend PHP.

Contexto: 0.7.0. Inventario y mantenimientos estructurados (I-002, I-003).
JWT ya protege la API (I-006). Stack: Python 3.10+, FastAPI, Scikit-learn,
joblib. PHP es el único cliente de http://127.0.0.1:8000. FastAPI no
es obligatorio: degradación (HU-ML-005).

Objetivo: Inferencia de riesgo y sugerencia de categoría, proxy JWT y UI
degradables (badge + alertas). Sin ampliar el esquema de telemetría.

Tarea:
1. Dataset A: CSV sintético ~200 filas; scripts generate/build.
2. Random Forest → riesgo_equipo_v1.joblib.
3. FastAPI: /health, /predict/riesgo, /predict/riesgo/batch,
   /predict/categoria, /train, /metrics.
4. SQL v2_predicciones_ml.
5. Proxy /api/v2/ml/* (timeout, fallback). /ml/train solo Administrador
   si requireRole ya existe; si no, dejarlo documentado.
6. RiesgoBadge en inventario; alertas top 10 en dashboard; sugerencia
   de categoría en MantenimientoForm.
7. Documentar en incremento_6.md. Changelog 0.7.0.

Entradas disponibles: ADR-001, I-006 (Axios/JWT), D-001.

Formato de salida: ml/app, ml/scripts, MlController.php, routes/ml.php,
componentes React listados.

Restricciones técnicas:
- El navegador no llama al puerto 8000.
- Batch: JSON objeto {}, no array [].
- Si FastAPI cae: inventario y login siguen; alertas N/A.
- No features de telemetría (horas_uso, SMART, etc.) — I-008.
- No secretos en joblib ni en prompts.

Criterios de aceptación:
- /health OK con uvicorn arriba.
- Un equipo obtiene nivel de riesgo vía proxy + JWT.
- Sin token: 401 en /api/v2/ml/*.
- uvicorn down: UI sin crash (HU-ML-005).
- Accuracy/F1 del entrenamiento se registran (no inventar).

Proceso sugerido: dataset → train → API Python → proxy con fallback →
UI → apagar uvicorn y reprobar.

No hacer: no CORS de FastAPI al origen del SPA; no entrenar en cada GET.

Ejemplos: cuerpo batch {"items":[...]} o el schema Pydantic del repo;
nunca [].
```

### Checklist D1

- [x] Alcance 0.7.0 solamente
- [x] Fallback y `{}` vs `[]`
- [x] I-008 fuera
- [x] Criterios con FastAPI down

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| FastAPI | `ml/app/main.py` | [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) (F-007) |
| Proxy | `MlController.php` | 0.7.0 |
| Incremento | `incremento_6.md` | docs asociadas |

Salida usada como entrada de **I-008**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Accuracy 95 %, F1 macro 0.92 (dataset sintético, incremento 6). Bugs de origen: batch `[]`; HTTP 503 con cuerpo OK. |
| **N.º de iteraciones** | ≥2 en el proxy (JSON batch, códigos HTTP). |
| **Diagnóstico** | Restricciones de contrato incompletas en el prompt original (I-002-ML). |
| **Decisión** | **Aprobado** (0.7.0). |
| **Lección** | Escribir el schema del vecino en el prompt; no “envía el batch”. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-002, I-003, I-006, D-001 |
| **Fase siguiente** | I-008, T-001 (casos ML), M-001 |
| **Matriz doble entrada** | F-007 ml |
| **Commit sugerido** | `feat(ml): FastAPI, proxy JWT y degradación [I-007]` |
