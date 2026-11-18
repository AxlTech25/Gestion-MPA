# Modelo entidad-relación V2 (as-built)

**Prompt:** [D-001 v2](../../prompts/02_diseno/D-001_modelo_datos_v2_refinado.md)  
**Origen:** FK de `backend/sql/v2_estructura.sql`, `v2_ml_predicciones.sql`, `v2_metricas_equipo.sql`  
**Producto:** esquema 0.11.2  
**No es un rediseño.** Si el SQL y este diagrama discrepan, manda el SQL.

---

## Cardinalidades (del DDL)

| Relación | Tipo | Evidencia SQL |
|----------|------|----------------|
| `v2_equipos` ↔ `v2_fichas_tecnicas` | 1:1 | `equipo_id UNIQUE NOT NULL` |
| `v2_equipos` → `v2_ficha_tecnica_historial` | 1:N | `equipo_id` FK, `ON DELETE CASCADE` |
| `v2_usuarios` → `v2_ficha_tecnica_historial` | 1:N | `usuario_id` FK, `ON DELETE SET NULL` |
| `v2_gerencias` → `v2_areas` | 1:N | `gerencia_id` FK, `ON DELETE SET NULL` |
| `v2_areas` → `v2_equipos` | 1:N | `area_id` FK, NOT NULL |
| `v2_usuarios` → `v2_equipos` | 1:N | `responsable_id` FK, `ON DELETE SET NULL` |
| `v2_areas` → `v2_usuarios` | 1:N | `area_id` FK, `ON DELETE SET NULL` |
| `v2_equipos` → `v2_fichas_mantenimiento` | 1:N | `equipo_id` FK, `ON DELETE CASCADE` |
| `v2_categorias_falla` → `v2_fichas_mantenimiento` | 1:N | `categoria_falla_id` FK, `ON DELETE SET NULL` |
| `v2_usuarios` → `v2_fichas_mantenimiento` | 1:N | `tecnico_id` FK |
| `v2_equipos` → `v2_predicciones_ml` | 1:N | `equipo_id` FK, `ON DELETE CASCADE` |
| `v2_categorias_falla` → `v2_predicciones_ml` | 1:N | `categoria_sugerida_id` FK |
| `v2_equipos` → `v2_metricas_equipo` | 1:N | `equipo_id` FK, `ON DELETE CASCADE` |
| `v2_fichas_mantenimiento` → `v2_metricas_equipo` | 1:N | `mantenimiento_id` FK, `ON DELETE SET NULL` |

FastAPI no aparece: no tiene tablas propias.

## Ajuste 0.11.0 (as-built)

Estas columnas ya están en `v2_estructura.sql` y en la base en uso. El diagrama de las figuras siguientes muestra las relaciones, no cada columna.

| Tabla | Columna | Uso |
|-------|---------|-----|
| `v2_equipos` | `tipo_equipo VARCHAR(100)` | Nombre del tipo: Laptop, CPU, Teclado, Cámara, Equipo de audio, etc. |
| `v2_equipos` | `responsable_nombre` | Encargado de ese bien. No es `responsable_id` ni un usuario del sistema. |
| `v2_areas` | `jefe_encargado` | Una persona por área. Puede ser distinta del encargado de cada equipo. |
| `v2_fichas_tecnicas` | `numero_ficha` | Único. Formato guardado `N° {n}`. |
| `v2_fichas_tecnicas` | `fecha_evaluacion` | Fecha que el técnico escribe. El PDF usa esta fecha. |
| `v2_fichas_tecnicas` | `funcionamiento` | `Sin fallas` o `Con fallas`. |
| `v2_fichas_tecnicas` | `obsolescencia_tecnologica` | `Si` o `No`. |
| `v2_fichas_tecnicas` | `repuestos_disponibles` | `Si` o `No`. |
| `v2_fichas_tecnicas` | `resultado_evaluacion` | Uno de los cinco resultados de la hoja 2026. |

Procesador, sistema operativo, licencia, MAC, IP y software de la ficha solo se guardan si el tipo del equipo contiene `cpu`, `laptop` o `pc`.

## Ajuste 0.11.1 — historial de la ficha

`v2_ficha_tecnica_historial` guarda un registro por cada guardado en el que cambió al menos un campo. Migración: `backend/tools/migrate_ficha_historial.php`.

| Columna | Uso |
|---------|-----|
| `equipo_id` | Equipo de la ficha. Si se borra el equipo, se borra su historial. |
| `usuario_id` | Usuario de la sesión que guardó. Puede quedar vacío. |
| `accion` | `Creación` o `Actualización`. |
| `cambios` | JSON: lista de `{ campo, antes, despues }`. Solo entran los campos distintos. |
| `fecha` | Momento del guardado. |

La pantalla de la ficha lista ese historial, el más reciente primero. Los PDF de Reportes lo imprimen del más antiguo al más reciente.

---

## Figura 1 — Núcleo (tesis)

```mermaid
erDiagram
  v2_gerencias ||--o{ v2_areas : "gerencia_id"
  v2_areas ||--o{ v2_usuarios : "area_id"
  v2_areas ||--o{ v2_equipos : "area_id"
  v2_usuarios ||--o{ v2_equipos : "responsable_id"
  v2_equipos ||--|| v2_fichas_tecnicas : "equipo_id UNIQUE"
  v2_equipos ||--o{ v2_fichas_mantenimiento : "equipo_id"
  v2_usuarios ||--o{ v2_fichas_mantenimiento : "tecnico_id"
  v2_categorias_falla ||--o{ v2_fichas_mantenimiento : "categoria_falla_id"
  v2_equipos ||--o{ v2_predicciones_ml : "equipo_id"
  v2_categorias_falla ||--o{ v2_predicciones_ml : "categoria_sugerida_id"
  v2_equipos ||--o{ v2_metricas_equipo : "equipo_id"
  v2_fichas_mantenimiento ||--o{ v2_metricas_equipo : "mantenimiento_id"

  v2_gerencias {
    int id PK
    string nombre UK
  }
  v2_areas {
    int id PK
    string nombre UK
    int gerencia_id FK
  }
  v2_usuarios {
    int id PK
    string usuario UK
    string rol
    int area_id FK
  }
  v2_equipos {
    int id PK
    string codigo_patrimonial UK
    int ram_gb
    int area_id FK
    int responsable_id FK
  }
  v2_fichas_tecnicas {
    int id PK
    int equipo_id FK_UK
  }
  v2_categorias_falla {
    int id PK
    string nombre
    string severidad
  }
  v2_fichas_mantenimiento {
    int id PK
    int equipo_id FK
    int tecnico_id FK
    int categoria_falla_id FK
  }
  v2_predicciones_ml {
    int id PK
    int equipo_id FK
    int categoria_sugerida_id FK
  }
  v2_metricas_equipo {
    int id PK
    int equipo_id FK
    int mantenimiento_id FK
  }
```

---

## Figura 2 — Esquema completo

Incluye historial de asignaciones, cronograma e hojas de baja (mismas fuentes SQL).

```mermaid
erDiagram
  v2_areas ||--o{ v2_usuarios : "area_id"
  v2_areas ||--o{ v2_equipos : "area_id"
  v2_usuarios ||--o{ v2_equipos : "responsable_id"
  v2_equipos ||--|| v2_fichas_tecnicas : "equipo_id UNIQUE"
  v2_equipos ||--o{ v2_fichas_mantenimiento : "equipo_id"
  v2_usuarios ||--o{ v2_fichas_mantenimiento : "tecnico_id"
  v2_categorias_falla ||--o{ v2_fichas_mantenimiento : "categoria_falla_id"
  v2_equipos ||--o{ v2_predicciones_ml : "equipo_id"
  v2_categorias_falla ||--o{ v2_predicciones_ml : "categoria_sugerida_id"
  v2_equipos ||--o{ v2_metricas_equipo : "equipo_id"
  v2_fichas_mantenimiento ||--o{ v2_metricas_equipo : "mantenimiento_id"

  v2_equipos ||--o{ v2_historial_asignaciones : "equipo_id"
  v2_areas ||--o{ v2_historial_asignaciones : "area_origen_destino"
  v2_usuarios ||--o{ v2_historial_asignaciones : "responsable_registrado_por"
  v2_equipos ||--o{ v2_cronograma_mantenimiento : "equipo_id"
  v2_usuarios ||--o{ v2_cronograma_mantenimiento : "responsable_creado_por"
  v2_areas ||--o{ v2_cronograma_mantenimiento : "area_id"
  v2_cronograma_celdas ||--o{ v2_cronograma_horarios : "celda_id"
  v2_equipos ||--o{ v2_cronograma_horarios : "equipo_id"
  v2_areas ||--o{ v2_cronograma_celdas : "area_id"
  v2_usuarios ||--o{ v2_cronogramas : "creado_por"
  v2_equipos ||--o{ v2_hojas_baja : "equipo_id"
  v2_usuarios ||--o{ v2_hojas_baja : "creado_validado_por"

  v2_historial_asignaciones {
    int id PK
    int equipo_id FK
    int area_origen_id FK
    int area_destino_id FK
    int responsable_origen_id FK
    int responsable_destino_id FK
    int registrado_por FK
  }
  v2_cronograma_mantenimiento {
    int id PK
    int equipo_id FK
    int responsable_id FK
    int area_id FK
    int creado_por FK
  }
  v2_cronogramas {
    int id PK
    int anio
    string nombre
    int creado_por FK
  }
  v2_cronograma_celdas {
    int id PK
    int cronograma_id FK
    int area_id FK
    date fecha
    int cantidad
    string turno
  }
  v2_hojas_baja {
    int id PK
    int equipo_id FK
    int creado_por FK
    int validado_por FK
  }
```

`v2_historial_asignaciones` y `v2_cronograma_mantenimiento` / `v2_hojas_baja` concentran varias FK a `v2_usuarios` y `v2_areas`; en Mermaid se agrupan en una arista por par de entidades para no saturar el dibujo. El detalle está en los atributos y en el SQL.

Incremento 8: `v2_cronogramas` + `v2_cronograma_celdas` (asiento área+fecha+**cantidad** Xn, I-014) + `v2_cronograma_personal` (I-013). `v2_cronograma_mantenimiento` **no** se usa. `turno` en celdas es residual.
