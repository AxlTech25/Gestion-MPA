# I-014 — Cantidad Xn por día (no turnos)

| Campo | Valor |
|-------|-------|
| **Código** | I-014 |
| **Título** | Xn = PCs/laptops atendidos ese día; una columna por día |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Few-shot (I-013) |
| **Autor / revisor** | Equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | 0.10.4 |
| **Historias** | HU-CRN-001–003, HU-CRN-006, HU-CRN-013 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19.

Contexto: Sigemad MPA 0.10.3. X1/X2 no son mañana/tarde: son cuántos
PC o laptop se atienden ese día. No separar el día en dos columnas.
Un área con 10 equipos puede ser X2 un día y X3 otro; no auto-rellenar.

Objetivo: Asiento = cronograma + área + fecha + cantidad. UI: una
columna por día; clic abre selector X1…Xn (n = PC+laptop del área).
PDF pinta Xn. Cobertura = suma(cantidad) vs PC+laptop.

Tarea: SQL cantidad + UNIQUE(área,fecha); migrar duplicados de turno;
API POST {area_id,fecha,cantidad}; matriz y PDF; tests; changelog 0.10.4.

Restricciones: no 10 columnas; no auto-fill; impresoras no entran en Xn;
Practicante no escribe; no mezclar con fichas.
```

### Checklist D1 (cap. 11.1)

- [x] El rol del LLM está definido.
- [x] El contexto del sistema es suficiente.
- [x] La tarea es específica y verificable.
- [x] El formato de salida está definido (SQL, API, UI, tests, changelog).
- [x] Hay restricciones técnicas y de seguridad.
- [x] Hay ejemplo (few-shot I-013).
- [x] Hay criterios de aceptación observables.
- [x] Se prohibieron auto-fill, 10 columnas y escritura del practicante.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| DDL / migrate | `backend/sql/v2_cronogramas.sql`, `backend/tools/migrate_cronograma.php` |
| Modelo / API | `Cronograma.php`, `CronogramaController.php` |
| UI | `CronogramaMatrizPage.jsx`, `CronogramaCantidadPopover.jsx` |
| PDF | `ReporteController.php` |
| Tests | `CronogramaTest.php`, `cronogramaUtils.test.js` |
| Changelog | `documents/05_mantenimiento/changelog.md` 0.10.4 |

Salida usada como entrada de **T-001** (casos CRN-006…008) y **M-003** (contrato, ADR, matriz).

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | Una columna/día; selector X1…Xn; RH X2 y X3 en días distintos (navegador); PHPUnit 6/6; Vitest 9/9 |
| **N.º de iteraciones** | 1 (mismo hilo que el código; el D1 se cerró en la pasada) |
| **Diagnóstico** | I-010 tomó X1/X2 como turnos; el papel y el responsable usan Xn como cantidad |
| **Decisión** | **Ejecutado** (pendiente revisión humana del registro) |
| **Lección** | No partir el día en columnas: el máximo del selector es PC+laptop, no el número de días |

| Relación | Valor |
|----------|-------|
| Anterior | R-006 v1.6, ADR-003 enmienda, I-013 |
| Siguiente | T-001 v1.3 / revisión humana |
| Commit sugerido | `feat(cronograma): Xn como cantidad de PC/laptop por día [I-014]` |
