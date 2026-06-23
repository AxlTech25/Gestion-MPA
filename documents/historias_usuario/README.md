# Historias de usuario — Gestión MPA V2

Documentación de requisitos desde la perspectiva del usuario final y los roles operativos del sistema **Sigemad MPA**.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [personas.md](./personas.md) | Perfiles de usuario y necesidades |
| [historias_por_epica.md](./historias_por_epica.md) | Catálogo completo de historias con criterios de aceptación |
| [matriz_trazabilidad.md](./matriz_trazabilidad.md) | Relación historia ↔ sprint ↔ versión |

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

Incluye: prioridad (Alta/Media/Baja), estado (Implementada / En progreso / Pendiente), sprint de origen y criterios de aceptación verificables.

## Estado global (v0.8.0)

| Épica | Implementadas | Pendientes |
|-------|---------------|------------|
| Autenticación | 4 | 0 |
| Configuración | 5 | 0 |
| Inventario | 9 | 1 |
| Ficha técnica | 7 | 1 |
| Mantenimiento | 12 | 0 |
| Dashboard | 6 | 0 |
| ML predictivo | 6 | 2 |
| Reportes | 4 | 0 |

## Relación con otras carpetas

- Sprints técnicos: `documents/sprints/`
- Pruebas funcionales: `documents/pruebas/plan_pruebas_funcionales.md`
- Pruebas unitarias: `documents/pruebas/unitarias/`
