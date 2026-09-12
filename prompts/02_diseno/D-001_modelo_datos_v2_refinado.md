# D-001 v2 — ER Mermaid as-built

| Campo | Valor |
|-------|-------|
| **Código** | D-001 |
| **Título** | Diagrama ER Mermaid a partir del SQL v2 existente |
| **Fase** | Diseño |
| **Versión del prompt** | v2 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | RAG sobre DDL + few-shot `erDiagram` |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Incremento / versión producto** | Esquema 0.9.1 (no cambia el producto) |
| **Refina** | [D-001 v1](./D-001_modelo_datos_v1.md) (deuda Mermaid cap. 5.2) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |



---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de datos (MySQL / MariaDB). No rediseñes el
esquema. No eres desarrollador de migraciones.

Contexto: Sigemad MPA V2. El modelo físico ya está en producción/XAMPP
(prefijo v2_*). D-001 v1 entregó DDL y migraciones; faltó el erDiagram
que pide la guía cap. 5.2. Motor: MySQL. FastAPI no persiste tablas
propias (ADR-001 / ADR-002).

Objetivo: Un diagrama entidad-relación as-built, trazable a FOREIGN KEY,
usable en tesis y en documents/02_diseno/.

Tarea:
1. Leer solo los SQL de entrada. Listar tablas y FK.
2. Dibujar Figura 1 (núcleo): areas, usuarios, equipos, fichas_tecnicas,
   categorias_falla, fichas_mantenimiento, predicciones_ml, metricas_equipo.
3. Dibujar Figura 2 (completa): sumar historial_asignaciones,
   cronograma_mantenimiento, hojas_baja.
4. Tabla de cardinalidades justificada con el DDL (UNIQUE, ON DELETE).
5. Marcar 1:1 en fichas_tecnicas (equipo_id UNIQUE).

Entradas disponibles (únicas permitidas):
- backend/sql/v2_estructura.sql
- backend/sql/v2_ml_predicciones.sql
- backend/sql/v2_metricas_equipo.sql

Formato de salida:
- documents/02_diseno/er_v2.md
- Bloques mermaid con erDiagram.
- Atributos: PK, UK, FK en las entidades del núcleo (no listar todas
  las columnas de telemetría en el recuadro; sí las claves).

Restricciones técnicas:
- Sintaxis Mermaid erDiagram (||--o{, ||--||).
- Nombres de tabla exactos (v2_equipos, no Equipo).
- No inventar v2_fallos ni quitar telemetría.
- No reescribir ni ALTER los SQL.
- FastAPI / React no son entidades.

Criterios de aceptación:
- Cada arista del Mermaid corresponde a un FOREIGN KEY del SQL.
- Figura 1 cabe en una página de tesis sin historial/cronograma/baja.
- fichas_tecnicas documentada como 1:1.
- El archivo no propone cambios de esquema.

Proceso sugerido: extraer CREATE/FK → clasificar núcleo vs anexo →
dibujar → contrastar cada relación con el SQL → tabla de cardinalidad.

No hacer: no generar PNG; no “mejorar” 3FN; no copiar el DDL completo
dentro del Markdown.

Ejemplos (sintaxis):
erDiagram
  v2_areas ||--o{ v2_equipos : "area_id"
  v2_equipos {
    int id PK
    string codigo_patrimonial UK
    int area_id FK
  }
```

### Checklist D1

- [x] Rol definido (no rediseñar)
- [x] Contexto: SQL ya existe
- [x] Tarea: dos figuras
- [x] Formato er_v2.md + mermaid
- [x] Restricciones: no ALTER, no tablas inventadas
- [x] Ejemplo few-shot de sintaxis
- [x] Criterios (FK ↔ arista)
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| ER as-built | `documents/02_diseno/er_v2.md` | (este cambio) |

Salida: documentación de diseño. No es entrada de un I-* nuevo (el código ya usa estas tablas).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 2 erDiagram; cardinalidades alineadas a UNIQUE/FK. Completitud guía D-01 (Mermaid) = sí. |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | D-001 v1 falló en **formato** (no pidió Mermaid como entregable obligatorio). |
| **Refinamiento** | Este archivo (v2). No se edita el SQL. |
| **Decisión** | **Aprobado** — deuda Mermaid de D-001 v1 cerrada. |
| **Lección** | Si el DDL ya existe, el prompt de ER debe ser RAG sobre SQL, no “propón el modelo”. |

### Checklist D2

- [x] Revisión humana (contraste con FK)
- [x] Documento completo
- [x] Sin cambios de esquema
- [x] Prompt, versión y métrica registrados
- [x] D-001 v1 apunta aquí

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | D-001 v1 (DDL) |
| **Fase siguiente** | Consulta / tesis / README de diseño |
| **Matriz doble entrada** | Diseño (no F-NNN de código) |
| **Commit sugerido** | `docs(diseno): ER Mermaid as-built [D-001]` |
