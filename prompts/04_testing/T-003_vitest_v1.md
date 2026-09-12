# T-003 — Tests Vitest

| Campo | Valor |
|-------|-------|
| **Código** | T-003 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (Vitest) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero QA especializado en Vitest.

Contexto: Utilidades JS usadas por MantenimientoForm (tipo PC vs
impresora) y ConsultaEquiposPanel (conteos). D-004: extraer lógica
testeable a src/lib, no montar la página entera.

Objetivo: UT-FE-001…005 en verde con `npm test`.

Tarea: Tests de isTipoComputadora, isTipoImpresora (case),
countMapFromItems (string/number/null).

Entradas: src/lib/equipoTipo.js (o equivalente), plan unitario §2.1.

Formato: src/lib/*.test.js.

Restricciones: no Testing Library de páginas (deuda); no mocks de API.

Criterios: npm test verde; null → {}.

Proceso: identificar ramas → casos borde → asserts.

No hacer: no snapshot de JSX.

Ejemplos: isTipoImpresora('impresora') === true.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Suite JS | `src/lib/equipoTipo.test.js` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 casos UT-FE; plan §2.1 |
| **Iteraciones** | No medido |
| **Decisión** | **Aprobado** |
| **Lección** | Extraer `equipoTipo` del formulario es lo que hace viable T-003 |

| Relación | Valor |
|----------|-------|
| Anterior | D-004, I-008 |
| Siguiente | T-005 |
| Commit | `test(js): tipos de equipo y conteos [T-003]` |
