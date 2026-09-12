# M-004 — Rollback y secretos en Hostinger

| Campo | Valor |
|-------|-------|
| **Código** | M-004 |
| **Fase** | Mantenimiento |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (pasos de restore) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Cierra deuda** | M-001 D2 (rollback sin heading) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero de operación PHP en hosting compartido.

Contexto: Guía Hostinger (M-001) tiene deploy y checklist pero no
apartado Rollback. No hay git en el servidor. local.php y JWT no van
a Git. ML vacío no es incidente.

Objetivo: Procedimiento de respaldo + restore + secretos, con heading
explícito “Rollback”.

Tarea: Añadir a hostinger.md: qué copiar antes (dump SQL, public_html),
cómo restaurar dist/ + backend/ + local.php, cuándo revertir migración,
smoke login, y que ml_service_url vacío es normal. Checkbox de dump en
el checklist.

Entradas: M-001, RNF-OPS-04, RNF-SEC-07, ADR-002.

Formato: sección dentro de documents/05_mantenimiento/hostinger.md
(no un tercer how-to).

Restricciones: no git push --force; no chmod 777; no pegar passwords
reales; no ALTER inverso no ensayado.

Criterios: un operador puede rollback sin el autor del código; el
criterio de M-001 queda cumplido.

Proceso: backup → restore archivos → restore BD si hubo migrate →
smoke → secretos.

No hacer: no mezclar instrucciones VPS como si fueran del plan compartido.

Ejemplos: N/A.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Sección Rollback + checklist | `documents/05_mantenimiento/hostinger.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Heading Rollback presente; 6 pasos; ítem de dump en checklist |
| **Iteraciones** | 1 (cierra desvío de formato de M-001) |
| **Decisión** | **Aprobado** |
| **Lección** | La deuda D2 se cierra con un prompt nuevo (M-004), no reescribiendo en silencio M-001 como si el rollback siempre hubiera estado |

| Relación | Valor |
|----------|-------|
| Anterior | M-001, M-002 |
| Siguiente | Operación |
| Commit | `docs(mantenimiento): rollback y secretos Hostinger [M-004]` |
