# T-013 — Degradación ML

| Campo | Valor |
|-------|-------|
| **Código** | T-013 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (FastAPI down / url vacía) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como QA de resiliencia. ADR-002 opción D.

Contexto: FastAPI :8000 opcional. Producción puede dejar ml_service_url vacío.
PHP único cliente. Inventario/auth/fichas/mantenimiento siguen.
POST mantenimientos persiste si falla recálculo.

Objetivo: DEG-001…005. No bloquear release si ML N/A.

Tarea: Down → dashboard sin blanco; inventario 200; guardar ficha;
url vacía; /ml/alertas no 500.

Entradas: ADR-002, RNF-AVA, T-006, ML-003, INT-013, SMOKE-005.

Formato: documents/04_testing/plan_degradacion_ml.md.

Restricciones: no exigir VPS; no entrenar modelo.

Criterios: cinco DEG; cruza sin duplicar pasos largos.

Proceso: apagar uvicorn → núcleo → endpoints /ml/* → url vacía.

No hacer: no marcar ML obligatorio.

Ejemplos: DEG-001 = ML-003 con criterio “resto del dashboard OK”.
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_degradacion_ml.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 DEG alineados a RNF-AVA-01…04 y ADR-002. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Degradación es un plan propio para que T-001 no “olvide” apagar uvicorn. |

| Relación | Valor |
|----------|-------|
| Anterior | D-006 / ADR-002, T-006 |
| Siguiente | M-001 producción; INT-013 |
| Commit | `docs(testing): plan degradación ML [T-013]` |
