# T-009 — Humo y compatibilidad

| Campo | Valor |
|-------|-------|
| **Código** | T-009 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (checklist ≤ 15 min) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como QA de release. Checklist corto, no el plan T-001.

Contexto: 0.10.7. Local XAMPP+Vite y build de producción (M-001). ML
opcional. RNF-UX-01 recarga SPA. RNF-OPS-03 npm run build.

Objetivo: SMOKE-001…005 (15 min) y CMP-001…003.

Tarea: Login, dashboard, inventario, cronograma listado, ml/status
sin tumbar UI. F5 en /v2/inventario. dist/ sirve V2. Producción sin
ml_service_url = inventario usable (detalle en T-013).

Entradas: T-006, M-001, produccion.md, AUTH-001.

Formato: documents/04_testing/plan_humo_compatibilidad.md.

Restricciones: no carga; no pentest; seed solo local.

Criterios: un técnico termina humo en ≤ 15 min; CMP no exige VPS.

Proceso: arranque → 5 humo → 3 compat → enlace M-001.

No hacer: no repetir MNT-001…018.

Ejemplos: SMOKE-001 = AUTH-001 recortado a “entra al dashboard”.
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_humo_compatibilidad.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 SMOKE + 3 CMP; entrada de M-001. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Humo no es una versión corta de T-001: es “¿puedo publicar?” |

| Relación | Valor |
|----------|-------|
| Anterior | T-006, M-001, RNF-UX/OPS |
| Siguiente | M-001 post-despliegue; T-013 |
| Commit | `docs(testing): plan humo y compatibilidad [T-009]` |
