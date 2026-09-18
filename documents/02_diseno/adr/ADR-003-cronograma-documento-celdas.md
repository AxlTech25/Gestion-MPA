# ADR-003 — Documento de cronograma y celdas por área (no por equipo)

| Campo | Valor |
|-------|-------|
| **Estado** | Aceptado |
| **Fecha** | 2026-09-15 |
| **Fase SDLC** | Diseño |
| **Incremento** | 8 (propuesto) |
| **Prompt** | [D-007](../../../prompts/02_diseno/D-007_cronograma_v1.md) |
| **Requisitos** | [R-006](../../../prompts/01_requisitos/R-006_cronograma_anual_v1.md) |

## Contexto

R-006 exige un **historial de cronogramas** (varios por año), una matriz **área × día × turno** y marcado manual. En `v2_estructura.sql` ya existe `v2_cronograma_mantenimiento` con `equipo_id` obligatorio, `proxima_fecha` y frecuencia: sirve como “próximo preventivo de una máquina”, no como el papel municipal ni como trazabilidad de 2–3 planes en el mismo año. Esa tabla no tiene API ni UI.

## Decisión

1. Introducir **dos tablas nuevas**:
   - `v2_cronogramas`: documento del historial (`anio`, `nombre`, `creado_por`, `creado_en`).
   - `v2_cronograma_celdas`: asiento de cine (`cronograma_id`, `area_id`, `fecha`, `turno`).
2. **No** usar `v2_cronograma_mantenimiento` como fuente de la matriz en I-010. Dejarla en el esquema sin escribirla (sin dual-write).
3. Los conteos PC / laptop / impresora se **calculan** desde `v2_equipos` (`tipo_equipo` CPU = PC del papel) al leer la matriz; no se persisten en la celda.
4. SIGA/SAF no tienen tabla propia: son **áreas** (o el área del servidor) en `v2_areas`.
5. Escritura (crear cronograma, marcar/liberar celda): roles **Administrador** y **Tecnico**. Lectura: cualquier JWT.

## Consecuencias

- El historial y “N por año” son naturales (N filas en `v2_cronogramas` con el mismo `anio`).
- Imprimir y cobertura se derivan del documento abierto + inventario.
- I-010 debe incluir migración `CREATE TABLE` aditiva y un `DROP` documentado para rollback (M-002).
- Un trabajo futuro podría sincronizar celdas → filas por equipo; **fuera de I-010**.

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Reusar `v2_cronograma_mantenimiento` | Un equipo / una fecha; no hay documento ni varios planes por año |
| Un Gantt global filtrado solo por año | R-006 v1.4: el año es atributo del documento, no el documento |
| Auto-rellenar días según conteo | R-006: marcado manual; el conteo solo informa |
| Dual-write a la tabla por equipo en I-010 | Doble verdad y rollback más frágil |

## Enmienda (I-014, 2026-09-15)

El asiento deja de ser área + día + **turno**. **Xn** es la cantidad de PC/laptop atendidos ese día. Unique: `(cronograma_id, area_id, fecha)` + columna `cantidad`. La columna `turno` queda como residual (default Mañana) y no se muestra. No se crean N columnas por equipo: el técnico elige X1…Xn en un selector. No auto-rellenar el resto de días.

## Relación con otros ADR

- ADR-001: mismo stack (React, PHP, MySQL, JWT).
- ADR-002: no aplica; el módulo no depende de FastAPI.
