# R-003 — Personas de usuario

| Campo | Valor |
|-------|-------|
| **Código** | R-003 |
| **Fase** | Requisitos |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (ficha de persona) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-02 (con R-001) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de experiencia de usuario institucional.

Contexto: Sigemad MPA V2. Ficha R-001. Roles de sistema: Administrador,
Técnico, Practicante. El producto es interno (unidad de informática /
patrimonio TI), no portal ciudadano.

Objetivo: Personas ficticias que anclen R-002 (quién se beneficia) sin
inventar un cuarto rol de login.

Tarea: Redactar P1–P5 con nombre, rol, área, objetivos, frustraciones,
uso típico; y una matriz persona × módulo (●/○/—).

Entradas: R-001, módulos AUTH…RPT.

Formato: Markdown por persona + tabla mapa. Archivo
documents/01_requisitos/historias_usuario/personas.md.

Restricciones: no datos personales reales de la municipalidad; no crear
rol “Consulta” como cuenta de sistema si no está en R-001.

Criterios: 5 personas; P3 y P4 no exigen login extra; mapa cubre los
8 módulos.

Proceso: listar roles → escenarios de uso → frustraciones → mapa.

No hacer: no copiar nombres de funcionarios reales; no personas de
ciudadanos.

Ejemplos: N/A.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Personas | `documents/01_requisitos/historias_usuario/personas.md` |

Entrada de **R-002** y **R-004** (P3 sin rol de sistema).

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 5 personas + mapa. Completitud plantilla 10.x de ficha de actor: OK |
| **Iteraciones** | No medido |
| **Decisión** | **Aprobado** |
| **Lección** | Separar “persona” de “rol de sistema” evita HU de un login que no existe |

| Relación | Valor |
|----------|-------|
| Anterior | R-001 |
| Siguiente | R-002, R-004 |
| Commit | `docs(requisitos): personas P1–P5 [R-003]` |
