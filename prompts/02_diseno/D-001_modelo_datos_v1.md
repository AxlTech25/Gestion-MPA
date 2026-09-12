# D-001 — Modelo de datos V2

| Campo | Valor |
|-------|-------|
| **Código** | D-001 |
| **Fase** | Diseño |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (DDL del propio proyecto) + CoT para normalización |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 (incremento 1); extensión 2026-07 (incremento 7) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incrementos 1 y 7 / esquema `v2_*` hasta 0.9.0 |
| **Historias o ADR** | R-002 (INV, FIC, MNT, ML); ADR-001 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

DDL y análisis se publicaron con [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765). El esquema evolucionó: instalación nueva en `v2_estructura.sql` y migración incremental en `v2_extension_fase7.sql`.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de datos (MySQL 8 / MariaDB compatible con XAMPP
y Hostinger).

Contexto: Sigemad MPA V2. Inventario patrimonial de equipos de cómputo,
áreas, usuarios, fichas técnicas, fichas de mantenimiento, catálogo de
fallas, predicciones ML y telemetría. Motor: MySQL. Prefijo de tablas v2_
para convivir con V1 (Strangler Fig). Requisitos: RAM y almacenamiento
numéricos; categoría de falla como catálogo (no texto libre como fuente de
verdad); datos aptos para un modelo de riesgo posterior. Hosting compartido:
evitar tipos o features que phpMyAdmin/Hostinger no importen.

Objetivo: Un esquema relacional instalable (DDL) y migraciones incrementales
que D-002 e I-001 puedan implementar sin reinventar tablas.

Tarea:
1. Proponer entidades y relaciones (equipos, áreas, usuarios, fichas
   técnicas, fichas de mantenimiento, categorías de falla).
2. Generar SQL de creación con PK, FK, unicidad, timestamps y ENUMs
   justificados.
3. Tipar RAM, almacenamiento y lecturas de telemetría como numéricos.
4. Definir tablas o columnas para predicciones ML y métricas.
5. Separar script de instalación nueva vs migración sobre BD ya poblada.

Entradas disponibles:
- Historias R-002 de INV, FIC, MNT, CFG, ML.
- ADR-001 (MySQL, prefijo v2_, FastAPI no persiste por su cuenta).
- Análisis de telemetría (incremento 7): hours de uso, SMART, batería,
  páginas, temperaturas.

Formato de salida:
- Script SQL versionado (CREATE TABLE).
- Nota de migraciones (ALTER) para entornos que ya tienen v2_estructura.
- Observaciones de integridad (qué no puede ser NULL, qué es único).
- (Deseable guía cap. 5.2) diagrama Mermaid erDiagram. Si no se genera en
  esta pasada, declararlo como deuda del registro.

Restricciones técnicas:
- Prefijo v2_. Columnas snake_case.
- Compatible con XAMPP/MySQL; nada de tipos PostgreSQL.
- Normalizar hasta 3FN cuando sea razonable; no sobre-normalizar catálogos
  de una sola columna de lookup inútil.
- codigo_patrimonial único, 12 dígitos en validación de aplicación.
- Categorías de falla: tabla de catálogo, no VARCHAR libre como verdad.
- Incluir seed mínimo (admin, áreas de ejemplo, categorías de falla).
- Migraciones incrementales además del script de instalación nueva.

Criterios de aceptación:
- Un import en phpMyAdmin o cliente MySQL crea el esquema sin error.
- Hay camino de upgrade (migrate_fase7 / SQL de extensión) sin borrar datos.
- Campos de telemetría y mantenimiento estructurado existen o están
  planificados en extensión documentada.
- El pipeline ML puede leer números, no parsear “8 GB DDR4” como texto.

Proceso sugerido: 1) listar entidades desde las HU, 2) definir cardinalidad,
3) escribir DDL, 4) marcar FKs y unicidad, 5) separar lo que es instalación
nueva de lo que es ALTER, 6) listar riesgos de datos existentes.

No hacer: no usar texto libre como categoría de falla; no mezclar tablas v1
y v2 sin prefijo; no introducir Mongo/JSON como almacén principal; no borrar
columnas de producción en el mismo script de seed.

Ejemplos: N/A en origen. Patrón posterior del repo: v2_equipos.ram_gb INT,
v2_categorias_falla, v2_predicciones_ml, v2_metricas_equipo.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto de dominio y motor
- [x] Tarea (DDL + migraciones)
- [x] Formato SQL versionado
- [x] Restricciones (prefijo, 3FN razonable, catálogo de fallas)
- [ ] Ejemplo few-shot en el prompt original (N/A; el repo es el ejemplo)
- [x] Criterios de aceptación
- [x] Prohibiciones

El diagrama as-built está en [D-001 v2](./D-001_modelo_datos_v2_refinado.md) → `documents/02_diseno/er_v2.md`.

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Estructura (instalación nueva) | `backend/sql/v2_estructura.sql` | esquema vivo en repo; docs [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) |
| Extensión telemetría | `backend/sql/v2_extension_fase7.sql` | incremento 7 |
| Predicciones | `backend/sql/v2_ml_predicciones.sql` | incremento 6 |
| Métricas por equipo | `backend/sql/v2_metricas_equipo.sql` | 0.9.0 |
| Análisis | `documents/02_diseno/ml/mantenimiento_predictivo_analisis.md` | [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) |
| ER Mermaid (v2) | `documents/02_diseno/er_v2.md` | [D-001 v2](./D-001_modelo_datos_v2_refinado.md) |

Salida usada como entrada de **I-001** (esqueleto), **I-002** (CRUD) e **I-007/I-008** (predicciones / telemetría).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Esquema instalable; migraciones incrementales existen; tipos numéricos en RAM/almacenamiento/telemetría. ER Mermaid: [v2](./D-001_modelo_datos_v2_refinado.md). |
| **N.º de iteraciones** | Varias a lo largo del producto (inc. 1 → inc. 7 → métricas 0.9.0). El prompt v1 no se versionó por iteración (hueco D2). |
| **Diagnóstico** | El registro v1 mezcló diseño inicial y extensión Fase 7 en un solo código D-001. El desvío es de **granularidad de tarea**, no de motor. |
| **Refinamiento** | v1.1 documentó la deuda. [v2](./D-001_modelo_datos_v2_refinado.md) la cierra sin tocar el DDL. |
| **Decisión** | **Aprobado** — evolucionó en incrementos 1 y 7. |
| **Lección** | Pedir instalación nueva y ALTER por separado desde el primer prompt evita reescribir `v2_estructura.sql` a mano en cada fase. |

### Checklist D2

- [x] Revisión humana del esquema
- [x] DDL ejecutable
- [x] Decisiones de integridad justificadas (catálogo de fallas, prefijo v2_)
- [x] Sirve de entrada a implementación
- [x] Diagrama ER ([D-001 v2](./D-001_modelo_datos_v2_refinado.md))

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | R-002 (INV, MNT, ML) |
| **Fase siguiente** | I-001, I-002, I-007, I-008 |
| **Matriz doble entrada** | F-003 inventario, F-005 mantenimiento, F-007 ml |
| **Commit sugerido** | `docs(diseno): esquema v2 y migraciones [D-001]` |
