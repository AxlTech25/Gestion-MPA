# Registro de métricas D2 — Sigemad MPA V2

**Metodología:** Prompt-Centered SDLC v1.2 (propuesta en validación)  
**Caso:** Sigemad MPA V2  
**Última actualización:** 2026-09-09

---

## Resumen ejecutivo

| Métrica | Valor | Umbral guía | Estado |
|---------|-------|-------------|--------|
| Historias de usuario | 56 implementadas (catálogo v0.9.0) | Alcance cerrado | OK |
| Incrementos de implementación | 7 | Trazables a versión | OK |
| Prompts versionados | 8 | Repositorio por fase | OK |
| Plan de pruebas funcionales | Documentado | Casos por módulo | OK |
| Suites unitarias | Vitest + PHPUnit + pytest | Críticos en verde antes de release | OK |
| ADR | 1 (stack V2) | Decisiones de arquitectura | OK |

---

## Registro por prompt

| Código | Fase | Versión | Resultado | Decisión |
|--------|------|---------|-----------|----------|
| R-001 | Requisitos | v1 | Ficha de proyecto y alcance | Aprobado |
| R-002 | Requisitos | v1 | Catálogo HU por épica | Aprobado |
| D-001 | Diseño | v1 | Esquema `v2_estructura.sql` + extensión fase 7 | Aprobado |
| D-002 | Diseño | v1 | ADR-001 stack React/PHP/MySQL/FastAPI | Aprobado |
| I-001 | Implementación | v1 | API V2, inventario, mantenimiento, auth | Aprobado |
| I-002 | Implementación | v1 | Microservicio ML y proxy PHP | Aprobado |
| T-001 | Pruebas | v1 | Plan funcional y unitario | Aprobado |
| M-001 | Mantenimiento | v1 | Guía Hostinger | Aprobado |

---

## Próxima medición

Tras cada incremento: actualizar este registro, changelog y matriz de trazabilidad. No abrir un «sprint» nuevo; abrir un incremento o una iteración D2 del prompt afectado.
