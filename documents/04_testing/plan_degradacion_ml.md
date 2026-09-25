# Plan de degradación ML

**Prompt:** [T-013](../../prompts/04_testing/T-013_degradacion_ml_v1.md)  
**Producto:** 0.10.7  
**Oráculo:** [ADR-002](../02_diseno/adr/ADR-002-degradacion-ml.md), RNF-AVA-01…04

Precondición común DEG-001…003 y 005: **detener uvicorn** (o no arrancarlo). DEG-004: `ml_service_url` vacío en `local.php`.

---

| ID | Pasos | Esperado | RNF | Cruza |
|----|--------|----------|-----|-------|
| DEG-001 | Detener FastAPI → recargar `/v2/dashboard` | Mensaje ámbar o sin tabla de riesgo; **4 tarjetas y gráficos operativos**; no pantalla en blanco | AVA-01, AVA-02 | ML-003, SMOKE-002/005 |
| DEG-002 | `/v2/inventario` | HTTP 200; tabla de equipos; badges N/A u ocultos | AVA-01, AVA-02 | INV-012, INT-013 |
| DEG-003 | Registrar mantenimiento preventivo de un laptop | Ficha **guardada**; historial muestra la intervención aunque falle recálculo de riesgo | AVA-03 | MNT-007 |
| DEG-004 | Configurar `ml_service_url` vacío (simula producción sin FastAPI) | Login + inventario OK; `/ml/status` degradado | AVA-04 | CMP-003, M-001 |
| DEG-005 | `GET /ml/alertas` con JWT y ML down | No 500; cuerpo vacío o mensaje de no disponible | AVA-02 | INT-013 |

Si FastAPI está **arriba**, DEG-001…003 y 005 se marcan **N/A** en esa corrida (hay que una pasada con el servicio parado). DEG-004 puede hacerse sin tocar uvicorn.

### Criterio de salida

Núcleo (login, inventario, mantenimiento) OK con ML down. El release institucional **no** espera uvicorn en el servidor web.
