# I-016 — Encaje del PDF, HORA PROGRAMADA con borde y columnas compactas

| Campo | Valor |
|-------|-------|
| **Código** | I-016 |
| **Título** | PDF: textos sin distorsión, HORA PROGRAMADA con reja y equipos más estrechos |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (I-015) |
| **Autor / revisor** | Equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Incremento / versión producto** | 0.10.6 |
| **Historias** | HU-CRN-004 (refino de impresión) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / Dompdf.

Contexto: Sigemad MPA 0.10.5. El PDF A4 (I-015) aplastaba ÁREA y
EQUIPOS DE CÓMPUTO (colspan de mes = días calendario vs solo L–V).
Luego N° quedó enorme, PC/LAP/IMP eran acrónimos, y dos tablas
(identidad vs meses) no cuadraban. El responsable pidió: encajar
letras de áreas y equipos; N° para dos dígitos; PC, LAPTOP e
IMPRESORA completos; una sola grilla alineada con los meses.
Para cerrar: documentar al estilo I-015; HORA PROGRAMADA debe
mostrar N°, EQUIPO y HORARIO con borde (aparecía sin reja);
reducir un poco el ancho de las columnas de equipos (hay blanco).

Objetivo: PDF legible en una sola tabla; pie HORA PROGRAMADA con
celdas N° / EQUIPO / HORARIO bordeadas; columnas PC/LAPTOP/IMPRESORA
compactas. Documentar R→D→I→T (0.10.6).

Tarea: ReporteController (colspan laborable, una tabla, N° estrecho,
nombres completos, CSS del pie, anchos pc/lap/imp); changelog 0.10.6;
registro I-016 y cadena R-006 / D-007 / T-001.

Restricciones: no auto-fill; no quitar N°/área/conteos; no volver a
A3; no partir el día en turnos; practicante no escribe; no mezclar
con fichas.

Criterios: áreas se leen por palabra; PC/LAPTOP/IMPRESORA completos
y más estrechos que 0.10.5; filas Xn alineadas al área; HORA
PROGRAMADA con borde en las tres columnas; tests PHPUnit de
laborables siguen verdes.
```

### Checklist D1 (cap. 11.1)

- [x] El rol del LLM está definido.
- [x] El contexto del sistema es suficiente.
- [x] La tarea es específica y verificable.
- [x] El formato de salida está definido (PDF, changelog, I-016).
- [x] Hay restricciones técnicas y de seguridad.
- [x] Hay ejemplo (few-shot I-015).
- [x] Hay criterios de aceptación observables.
- [x] Se prohibieron auto-fill, quitar conteos y escritura del practicante.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| PDF | `backend/api/v2/controllers/ReporteController.php` (`htmlMatrizCronograma`, `htmlPiePersonal`, `estilosCronogramaPdf`) |
| Helper | `Cronograma::cantidadLaborablesDelMes` (colspan = L–V) |
| Changelog | `documents/05_mantenimiento/changelog.md` 0.10.6 |

Causa del pie sin borde: una tabla anidada heredaba `border: 0` del contenedor (antes `.cols td`). HORA PROGRAMADA es ahora **una sola tabla** (`.pie-grid`) con N°, EQUIPO, HORARIO y la nota a la derecha; cada celda lleva el mismo borde de 1px. Columnas PC / LAPTOP / IMPRESORA: `width: 1%` + `nowrap` para que no absorban el blanco de la hoja.

Salida usada como entrada de **T-001** v1.5 (CRN-016).

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit CronogramaTest (laborables); PDF 2026: HORA PROGRAMADA con N°/EQUIPO/HORARIO bordeados; PC/LAPTOP/IMPRESORA al ancho del texto |
| **N.º de iteraciones** | 2 (encaje de matriz; luego pie + ancho de equipos) |
| **Diagnóstico** | `table-layout:fixed` + colspan de 31 días aplastaba textos; dos tablas no alineaban filas; `.cols td` quitaba bordes del pie |
| **Decisión** | **Ejecutado** (pendiente revisión humana del registro) |
| **Lección** | Una sola tabla (layout auto) mantiene filas con los meses; el colspan del mes debe ser el conteo laborable, no `date('t')` |

| Relación | Valor |
|----------|-------|
| Anterior | R-006 v1.8, D-007 refinamiento I-016, I-015 |
| Siguiente | T-001 v1.5 / revisión humana |
| Commit sugerido | `fix(cronograma): encaje PDF, HORA PROGRAMADA con borde [I-016]` |
