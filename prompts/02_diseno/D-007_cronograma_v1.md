# D-007 — Diseño del módulo Cronograma

| Campo | Valor |
|-------|-------|
| **Código** | D-007 |
| **Título** | Cronograma: modelo, contrato API y frontend |
| **Fase** | Diseño |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Cerrado (Incremento 8 / 0.10.7) |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | CoT + few-shot (D-003/D-004) |
| **Autor / revisor** | Equipo Sigemad MPA / responsable del caso (cierre 2026-09-17) |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | Incremento 8 / 0.10.7 (cerrado) |
| **Historias o ADR relacionados** | HU-CRN-001–009, ADR-003, M-002 cronograma |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como arquitecto de software (MySQL + API PHP + React 19).

Contexto: Sigemad MPA V2 0.9.1. R-006 aprobado. M-002: impacto alto en BD
y API; ML nulo. ADR-003: documento + celdas por área; no reusar
v2_cronograma_mantenimiento. Patrones: JSON {success,data,message}, JWT,
requireRole, feature folders, PDF blob.

Objetivo: Diseño implementable en un I-010 sin reabrir I-003.

Tarea:
1. DDL de v2_cronogramas y v2_cronograma_celdas (unicidad, turnos, horarios).
2. Contrato REST (método, ruta, auth, cuerpo).
3. Pantallas: historial / matriz / impresión; rutas y Navbar «Cronograma».
4. Cómo se arman conteos y cobertura desde inventario.
5. Fuera de I-010 explícito.

Entradas: R-006, impacto_cronograma.md, ADR-003, D-003, D-004, er_v2.md.

Formato: documents/02_diseno/cronograma.md; parches a er_v2.md,
contrato_api_v2.md, frontend_features.md.

Restricciones: no código de producto; no FastAPI; CPU del inventario = PC
del papel; Practicante no escribe.

Criterios: I-010 puede copiar rutas y tablas; unicidad
(cronograma, área, fecha, turno); 2+ documentos el mismo año.

Proceso: modelo → API → UI → trazabilidad HU.

No hacer: auto-generar Gantt; dual-write; módulo SIGA.

Ejemplos: POST /mantenimientos (JWT, 201, 400) como few-shot de contrato.
```

### Checklist D1

- [x] Rol, contexto, tarea, formato, restricciones, criterios, no hacer, ejemplo

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Spec | `documents/02_diseno/cronograma.md` |
| ADR | `documents/02_diseno/adr/ADR-003-cronograma-documento-celdas.md` |
| ER | `documents/02_diseno/er_v2.md` (extensión) |
| Contrato | `documents/02_diseno/contrato_api_v2.md` |
| Front | `documents/02_diseno/frontend_features.md` |

Salida de **I-010**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Tablas + unicidad; 8 rutas; 2 pantallas; HU cubiertas |
| **N.º de iteraciones** | 1 |
| **Decisión** | **Aprobado** (Incremento 8 cerrado 2026-09-17; ADR-003 vigente) |
| **Lección** | El historial es la entidad raíz; la matriz es el detalle |

| Relación | Valor |
|----------|-------|
| Anterior | R-006, M-002 cronograma |
| Siguiente | Incremento 8 cerrado (I-010…I-017). M-001 u otro R-*. |
| Commit sugerido | `docs(diseno): módulo cronograma [D-007]` |

### Refinamiento I-014 (2026-09-15)

No se reescribe el D1 de D-007. El spec vivo (`cronograma.md`) y ADR-003 enmienda pasan el asiento a **área + fecha + cantidad**. Unicidad `(cronograma_id, area_id, fecha)`. La UI es una columna por día + selector X1…Xn.

### Refinamiento I-015 (2026-09-16)

PDF: **A4 apaisado**, **2 meses por hoja**, solo **lunes–viernes**, celdas de día compactas. Se conservan N°, área, PC, laptop, impresora. Las fechas (y el weekday) son del **`anio` del documento**. Pares Ene–Feb … Nov–Dic; si hay marcas, solo los pares que cubren el rango marcado. `DELETE /cronogramas/{id}` (Admin/Técnico, CASCADE). La matriz en pantalla también oculta sábados y domingos.

### Refinamiento I-016 (2026-09-17)

Una sola tabla Gantt (sin partir identidad/meses). `colspan` del mes = días laborables. N° para dos dígitos; cabeceras **PC / LAPTOP / IMPRESORA** completas y al ancho del texto (`width: 1%` + nowrap). Pie **HORA PROGRAMADA** en una sola tabla (N°, EQUIPO, HORARIO + nota), con borde de 1px en cada celda.

### Refinamiento I-017 (2026-09-17)

Catálogo `v2_gerencias`. `v2_areas.gerencia_id` opcional (SET NULL). Configuración: selector de gerencia; editar/eliminar área (409 si hay equipos). Matriz y PDF: fila banda de gerencia; N° continuo; sin asignaciones no hay bandas.

### Cierre del Incremento 8 (2026-09-17)

El responsable dio por **terminada** esta parte. D-007 no abre más refinamientos de cronograma hasta un R-* nuevo.
