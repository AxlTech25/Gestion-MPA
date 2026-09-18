# M-002 — Impacto del cronograma de preventivo (ejecución)

| Campo | Valor |
|-------|-------|
| **Código** | M-002 (ejecución cronograma) |
| **Título** | Análisis de impacto — incremento 8 cronograma |
| **Fase** | Mantenimiento (antes de I-010) |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | CoT guiado (M-01 de la guía) |
| **Autor / revisor** | Equipo Sigemad MPA / pendiente aprobación humana del diseño |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | Incremento 8 propuesto |
| **Historias o ADR relacionados** | R-006, HU-CRN-001–009, ADR-003 (previsto) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No implementa código. Plantilla reutilizable: [M-002_analisis_impacto_v1.md](./M-002_analisis_impacto_v1.md).

---

## Prompt (anatomía D1)

```text
Rol: Actúa como arquitecto responsable de mantenimiento.

Contexto: Sigemad MPA V2 0.9.1. ADR-001, ADR-002, D-003. R-006 aprobado:
módulo Cronograma (historial de documentos por año, matriz área×día×turno,
marcado manual, PDF). Existe v2_cronograma_mantenimiento por equipo, sin UI.

Tarea: Impacto en BD, modelos, API, frontend, ML, tests, docs, despliegue
y datos existentes. Nivel Alto/Medio/Bajo, archivos, riesgos. Rollback y
regresión T-001. Si hay decisión de modelo (reusar tabla vs tablas nuevas),
pedir ADR.

Formato: documents/05_mantenimiento/impacto_cronograma.md.

Restricciones: no implementar código; no dual-write a ML; no ALTER destructivo.

Criterios: 8 categorías; rollback dump + restore; go/no-go explícito.

Proceso: leer contrato y esquema → listar toques → rollback → decisión.

No hacer: no minimizar un CREATE/ALTER como “bajo” sin restore.

Ejemplos: ficha I-008 en plantilla_analisis_impacto.md.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto 0.9.1 + R-006
- [x] Tarea verificable
- [x] Formato de ficha
- [x] Restricciones
- [x] Ejemplo I-008
- [x] Criterios
- [x] No implementar

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Ficha de impacto | `documents/05_mantenimiento/impacto_cronograma.md` |

Salida usada como entrada de **ADR-003** y **D-007**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 8 categorías; BD Alta; ML Nulo; rollback restore |
| **N.º de iteraciones** | 1 |
| **Decisión** | **Seguir a diseño (ADR-003 + D-007).** No a I-010 hasta aprobar diseño. |
| **Lección** | La tabla por equipo ya en SQL no cubre el papel; el impacto obliga ADR, no un ALTER silencioso |

| Relación | Valor |
|----------|-------|
| Anterior | R-006 v1.4 aprobado |
| Siguiente | ADR-003, D-007, luego I-010 |
| Commit sugerido | `docs(mantenimiento): impacto cronograma [M-002]` |
