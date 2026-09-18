# R-006 — Elicitación del cronograma anual de mantenimiento preventivo

| Campo | Valor |
|-------|-------|
| **Código** | R-006 |
| **Título** | Cronograma anual de preventivo (papel municipal → requisitos) |
| **Fase** | Requisitos |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.9 |
| **Estado** | Cerrado (Incremento 8 / 0.10.7) |
| **Revisor** | Responsable del caso (cierre 2026-09-17: «ya estaríamos dando por terminado esta parte») |
| **Modelo** | Cursor Agent — 2026-09-15 |
| **Técnica** | Chain-of-Thought guiado (R-01) + few-shot del catálogo R-002 |
| **Autor** | Equipo Sigemad MPA (conversación con el responsable del caso) |
| **Fecha de ejecución** | 2026-09-15 |
| **Incremento / versión producto** | Incremento 8 / 0.10.7 |
| **Historias o ADR relacionados** | HU-CRN-001 … HU-CRN-009; [ADR-003](../../documents/02_diseno/adr/ADR-003-cronograma-documento-celdas.md) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Cierra la entrada de requisitos de una **extensión** del producto 0.9.1. No reescribe R-001 como si el cronograma siempre hubiera estado en alcance. I-003 sigue vigente: el historial de fichas no incluye este módulo.

---

## Prompt (anatomía D1)

```text
Rol: Actúa como analista de requisitos de software institucional. No actúes
como Scrum Master ni como implementador. No estimes en sprints.

Contexto: Sigemad MPA V2, producto 0.9.1. Cliente: unidad de informática de
la Municipalidad Provincial de Acobamba. Metodología Prompt-Centered SDLC
v1.2. El sistema ya registra inventario, ficha técnica e historial de
mantenimiento (EP-05). Existe un cronograma en papel 2024 (matriz área × día
con marcas X1/X2 y turnos 10:00–13:00 / 14:00–17:00). La tabla SQL
v2_cronograma_mantenimiento está en el esquema y no tiene UI ni API.
I-003 dice explícitamente no inventar cronograma preventivo automático.
Fuera de alcance R-001: sustituir SIGA/SIAF; portal ciudadano.

Necesidad declarada por el responsable (2026-09-15):
- Todo equipo de cómputo debe tener mantenimiento preventivo al menos una
  vez al año.
- El cronograma sirve para planear esas fechas.
- SIGA y SAF no son oficinas: son software institucional que corre en el
  servidor de la entidad; la fila del cronograma es ese servidor.
- El técnico o el administrador marca las fechas a mano, como elegir un
  asiento en el cine (celda libre → ocupada).
- El cronograma es un horario imprimible para saber cuándo le toca el
  mantenimiento a cada equipo.

Objetivo: Cerrar requisitos verificables de esta extensión: ambigüedades
R-01 (cerrado / supuesto / abierto) e historias HU-CRN con criterios
observables. Dejar listo el insumo para M-002 y diseño (D-001/D-003/D-004).

Tarea:
1. Clasificar cada hallazgo del papel y de la declaración oral (tipo,
   riesgo, pregunta, prioridad, estado).
2. No convertir un supuesto en historia implementada.
3. Redactar épica EP-09 Cronograma e historias HU-CRN-00N (Como/quiero/para)
   con estado Pendiente e incremento «8 (propuesto)».
4. Actualizar matriz de trazabilidad, índice de historias y ficha: sección
   de extensión propuesta, sin mover el alcance ya implementado de v0.9.1.
5. Distinguir planificación (cronograma) de ejecución (ficha HU-MNT-002).

Entradas disponibles:
- Foto del cronograma 2024 (áreas, PC/Laptop/Impresora, X1/X2, nota de
  acceso al usuario).
- documents/01_requisitos/ficha-proyecto.md, ambiguedades.md,
  historias_por_epica.md, personas.md.
- backend/sql/v2_estructura.sql (v2_cronograma_mantenimiento por equipo).
- prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md (no hacer
  cronograma automático).

Formato de salida:
- Registro de prompt R-006 (este archivo).
- Sección nueva en ambiguedades.md.
- Épica EP-09 en historias_por_epica.md.
- Filas nuevas en matriz_trazabilidad.md.
- Nota de extensión en ficha-proyecto.md.

Restricciones técnicas:
- No generar código, SQL, API ni UI en esta pasada.
- No usar sprint ni story points.
- No inventar generación automática de celdas (el marcado es manual).
- No inventar integración SIGA/SIAF; solo el servidor físico que los hospeda.
- Código patrimonial 12 dígitos donde se cite un equipo.
- Practicante no fue autorizado a marcar; no ampliarle ese permiso.

Criterios de aceptación:
- Toda decisión oral queda Cerrada o como Supuesto explícito.
- Toda HU-CRN tiene ≥2 criterios observables (UI, impresión o persistencia).
- Queda escrito que marcar fecha ≠ registrar ficha de mantenimiento.
- Un tester podría ejecutar los criterios cuando exista I-010, sin leer código.
- El revisor humano puede aprobar o devolver sin pasar a diseño.

Proceso sugerido: contrastar papel vs declaración oral → tabla R-01 →
historias mínimas → matriz → listar lo que queda abierto para diseño.

No hacer: no implementar; no auto-rellenar el Gantt; no reabrir I-003; no
tratar SIGA/SAF como gerencias municipales; no fingir que R-001 ya incluía
este módulo.

Ejemplos: patrón few-shot de HU-MNT-001 (Como técnico, quiero ver…, para…).
```

### Checklist D1 (cap. 11.1)

- [x] El rol del LLM está definido.
- [x] El contexto del sistema es suficiente.
- [x] La tarea es específica y verificable.
- [x] El formato de salida está definido.
- [x] Hay restricciones técnicas y de seguridad.
- [x] Hay ejemplo (patrón HU del catálogo).
- [x] Hay criterios de aceptación observables.
- [x] Se prohibieron implementación, auto-generación y reescritura de R-001.

---

## Resultado

| Artefacto | Ubicación | Commit (si aplica) |
|-----------|-----------|--------------------|
| Ambigüedades del cronograma | `documents/01_requisitos/ambiguedades.md` | Pendiente |
| Épica EP-09 e HU-CRN | `documents/01_requisitos/historias_usuario/historias_por_epica.md` | Pendiente |
| Matriz | `documents/01_requisitos/historias_usuario/matriz_trazabilidad.md` | Pendiente |
| Índice HU | `documents/01_requisitos/historias_usuario/README.md` | Pendiente |
| Extensión en ficha | `documents/01_requisitos/ficha-proyecto.md` | Pendiente |

Salida usada como entrada de la fase siguiente: **M-002** (impacto) y luego **D-001 / D-003 / D-004** cuando el revisor apruebe. No hay I-* hasta ese cierre.

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | HU-CRN-001–009; menú Cronograma; historial; varios documentos por año. |
| **N.º de iteraciones** | 9 (v1.9: gerencias y CRUD de áreas) |
| **Diagnóstico** | v1.3 unificaba “un Gantt por año” y un título largo de menú. |
| **Refinamiento** | v1.4: menú «Cronograma»; primera vista = historial; 2 o 3 (o más) por año; matriz al abrir un ítem. |
| **Decisión** | **Cerrado** (Incremento 8 / 0.10.7). El responsable dio por terminada esta parte el 2026-09-17. |
| **Lección** | El año es atributo del documento, no un filtro que sustituye al historial. |

### Checklist D2 (cap. 11.2)

- [x] Revisión humana por una persona competente.
- [x] El documento está completo para esta fase (sin código).
- [x] No hay secretos.
- [x] Xn = cantidad de PC/laptop por día (R-006 v1.6); no turnos mañana/tarde.
- [x] PDF A4 L–V, 2 meses/hoja; N°/área/conteos se conservan; se puede eliminar el plan (v1.7).
- [x] PDF: una tabla; PC/LAPTOP/IMPRESORA completos y compactos; HORA PROGRAMADA con borde (v1.8).
- [x] Cada área puede pertenecer a una gerencia; se edita y se elimina (v1.9).
- [x] Incremento 8 cerrado por el responsable (2026-09-17); no hay I-018 de cronograma.
- [x] Pantalla propia y selector de año: superados por historial v1.4.
- [x] Se registró código R-006, versión v1.9 y métrica de iteración.
- [x] La salida puede usarse como entrada de M-002 / D-*.

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior (entrada)** | R-001 ficha, R-002 catálogo 0.9.1, R-004 ambigüedades, papel 2024, declaración 2026-09-15 |
| **Fase siguiente (salida)** | Incremento 8 cerrado. Siguiente: M-001 (despliegue) u otro R-*; no más I-* de cronograma en esta oleada. |
| **Matriz doble entrada** | Función nueva (cronograma); no F-005 (historial de fichas) |
| **Mensaje de commit sugerido** | `docs(requisitos): cronograma anual por área [R-006]` |

### Plantilla de refinamiento (v1 → v1.1)

```text
Prompt original: R-006 v1
Resultado observado: quedó abierta la unidad de la celda (área vs equipo)
Evidencia: aclaración del responsable 2026-09-15 (igual que la foto; más equipos ⇒ más días; conteos PC/laptop/impresora)
Diagnóstico: contexto D1 incompleto (papel vs “ese equipo”)
Nuevo prompt: no se reescribe el bloque D1; se cierra el hallazgo en ambiguedades.md y se ajustan HU-CRN
Criterio para cerrar: fila = área; varios días por fila; conteos de inventario; marcado manual
Decisión final: granularidad por área cerrada

Prompt original: R-006 v1.1
Resultado observado: turnos X1/X2 quedaron como supuesto
Evidencia: “los turnos se deben poder programar así como también los días”
Diagnóstico: restricción D1 incompleta (día sin turno)
Nuevo prompt: no se reescribe D1; se cierra el hallazgo y HU-CRN-001–004
Criterio para cerrar: asiento = área + día + turno (X1 10:00–13:00 / X2 14:00–17:00)
Decisión final: turnos al mismo nivel que los días

Prompt original: R-006 v1.2
Resultado observado: no había pantalla propia ni año del plan
Evidencia: “otra ventana que diga cronograma de mantenimiento” + “elegir el año”
Diagnóstico: contexto de navegación y de campaña anual incompleto
Nuevo prompt: HU-CRN-007 y HU-CRN-008; supuestos 8 y 9
Criterio para cerrar: módulo distinto de fichas; título literal; selector de año; marcas no se pisan entre años
Decisión final: paquete R-006 v1.3 (superado en navegación por v1.4)

Prompt original: R-006 v1.3
Resultado observado: un Gantt por año y menú con título largo
Evidencia: menú solo «Cronograma»; historial; 2 o 3 por año; trazabilidad
Diagnóstico: el año no debe sustituir al documento de cronograma
Nuevo prompt: HU-CRN-007–009; historial primero; N documentos por año
Criterio para cerrar: menú Cronograma; listado; varios por año; matriz al abrir un ítem
Decisión final: paquete R-006 v1.4 listo para aprobación humana

Prompt original: R-006 v1.4 / I-010
Resultado observado: matriz sin pie de totales; impresión sin hora por equipo; PDF abre buscador
Evidencia: feedback 2026-09-15 (subtotal/total; horario equipo1, equipo2…; ruta de imprimir)
Diagnóstico: HU-CRN-001 sin sumas; HU-CRN-004 pedía asociar equipos pero I-010 no guardó horas; descarga blob con target=_blank
Nuevo prompt: HU-CRN-010 y HU-CRN-011; I-011; no se reescribe D1
Criterio para cerrar: pie Subtotal/Total; horas editables por equipo del área; PDF descarga archivo
Decisión final: paquete R-006 v1.5 → I-011

Prompt original: R-006 v1.5 / I-013
Resultado observado: X1/X2 se interpretaron como mañana/tarde y el día se partía en dos columnas
Evidencia: 2026-09-15 — Xn = PCs/laptops ese día; no separar el día; un área de 10 puede ser X2 un día y X3 otro
Diagnóstico: el papel usa Xn como cantidad, no como turno
Nuevo prompt: HU-CRN-013; I-014; selector X1…Xn; una columna por día
Criterio para cerrar: marca Xn; no columnas de turno; no auto-fill
Decisión final: paquete R-006 v1.6 → I-014

Prompt original: R-006 v1.6 / I-014
Resultado observado: el PDF A3 de 4 meses desperdicia hoja; hay sábados/domingos; no se puede borrar un plan; el año 2027/2028 debe gobernar las fechas
Evidencia: 2026-09-16 — quitar sáb/dom; A4 dos meses/página; márgenes de día chicos; conservar N°/área/conteos; fechas del año del documento; eliminar cronograma
Diagnóstico: HU-CRN-004 (papel A3) y falta de baja en historial
Nuevo prompt: HU-CRN-014; I-015; no se reescribe D1
Criterio para cerrar: PDF A4 L–V, 2 meses, año del documento; DELETE del plan; practicante no borra
Decisión final: paquete R-006 v1.7 → I-015

Prompt original: R-006 v1.7 / I-015
Resultado observado: ÁREA y EQUIPOS DE CÓMPUTO distorsionados; N° enorme; LAP/IMP acrónimos; dos tablas no cuadraban; HORA PROGRAMADA sin borde; columnas de equipos con blanco
Evidencia: 2026-09-16/17 — encajar letras; N° dos dígitos; PC/LAPTOP/IMPRESORA completos; una grilla; pie con reja; equipos más estrechos
Diagnóstico: colspan de mes usaba date('t'); table-layout:fixed; .cols td anulaba bordes del pie
Nuevo prompt: I-016; no se reescribe D1
Criterio para cerrar: textos legibles; una tabla; HORA PROGRAMADA N°/EQUIPO/HORARIO con borde; columnas de equipos compactas
Decisión final: paquete R-006 v1.8 → I-016

Prompt original: R-006 v1.8 / I-016
Resultado observado: el papel agrupa áreas bajo gerencia; no se podía editar ni borrar un área
Evidencia: 2026-09-17 — fila banda de gerencia; selector (no etiqueta libre); CRUD de área
Diagnóstico: organigrama incompleto en v2_areas; I-005 solo daba de alta
Nuevo prompt: HU-CFG-007/008, HU-CRN-015; I-017; no se reescribe D1
Criterio para cerrar: gerencia opcional por área; editar/eliminar área; banda en matriz/PDF; 409 si el área tiene equipos
Decisión final: paquete R-006 v1.9 → I-017

Prompt original: R-006 v1.9 / I-017
Resultado observado: gerencias, CRUD de áreas y bandas en matriz/PDF
Evidencia: 2026-09-17 — «Bien me parece excelente, ya estaríamos dando por terminado esta parte»
Diagnóstico: el alcance oral del papel 2024 quedó cubierto (historial, Xn, PDF A4, gerencias, editar/borrar área)
Nuevo prompt: no se reescribe D1; no hay I-018 de cronograma
Criterio para cerrar: revisión humana del producto 0.10.7 sin nuevo hallazgo de alcance
Decisión final: Incremento 8 cerrado
```
