# T-011 — Aceptación UAT por personas

| Campo | Valor |
|-------|-------|
| **Código** | T-011 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (un journey por persona R-003) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

UAT ≠ QA: firma de usuario clave, no checklist de 90 casos.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de aceptación. Journeys de personas, no
casos MOD-NNN.

Contexto: personas.md P1 Carlos admin, P2 Ana técnico, P3 Luis jefe
de área (consulta), P4 Diana ML, P5 Miguel practicante. 0.10.7.
P3 no tiene rol de sistema propio (consulta). Cronograma: Admin y
Técnico escriben; Practicante no.

Objetivo: UAT-P1…P5 con resultado de negocio y firma.

Tarea: Un escenario por persona. P3: dashboard dañados/excedencia
sin Configuración. P4: badges o N/A. P5: alta 12 dígitos y no crea
cronograma.

Entradas: R-003, T-006, T-001, CRN-011, CFG-008.

Formato: documents/04_testing/plan_aceptacion_uat.md.

Restricciones: no exigir FastAPI para aprobar P1/P2/P5; P4 puede N/A.

Criterios: cinco journeys; columna firma; cruza a T-001 sin copiarlo.

Proceso: mapa persona-módulo → escenario mínimo → firma.

No hacer: no convertir UAT en T-001 otra vez.

Ejemplos: UAT-P5 Miguel registra 740000001001 y no ve Nuevo cronograma.
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_aceptacion_uat.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 journeys P1–P5; P3 sin rol de sistema declarado. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Persona ≠ rol: P3 se acepta con consulta, no con Configuración. |

| Relación | Valor |
|----------|-------|
| Anterior | R-003, T-006 |
| Siguiente | Ejecución con usuario clave; plantilla firmas |
| Commit | `docs(testing): plan UAT personas [T-011]` |
