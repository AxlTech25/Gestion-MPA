# I-010 — Módulo Cronograma (historial + matriz)

| Campo | Valor |
|-------|-------|
| **Código** | I-010 |
| **Título** | Cronograma de preventivo por área |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Few-shot (I-003 / I-009) |
| **Autor / revisor** | Equipo Sigemad MPA / revisión humana al integrar |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | Incremento 8 / 0.10.0 |
| **Historias** | HU-CRN-001 … HU-CRN-009 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Entradas: [D-007](../02_diseno/D-007_cronograma_v1.md), [ADR-003](../../documents/02_diseno/adr/ADR-003-cronograma-documento-celdas.md), [M-002](../05_mantenimiento/M-002_cronograma_v1.md).

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19 (Vite, Tailwind).

Contexto: Sigemad MPA 0.9.1. R-006 y D-007 aprobados. ADR-003: tablas
v2_cronogramas y v2_cronograma_celdas. No usar v2_cronograma_mantenimiento.
No dual-write. No auto-rellenar. JWT + requireRole Administrador|Tecnico
en escritura. Feature folders. PDF blob con Bearer.

Objetivo: Incremento 8 usable: historial, alta de documento, matriz
área×día×turno, cobertura, PDF.

Tarea:
1. SQL + migrate_cronograma.php (CREATE IF NOT EXISTS).
2. Modelo Cronograma (turnos, unicidad, conteos CPU=PC, cobertura).
3. CronogramaController + routes + index.php.
4. PDF GET /reportes/cronograma/{id}.
5. Feature src/features/cronograma; Navbar «Cronograma»;
   /v2/cronograma y /v2/cronograma/:id.
6. PHPUnit (fecha en año, turnos, unicidad lógica) y Vitest (días del mes).
7. Changelog 0.10.0. Matriz: vista mensual dentro del año (no 365 columnas).

Entradas: documents/02_diseno/cronograma.md, patrones I-003/I-009.

Formato: archivos de producto + tests + changelog.

Restricciones: no ML; no DELETE del documento padre; no secretos;
Practicante GET sí / POST-DELETE 403.

Criterios: dos cronogramas el mismo año; clic crea celda; clic ocupada
libera; PDF autenticado; menú distinto de Mantenimiento.

Proceso: migrate → API → UI → tests → changelog.

No hacer: auto-generar celdas; módulo SIGA; reabrir I-003.

Ejemplos: POST /mantenimientos 201; 409 UNIQUE como usuarios duplicados.
```

### Checklist D1

- [x] Rol, contexto, tarea, formato, restricciones, criterios, no hacer, ejemplo

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| SQL / migrate | `backend/sql/v2_cronogramas.sql`, `backend/tools/migrate_cronograma.php` |
| API | `Cronograma.php`, `CronogramaController.php`, `routes/cronogramas.php` |
| PDF | `ReporteController::cronograma` |
| UI | `src/features/cronograma/` |
| Tests | `backend/tests/CronogramaTest.php`, `src/features/cronograma/utils/cronogramaUtils.test.js` |

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit 3/3; Vitest 11; UI XAMPP: historial, X1/X2, PDF, cobertura |
| **N.º de iteraciones** | 2 |
| **Decisión** | Ejecutado y verificado en navegador (XAMPP + Vite) |
| **Lección** | Vista mensual evita Gantt de 365 columnas sin recortar el año del documento |

| Relación | Valor |
|----------|-------|
| Anterior | D-007, ADR-003, M-002 |
| Siguiente | T-001 v1.2 (casos CRN escritos); corrida humana CRN-001…012 |
| Commit sugerido | `feat(cronograma): historial y matriz por área [I-010]` |
