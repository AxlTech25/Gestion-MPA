# Análisis — Optimización de Mantenimiento Predictivo

**Fecha:** 2026-06-21  
**Contexto:** Evaluación de propuesta de ampliación de esquema (`equipos`, `fichas_mantenimiento`, `fallos`, `metricas_equipo`) frente al sistema V2 + ML implementado en Sprint 6.  
**Versión actual del sistema:** 0.7.0

---

## Resumen ejecutivo

| Pregunta | Conclusión |
|----------|------------|
| ¿Es viable técnicamente? | **Sí** |
| ¿Implementar todo de una vez? | **No recomendable** |
| ¿Mejora el mantenimiento predictivo? | **Sí**, con datos reales y captura periódica |
| ¿Compatible con V2 + ML actual? | **Sí**, extendiendo tablas `v2_*` |
| Camino recomendado | **Evolución por fases** sobre el esquema existente |

La propuesta analizada es un **buen diseño objetivo** para mantenimiento predictivo maduro. El límite principal no es el modelo de datos, sino la **captura operativa** de telemetría (horas de uso, SMART, temperaturas, batería) y el tiempo necesario para acumular historial.

---

## Estado actual del ML (Sprint 6)

### Fuentes de datos en producción

| Fuente | Tabla | Uso actual |
|--------|-------|------------|
| Inventario | `v2_equipos` | Features estáticas del equipo |
| Mantenimiento | `v2_fichas_mantenimiento` | Features agregadas (conteos, severidad) |
| Catálogo | `v2_categorias_falla` | Severidad de fallas |
| Ficha técnica | `v2_fichas_tecnicas` | No entra al modelo v1 |
| Predicciones | `v2_predicciones_ml` | Salida persistida del ML |

### Variables que usa el modelo v1 (14 features)

**Numéricas:** `ram_gb`, `almacenamiento_gb`, `antiguedad_meses`, `total_mantenimientos`, `correctivos_12m`, `preventivos_12m`, `dias_desde_ultimo_mantenimiento`, `severidad_max_historica`, `fallas_altas_criticas_12m`, `area_id`

**Categóricas:** `tipo_equipo`, `tipo_disco`, `estado_conservacion`, `estado_operativo`

**Salida:** `nivel_riesgo` (Bajo / Medio / Alto / Critico), `score_riesgo` (0–100)

### Variables con mayor peso (modelo entrenado)

1. `fallas_altas_criticas_12m`
2. `estado_conservacion`
3. `correctivos_12m`

El modelo actual predice **riesgo agregado de falla** a partir del historial estructurado, no eventos puntuales futuros con fecha exacta.

---

## Comparación: propuesta vs. esquema V2 existente

### Ya implementado en V2 (no duplicar)

| Elemento propuesto | Equivalente V2 |
|--------------------|----------------|
| Tabla `equipos` | `v2_equipos` |
| Tabla `fichas_mantenimiento` | `v2_fichas_mantenimiento` |
| `categoria_falla` | `v2_categorias_falla` (con `severidad`) |
| Mantenimiento predictivo (cronograma) | `v2_cronograma_mantenimiento` |
| Especificaciones hardware/software | `v2_fichas_tecnicas` |
| Microservicio ML + predicciones | Sprint 6 (`ml/app/`, `v2_predicciones_ml`) |

### Aportes nuevos de la propuesta (valor real)

| Bloque | Valor para ML | Prioridad |
|--------|---------------|-----------|
| Telemetría en equipos (`horas_uso`, SMART, temps, batería) | Muy alto | Fase 1–2 |
| Snapshot en mantenimiento (`nivel_polvo`, temps, componente) | Alto | **Fase 1 (confirmada)** |
| Tabla `metricas_equipo` (series temporales) | Muy alto | Fase 2 |
| Tabla `fallos` separada | Medio | Fase 3 o vista derivada |
| Fotos antes/después | Bajo para ML | Operativo, no prioritario |

---

## Evaluación por componente de la propuesta

### 1. Campos adicionales en equipos

| Campo | Valor ML | Viabilidad operativa |
|-------|----------|----------------------|
| `horas_uso` | Alto | Media — agente o lectura manual |
| `ciclos_bateria`, `salud_bateria` | Alto (laptops) | Media — WMI / manual |
| `contador_paginas` | Alto (impresoras) | Alta — SNMP o visita |
| `ultima_temp_cpu`, `ultima_temp_disco` | Alto | Baja manual; alta con agente |
| `errores_smart` | Muy alto | Media — `smartctl` o script |
| `fecha_ultimo_mantenimiento` | Medio | Alta — calculable desde historial |
| `estado_operativo = En Reparación` | Medio | Alta |

**Riesgo:** campos numéricos sin datos (NULL/0) no mejoran el modelo; pueden degradarlo si se añaden sin disciplina de captura.

### 2. Fichas de mantenimiento ampliadas

| Campo | Valor ML | Notas |
|-------|----------|-------|
| `componente_principal` | Alto | Estructurado — ideal para Modelo B |
| `causa_raiz` | Alto | Mejor que solo texto libre |
| `nivel_polvo` | Alto | Fácil en preventivos |
| `temperatura_cpu`, `temperatura_disco` | Muy alto | Requiere medición en visita |
| `horas_uso_acumuladas`, `salud_bateria` | Alto | Snapshot del momento |
| `tiempo_inactividad_min` | Medio | Priorización y costos |
| `sintoma_usuario` | Bajo (ML v1) | Útil operativamente; NLP en futuro |
| `tipo_mantenimiento = Predictivo` | Medio | Alineado con cronograma V2 |

### 3. Tabla `fallos`

**Ventajas:** dataset explícito de incidentes; útil para predecir componente afectado.

**Riesgos:**
- Duplicación con correctivos ya registrados en `v2_fichas_mantenimiento`
- Doble carga operativa si no se define un flujo único

**Recomendación:** posponer tabla independiente. Primero enriquecer mantenimiento; luego crear vista `v2_fallos_derivados` desde correctivos si hace falta.

### 4. Tabla `metricas_equipo`

**La pieza más valiosa para predictivo avanzado.**

Permite detectar tendencias:

```text
errores_smart ↑ + temp_disco ↑ + horas_uso ↑  →  riesgo de fallo de disco en ventana futura
```

**Requisitos:**
- Registro periódico (mensual mínimo) o agente automático
- 3–6 meses de historial antes de impacto significativo en ML
- Integración futura con `v2_cronograma_mantenimiento`

---

## Flujo de datos: mantenimiento → ML (hoy)

```text
Registrar mantenimiento
        │
        ▼
v2_fichas_mantenimiento  (+ v2_categorias_falla.severidad)
        │
        │  (no automático al guardar)
        ▼
Abrir Inventario / Dashboard
        │
        ▼
FastAPI agrega features desde MySQL
        │
        ▼
Random Forest v1 → score + nivel + factores
        │
        ▼
v2_predicciones_ml + badges en UI
```

**Hallazgo operativo:** el mantenimiento **sí alimenta** el ML, pero el recálculo ocurre **bajo demanda** al consultar inventario/dashboard, no al instante de guardar la ficha.

---

## Problemas detectados en la propuesta original

1. **Reemplazo total del esquema** — rompe API V2, frontend y pipeline ML existente.
2. **`tipo_equipo VARCHAR(100)`** — menos estable que ENUM/catálogo para encoding ML.
3. **`categoria_falla INT` sin catálogo explícito** — V2 ya tiene `v2_categorias_falla` con severidad.
4. **Sobrecarga de formulario** — demasiados campos por intervención sin automatización.
5. **Campos de imagen** — valor operativo, mínimo para Random Forest actual.
6. **Sin plan de captura** — el esquema asume telemetría que hoy no se mide sistemáticamente.

---

## Roadmap recomendado

| Fase | Alcance | Plazo estimado | Documento |
|------|---------|----------------|-----------|
| **1** | Extender `v2_equipos` + `v2_fichas_mantenimiento` | 1–2 semanas | `documents/sprints/sprint_7_extension_schema_v2.md` |
| **2** | Tabla `v2_metricas_equipo` + formulario lectura periódica | 3–4 semanas | Por definir |
| **3** | Agente/script captura SMART, temps, horas_uso | 1–2 meses | Por definir |
| **4** | Modelo B por componente; series temporales | Sprint 8+ | Por definir |

---

## Impacto esperado por fase

| Escenario | Mejora en predicción |
|-----------|---------------------|
| Solo ampliar esquema sin llenar datos | Ninguna / negativa (más NULLs) |
| Fase 1 con 3–5 campos bien completados | Mejora moderada en 2–3 meses |
| Fase 2 con 6 meses de métricas periódicas | Mejora alta |
| Fase 3 con agente automático | Máximo impacto — predictivo real |

---

## Decisiones tomadas

- [x] **No** reemplazar esquema V2 por tablas paralelas `equipos` / `fichas_mantenimiento`.
- [x] **Sí** extender `v2_equipos` y `v2_fichas_mantenimiento` (Fase 1).
- [ ] Posponer tabla `fallos` independiente.
- [ ] Planificar `v2_metricas_equipo` para Fase 2.
- [ ] Actualizar features ML tras Fase 1 y reentrenar modelo (`POST /ml/train`).

---

## Referencias

- Esquema actual: `backend/sql/v2_estructura.sql`
- Dataset ML: `ml/data/README.md`
- Sprint 6 completado: `documents/sprints/sprint_6.md`
- Plan de extensión Fase 1: `documents/sprints/sprint_7_extension_schema_v2.md`
- SQL migración Fase 1: `backend/sql/v2_extension_fase7.sql`
