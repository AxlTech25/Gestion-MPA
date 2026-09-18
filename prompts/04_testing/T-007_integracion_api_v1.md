# T-007 — Plan de pruebas de integración API

| Campo | Valor |
|-------|-------|
| **Código** | T-007 |
| **Título** | Integración HTTP PHP + BD (contrato D-003) |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (status HTTP + `{success, data, message}`) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No genera archivos PHPUnit en esta oleada. Los scripts son oleada posterior (ampliar T-002 o T-007b).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero QA de API. Plan de integración, no UI.

Contexto: Sigemad 0.10.7. Base /gestion_mpa/backend/api/v2/. JWT en
todas las rutas salvo POST /auth/login. PHP único cliente FastAPI.
SQLite en memoria o MySQL local. FastAPI opcional (N/A si caído).

Objetivo: Casos INT-001…014 ejecutables con curl o PHPUnit futuro,
oráculo contrato_api_v2.md.

Tarea: Por caso: precondición, método, ruta, headers, body, HTTP
esperado, cuerpo JSON, HU/RNF si aplica. Cubrir auth, RBAC,
cronograma Xn/año/sábado, DELETE plan, áreas 409, gerencia, ML
proxy, OPTIONS.

Entradas: D-003, T-006, AUTH-007, CRN-011/012/015, CFG-010/011.

Formato: documents/04_testing/plan_pruebas_integracion.md.

Restricciones: no navegador; no JMeter; no entrenar RF; no JWT de
producción; no Apache obligatorio si se documenta PHPUnit+SQLite.

Criterios: un técnico reproduce INT-001…014 sin leer controladores;
INT-013 no bloquea el resto.

Proceso: contrato → negativos 401/403/400/409 → cronograma → CFG → ML.

No hacer: no montar React; no duplicar AUTH-001 paso a paso en UI.

Ejemplos: INT-002 GET /equipos sin Bearer → 401 JSON.
```

### Checklist D1

- [x] Rol API QA
- [x] Contexto contrato y JWT
- [x] Tarea INT-001…014
- [x] Formato plan_pruebas_integracion.md
- [x] Restricciones
- [x] Ejemplo 401
- [x] Criterios
- [x] No UI

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan integración | `documents/04_testing/plan_pruebas_integracion.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 14 casos INT con request/response; scripts no incluidos (declarado). |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** — pendiente aprobación humana. |
| **Lección** | Integración ≠ E2E: el oráculo es el contrato, no el Navbar. |

| Relación | Valor |
|----------|-------|
| Anterior | T-006, D-003, I-009, I-014…I-017 |
| Siguiente | T-002 ampliación o T-007b (asserts HTTP); T-010 SEC |
| Commit | `docs(testing): plan integración API [T-007]` |
