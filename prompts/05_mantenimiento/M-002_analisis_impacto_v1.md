# M-002 — Análisis de impacto (plantilla)

| Campo | Valor |
|-------|-------|
| **Código** | M-002 |
| **Fase** | Mantenimiento |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Plantilla reutilizable / lista para ejecutar |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT guiado (M-01 de la guía) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha** | 2026-09-11 |
| **Plantilla maestra** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Usar **antes** de un I-* que toque BD, API o despliegue. Incluye ejemplo reconstruido de I-008.

---

## Prompt a ejecutar (anatomía D1)

```text
Rol: Actúa como arquitecto responsable de mantenimiento.

Contexto: Sigemad MPA V2 en producción o XAMPP. Arquitectura: ADR-001,
ADR-002, D-003. Cambio solicitado: [describir].

Tarea: Impacto en BD, modelos, API, frontend, ML, tests, docs, despliegue
y datos existentes. Nivel Alto/Medio/Bajo, archivos, riesgos. Rollback y
regresión T-001 obligatorios.

Formato: ficha en documents/05_mantenimiento/plantilla_analisis_impacto.md.

Restricciones: no implementar código en esta pasada; si es decisión de
stack, pedir ADR.

Criterios: las 8 categorías llenas; rollback con dump + restore.

Proceso: leer contrato y esquema → listar toques → rollback → go/no-go.

No hacer: no minimizar un ALTER como “bajo” sin plan de restore.

Ejemplos: ficha I-008 (telemetría) en el mismo archivo.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plantilla + ejemplo I-008 | `documents/05_mantenimiento/plantilla_analisis_impacto.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Plantilla + 1 ejemplo retrospectivo |
| **Decisión** | **Aprobado** |
| **Lección** | M-01 antes de I-* evita otro I-005 sin requireRole |

| Relación | Valor |
|----------|-------|
| Anterior | D-003, D-001, M-004 |
| Siguiente | I-0NN del cambio |
| Commit | `docs(mantenimiento): plantilla impacto M-01 [M-002]` |
