# Ambigüedades, implícitos y supuestos — Sigemad MPA V2

**Prompt:** [R-004](../../prompts/01_requisitos/R-004_ambiguedades_v1.md) (guía cap. 5.1, R-01).  
**Fecha del registro:** 2026-09-11  
**Fuente:** ficha R-001, personas, código 0.9.1 y decisiones ya tomadas.  
**Regla:** no se inventa un requisito; lo no confirmado queda como **supuesto** o **fuera de alcance**.

---

## Tabla R-01

| Tipo | Hallazgo | Riesgo si no se aclara | Pregunta / resolución | Prioridad | Estado |
|------|----------|------------------------|----------------------|-----------|--------|
| Implícito | El código patrimonial es de **12 dígitos numéricos** | Altas inválidas; carga Excel desalineada | ¿Formato municipal obligatorio? **Resuelto:** validación en UI/API (INV) | Alta | Cerrado |
| Implícito | Categoría de falla es **catálogo**, no texto libre | Dataset ML inservible | ¿Se permite “otros” libre? **Resuelto:** `v2_categorias_falla` | Alta | Cerrado |
| Implícito | ML **no** es obligatorio en producción | El operador espera alertas en Hostinger y reporta “sistema caído” | ¿El núcleo funciona sin FastAPI? **Resuelto:** sí (R-001, ADR-002) | Alta | Cerrado |
| Ambigüedad | Tres **roles de sistema** vs personas P1–P5 | P3 (jefe de área) no tiene login propio | ¿Hace falta rol “Consulta”? **Supuesto:** no en 0.9.1; P3 usa dashboard con cuenta existente | Media | Abierto (producto futuro) |
| Ambigüedad | Quién puede crear/editar **usuarios** | Escalada de privilegios (ocurrida hasta 0.9.1) | ¿Solo Administrador en API? **Resuelto:** I-009 `requireRole` | Alta | Cerrado |
| Contradicción | UI “solo admin ve Configuración” ≠ API abierta con JWT | Técnico muta `/usuarios` sin UI | ¿La UI es la autorización? **Resuelto:** no; la API autoriza | Alta | Cerrado |
| Implícito | Hosting **compartido** no ejecuta Python | Diseño de microservicio “en producción” irreal | ¿VPS obligatorio? **Resuelto:** no; ML opcional / VPS aparte | Alta | Cerrado |
| Fuera de alcance | Integración SIGA/SIAF o portal ciudadano | Alcance institucional inflado | ¿Hay interoperabilidad? **Resuelto:** no (R-001) | Alta | Cerrado |
| Implícito | Inventario solo de **bienes informáticos** | Pedidos de mobiliario/vehículos | ¿Patrimonio general? **Resuelto:** no | Media | Cerrado |
| Ambigüedad | Telemetría **manual** vs agente WMI/SMART | Expectativa de captura automática | ¿Hay agente? **Resuelto:** no en 0.9.1 (I-008 fuera de alcance) | Media | Cerrado |
| Implícito | Seed `admin` / `admin123` | Credencial por defecto en internet | ¿Se cambia al desplegar? **Resuelto:** checklist M-001 / M-004 | Alta | Cerrado (operación) |
| Ambigüedad | DELETE de equipos | Borrado patrimonial sin auditoría | ¿Se permite? **Parcial:** ruta existe; no es historia priorizada | Baja | Abrir si el cliente lo pide |
| Implícito | PDF de ficha requiere **memoria PHP** alta | 500 en Hostinger | ¿Límite del plan? **Supuesto:** 256M (hostinger.md) | Media | Cerrado (operación) |
| Ambigüedad | “Incremento 6” = JWT 0.6.0 o ML 0.7.0 | Trazabilidad rota | ¿Qué documento es la fuente? **Resuelto:** I-006 vs I-007 (oleada 2) | Media | Cerrado (docs) |

---

## Supuestos vigentes (no confirmados con acta de cliente)

1. Un practicante registra equipos pero no administra usuarios.
2. El jefe de área no requiere un cuarto rol en 0.9.1.
3. El modelo de riesgo se entrena con datos sintéticos hasta acumular historial real (≥200 equipos).
4. No hay obligación legal de conservar PDF firmado digitalmente.

Si un supuesto se niega, abrir incremento + prompt nuevo; no reescribir R-001 como si siempre hubiera sido así.

---

## Extensión: cronograma anual de preventivo

**Prompt:** [R-006](../../prompts/01_requisitos/R-006_cronograma_anual_v1.md)  
**Fecha:** 2026-09-15  
**Fuente:** cronograma en papel 2024 + declaraciones del responsable (2026-09-15): mínimo anual; marcado manual; impresión; **por área**; más equipos ⇒ más días; conteos PC/laptop/impresora.  
**Regla:** implementado en el Incremento 8 (I-010…I-017 / 0.10.7). **Cerrado** el 2026-09-17 por el responsable. Un cambio nuevo exige R-*.

| Tipo | Hallazgo | Riesgo si no se aclara | Pregunta / resolución | Prioridad | Estado |
|------|----------|------------------------|----------------------|-----------|--------|
| Implícito | El preventivo debe ocurrir **al menos una vez al año** por equipo | Equipos sin cita; papel 2024 se usa como lista de asistencia informal | ¿Es obligación anual? **Resuelto:** sí; el cronograma planifica esas fechas | Alta | Cerrado |
| Implícito | El cronograma es **planificación**, no la ficha de intervención | Marcar una celda se confunde con “ya se hizo el mantenimiento” | ¿La celda reemplaza HU-MNT-002? **Resuelto:** no; la ficha sigue siendo la ejecución | Alta | Cerrado |
| Implícito | El marcado es **manual** (técnico o administrador), como elegir asiento de cine | Se inventa un auto-relleno que I-003 prohibió | ¿Se generan celdas solas? **Resuelto:** no; celda libre → ocupada a mano | Alta | Cerrado |
| Implícito | El horario debe **imprimirse** (como el papel) | Solo existe en pantalla y no llega al área usuaria | ¿Hace falta PDF/impresión? **Resuelto:** sí; matriz por área con conteos y días; los equipos del área quedan citados en esas fechas | Alta | Cerrado |
| Ambigüedad | SIGA / SAF / biométrico en el papel | Se tratan como gerencias o se pide integrar SIGA | ¿Son oficinas? **Resuelto:** son software que corre en el **servidor** de la entidad; la fila es ese equipo servidor. No sustituye SIGA/SIAF (R-001) | Alta | Cerrado |
| Ambigüedad | Quién marca | Practicante altera el plan anual | ¿P5 puede marcar? **Resuelto:** solo Técnico y Administrador. Ver/imprimir para otros roles queda como supuesto | Media | Cerrado (marcado) |
| Ambigüedad | Unidad de la celda: área vs equipo | Modelo y UI incompatibles | ¿Un clic agenda el área o un activo? **Resuelto (2026-09-15):** igual que la foto: **por área**. El preventivo se hace visitando el área. Si hay muchos equipos, se marcan **más días** en esa misma fila. Los equipos heredan el rango de fechas del área | Alta | Cerrado |
| Ambigüedad | Significado de X1/X2/X3 en el papel | Se inventan turnos mañana/tarde o diez columnas (una por equipo) | **Resuelto (2026-09-15, R-006 v1.6 / I-014):** Xn = **cuántos PC o laptop** se atienden ese día (X1 = 1, X3 = 3). Una columna por día; el técnico elige X1…Xn. No es turno. Las impresoras no entran en Xn. No auto-rellenar | Alta | Cerrado |
| Implícito | Conteos de **PC, laptop e impresora** por área | El técnico no sabe cuántos días reservar | ¿Se teclean otra vez? **Resuelto:** no; salen del inventario y se muestran en la fila para organizar la duración | Alta | Cerrado |
| Implícito | Más equipos ⇒ **más días** en la misma área | Se obliga a un solo día y el trabajo no cabe | ¿Una sola celda por área y año? **Resuelto:** no; una fila puede ocupar varios días. Un día puede ser X2 y el siguiente X3. El marcado sigue siendo manual (cine) | Alta | Cerrado |
| Ambigüedad | Un “asiento” ¿es único en todo el día (una sola visita municipal) o único por fila? | Doble reserva o subuso del técnico | **Resuelto (I-014):** el asiento es **área + día + cantidad**. La misma área no ocupa dos veces el mismo día; cambia Xn o libera | Alta | Cerrado |
| Implícito | El cronograma vive en **otro módulo** | Se mezcla con el timeline de fichas (EP-05) y no se encuentra | ¿Misma página que Mantenimiento? **Resuelto:** no. El ítem de menú se llama solo **Cronograma**. Al entrar no se abre la matriz: se ve el **historial** de cronogramas programados | Alta | Cerrado |
| Implícito | El plan se agrupa por **año** y puede haber **varios por año** | Un selector de año único pisa o oculta campañas (p. ej. dos preventivos en 2026) | ¿Un solo Gantt por año? **Resuelto:** cada cronograma es un documento del historial, con año. Pueden existir 2 o 3 (o más) en el mismo año; no se pisan entre sí. Las celdas y el PDF usan ese `anio` (2027, 2028…), no el año civil del servidor | Alta | Cerrado |
| Implícito | La impresión en A3 con sábados/domingos desperdicia hoja | PDF ilegible o costoso de imprimir en municipalidad | ¿Qué recortar? **Resuelto (2026-09-16):** A4 apaisado, 2 meses/página, L–V, celdas de día compactas; se conservan N°/área/conteos | Alta | Cerrado |
| Implícito | Hay que poder **borrar** un plan creado | Quedan cronogramas de prueba en el historial | ¿Soft delete? **Resuelto:** DELETE duro con confirmación; CASCADE; practicante no borra | Alta | Cerrado |
| Implícito | El papel agrupa áreas bajo **gerencia** | El horario se lee plano y no coincide con el documento municipal | ¿Etiqueta libre? **Resuelto (2026-09-17):** catálogo + selector; fila banda; área se edita y se elimina | Alta | Cerrado |
| Fuera de alcance | Integrar o sustituir SIGA/SAF | Alcance inflado | Ya cerrado en R-001 | Alta | Cerrado |

### Supuestos vigentes de esta extensión

1. El cronograma cubre la campaña anual de preventivo; el correctivo no se agenda aquí.
2. El practicante no marca celdas; puede consultar e imprimir si tiene sesión.
3. Completar el trabajo en campo sigue siendo registrar la ficha de mantenimiento de cada equipo del área visitada.
4. Los conteos PC / Laptop / Impresora salen del inventario; no se teclean otra vez.
5. El sistema **no calcula solo** cuántos días necesita el área: muestra los conteos y el técnico reparte Xn entre días.
6. La fila de servidores institucionales (SIGA/SAF) se trata como un área más del horario.
7. Xn no es turno mañana/tarde: es la cantidad de PC/laptop de ese día. El horario del personal va en HORA PROGRAMADA (I-013).
8. El menú dice **Cronograma**. La primera vista es el **historial** (trazabilidad); la matriz se abre al elegir un ítem.
9. 2 o 3 por año es el caso típico; no se fija un tope rígido en requisitos salvo que el responsable lo pida.
10. Cada ítem del historial tiene año, identificador visible (nombre o número) y fecha de registro. El detalle de campos se cierra en diseño.
11. **Impresión (2026-09-16):** A4 apaisado, dos meses por hoja, **lunes a viernes**. N°, área y conteos PC/laptop/impresora se conservan. Las fechas siguen el **año del documento** (un plan 2028 imprime ENE-2028 y el weekday de 2028).
12. Un cronograma del historial **se puede eliminar** (Técnico/Administrador, con confirmación). No hay papelera.
13. **Gerencia (2026-09-17):** cada área puede pertenecer a **una** gerencia del catálogo (selector). La gerencia no recibe Xn: es una fila banda. SIGA/SAF siguen siendo áreas. Editar/eliminar área es de Configuración (Admin); no se borra un área con equipos.

**Cierre:** el responsable dio por terminada esta parte (2026-09-17). Los supuestos 1–13 quedan como reglas del producto 0.10.7, no como cola de implementación.
