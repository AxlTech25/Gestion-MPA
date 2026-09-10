# D-002 — Decisión de arquitectura

| Campo | Valor |
|-------|-------|
| **Código** | D-002 |
| **Fase** | Diseño |
| **Versión** | v1 |
| **Estado** | Aprobado |

---

## Prompt ejecutado

**Rol:** Arquitecto de software.

**Contexto:** Hosting PHP, equipo pequeño, necesidad de ML opcional.

**Tarea:** Proponer stack, separación de capas, flujo JWT y patrón proxy hacia FastAPI. Registrar ADR.

**Restricciones:** No exponer Python al navegador. Operación degradada si ML está caído.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Arquitectura | `documents/02_diseno/architecture.md` |
| ADR-001 | `documents/02_diseno/adr/ADR-001-stack-arquitectura.md` |

## Decisión

**Aprobado** — React + PHP API + MySQL + FastAPI opcional.
