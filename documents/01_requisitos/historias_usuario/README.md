# Historias de usuario — Gestión MPA V2

Documentación de requisitos desde la perspectiva del usuario final y los roles operativos del sistema **Sigemad MPA**.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [personas.md](./personas.md) | Perfiles de usuario y necesidades ([R-003](../../../prompts/01_requisitos/R-003_personas_v1.md)) |
| [historias_por_epica.md](./historias_por_epica.md) | Catálogo completo de historias con criterios de aceptación |
| [matriz_trazabilidad.md](./matriz_trazabilidad.md) | Relación historia ↔ incremento SDLC ↔ versión |

## Convención de identificadores

```
HU-{EPICA}-{NNN}
```

| Prefijo | Épica |
|---------|-------|
| AUTH | Autenticación y sesión |
| CFG | Configuración organizacional |
| INV | Inventario de equipos |
| FIC | Ficha técnica y evaluación |
| MNT | Mantenimiento |
| DSH | Dashboard y consultas |
| ML | Machine Learning predictivo |
| RPT | Reportes PDF |
| CRN | Cronograma anual de preventivo |

## Formato de cada historia

Cada historia sigue la plantilla:

> **Como** [rol], **quiero** [acción], **para** [beneficio].

Incluye: prioridad (Alta/Media/Baja), estado (Implementada / En progreso / Pendiente), incremento SDLC de origen y criterios de aceptación verificables.

## Estado global (v0.10.7)

Incremento 8 (cronograma) **cerrado** 2026-09-17.

| Épica | Implementadas | Pendientes |
|-------|---------------|------------|
| Autenticación | 5 | 0 |
| Configuración | 8 | 0 |
| Inventario | 9 | 0 |
| Ficha técnica | 8 | 0 |
| Mantenimiento | 12 | 0 |
| Dashboard | 6 | 0 |
| ML predictivo | 8 | 0 |
| Reportes | 4 | 0 |
| Cronograma | 14 | 0 |

## Relación con otras carpetas

- Ambigüedades: `documents/01_requisitos/ambiguedades.md` ([R-004](../../../prompts/01_requisitos/R-004_ambiguedades_v1.md))
- RNF: `documents/01_requisitos/requisitos_no_funcionales.md` ([R-005](../../../prompts/01_requisitos/R-005_rnf_v1.md))
- Metodología: `documents/metodologia.md`
- Incrementos de implementación: `documents/03_implementacion/incrementos/`
- Pruebas funcionales: `documents/04_testing/plan_pruebas_funcionales.md`
- Pruebas unitarias: `documents/04_testing/unitarias/`
