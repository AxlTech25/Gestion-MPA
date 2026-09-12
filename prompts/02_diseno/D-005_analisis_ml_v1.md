# D-005 — Análisis de mantenimiento predictivo

| Campo | Valor |
|-------|-------|
| **Código** | D-005 |
| **Fase** | Diseño |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (viable / no todo de una vez / fases) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha del artefacto** | 2026-06-21 (v0.7.0) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Alimentó **I-008**. No sustituye CRISP-ML(Q).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de datos + ML aplicado.

Contexto: V2 + ML incremento 6 (0.7.0). Hay una propuesta de ampliar
equipos, fichas, fallos y metricas_equipo. Features v1: 14 variables;
peso en fallas_altas_criticas_12m, estado_conservacion, correctivos_12m.

Objetivo: Decidir si implementar todo, nada, o por fases. No duplicar
tablas v2_*.

Tarea: Comparar propuesta vs esquema; priorizar telemetría vs tabla
fallos vs fotos; recomendar evolución incremental.

Entradas: v2_estructura.sql, incremento_6.md, ADR-001.

Formato: documents/02_diseno/ml/mantenimiento_predictivo_analisis.md
con tablas de viabilidad y fases.

Restricciones: no exigir agente WMI; no reemplazar FastAPI; captura
operativa es el cuello de botella (declararlo).

Criterios: conclusión “sí viable / no todo de una vez”; Fase 1 =
snapshot + campos equipo; fallos = fase posterior.

Proceso: estado actual → gaps → valor ML → fases → riesgos.

No hacer: no inventar accuracy de un modelo no entrenado con telemetría.

Ejemplos: N/A.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Análisis | `documents/02_diseno/ml/mantenimiento_predictivo_analisis.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | I-008 implementó Fase 1+2 alineada al análisis |
| **Iteraciones** | No medido (origen 2026-06-21) |
| **Decisión** | **Aprobado** |
| **Lección** | Un análisis que dice “no de una vez” es un prompt de diseño, no de código |

| Relación | Valor |
|----------|-------|
| Anterior | D-001, I-007 |
| Siguiente | I-008, D-006 |
| Commit | `docs(diseno): análisis predictivo [D-005]` |
