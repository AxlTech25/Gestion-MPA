# I-013 — Equipo de trabajo en HORA PROGRAMADA

| Campo | Valor |
|-------|-------|
| **Código** | I-013 |
| **Título** | Personal que realiza el preventivo (recuadro HORA PROGRAMADA) |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Few-shot (I-012) |
| **Autor / revisor** | Equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | 0.10.3 |
| **Historias** | HU-CRN-004, HU-CRN-012 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19.

Contexto: El PDF tenía «horario por equipo programado» (PCs del
inventario). El papel muestra un recuadro pequeño HORA PROGRAMADA
(N°, EQUIPO, HORARIO). El EQUIPO de esa tabla son las personas que
harán el mantenimiento, no los bienes del área. Debe poder cambiarse.

Objetivo: Recuadro editable en la matriz y en el PDF. Quitar del PDF
la tabla grande de horas por CPU/laptop/impresora.

Tarea:
1. Tabla v2_cronograma_personal (nombre, hora_inicio, hora_fin).
   Semilla PC 01 10:00–13:00 y PC 02 14:00–17:00.
2. PUT /cronogramas/{id}/personal. Panel pequeño en la matriz.
3. PDF: recuadro HORA PROGRAMADA + NOTA al pie de la matriz. Sin
   hoja «HORARIO POR EQUIPO PROGRAMADO».

Restricciones: Practicante no escribe; no dual-write.

Criterios: se edita el nombre de la persona y se ve igual en el PDF.

No hacer: auto-rellenar el Gantt.
```

### Checklist D1

- [x] Rol, contexto, tarea, restricciones, criterios, no hacer

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| SQL | `v2_cronograma_personal` |
| UI | `CronogramaPersonalPanel.jsx` |
| PDF | pie de `htmlMatrizCronograma` |

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Panel + PDF recuadro |
| **N.º de iteraciones** | 1 |
| **Decisión** | Ejecutado |
| **Lección** | En el papel «EQUIPO» del recuadro es el equipo humano, no el inventario |

| Relación | Valor |
|----------|-------|
| Anterior | I-012 |
| Siguiente | Revisión humana |
| Commit sugerido | `feat(cronograma): personal editable en HORA PROGRAMADA [I-013]` |
