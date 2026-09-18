# I-012 — PDF del cronograma en formato matriz (papel)

| Campo | Valor |
|-------|-------|
| **Código** | I-012 |
| **Título** | Impresión del Gantt área × día como el papel 2024 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Few-shot (I-011 / I-004) |
| **Autor / revisor** | Equipo Sigemad MPA / revisión humana al imprimir |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | 0.10.2 |
| **Historias** | HU-CRN-004 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / Dompdf.

Contexto: Sigemad MPA 0.10.1. El PDF de cronograma era un listado de
visitas. El papel 2024 es una matriz: N°, área, PC/laptop/impresora,
meses con días, marcas X1/X2 en la celda del día, SUBTOTAL, TOTAL
EQUIPOS, recuadro HORA PROGRAMADA y NOTA al usuario.

Objetivo: GET /reportes/cronograma/{id} imprime esa grilla con las
marcas del documento abierto.

Tarea:
1. Hoja A3 apaisada. Título «Cronograma de mantenimiento de equipos
   de cómputo {año}».
2. Rango de meses = primer mes con marca … último mes con marca
   (si no hay marcas, el año completo). Hasta 4 meses por hoja.
3. Un día = una columna; la celda muestra X1, X2 o X1 X2.
4. Última hoja: leyenda X1/X2, horas por equipo y la nota institucional.
5. No cambiar el asiento área+fecha+turno.

Entradas: foto del papel 2024; ReporteController::cronograma; Cronograma.php.

Formato: PHP + tests de marcaEnFecha / mesesDelRango + changelog 0.10.2.

Restricciones: JWT; no dual-write; no auto-rellenar celdas.

Criterios: el PDF se parece al papel; las X coinciden con la matriz UI.

Proceso: helpers → HTML tabla → A3 → tests.

No hacer: reabrir I-003; módulo SIGA.

Ejemplos: I-004 PDF blob; I-011 attachment.
```

### Checklist D1

- [x] Rol, contexto, tarea, formato, restricciones, criterios, no hacer, ejemplo

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| PDF matriz | `ReporteController::cronograma` y helpers |
| Tests | `CronogramaTest` (marca y rango de meses) |

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit; PDF A3 con Gantt |
| **N.º de iteraciones** | 1 |
| **Decisión** | Ejecutado |
| **Lección** | El papel usa un día = una columna; X1 y X2 conviven en la misma celda |

| Relación | Valor |
|----------|-------|
| Anterior | I-011 |
| Siguiente | Revisión humana al imprimir |
| Commit sugerido | `fix(cronograma): PDF matriz tipo papel [I-012]` |
