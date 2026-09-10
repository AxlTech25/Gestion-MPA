# I-002 — Microservicio ML y proxy autenticado

| Campo | Valor |
|-------|-------|
| **Código** | I-002 |
| **Fase** | Implementación |
| **Versión** | v1 |
| **Estado** | Aprobado |

---

## Prompt ejecutado

**Rol:** Ingeniero ML + backend.

**Contexto:** Dataset estructurado desde inventario y mantenimientos. Modelo de riesgo por equipo (Random Forest) y sugerencia de categoría de falla.

**Tarea:** Microservicio FastAPI, entrenamiento, inferencia, tabla `v2_predicciones_ml`, proxy PHP `/api/v2/ml/*`, badges en inventario y alertas en dashboard.

**Restricciones:** PHP como único cliente del puerto 8000. Si FastAPI no responde, el resto del sistema continúa.

---

## Resultado

Incrementos 6–7: `ml/`, `MlController.php`, `MlService.php`, UI de riesgo y ficha predictiva.

**Decisión:** Aprobado (v0.7.0–0.9.0).
