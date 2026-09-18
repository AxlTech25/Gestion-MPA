# I-015 — PDF A4 laborable, año del documento y baja

| Campo | Valor |
|-------|-------|
| **Código** | I-015 |
| **Título** | Impresión A4 (2 meses, L–V) + fechas del año del plan + eliminar cronograma |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-16 |
| **Técnica** | Few-shot (I-012 / I-014) |
| **Autor / revisor** | Equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-16 |
| **Incremento / versión producto** | 0.10.5 |
| **Historias** | HU-CRN-004 (refino), HU-CRN-008, HU-CRN-014 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19 / Dompdf.

Contexto: Sigemad MPA 0.10.4. El PDF del cronograma es A3 apaisado,
4 meses por hoja, todos los días del mes. El responsable pidió
optimizar espacio y, además: quitar sábados y domingos; reducir
márgenes de las columnas de día; conservar N°, área, PC, laptop e
impresora; dos meses por página en A4; las fechas deben ser las del
año del documento (2027, 2028…); poder eliminar un cronograma creado.

Objetivo: PDF A4 apaisado, lunes–viernes, 2 meses/hoja, cabeceras
ENE-2028 etc. según cronograma.anio. DELETE /cronogramas/{id} con
CASCADE. Matriz en pantalla también oculta fines de semana.

Tarea: helpers laborables + pares de meses; ReporteController A4;
API destroy; UI historial (confirmar baja); tests PHPUnit/Vitest;
changelog 0.10.5.

Restricciones: no auto-fill; no 10 columnas; no borrar v2_cronograma_mantenimiento;
Practicante no escribe ni elimina; no mezclar con fichas; no quitar
columnas N°/área/PC/laptop/impresora.
```

### Checklist D1 (cap. 11.1)

- [x] El rol del LLM está definido.
- [x] El contexto del sistema es suficiente.
- [x] La tarea es específica y verificable.
- [x] El formato de salida está definido (PDF, API, UI, tests, changelog).
- [x] Hay restricciones técnicas y de seguridad.
- [x] Hay ejemplo (few-shot I-012/I-014).
- [x] Hay criterios de aceptación observables.
- [x] Se prohibieron auto-fill, quitar conteos y escritura del practicante.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Modelo / API | `Cronograma.php`, `CronogramaController.php`, `routes/cronogramas.php` |
| PDF | `ReporteController.php` |
| UI | `CronogramaListPage.jsx`, `CronogramaMatrizPage.jsx`, `cronogramaService.js` |
| Utils | `cronogramaUtils.js` |
| Tests | `CronogramaTest.php`, `cronogramaUtils.test.js` |
| Changelog | `documents/05_mantenimiento/changelog.md` 0.10.5 |

Salida usada como entrada de **T-001** (CRN-013…016).

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit (laborables, pares, año); Vitest; navegador: 2028 arranca en lunes 3 ene; baja con confirmación |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | A3×4 meses y sábados/domingos inflaban la hoja; no había DELETE del documento |
| **Decisión** | **Ejecutado** (pendiente revisión humana del registro) |
| **Lección** | El calendario del PDF y de la matriz sale de `cronograma.anio`, no de `date('Y')` |

| Relación | Valor |
|----------|-------|
| Anterior | R-006 v1.7, D-007 refinamiento I-015, I-014 |
| Siguiente | T-001 v1.4 / revisión humana |
| Commit sugerido | `feat(cronograma): PDF A4 laborable, año del plan y baja [I-015]` |
