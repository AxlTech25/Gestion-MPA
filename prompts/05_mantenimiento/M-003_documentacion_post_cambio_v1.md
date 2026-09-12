# M-003 — Documentación técnica post-cambio

| Campo | Valor |
|-------|-------|
| **Código** | M-003 |
| **Fase** | Mantenimiento |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Plantilla reutilizable / lista para ejecutar |
| **Modelo** | Cursor Agent |
| **Técnica** | Zero-shot acotado (M-02 de la guía) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha** | 2026-09-11 |
| **Artefacto vivo** | `documents/05_mantenimiento/changelog.md` |
| **Plantilla maestra** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt a ejecutar (anatomía D1)

```text
Rol: Actúa como technical writer de software.

Contexto: Se implementó el cambio [I-00N / versión]. Módulo […].
Contrato actual: documents/02_diseno/contrato_api_v2.md.

Tarea: Actualizar changelog (Keep a Changelog + semver). Si cambió API,
parchear el contrato. Si cambió arquitectura, ADR o architecture.md.
Si cambió HU, matriz. Citar [I-00N] en el mensaje de commit.

Formato: Markdown existente; no crear un PDF paralelo.

Restricciones: no documentar campos que no existan; ejemplos
request/response solo si el contrato cambió.

Criterios: un lector de changelog entiende qué probar (T-001).

Proceso: diff → changelog → contrato si aplica → matriz.

No hacer: no reescribir la ficha de proyecto por un parche.

Ejemplos: entrada [0.9.1] del changelog (RBAC + Excel).
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Checklist | `documents/05_mantenimiento/plantilla_documentacion_post_cambio.md` |
| Historial | `documents/05_mantenimiento/changelog.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Changelog ya era el hábito; ahora hay prompt M-02 |
| **Decisión** | **Aprobado** |
| **Lección** | Documentar post-cambio es un prompt de fase M, no un “extra” de I-* |

| Relación | Valor |
|----------|-------|
| Anterior | I-* merged |
| Siguiente | Release / M-001 |
| Commit | `docs(mantenimiento): plantilla post-cambio [M-003]` |
