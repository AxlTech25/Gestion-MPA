# Sprint 7 — Extensión de esquema V2 para ML predictivo (Fase 1)

**Fecha planificada:** 2026-07-01 — 2026-07-31  
**Estado:** En progreso (Fase 1 — implementación base)  
**Versión objetivo:** 0.8.0  
**Depende de:** Sprint 6 (ML operativo, v0.7.0)

---

## Objetivo

Ampliar `v2_equipos` y `v2_fichas_mantenimiento` con campos de **telemetría básica** y **contexto estructurado de intervención**, sin reemplazar el esquema V2 ni romper el pipeline ML existente.

Esta fase es la implementación concreta acordada tras el análisis documentado en `documents/ml/mantenimiento_predictivo_analisis.md`.

---

## Alcance Fase 1

### Incluido

- Migración SQL: `backend/sql/v2_extension_fase7.sql`
- Nuevas columnas en `v2_equipos` (6 campos)
- Nuevas columnas en `v2_fichas_mantenimiento` (10 campos)
- Ampliación ENUM `tipo_mantenimiento` → incluye `Predictivo`
- Ampliación ENUM `estado_operativo` → incluye `En Reparación`
- Actualización backend PHP (modelos, controladores)
- Actualización formularios React (`EquipoForm`, `MantenimientoForm`)
- Actualización pipeline ML (`features.py`, `dataset.py`, reentrenamiento)
- Script de migración: `backend/tools/migrate_fase7.php`

### Fuera de alcance (Fase 2+)

- Tabla `v2_metricas_equipo`
- Tabla `v2_fallos`
- Agente automático WMI/SMART
- Bloque ML en `FichaTecnicaPanel.jsx`
- Recálculo automático de riesgo al guardar mantenimiento

---

## Cambios en base de datos

### A. `v2_equipos` — telemetría y snapshot

| Columna | Tipo | Default | Aplica a | Descripción |
|---------|------|---------|----------|-------------|
| `horas_uso` | INT | 0 | Todos | Horas de uso acumuladas |
| `errores_smart` | INT | 0 | PC/Laptop | Conteo errores SMART del disco |
| `contador_paginas` | INT NULL | NULL | Impresoras | Páginas impresas acumuladas |
| `salud_bateria` | DECIMAL(5,2) NULL | NULL | Laptops | Porcentaje 0–100 |
| `ultima_temp_cpu` | DECIMAL(5,2) NULL | NULL | PC/Laptop | °C última lectura |
| `ultima_temp_disco` | DECIMAL(5,2) NULL | NULL | PC/Laptop | °C última lectura |

**ENUM actualizado:**

```sql
estado_operativo ENUM('Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja')
```

> Nota: se usa `En Reparacion` sin tilde por compatibilidad ENUM MySQL/PHP existente.

### B. `v2_fichas_mantenimiento` — contexto de intervención

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `sintoma_usuario` | TEXT NULL | NULL | Lo que reportó el usuario |
| `causa_raiz` | VARCHAR(150) NULL | NULL | Causa identificada (estructurado) |
| `componente_principal` | VARCHAR(100) NULL | NULL | Disco, Batería, Ventilador, Fuser, etc. |
| `nivel_polvo` | ENUM | NULL | Bajo, Medio, Alto, Critico |
| `temperatura_cpu` | DECIMAL(5,2) NULL | NULL | °C al momento de la intervención |
| `temperatura_disco` | DECIMAL(5,2) NULL | NULL | °C al momento de la intervención |
| `horas_uso_acumuladas` | INT NULL | NULL | Lectura en el momento |
| `salud_bateria_pct` | DECIMAL(5,2) NULL | NULL | % batería en el momento |
| `contador_paginas_lectura` | INT NULL | NULL | Lectura impresora en el momento |
| `tiempo_inactividad_min` | INT | 0 | Minutos fuera de servicio |

**ENUM actualizado:**

```sql
tipo_mantenimiento ENUM('Preventivo', 'Correctivo', 'Predictivo', 'Evaluacion')
```

---

## Reglas de captura por tipo de equipo

Para no sobrecargar al técnico, el formulario mostrará campos condicionales:

| Tipo equipo | Campos visibles en inventario | Campos extra en mantenimiento |
|-------------|------------------------------|-------------------------------|
| Laptop | horas_uso, salud_bateria, temps, errores_smart | + salud_bateria_pct, temps |
| CPU | horas_uso, temps, errores_smart | + temps, horas_uso_acumuladas |
| Impresora | contador_paginas | + contador_paginas_lectura, componente (Fuser/Toner) |
| Monitor / Otro | horas_uso (opcional) | componente_principal, nivel_polvo |

**Campos obligatorios mínimos (todos los tipos, en correctivo):**

- `componente_principal`
- `categoria_falla_id` (existente)

**Campos recomendados (preventivo):**

- `nivel_polvo`
- `temperatura_cpu` / `temperatura_disco` (si aplica)

---

## Impacto en Machine Learning

### Nuevas features candidatas (modelo v2)

| Feature | Origen | Prioridad |
|---------|--------|-----------|
| `horas_uso` | `v2_equipos` | Alta |
| `errores_smart` | `v2_equipos` | Alta |
| `salud_bateria` | `v2_equipos` | Media (solo laptops) |
| `contador_paginas` | `v2_equipos` | Media (solo impresoras) |
| `ultima_temp_cpu` | `v2_equipos` | Media |
| `ultima_temp_disco` | `v2_equipos` | Media |
| `nivel_polvo_ultimo` | Último mantenimiento | Media |
| `tiempo_inactividad_total_12m` | Agregado mantenimientos | Baja |

### Archivos ML a actualizar

| Archivo | Cambio |
|---------|--------|
| `ml/scripts/features.py` | Añadir columnas numéricas/categóricas |
| `ml/app/services/dataset.py` | Ampliar `EXTRACT_QUERY` |
| `ml/scripts/build_dataset.py` | Misma query de extracción |
| `ml/scripts/generate_synthetic.py` | Generar valores sintéticos nuevos |
| `ml/scripts/train_model.py` | Reentrenar → `riesgo_equipo_v2.joblib` |
| `ml/data/README.md` | Diccionario actualizado |

### Estrategia de nulos

- Valores NULL → `0` (numéricos) o `"N/A"` (categóricos) en `preparar_dataframe()`
- No incluir feature en el modelo hasta tener **≥30% de filas con dato real** (evaluar tras 1 mes de uso)

---

## Cambios en backend PHP

| Archivo | Cambio |
|---------|--------|
| `models/Equipo.php` | INSERT/UPDATE/SELECT nuevos campos |
| `models/Mantenimiento.php` | INSERT nuevos campos |
| `controllers/EquipoController.php` | Validación condicional por tipo |
| `controllers/MantenimientoController.php` | Validación + sync snapshot a equipo |

### Sync opcional post-mantenimiento

Tras guardar una ficha, actualizar en `v2_equipos` (si vienen en el formulario):

- `horas_uso` ← `horas_uso_acumuladas`
- `salud_bateria` ← `salud_bateria_pct`
- `contador_paginas` ← `contador_paginas_lectura`
- `ultima_temp_cpu` / `ultima_temp_disco` ← lecturas de la ficha
- `fecha_ultimo_mantenimiento` ← `fecha_intervencion` (trigger o PHP)

---

## Cambios en frontend React

| Componente | Cambio |
|------------|--------|
| `EquipoForm.jsx` | Sección "Telemetría" condicional por `tipo_equipo` |
| `MantenimientoForm.jsx` | Campos estructurados + medición en visita |
| `InventarioPage.jsx` | *(Opcional)* icono si `errores_smart > 0` |
| `mlService.js` | Sin cambio de rutas |

### UX — `MantenimientoForm.jsx`

```
[Siempre]
  tipo_mantenimiento, equipo_id, fecha, categoria_falla_id

[Si Correctivo]
  sintoma_usuario, componente_principal*, causa_raiz

[Si Preventivo o Predictivo]
  nivel_polvo, temperatura_cpu, temperatura_disco

[Si Laptop]
  salud_bateria_pct, horas_uso_acumuladas

[Si Impresora]
  contador_paginas_lectura, componente_principal

[Todos]
  tiempo_inactividad_min, actividades_realizadas, estado_post
```

---

## Plan de implementación

| Semana | Tareas |
|--------|--------|
| **1** | SQL migración, modelos PHP, pruebas API |
| **2** | Formularios React, validación condicional |
| **3** | Pipeline ML (features + dataset + retrain v2), QA, docs |

---

## Criterios de aceptación

- [x] Migración `v2_extension_fase7.sql` ejecutada sin errores en BD existente.
- [x] `EquipoForm` guarda telemetría según tipo de equipo.
- [x] `MantenimientoForm` guarda campos estructurados (componente, polvo, temps).
- [x] API POST equipos/mantenimientos acepta nuevos campos.
- [x] Post-mantenimiento actualiza snapshot en `v2_equipos` (horas, temps, batería, fecha).
- [x] `features.py` y `dataset.py` incluyen telemetría de equipos.
- [ ] Modelo reentrenado como v2 (requiere datos reales acumulados + `POST /ml/train`).
- [x] `changelog.md` actualizado a **0.8.0**.

---

## Ejecución de migración

```bash
# Desde la raíz del proyecto
php backend/tools/migrate_fase7.php
```

O manualmente:

```bash
mysql -u root gestion_equipos_mpa_v2 < backend/sql/v2_extension_fase7.sql
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Técnicos no llenan campos nuevos | Formulario condicional; solo 3–5 campos visibles por tipo |
| ENUM alter falla en MySQL | Script migración con `ALTER` probado; backup previo |
| Modelo empeora por muchos NULLs | Introducir features gradualmente; evaluar cobertura antes de entrenar |
| Duplicar nombres (`salud_bateria` vs `salud_bateria_pct`) | Equipo = snapshot actual; ficha = lectura histórica |

---

## Referencias

- Análisis completo: `documents/ml/mantenimiento_predictivo_analisis.md`
- Esquema base: `backend/sql/v2_estructura.sql`
- Migración Fase 1: `backend/sql/v2_extension_fase7.sql`
- ML actual: `ml/data/README.md`, `documents/sprints/sprint_6.md`
