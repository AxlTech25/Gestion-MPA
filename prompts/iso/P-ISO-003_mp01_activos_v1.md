# P-ISO-003 — Mapas as-is y to-be de MP-01


| Campo                             | Valor                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| **Código**                        | P-ISO-003                                                                          |
| **Título**                        | Mapa del proceso de activos informáticos, situación actual y situación con Sigemad |
| **Fase**                          | Procesos (columna ID Prompt del procedimiento, matriz V4)                          |
| **Versión del prompt**            | v1                                                                                 |
| **Versión del registro**          | v1                                                                                 |
| **Estado**                        | Ejecutado — pendiente de revisión humana                                           |
| **Modelo**                        | Cursor Agent — 2026-09-30                                                          |
| **Técnica**                       | Chain-of-Thought guiado                                                            |
| **Autor**                         | AxlTech25 (equipo Sigemad MPA)                                                     |
| **Revisor**                       | Pendiente                                                                          |
| **Fecha de ejecución**            | 2026-09-30                                                                         |
| **Incremento / versión producto** | Documentación de procesos; producto 0.10.7                                         |
| **Historias o ADR relacionados**  | Art. 111 num. 11; art. 90 num. 3; inventario PR-01-01…PR-01-03                     |
| **Plantilla**                     | `[../gobernanza/_plantilla_prompt.md](../gobernanza/_plantilla_prompt.md)`         |


Par as-is / to-be de MP-01 para el apéndice. No entra al cuerpo si el par de MP-02 ya ocupa las dos figuras.

---



## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de procesos. Preparas la especificación que una
persona va a dibujar en Bizagi (as-is y to-be de un solo proceso).

Contexto: MP-01 Gestión de activos informáticos. Fuente institucional:
artículo 111 numeral 11 del ROF (mantener actualizado el inventario de la
arquitectura tecnológica, proyectos, licencias y conectividad) y artículo 90
numeral 3 (la Unidad de Patrimonio realiza el inventario de bienes muebles
e inmuebles). Sigemad cubre solo equipos de cómputo con código patrimonial
de 12 dígitos, ficha técnica, carga Excel y PDF. Licencias, conectividad y
bienes que no son de TI quedan fuera del sistema. El medio en el que la
unidad registraba los equipos antes de Sigemad no está descrito en el ROF
ni en la ficha de proyecto.

Objetivo: Especificar el as-is y el to-be de MP-01 sin completar huecos.

Tarea: Listar carriles, actividades en orden y compuertas. Cada actividad
cita art. 111.11, art. 90.3 o un procedimiento PR-01-*. Lo que no tenga
fuente va a "No dibujar", en una línea, sin actividad ficticia.

Entradas disponibles:
- Arts. 111.11 y 90.3.
- Inventario PR-01-01 Control de inventario, PR-01-02 Ficha técnica,
  PR-01-03 Reportes patrimoniales.
- documents/ISO/mapas/nivel_0_unidad_ti.md.

Formato de salida: Markdown, secciones as-is y to-be, más "No dibujar".
Ruta: documents/ISO/mapas/MP-01_activos_as_is_to_be.md

Restricciones técnicas:
- As-is: dos actores, Unidad de TI y Unidad de Patrimonio. Sin compuertas
  de completitud, traslado ni baja.
- To-be: la Unidad de TI registra en Sigemad. Código de 12 dígitos inválido
  se corrige y se vuelve a intentar. Carga Excel solo para lote, a cargo
  del Administrador. El riesgo ML en el listado es opcional.
- Patrimonio sigue siendo quien inventaría los bienes muebles de la
  municipalidad. Sigemad no lo reemplaza.

Criterios de aceptación:
- El as-is no nombra un soporte (Excel, cuaderno, sistema) que las fuentes
  no nombran.
- El to-be coincide con PR-01-01, PR-01-02 y PR-01-03.
- No aparece un flujo de baja ni de traslado.

Proceso sugerido: 1) escribir solo la relación TI–Patrimonio que el ROF
sí dice, 2) marcar el medio previo como no documentado, 3) volcar los tres
procedimientos al to-be.

No hacer:
- No copiar el diagrama largo de "Gestión de Activos Informáticos" que
  incluye traslado, reasignación y baja con el área de Patrimonio.
- No tratar a Patrimonio como un módulo de Sigemad.
- No inventar el medio del inventario anterior.

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


| Artefacto                   | Ubicación                                          | Commit    |
| --------------------------- | -------------------------------------------------- | --------- |
| Spec as-is y to-be de MP-01 | `documents/ISO/mapas/MP-01_activos_as_is_to_be.md` | Pendiente |


Cuando el revisor apruebe la spec y exporte el PNG, PR-01-01…PR-01-03 pueden citar este código. Hasta entonces la columna sigue en N/A.

---



## Evaluación D2


| Campo                  | Valor                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Medición**           | As-is sin medio inventado; to-be alineado a PR-01-01…03; baja y traslado en "No dibujar"                                                                                              |
| **N.º de iteraciones** | 1                                                                                                                                                                                     |
| **Diagnóstico**        | N/A hasta la revisión                                                                                                                                                                 |
| **Refinamiento**       | 2026-09-30, misma v1: parque de informática y desglose as-is / to-be por PR-01-01, PR-01-02 y PR-01-03 |
| **Decisión**           | Pendiente de revisión humana                                                                                                                                                          |
| **Lección**            | Si el medio anterior no está en el ROF ni en el proyecto, el as-is se queda en la relación entre unidades y se declara el hueco                                                       |




### Checklist D2

- [ ] Revisión humana
- [x] Documento completo respecto de la tarea
- [ ] PNG de Bizagi
- [x] Sin secretos
- [x] Actividades ligadas a fuente
- [ ] Commit y columna de la matriz
- [x] Sirve para el diagrama de activos del apéndice

---



## Trazabilidad


| Relación                       | Valor                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| **Fase anterior (entrada)**    | P-ISO-001; arts. 111.11 y 90.3; inventario MP-01            |
| **Fase siguiente (salida)**    | Export PNG Bizagi → Apéndice G                              |
| **Matriz doble entrada**       | PR-01-01, PR-01-02, PR-01-03 (columna aún N/A)              |
| **Mensaje de commit sugerido** | `docs(procesos): spec as-is y to-be de activos [P-ISO-003]` |


