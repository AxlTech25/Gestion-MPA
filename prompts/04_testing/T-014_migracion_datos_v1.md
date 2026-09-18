# T-014 — Migración e integridad de datos

| Campo | Valor |
|-------|-------|
| **Código** | T-014 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (ALTER sobre copia, no producción) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como QA de datos. Migraciones incrementales, no dump de
producción.

Contexto: RNF-DAT. Scripts migrate_fase7.php, migrate_cronograma.php,
migrate_gerencias.php. Código patrimonial 12 dígitos único. DELETE
área 409 si hay equipos.

Objetivo: MIG-001…005 sobre copia local. Idempotencia donde el
script lo permita.

Tarea: Contar equipos antes/después de Fase 7; reejecutar cronograma
migrate; gerencias nullable; duplicado patrimonial; 409.

Entradas: RNF-DAT, I-008, I-010, I-017, INT-011, INV-008.

Formato: documents/04_testing/plan_migracion_datos.md.

Restricciones: nunca producción; dump previo; no DROP DATABASE.

Criterios: cinco MIG; conteo de filas documentado.

Proceso: dump → conteo → script → reconteo → caso de negocio.

No hacer: no inventar rollback automático.

Ejemplos: MIG-001 COUNT(*) v2_equipos igual tras migrate_fase7.
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_migracion_datos.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 MIG; producción prohibida. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Integridad se prueba con conteo, no con “el script corrió”. |

| Relación | Valor |
|----------|-------|
| Anterior | RNF-DAT, D-001, I-008, I-017, T-006 |
| Siguiente | M-002 impacto si hay nuevo ALTER |
| Commit | `docs(testing): plan migración e integridad [T-014]` |
