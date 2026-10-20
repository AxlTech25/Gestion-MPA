# P-ISO-002 — Mapas as-is y to-be de MP-02

| Campo | Valor |
|-------|-------|
| **Código** | P-ISO-002 |
| **Título** | Mapa del proceso de mantenimiento informático, situación actual y situación con Sigemad |
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
| **Historias o ADR relacionados** | Art. 111 num. 3; R-006; inventario PR-02-01…PR-02-04 |
| **Plantilla** | [`../gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Un solo par as-is / to-be del proceso MP-02. Los procedimientos PR-02-* ya están en el inventario; este prompt no los vuelve a inventar.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de procesos. Preparas la especificación que una
persona va a dibujar en Bizagi (dos diagramas: as-is y to-be). No exportes
un PNG.

Contexto: MP-02 Mantenimiento de recursos informáticos. Fuente institucional:
ROF de la Municipalidad Provincial de Acobamba, artículo 111 numeral 3:
planificar, programar, ejecutar y supervisar el mantenimiento preventivo y
correctivo de los recursos informáticos. Fuente del as-is ya escrita en el
proyecto: cronograma en papel 2024 (documents/01_requisitos/ambiguedades.md,
extensión R-006): al menos una vez al año; marcado manual; por área; Xn es
la cantidad de PC o laptop que se atienden ese día; la celda no reemplaza
la ficha de ejecución; se imprime; el papel agrupa áreas por gerencia.
To-be: Sigemad, procedimientos ya inventariados PR-02-01 a PR-02-04
(intervención, priorización, cronograma anual, reportes). ML es opcional
(ADR-002): si FastAPI no responde, el registro igual se cierra.

Objetivo: Dejar listos los dos diagramas del cuerpo de la tesis (figura
as-is y figura to-be del mismo proceso).

Tarea: Redactar la especificación de dibujo con carriles, inicio, actividades
en orden, compuertas permitidas y fin. Separar lo evidenciado de lo que no
está en las fuentes. El to-be usa los mismos actores; solo cambia el registro,
que pasa al sistema.

Entradas disponibles:
- Art. 111 numeral 3.
- Ambigüedades del cronograma en papel 2024 (R-006).
- documents/ISO/plantillas/inventario_procesos.md, sección MP-02.
- documents/ISO/mapas/nivel_0_unidad_ti.md (P-ISO-001).

Formato de salida: Markdown con dos secciones (as-is y to-be). Cada actividad
lleva: nombre, carril, y fuente (art. 111.3, papel 2024, o procedimiento
PR-02-*). Si el medio o el paso no está en esas fuentes, la actividad se
omite y se anota en "No dibujar". Ruta:
documents/ISO/mapas/MP-02_mantenimiento_as_is_to_be.md

Restricciones técnicas:
- Carriles del as-is: Área usuaria y Unidad de TI. El papel es el registro,
  no un tercer actor.
- Carriles del to-be: Unidad de TI (Administrador o Técnico opera el sistema).
  Sigemad no es un pool que decide.
- Compuertas permitidas en el to-be: preventivo o correctivo; el equipo está
  o no está en el inventario (si no está, alta por MP-01 y se vuelve);
  FastAPI activo o no (el flujo sigue).
- Xn, A4, lunes a viernes, bandas de gerencia y personal solo en el to-be,
  porque así quedó el sistema. En el as-is, Xn y gerencia solo si constan
  en el papel 2024.

Criterios de aceptación:
- As-is y to-be describen el mismo proceso (mantenimiento preventivo y
  correctivo).
- Cada actividad cita una fuente.
- La lista "No dibujar" incluye ticket, conformidad del usuario y proveedor
  si no están en el ROF ni en R-006.
- Un revisor puede pasar la lista a Bizagi sin agregar tareas.

Proceso sugerido: 1) listar verbos del numeral 3, 2) colocar solo los hechos
del papel 2024 en el as-is, 3) colocar los PR-02-* en el to-be, 4) tachar
lo no documentado.

No hacer:
- No reutilizar los flujos M.01 a M.05 ya dibujados (mesa de ayuda,
  infraestructura, proveedor, conformidad).
- No inventar cuaderno, Excel, WhatsApp ni correo como medio del as-is.
- No convertir la marca del cronograma en "mantenimiento ya ejecutado".
- No pedir integración con SIGA/SIAF.

Ejemplos: N/A.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto suficiente
- [x] Tarea verificable
- [x] Formato definido
- [x] Restricciones
- [ ] Ejemplos (N/A)
- [x] Criterios de aceptación
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Spec as-is y to-be de MP-02 | `documents/ISO/mapas/MP-02_mantenimiento_as_is_to_be.md` | Pendiente |

Cuando el revisor apruebe la spec y exporte el PNG, los procedimientos PR-02-01…PR-02-04 pueden citar este código en la columna ID Prompt (Procedimiento). Hasta entonces esa columna sigue en N/A.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Cada actividad tiene fuente; la lista "No dibujar" está presente |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | N/A hasta la revisión |
| **Refinamiento** | 2026-09-30, misma v1: objetos de datos, y desglose as-is / to-be por PR-02-03, PR-02-01, PR-02-04 y PR-02-02 |
| **Decisión** | Pendiente de revisión humana |
| **Lección** | El as-is de este proceso está documentado en el papel 2024. Lo que el ROF no secuencia no se dibuja |

### Checklist D2

- [ ] Revisión humana
- [x] Documento completo respecto de la tarea
- [ ] PNG de Bizagi
- [x] Sin secretos
- [x] Actividades ligadas a fuente
- [ ] Commit y columna de la matriz
- [x] Sirve para dibujar las figuras as-is y to-be del anexo

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior (entrada)** | P-ISO-001; art. 111 num. 3; R-006; inventario MP-02 |
| **Fase siguiente (salida)** | Export PNG Bizagi → Figura as-is y Figura to-be del Anexo 07 |
| **Matriz doble entrada** | PR-02-01, PR-02-02, PR-02-03, PR-02-04 (columna aún N/A) |
| **Mensaje de commit sugerido** | `docs(procesos): spec as-is y to-be de mantenimiento [P-ISO-002]` |
