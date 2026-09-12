# T-005 — Diagnóstico de test fallido (plantilla)

| Campo | Valor |
|-------|-------|
| **Código** | T-005 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Plantilla reutilizable / lista para ejecutar |
| **Modelo** | Cursor Agent (cuando falle un test) |
| **Técnica** | CoT guiado (T-02 de la guía) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha** | 2026-09-11 |
| **Plantilla maestra** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No hay un fallo concreto asociado. Copiar la ficha en `documents/04_testing/diagnostico_test_fallido.md` por incidente.

---

## Prompt a ejecutar (anatomía D1)

```text
Rol: Actúa como ingeniero de debugging.

Contexto: El siguiente test falla en [Vitest | PHPUnit | pytest | XAMPP].
Proyecto Sigemad MPA V2. No reescribir el módulo.

Entrada: Stack trace: [pegar]. Código: [archivo:líneas]. Assert esperado: […].

Tarea: Causa probable, evidencia, cambio mínimo, riesgo, test de
regresión (¿basta este?).

Formato: Llenar la tabla de documents/04_testing/diagnostico_test_fallido.md.

Restricciones: no sleeps; no relajar el assert sin justificar; no
proponer un rewrite.

Criterios: un cambio local o “el test está mal” con prueba.

Proceso: leer traza → ubicar línea → hipótesis → parche mínimo.

No hacer: no tocar secretos ni producción.

Ejemplos: N/A — pegar el error real.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plantilla de ficha | `documents/04_testing/diagnostico_test_fallido.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Plantilla lista; 0 fichas llenas (aún no hay incidente oleada 3) |
| **Iteraciones** | N/A |
| **Decisión** | **Aprobado** como T-02 reutilizable |
| **Lección** | El prompt T-02 se versiona vacío; la ficha se llena por fallo |

| Relación | Valor |
|----------|-------|
| Anterior | T-002, T-003, T-004 |
| Siguiente | fix `[T-005]` + SHA |
| Commit | `docs(testing): plantilla diagnóstico T-02 [T-005]` |
