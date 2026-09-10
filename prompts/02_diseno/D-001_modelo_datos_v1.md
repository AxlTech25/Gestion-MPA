# D-001 — Modelo de datos V2

| Campo | Valor |
|-------|-------|
| **Código** | D-001 |
| **Fase** | Diseño |
| **Versión** | v1 |
| **Estado** | Aprobado |

---

## Prompt ejecutado

**Rol:** Arquitecto de datos.

**Contexto:** Inventario patrimonial, áreas, usuarios, fichas de mantenimiento, categorías de falla, predicciones ML y telemetría.

**Tarea:** Diseñar esquema MySQL `v2_*` con tipos numéricos para RAM, almacenamiento y lecturas de telemetría; catálogo de fallas (sin texto libre como fuente de verdad); tablas de predicciones y métricas.

**Formato:** DDL versionado + nota de migraciones.

**Restricciones:** Prefijo `v2_`. Compatible con XAMPP/MySQL. Migraciones incrementales además del script de instalación nueva.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Estructura | `backend/sql/v2_estructura.sql` |
| Extensión telemetría | `backend/sql/v2_extension_fase7.sql` |
| Predicciones | `backend/sql/v2_ml_predicciones.sql` |
| Análisis | `documents/02_diseno/ml/mantenimiento_predictivo_analisis.md` |

## Decisión

**Aprobado** — evolucionó en incrementos 1 y 7.
