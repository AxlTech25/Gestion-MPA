# ADR-002 — Degradación si FastAPI no está disponible

| Campo | Valor |
|-------|-------|
| **Estado** | Aceptado |
| **Fecha** | 2026-09-11 (formaliza decisión de 0.7.0 / I-007) |
| **Fase SDLC** | Diseño |
| **Incrementos** | 6–7 (0.7.0–0.9.0), operación Hostinger (M-001) |
| **Prompt** | [D-006](../../../prompts/02_diseno/D-006_adr_degradacion_ml_v1.md) |

## Contexto

El modelo de riesgo corre en un microservicio Python (FastAPI, puerto 8000). El destino de producción previsto es **Hostinger compartido** (PHP + MySQL), que no ejecuta ese proceso. Incluso en local, uvicorn puede estar apagado. ADR-001 ya prohibió exponer Python al navegador; faltaba registrar qué ocurre cuando el proxy PHP no obtiene respuesta.

## Decisión

1. PHP es el **único** cliente de FastAPI (`MlService` / `MlController`).
2. Si no hay `ml_service_url`, hay timeout o HTTP de error del microservicio:
   - Auth, inventario, fichas, mantenimiento, configuración, dashboard operativo y PDF **siguen**.
   - Endpoints `/ml/*` responden de forma controlada (éxito de negocio con datos vacíos o mensaje de no disponible; la UI no crashea).
   - Badges y alertas: ocultos o N/A (HU-ML-005).
   - `POST /mantenimientos` persiste aunque falle el recálculo de riesgo (I-008).
3. Entrenar (`POST /ml/train`) solo Administrador y solo si el servicio está arriba.
4. No se exige VPS para declarar el producto usable.

## Alternativas evaluadas

| Opción | Por qué se descartó |
|--------|---------------------|
| A) FastAPI obligatorio; sin él la app no arranca | Rompe Hostinger y el alcance R-001 |
| B) El navegador llama a `:8000` con fallback en React | Viola ADR-001; CORS y superficie de ataque |
| C) Encolar predicciones y reintentar en cron | Complejidad de operación que el equipo no sostiene |
| D) **Proxy PHP + degradación** (elegida) | Cumple hosting, JWT y HU-ML-005 |

## Consecuencias

- El caso de estudio **no** demuestra ML en producción compartida (limitación ya en `metodologia.md`).
- Hay que probar el sistema **con y sin** uvicorn (T-001 módulo ML = N/A si está caído).
- `local.php` en Hostinger deja `ml_service_url` vacío a propósito.
- Un VPS puede activar ML sin cambiar el contrato del front (solo config PHP).

## Riesgos

- El usuario puede interpretar “sin alertas” como fallo de inventario. Mitigación: copy en UI y guía Hostinger.
- Predicciones viejas en `v2_predicciones_ml` pueden verse desactualizadas. Aceptable frente a tumbar el módulo.

## Relación

- Sustenta: I-007, I-008, M-001, RNF-AVA-01…04.
- No reemplaza ADR-001 (stack); lo precisa en el eje disponibilidad.
