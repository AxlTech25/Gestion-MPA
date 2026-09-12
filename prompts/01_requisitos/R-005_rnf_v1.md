# R-005 — Requisitos no funcionales

| Campo | Valor |
|-------|-------|
| **Código** | R-005 |
| **Fase** | Requisitos |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (tabla ID / requisito / evidencia) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Producto** | 0.9.1 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de requisitos no funcionales (seguridad,
disponibilidad, datos, operación).

Contexto: Sigemad MPA V2 en Hostinger PHP + XAMPP. ML opcional (R-004,
ADR-001). Roles Administrador / Tecnico / Practicante. Código patrimonial
12 dígitos. Política de IA: sin secretos en prompts.

Objetivo: RNF verificables con ID, no párrafos vagos (“el sistema debe
ser seguro”).

Tarea: Redactar RNF-SEC, AVA, DAT, UX, OPS, QUA con evidencia (prompt I-*,
HU, ADR). Excluir carga, pentest y SLA contractual.

Entradas: R-001, R-004, architecture.md, I-006, I-007, I-009, M-001.

Formato: documents/01_requisitos/requisitos_no_funcionales.md, tablas.

Restricciones: cada RNF debe poder fallar o pasar; no inventar HA
multi-región.

Criterios: JWT, requireRole, degradación ML, BCRYPT, secretos fuera de
Git y 12 dígitos están listados.

Proceso: seguridad → disponibilidad → datos → UX → ops → calidad.

No hacer: no repetir el catálogo HU; enlazar evidencia.

Ejemplos: RNF-SEC-01 | Toda ruta salvo /auth exige JWT | I-006.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| RNF | `documents/01_requisitos/requisitos_no_funcionales.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 6 grupos; RNF-SEC-01…10 y AVA-01…04 cubren el hueco de oleada 1 |
| **Iteraciones** | 1 |
| **Decisión** | **Aprobado** |
| **Lección** | Un RNF sin columna “evidencia” no es testeable |

| Relación | Valor |
|----------|-------|
| Anterior | R-004 |
| Siguiente | D-003, D-006, T-001 |
| Commit | `docs(requisitos): RNF con evidencia [R-005]` |
