# I-002-ML — Microservicio ML y proxy autenticado (histórico)

> **Superado (oleada 2, 2026-09-11).** El código **I-002 vigente** es [inventario 0.2.0](./I-002_inventario_v1.md). Este archivo queda como alias del ML documentado antes de partirlo:
>
> [I-007 microservicio ML 0.7.0](./I-007_microservicio_ml_v1.md) · [I-008 telemetría 0.8.0–0.9.0](./I-008_telemetria_ficha_predictiva_v1.md)

| Campo | Valor |
|-------|-------|
| **Código** | I-002-ML |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.2 |
| **Estado** | Reconstruido a posteriori / Aprobado / **Superado** |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT guiado (pipeline datos → modelo → API → proxy → UI) + few-shot JSON PHP |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-06-21 (0.7.0); extensión 0.8.0–0.9.0 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incrementos 6–7 / 0.7.0–0.9.0 |
| **Historias** | HU-ML-001 a HU-ML-007, HU-INV-006, HU-MNT-009, HU-FIC-008, HU-DSH-005/006 |
| **ADR** | ADR-001 (PHP único cliente de FastAPI) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Código representativo: [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) (F-007). Reemplazado por **I-007** + **I-008**.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero de ML aplicado y backend PHP. El humano revisa
entrenamiento, métricas y el proxy; no deploys autónomos a producción.

Contexto: Sigemad MPA V2. Inventario y mantenimientos ya estructurados
(D-001, I-001): ram_gb, almacenamiento_gb, categoria_falla_id, fechas.
Objetivo de negocio: riesgo de falla por equipo y sugerencia de categoría
de falla en correctivos. Stack ML: Python 3.10+, FastAPI, Scikit-learn,
joblib. PHP es el único cliente de http://127.0.0.1:8000. Si FastAPI no
corre, el resto del sistema debe seguir.

Objetivo: Microservicio de inferencia + entrenamiento, persistencia de
predicciones, proxy JWT y UI degradable (badges, alertas, ficha predictiva).

Tarea:
1. Dataset A: CSV sintético (~200 equipos) y builder desde MySQL.
2. Modelo Random Forest de riesgo; serializar .joblib.
3. FastAPI: /health, /predict/riesgo, /predict/riesgo/batch,
   /predict/categoria, /train, /metrics.
4. Tabla v2_predicciones_ml y, en extensión, v2_metricas_equipo.
5. Proxy PHP /api/v2/ml/* (MlController / MlService). Entrenamiento solo
   Administrador.
6. UI: RiesgoBadge en inventario, alertas en dashboard, sugerencia de
   categoría en MantenimientoForm, bloque predictivo en ficha.
7. Extensión incremento 7: telemetría en v2_equipos, campos estructurados
   en mantenimiento, syncTelemetria, features v2 y recálculo tras POST
   /mantenimientos.

Entradas disponibles:
- incremento_6.md, architecture.md (flujo React → PHP → FastAPI → MySQL).
- v2_estructura.sql y categorías de falla.
- Restricción R-001: ML opcional.

Formato de salida:
- Código en ml/app, ml/scripts, ml/models.
- PHP en backend/api/v2 (routes/ml.php, controllers, services).
- SQL v2_ml_predicciones.sql y v2_extension_fase7.sql.
- Documentación en documents/03_implementacion/incrementos/.

Restricciones técnicas:
- El navegador no llama al puerto 8000.
- Si FastAPI no responde: HTTP de negocio controlado, UI sin crash,
  badges/alertas ocultos o en estado N/A (HU-ML-005).
- No secretos en prompts ni en joblib.
- Batch: cuerpo JSON objeto {}, no array [] (FastAPI).
- No exigir ML en el plan de pruebas como bloqueante del resto.
- Reentrenamiento no pisa el núcleo de inventario si falla.

Criterios de aceptación:
- GET /health del FastAPI responde con el proceso arriba.
- Un equipo con features válidas obtiene nivel de riesgo.
- Proxy con JWT válido; sin token, 401.
- FastAPI caído: login, inventario y mantenimiento siguen.
- POST /mantenimientos puede recalcular riesgo (0.9.0) sin romper el alta.
- Train restringido a Administrador.

Proceso sugerido: 1) dataset y diccionario de columnas, 2) entrenar y
medir, 3) API Python, 4) proxy PHP con timeout y fallback, 5) UI, 6)
verificar degradación parando uvicorn.

No hacer: no poner CORS abierto de FastAPI al origen del front; no
entrenar en cada page load; no usar texto libre de “observaciones” como
feature principal; no inventar accuracy sin correr el script.

Ejemplos: contrato PHP {success, data, message}; timeout curl corto;
HU-ML-005 fallback graceful.
```

### Checklist D1

- [x] Rol mixto ML + backend
- [x] Contexto de degradación
- [x] Tarea de pipeline
- [x] Formato de rutas
- [x] Guardrails (no exponer Python, timeout)
- [x] Criterios incluyendo FastAPI caído
- [x] Prohibiciones
- [x] Ejemplo de fallback

**Deuda:** incrementos 6 y 7 siguen en un solo código I-002 (granularidad menor que I-001, aún mejorable).

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| FastAPI | `ml/app/main.py` | [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) |
| Proxy / servicio PHP | `MlController.php`, `MlService.php` | 0.7.0–0.9.0 |
| UI | `RiesgoBadge.jsx`, dashboard alertas, ficha predictiva | 0.7.0–0.9.0 |
| Incremento 6 | `documents/03_implementacion/incrementos/incremento_6.md` | docs asociadas |
| Incremento 7 | `incremento_7_extension_schema_v2.md` | telemetría |

Salida usada como entrada de **T-001** (casos ML condicionales) y **M-001** (ML deshabilitado si FastAPI no está en el servidor).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Modelo A documentado: accuracy 95 %, F1 macro 0.92 (incremento 6, dataset sintético). pytest en plan unitario. Fallos reales corregidos: batch `[]` vs `{}`; HTTP 503 con cuerpo 200. |
| **N.º de iteraciones** | ≥3 conocidas (batch JSON, códigos HTTP curl, features v2 / recálculo). No hubo `I-002_v2_refinado.md`. |
| **Diagnóstico** | Los bugs de proxy eran de **restricciones** incompletas (forma del JSON batch y semántica HTTP). El registro v1 no las incluía. |
| **Refinamiento v1.1** | Se documentan esas restricciones para reuso. Partición I-007/I-008 pendiente. |
| **Decisión** | **Aprobado** (v0.7.0–0.9.0). |
| **Lección** | Incluir en el prompt el contrato exacto del vecino (`{}` no `[]`) y el caso “servicio caído” evita dos regresiones típicas de GenAI en integraciones. |

### Checklist D2

- [x] Revisión humana
- [x] Degradación verificable (HU-ML-005)
- [x] Train con rol Administrador
- [x] Documentación de incremento
- [x] Lección de integración registrada

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | D-001, D-002, I-001 (dataset operativo) |
| **Fase siguiente** | T-001 (módulo ML), M-001 |
| **Matriz doble entrada** | F-007 ml |
| **Commit sugerido** | `feat(ml): proxy y degradación si FastAPI no responde [I-002]` |
