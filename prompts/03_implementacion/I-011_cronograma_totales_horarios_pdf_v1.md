# I-011 — Totales, horario por equipo e impresión PDF

| Campo | Valor |
|-------|-------|
| **Código** | I-011 |
| **Título** | Totales en matriz, horas por equipo e impresión PDF |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Few-shot (I-010) |
| **Autor / revisor** | Equipo Sigemad MPA / revisión humana al usar XAMPP |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | Incremento 8 parche / 0.10.1 |
| **Historias** | HU-CRN-001, HU-CRN-004, HU-CRN-010, HU-CRN-011 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Entradas: [R-006 v1.5](../01_requisitos/R-006_cronograma_anual_v1.md), [D-007](../02_diseno/D-007_cronograma_v1.md), [I-010](./I-010_cronograma_v1.md).

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19 (Vite, Tailwind).

Contexto: Sigemad MPA 0.10.0. I-010 entregó historial + matriz área×día×turno.
Feedback: (1) faltan subtotal y total de equipos; (2) hay que programar
hora de cada equipo del área (equipo1, equipo2…) para la impresión;
(3) Imprimir PDF abre una pestaña/Google: downloadPdf usa target=_blank
sin atributo download; CORS manda Content-Type JSON antes del PDF.

Objetivo: Parche 0.10.1 usable. El asiento sigue siendo área+fecha+turno
(ADR-003). Las horas por equipo son detalle de impresión, no dual-write
a v2_cronograma_mantenimiento.

Tarea:
1. Totales: columna Tot por fila; pie Subtotal (PC, Lap, Imp) y Total.
2. Tabla v2_cronograma_horarios (celda_id, equipo_id, hora_inicio, hora_fin).
   Al ocupar, sembrar con horario del turno. Modal para editar. PUT.
3. PDF lista equipo + horas. downloadPdf: blob + download, sin target=_blank;
   detectar %PDF; Content-Type application/pdf en renderPdf.

Entradas: Cronograma.php, CronogramaMatrizPage, lib/api.js downloadPdf.

Formato: SQL + migrate, API, UI, PDF, tests, changelog 0.10.1.

Restricciones: no auto-rellenar celdas del Gantt; Practicante no escribe;
no mezclar con /v2/mantenimiento.

Criterios: pie de totales; modal horas; PDF descarga archivo, no Google.

Proceso: migrate → API → UI → PDF → tests.

No hacer: cambiar la unicidad del asiento; módulo SIGA.

Ejemplos: I-010 POST celdas 201; downloadFile() ya usa link.download.
```

### Checklist D1

- [x] Rol, contexto, tarea, formato, restricciones, criterios, no hacer, ejemplo

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| SQL / migrate | `backend/sql/v2_cronogramas.sql`, `backend/tools/migrate_cronograma.php` |
| API | `Cronograma.php`, `CronogramaController.php`, `routes/cronogramas.php` |
| PDF / blob | `ReporteController`, `src/lib/api.js` |
| UI | `CronogramaMatrizPage.jsx`, `CronogramaHorariosModal.jsx` |
| Tests | `CronogramaTest.php`, `cronogramaUtils.test.js` |

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit 4/4; Vitest 7; UI: Tot/Subtotal/Total, modal Equipo 1, PDF sin salir de la matriz |
| **N.º de iteraciones** | 1 |
| **Decisión** | Ejecutado y verificado en XAMPP + Vite |
| **Lección** | `target=_blank` sobre blob sin `download` abre una pestaña vacía (búsqueda) |

| Relación | Valor |
|----------|-------|
| Anterior | I-010, R-006 v1.5 |
| Siguiente | T-001 CRN-013… (plan); revisión humana |
| Commit sugerido | `fix(cronograma): totales, horas por equipo y descarga PDF [I-011]` |
