# Historias de usuario — Gestión MPA V2

Documentación de requisitos desde la perspectiva del usuario final y los roles operativos del sistema **Sigemad MPA**.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [personas.md](./personas.md) | Perfiles de usuario y necesidades |
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

## Formato de cada historia

Cada historia sigue la plantilla:

> **Como** [rol], **quiero** [acción], **para** [beneficio].

Incluye: prioridad (Alta/Media/Baja), estado (Implementada / En progreso / Pendiente), incremento SDLC de origen y criterios de aceptación verificables.

## Estado global (v0.9.1)

| Épica | Implementadas | Pendientes |
|-------|---------------|------------|
| Autenticación | 5 | 0 |
| Configuración | 6 | 0 |
| Inventario | 9 | 0 |
| Ficha técnica | 8 | 0 |
| Mantenimiento | 12 | 0 |
| Dashboard | 6 | 0 |
| ML predictivo | 8 | 0 |
| Reportes | 4 | 0 |

## Relación con otras carpetas

- Metodología: `documents/metodologia.md`
- Incrementos de implementación: `documents/03_implementacion/incrementos/`
- Pruebas funcionales: `documents/04_testing/plan_pruebas_funcionales.md`
- Pruebas unitarias: `documents/04_testing/unitarias/`
