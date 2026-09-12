# T-004 — Tests pytest (ML)

| Campo | Valor |
|-------|-------|
| **Código** | T-004 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (pytest + Pydantic) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No exige uvicorn ni `.joblib` en disco (inferencia E2E es deuda del plan).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero QA de Python (pytest).

Contexto: ml/ FastAPI + features v1/v2 (I-007, I-008). Probar
FEATURE_COLUMNS (6 de telemetría), preparar_dataframe (nulos, no mutar
original) y schemas RiesgoRequest / batch limit / HealthResponse.

Objetivo: UT-ML-001…009 con `pytest -v` en ml/.

Tarea: test_features.py y test_ml_schemas.py.

Entradas: features.py, schemas, plan unitario §2.4–2.5.

Formato: ml/tests/*.py.

Restricciones: no llamar a MySQL; no entrenar el RF en el test;
id ≤ 0 → ValidationError.

Criterios: pytest verde; telemetría presente en numéricas.

Proceso: columnas → coerción → schemas.

No hacer: no accuracy assert sobre sintético como si fuera producción.

Ejemplos: RiesgoRequest id=0 lanza ValidationError.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Suite Python | `ml/tests/test_features.py`, `test_ml_schemas.py` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | UT-ML-001…009 |
| **Iteraciones** | No medido |
| **Decisión** | **Aprobado** |
| **Lección** | Separar schema/features de “cargar joblib” mantiene la suite < 30 s |

| Relación | Valor |
|----------|-------|
| Anterior | I-007, I-008, T-001 |
| Siguiente | T-005 |
| Commit | `test(ml): features y schemas [T-004]` |
