# T-012 — Regresión por incremento

| Campo | Valor |
|-------|-------|
| **Código** | T-012 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (una fila por incremento) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No reejecuta T-001 completo.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como QA de regresión. Una prueba caracterizada por
incremento, no 90 casos.

Contexto: Changelog 0.1.0–0.10.7. Incrementos 1–8 + parche 0.9.1.
REG-001…006 ya en T-001.

Objetivo: REG-INC-01…08 más los REG existentes. Ejemplos: Excel
color 0.9.1, JWT dashboard 0.6.0, Xn no turno 0.10.4, PDF A4 L–V
0.10.5, bandas 0.10.7.

Entradas: changelog.md, T-001 §4.9, T-006.

Formato: documents/04_testing/plan_regresion.md.

Restricciones: no duplicar CRN-010 entero; una comprobación por
incremento.

Criterios: 8 filas INC + enlace REG-001…006.

Proceso: changelog → riesgo de ruptura → un caso.

No hacer: no reabrir I-017.

Ejemplos: REG-INC-08 bandas de gerencia en matriz (CRN-017).
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_regresion.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 8 REG-INC + 6 REG T-001. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Regresión se recorta por incremento, no por módulo. |

| Relación | Valor |
|----------|-------|
| Anterior | Changelog, T-001, T-006 |
| Siguiente | Ejecutar REG-INC tras cada I-* nuevo |
| Commit | `docs(testing): plan regresión por incremento [T-012]` |
