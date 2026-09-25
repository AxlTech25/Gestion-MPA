# Análisis de impacto — Cronograma de preventivo

**Prompt:** [M-002 ejecución](../../prompts/05_mantenimiento/M-002_cronograma_v1.md)  
**Fecha:** 2026-09-15  
**HU:** HU-CRN-001 … HU-CRN-009  
**Implementación prevista:** I-010 (no ejecutar hasta aprobar ADR-003 y D-007)

---

## Ficha

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | Módulo Cronograma: historial de planes por año + matriz área × día × turno |
| **Solicitante / fecha** | Unidad de informática MPA / 2026-09-15 |
| **Prompt de implementación previsto** | I-010 |
| **Entradas** | R-006 v1.4, `v2_estructura.sql`, D-003, D-004, I-003 |

### Impacto por categoría

| Categoría | Nivel | Archivos / componentes | Riesgo |
|-----------|-------|------------------------|--------|
| Base de datos | **Alto** | Tablas nuevas de documento y celdas. `v2_cronograma_mantenimiento` (por equipo) **no** cubre el papel | Si se reusa esa tabla, el historial de 2–3 planes por año no cabe. CREATE es aditivo; exige dump previo |
| Modelos / API | **Alto** | Recurso `/cronogramas`, celdas, PDF, `index.php`, RBAC Técnico/Admin en escritura | 403 vs 401 (mismo patrón I-009). No tocar `/mantenimientos` |
| Frontend | **Alto** | Feature `cronograma`, ruta `/v2/cronograma`, Navbar | Matriz ancha (overflow). No mezclar con `MantenimientoPage` |
| ML / FastAPI | **Nulo** | Ninguno | El cronograma no alimenta el modelo en este incremento |
| Tests | **Medio** | PHPUnit (unicidad área+fecha+turno+cronograma, RBAC); Vitest (año, turnos); T-001 casos CRN | Hueco si no hay casos de “dos cronogramas el mismo año” |
| Documentación | **Medio** | ER, contrato API, frontend_features, changelog (M-003 post I-010), T-001 | Contrato D-003 hoy no lista el recurso |
| Despliegue / producción | **Medio** | Migración `CREATE TABLE` en XAMPP y producción | PHP/MySQL basta; no hay Python |
| Datos existentes | **Bajo** | Inventario y áreas se leen; no se migran celdas desde el papel 2024 | Historial empieza vacío. Áreas “servidor SIGA/SAF” se dan de alta en Configuración si no existen |

### Rollback

| Paso | Acción | Responsable |
|------|--------|-------------|
| 1 | `mysqldump` de `gestion_equipos_mpa_v2` antes de migrar | Operador |
| 2 | Conservar `dist/` y `backend/` del 0.9.1 | Operador |
| 3 | Revertir: `DROP TABLE` de celdas y documentos (FK primero) o restore del dump | Operador |
| 4 | Regresión T-001: login, inventario, mantenimiento (fichas), dashboard | Tester |

### Decisión

- [x] Abrir **ADR** (no reusar `v2_cronograma_mantenimiento` como Gantt)
- [x] Seguir a **diseño** (D-007)
- [ ] Seguir a implementación I-010 — **solo después** de aprobar ADR-003 y D-007
- [ ] Rechazar / recortar alcance

**Go/no-go:** GO a diseño. NO-GO a código hasta ese cierre.

---

## Enmienda I-014 (2026-09-15) — cantidad, no turno

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | Xn = PC/laptop atendidos ese día; unique área+fecha |
| **Prompt** | I-014 |
| **Entradas** | R-006 v1.6, declaración oral 2026-09-15 |

| Categoría | Nivel | Notas |
|-----------|-------|--------|
| Base de datos | **Alto** | `ALTER` `cantidad`; fusionar duplicados por turno; unique `(cronograma_id, area_id, fecha)`. Dump previo |
| Modelos / API | **Medio** | POST `{ area_id, fecha, cantidad }`; cobertura = suma(Xn) vs PC+laptop |
| Frontend | **Medio** | Una columna/día + popover; no 10 columnas |
| Tests | **Medio** | CRN-006…008; `codigoCantidad` / `maxCantidadDia` |
| Documentación | **Medio** | R-01 Xn, ADR-003, D-007, contrato, changelog 0.10.4 |

Rollback: restore dump previo al ALTER; la columna `turno` no se elimina.

---

## Enmienda I-015 (2026-09-16) — PDF A4 y baja del documento

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | Impresión A4 (2 meses, L–V), calendario del año del plan, DELETE del cronograma |
| **Prompt** | I-015 |
| **Entradas** | R-006 v1.7, declaración 2026-09-16 |

| Categoría | Nivel | Notas |
|-----------|-------|--------|
| Base de datos | **Bajo** | Sin ALTER. `ON DELETE CASCADE` ya existe en celdas, horarios y personal |
| Modelos / API | **Medio** | `DELETE /cronogramas/{id}`; POST celda rechaza fin de semana; PDF A4 |
| Frontend | **Medio** | Matriz L–V; confirmar baja en historial; mes inicial = ene si el año ≠ actual |
| Tests | **Medio** | Laborables 2027/2028; pares de meses; CRN-013…016 |
| Documentación | **Medio** | HU-CRN-004/014, contrato, changelog 0.10.5 |
| ML / FastAPI | **Nulo** | — |

Rollback: revertir I-015; los PDF A3 anteriores no se regeneran. La baja es irreversible (no hay papelera).

## Enmienda I-016 (2026-09-17) — Encaje del PDF y pie bordeado

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | Textos del Gantt sin distorsión; HORA PROGRAMADA con reja; columnas PC/LAPTOP/IMPRESORA más estrechas |
| **Prompt** | I-016 |
| **Entradas** | R-006 v1.8, PDF 0.10.5 |

| Categoría | Nivel | Notas |
|-----------|-------|--------|
| Base de datos | **Nulo** | Sin ALTER |
| Modelos / API | **Bajo** | Solo HTML/CSS de `ReporteController` (pie en una tabla `.pie-grid`) |
| Frontend | **Nulo** | Sin cambio de UI |
| Tests | **Bajo** | CRN-016 visual; PHPUnit laborables ya existían |
| Documentación | **Medio** | HU-CRN-004, changelog 0.10.6 |
| ML / FastAPI | **Nulo** | — |

Rollback: revertir I-016; el PDF vuelve al encaje 0.10.5 (textos aplastados / pie sin borde).

## Enmienda I-017 (2026-09-17) — Gerencias y CRUD de áreas

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | Catálogo de gerencias, editar/eliminar área, bandas en cronograma/PDF |
| **Prompt** | I-017 |
| **Entradas** | R-006 v1.9, papel 2024 |

| Categoría | Nivel | Notas |
|-----------|-------|--------|
| Base de datos | **Medio** | `v2_gerencias`; `v2_areas.gerencia_id` SET NULL |
| Modelos / API | **Medio** | `/gerencias`; PUT/DELETE `/areas`; requireAdmin |
| Frontend | **Medio** | Configuración + bandas en matriz |
| Tests | **Medio** | AreaTest; bandas PHPUnit/Vitest; CFG-009…011, CRN-017 |
| Documentación | **Medio** | HU-CFG-007/008, HU-CRN-015, changelog 0.10.7 |
| ML / FastAPI | **Nulo** | — |

Rollback: revertir I-017 y `migrate_gerencias.php` no se deshace solo (guardar dump).

## Cierre Incremento 8 (2026-09-17)

El responsable dio por terminada esta parte. No hay más enmiendas de cronograma hasta un R-* nuevo. Producto **0.10.7**.

