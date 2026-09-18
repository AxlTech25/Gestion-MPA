# I-017 — Gerencias, CRUD de áreas y bandas en el cronograma

| Campo | Valor |
|-------|-------|
| **Código** | I-017 |
| **Título** | Catálogo de gerencias; editar/eliminar área; agrupar cronograma como el papel |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Aprobado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (I-005, I-009, I-016) |
| **Autor / revisor** | Equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Incremento / versión producto** | 0.10.7 |
| **Historias** | HU-CFG-007, HU-CFG-008, HU-CRN-015 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8 / React 19.

Contexto: Sigemad MPA 0.10.6. El papel 2024 agrupa áreas bajo filas de
gerencia (banda, sin Xn). v2_areas solo tiene alta; no se edita ni borra.
El responsable pidió: asignar cada área a una gerencia (selector, no
etiqueta libre) y, al tocar Configuración, poder editar y eliminar áreas.

Objetivo: Catálogo v2_gerencias; área.gerencia_id opcional; CRUD de área
(Admin); matriz y PDF con fila banda. Documentar R→D→I→T (0.10.7).

Tarea:
1. Migración v2_gerencias + gerencia_id en v2_areas (SET NULL).
2. API /gerencias y PUT/DELETE /areas?id= (requireRole Administrador).
3. Configuración: selector de gerencia; Editar/Eliminar área; alta de gerencia.
4. Matriz y PDF: banda de gerencia; N° solo en áreas; sin gerencia = sin
   bandas (compatibilidad) o «OTRAS ÁREAS» al final si hay alguna asignada.
5. No borrar área con equipos (409). Changelog 0.10.7.

Restricciones: no auto-fill del Gantt; SIGA/SAF siguen siendo áreas
(servidor), no gerencias inventadas; practicante no escribe; no mezclar
con fichas; no etiqueta de texto libre como verdad de agrupación.

Criterios: un área se edita y se asigna a una gerencia; eliminar área con
equipos se rechaza; cronograma/PDF muestran la banda; PHPUnit/Vitest de
agrupación en verde.
```

### Checklist D1 (cap. 11.1)

- [x] El rol del LLM está definido.
- [x] El contexto del sistema es suficiente.
- [x] La tarea es específica y verificable.
- [x] El formato de salida está definido.
- [x] Hay restricciones técnicas y de seguridad.
- [x] Hay ejemplo (few-shot I-005 / I-016).
- [x] Hay criterios de aceptación observables.
- [x] Se prohibieron auto-fill, SIGA-como-gerencia y etiqueta libre.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| DDL | `backend/sql/v2_gerencias.sql`, `backend/tools/migrate_gerencias.php` |
| API | `Gerencia.php` / `Area.php` / rutas `/gerencias`, PUT/DELETE `/areas` |
| UI | `ConfiguracionPage`, `AreaForm` |
| Cronograma | `Cronograma::areasConConteos`, `CronogramaMatrizPage`, `ReporteController` |
| Changelog | `documents/05_mantenimiento/changelog.md` 0.10.7 |

Salida usada como entrada de **T-001** v1.6 (CFG-009…011, CRN-017).

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | PHPUnit AreaTest + Cronograma bandas; Vitest `debeMostrarBandaGerencia`; Configuración Admin |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | El papel agrupa por gerencia; I-005 solo daba de alta áreas |
| **Decisión** | **Aprobado** (responsable cerró el Incremento 8 el 2026-09-17) |
| **Lección** | La gerencia es dato de organización (`v2_areas`), no un adorno del PDF |

| Relación | Valor |
|----------|-------|
| Anterior | R-006 v1.9, D-007 refinamiento I-017, I-016 |
| Siguiente | Incremento 8 cerrado; M-001 u otro R-* |
| Commit sugerido | `feat(org): gerencias, CRUD de áreas y bandas en cronograma [I-017]` |
