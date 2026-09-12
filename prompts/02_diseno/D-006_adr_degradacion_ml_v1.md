# D-006 — ADR-002 degradación FastAPI

| Campo | Valor |
|-------|-------|
| **Código** | D-006 |
| **Fase** | Diseño |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Tree-of-Thought (alternativas A–D) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 (formaliza decisión de 0.7.0) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de software. Redacta ADR, no código.

Contexto: ADR-001 eligió FastAPI detrás de PHP. Hostinger no corre
Python. HU-ML-005 exige fallback. architecture.md lo dice en prosa;
no hay ADR.

Objetivo: ADR-002 con plantilla 10.3: contexto, decisión, alternativas,
consecuencias, riesgos.

Tarea: Evaluar A) ML obligatorio, B) fetch al :8000 desde React,
C) cola/cron, D) proxy PHP + degradación. Elegir y justificar.

Entradas: ADR-001, RNF-AVA, I-007, M-001, HU-ML-005.

Formato: documents/02_diseno/adr/ADR-002-degradacion-ml.md.

Restricciones: no contradecir “PHP único cliente”; no exigir VPS
para el MVP.

Criterios: una opción ganadora; Hostinger con ml_service_url vacío
queda permitido; T-001 puede marcar ML como N/A.

Proceso: restricciones → tabla de alternativas → decisión → riesgos.

No hacer: no reabrir el stack React/PHP.

Ejemplos: estructura de ADR-001.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| ADR-002 | `documents/02_diseno/adr/ADR-002-degradacion-ml.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Plantilla 10.3 completa; 4 alternativas |
| **Iteraciones** | 1 |
| **Decisión** | **Aprobado** — opción D |
| **Lección** | Lo que “ya todos saben” (ML se apaga) no existe para la tesis hasta que hay ADR |

| Relación | Valor |
|----------|-------|
| Anterior | D-002, D-005, R-005 |
| Siguiente | I-007 (consulta), M-001, T-001 |
| Commit | `docs(diseno): ADR-002 degradación ML [D-006]` |
