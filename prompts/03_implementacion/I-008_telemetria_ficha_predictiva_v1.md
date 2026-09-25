# I-008 — Telemetría, mantenimiento estructurado y ficha predictiva

| Campo | Valor |
|-------|-------|
| **Código** | I-008 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (migración → sync → features v2 → UI) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-07 (0.8.0) – cierre 0.9.0 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 7 / 0.8.0–0.9.0 |
| **Historias** | HU-INV-008, HU-MNT-006–012, HU-DSH-005–006, HU-FIC-008, HU-ML-003, HU-ML-006–007 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No rompe el pipeline I-007: se añade migración incremental y modelo `riesgo_equipo_v2.joblib` si hay features nuevas.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador PHP/React e ingeniero de datos ML.

Contexto: Incremento 7. ML 0.7.0 ya opera (I-007). Análisis en
documents/02_diseno/ml/mantenimiento_predictivo_analisis.md. Hay que
ampliar v2_equipos y v2_fichas_mantenimiento con telemetría y contexto
de intervención, sincronizar snapshot al registrar mantenimiento y
exponer consulta de dashboard + bloque predictivo en ficha.

Objetivo: Esquema Fase 7 + UI condicional + features v2 + recálculo de
riesgo tras POST /mantenimientos, sin WMI automático ni DELETE de equipos.

Tarea:
1. v2_extension_fase7.sql + migrate_fase7.php.
   Equipos: horas_uso, errores_smart, contador_paginas, salud_bateria,
   ultima_temp_cpu, ultima_temp_disco, fecha_ultimo_mantenimiento.
   Mantenimiento: sintoma_usuario, causa_raiz, componente_principal,
   nivel_polvo, temperaturas, lecturas, tiempo_inactividad_min.
   ENUM: tipo Predictivo; estado En Reparacion.
2. Equipo::syncTelemetria() tras el alta de mantenimiento.
3. EquipoForm (telemetría) y MantenimientoForm (campos condicionales).
4. features.py / dataset.py / train --version v2.
5. ConsultaEquiposPanel (GET /dashboard/consulta, tipo_otro).
6. FichaTecnicaPanel: bloque Evaluación predictiva.
7. v2_metricas_equipo + MlService::recalcularEquipo() (0.9.0).
8. Changelog 0.8.0 y 0.9.0; incremento_7_extension_schema_v2.md.

Entradas disponibles: I-007, análisis ML, HU-MNT-010, HU-FIC-008.

Formato de salida: SQL ALTER + PHP + React + scripts ML. Instalación
nueva actualiza v2_estructura.sql además del ALTER.

Restricciones técnicas:
- No tabla v2_fallos ni agente SMART (fuera de alcance).
- No borrar columnas v1 de I-007; inferencia prioriza v2 si existe.
- ENUM sin tilde: En Reparacion (compatibilidad MySQL/PHP).
- PHP sigue siendo el único cliente de :8000.
- Migración no destruye filas existentes (DEFAULT 0 / NULL).

Criterios de aceptación:
- migrate_fase7.php corre sobre una BD 0.7.0 sin pérdida.
- POST mantenimiento actualiza snapshot del equipo.
- Campos de impresora no aparecen en laptop (y viceversa).
- Ficha muestra score si ML está arriba; si no, el resto de la ficha.
- Consulta dashboard filtra por etiquetas / tipo Otro.
- Recálculo post-mantenimiento no impide guardar la ficha si ML falla.

Proceso sugerido: ALTER → modelos → formularios → features → train v2
→ recálculo → consulta dashboard → probar migrate en copia.

No hacer: no exigir FastAPI en producción; no reescribir I-007 desde cero.

Ejemplos: N/A (seguir columnas del análisis).
```

### Checklist D1

- [x] Migración vs install nueva
- [x] Fuera de alcance agente WMI
- [x] Degradación ML
- [x] Criterios sync + UI condicional

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Migración | `backend/sql/v2_extension_fase7.sql` | 0.8.0 |
| Sync | `Equipo::syncTelemetria` | 0.8.0 |
| Ficha predictiva / métricas | `FichaTecnicaPanel.jsx`, `v2_metricas_equipo.sql` | 0.9.0 |
| Incremento | `incremento_7_extension_schema_v2.md` | docs |

Salida usada como entrada de **I-009** (parche puntual) y **T-001**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 0.8.0 telemetría + 0.9.0 recálculo y ficha predictiva. Unitarias posteriores cubren sync y consulta (UT-PHP). |
| **N.º de iteraciones** | 2 fases (Fase 1 esquema/UI, Fase 2 métricas/recalc). |
| **Diagnóstico** | I-002-ML mezclaba esto con 0.7.0; partir evita un prompt de dos esquemas. |
| **Decisión** | **Aprobado.** |
| **Lección** | Pedir ALTER y “v2_estructura.sql para installs nuevas” en el mismo prompt (lección D-001 aplicada). |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-007, D-001 |
| **Fase siguiente** | I-009, T-001 |
| **Matriz doble entrada** | F-003/F-005/F-007 evolucionados; sin F nuevo |
| **Commit sugerido** | `feat(mantenimiento): telemetría y ficha predictiva [I-008]` |
