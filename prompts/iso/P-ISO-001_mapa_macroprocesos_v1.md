# P-ISO-001 — Mapa de macroprocesos nivel 0

| Campo | Valor |
|-------|-------|
| **Código** | P-ISO-001 |
| **Título** | Mapa de macroprocesos de la Unidad de Tecnologías de la Información y Sistemas |
| **Fase** | Procesos (columna ID Prompt del procedimiento, matriz V4) |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado — pendiente de revisión humana |
| **Modelo** | Cursor Agent — 2026-09-30 |
| **Técnica** | Chain-of-Thought guiado |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Pendiente |
| **Fecha de ejecución** | 2026-09-30 |
| **Incremento / versión producto** | Documentación de procesos; producto 0.10.7 |
| **Historias o ADR relacionados** | ROF arts. 109-111 y 88-90; inventario MP-01…MP-03 |
| **Plantilla** | [`../gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Este prompt asiste el mapa de nivel 0. No sustituye los prompts I-* del código.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de procesos institucionales (ISO 9001:2015, cláusula 4.4)
para una unidad orgánica municipal. El entregable lo dibujará una persona en Bizagi.

Contexto: Municipalidad Provincial de Acobamba. Ordenanza Municipal
N.° 014-2019/MPA, Reglamento de Organización y Funciones. La unidad del caso
es la Unidad de Tecnologías de la Información y Sistemas, artículos 109 a 111
(páginas 63-64): depende de la Gerencia de Planificación y Presupuesto y da
apoyo tecnológico a las demás unidades orgánicas. La Unidad de Patrimonio,
artículos 88 a 90 (páginas 53-54), depende de la Gerencia de Administración
y lleva el inventario de bienes muebles e inmuebles. Sigemad MPA V2 automatiza
solo el inventario de equipos de cómputo y el mantenimiento preventivo y
correctivo. MP-03 Gobernanza del sistema (acceso, áreas, personal, gerencias,
indicadores) es apoyo del software y vive en la matriz de funciones; no es
una función del ROF.

Objetivo: Especificar el mapa de macroprocesos de nivel 0 de esa unidad, con
ficha corta de las cajas que no llevan diagrama de flujo.

Tarea: Producir un documento con:
1) el mapa en tres bandas (estratégico, operativo, apoyo), entradas y salidas;
2) una tabla por caja: código, nombre, tipo, numeral del artículo 111, dueño,
   entrada, salida, y si Sigemad lo cubre;
3) ficha de una página para MP-00, MP-04, MP-05 y MP-06 (objetivo, dueño,
   entrada, salida, qué queda fuera);
4) la flecha hacia la Unidad de Patrimonio, fuera de la unidad de TI.

Cajas obligatorias:
- MP-00 Planificación de tecnologías de la información (art. 111, nums. 4, 7 y 9).
- MP-01 Gestión de activos informáticos (art. 111, num. 11). Sigemad: equipos.
- MP-02 Mantenimiento de recursos informáticos (art. 111, num. 3). Sigemad.
- MP-04 Asistencia técnica a usuarios (art. 111, nums. 6 y 14).
- MP-05 Operación de la plataforma tecnológica (art. 111, nums. 5, 8 y 10).
- MP-06 Recursos de TI: licencias, especificaciones de compra y capacitación
  (art. 111, nums. 12, 16 y 13). La contratación la hace Abastecimiento.

Entradas disponibles:
- ROF, arts. 109-111 y 88-90, ya leídos.
- Inventario Sigemad: documents/ISO/plantillas/inventario_procesos.md
  (MP-01, MP-02, MP-03 y sus PR/ACT). No redefinir esos procedimientos aquí.
- Ficha de proyecto: fuera de alcance el portal ciudadano, los bienes no TI
  y SIGA/SIAF.

Formato de salida: Markdown. Un diagrama Mermaid del nivel 0. Tablas para
las cajas y las fichas. Sin BPMN de actividades. Ruta:
documents/ISO/mapas/nivel_0_unidad_ti.md

Restricciones técnicas:
- Una caja = una función o un grupo de numerales del artículo 111, citados.
- Patrimonio es otra unidad: flecha lateral, no caja interna.
- MP-03 no entra en este mapa.
- El portal queda dentro de MP-05, no como macroproceso propio.

Criterios de aceptación:
- Las seis cajas citan el numeral del artículo 111.
- Se distingue qué cubre Sigemad (MP-01 equipos y MP-02) y qué no.
- Un revisor puede dibujar la hoja en Bizagi sin agregar procesos.

Proceso sugerido: 1) fijar el límite de la unidad, 2) agrupar numerales en
las seis cajas, 3) marcar alcance Sigemad, 4) escribir la ficha de las cajas
sin flujo, 5) colocar la flecha a Patrimonio.

No hacer:
- No usar la Resolución Directoral N.° 4026-2022-JUS (expediente Equifax).
- No crear mesa de ayuda, ticket, conformidad del usuario, proveedor,
  continuidad, seguridad o innovación como cajas distintas de las seis.
- No inventar un trámite de baja patrimonial.
- No modificar inventario_procesos.md ni el Excel de la matriz.
- No dibujar el flujo as-is ni to-be (eso es P-ISO-002 y P-ISO-003).

Ejemplos: N/A. El agrupamiento de cajas de esta tarea es la referencia.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto suficiente
- [x] Tarea verificable
- [x] Formato definido
- [x] Restricciones
- [ ] Ejemplos (N/A — el agrupamiento va en la tarea)
- [x] Criterios de aceptación
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Mapa de nivel 0 y fichas sin flujo | `documents/ISO/mapas/nivel_0_unidad_ti.md` | Pendiente |

Salida usada como contexto de **P-ISO-002** y **P-ISO-003**. El PNG de Bizagi se exporta después de la revisión humana.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Checklist del propio prompt: seis cajas con numeral, Sigemad marcado, Patrimonio fuera, MP-03 ausente |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | N/A hasta la revisión |
| **Refinamiento** | 2026-09-30, misma v1: bandas explícitas; parque de informática; elaboración propia. Cada proceso del nivel 0 tiene as-is y to-be en el desglose |
| **Decisión** | Pendiente de revisión humana. No marcar Aprobado ni cargar la columna de la matriz |
| **Lección** | El ROF da funciones, no la secuencia del flujo. El nivel 0 se cierra en esta pasada; el BPMN va en otro prompt |

### Checklist D2

- [ ] Revisión humana
- [x] Documento completo respecto de la tarea
- [ ] PNG de Bizagi (aún no; la spec es la entrada del dibujo)
- [x] Sin secretos
- [x] Decisiones citadas al artículo 111
- [ ] Commit y columna de la matriz (esperan la aprobación)
- [x] Sirve de entrada a P-ISO-002 y P-ISO-003

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior (entrada)** | ROF arts. 109-111 y 88-90; ficha de proyecto; inventario MP-01…MP-03 |
| **Fase siguiente (salida)** | P-ISO-002 (MP-02), P-ISO-003 (MP-01), Apéndice G del Anexo 07 |
| **Matriz doble entrada** | No llena una fila F-*. La columna ID Prompt (Procedimiento) sigue en N/A hasta aprobar el diagrama |
| **Mensaje de commit sugerido** | `docs(procesos): mapa de macroprocesos nivel 0 [P-ISO-001]` |
