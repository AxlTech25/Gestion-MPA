# T-010 — Seguridad funcional

| Campo | Valor |
|-------|-------|
| **Código** | T-010 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (un caso por RNF-SEC) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No es pentest. R-005 excluye ZAP/carga.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como QA de seguridad de aplicación (verificación RNF), no
como pentester.

Contexto: RNF-SEC-01…10. JWT, requireRole, BCRYPT, PDO, seed,
navegador no llama :8000, /ml/train admin, secretos fuera de Git.

Objetivo: SEC-01…10 con pasos observables y cruza a INT/AUTH.

Tarea: Un caso por RNF. SEC-09: comilla en código patrimonial no
rompe SQL. SEC-07: git ls-files no incluye local.php.

Entradas: R-005, I-006, I-009, M-004, T-006, T-007.

Formato: documents/04_testing/plan_seguridad_funcional.md.

Restricciones: no OWASP ZAP como entregable; no secretos en el plan;
no payloads de explotación más allá de una comilla de integridad.

Criterios: cada RNF-SEC tiene OK/FALLA; SEC-10 es recordatorio M-001.

Proceso: auth → RBAC → secretos → inyección parametrizada → seed.

No hacer: no enumerar usuarios; no crackear JWT.

Ejemplos: SEC-01 = INT-002 GET /equipos sin Bearer → 401.
```

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan | `documents/04_testing/plan_seguridad_funcional.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 10 casos = 10 RNF-SEC; pentest explícitamente fuera. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** |
| **Lección** | Seguridad funcional verifica el RNF; no sustituye un pentest. |

| Relación | Valor |
|----------|-------|
| Anterior | R-005, T-006, T-007, I-009 |
| Siguiente | Ejecución SEC; M-001 seed |
| Commit | `docs(testing): plan seguridad funcional [T-010]` |
