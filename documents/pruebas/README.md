# Pruebas funcionales — Gestión MPA V2

Documentación para validar el sistema antes de entrega o despliegue.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [plan_pruebas_funcionales.md](./plan_pruebas_funcionales.md) | Plan maestro: alcance, entorno, casos por módulo, criterios de aceptación |
| [plantilla_registro_resultados.md](./plantilla_registro_resultados.md) | Plantilla para registrar ejecución, evidencias y firmas |
| [unitarias/README.md](./unitarias/README.md) | Pruebas unitarias automatizadas (Vitest, PHPUnit, pytest) |

## Versión bajo prueba

**0.8.0** (Sprint 7 en progreso) — incluye telemetría, mantenimiento ampliado, consulta en dashboard e integración ML v1.

## Orden recomendado de ejecución

1. **Preparación del entorno** (sección 2 del plan)
2. **Autenticación** (AUTH)
3. **Configuración** — áreas y usuarios (CFG)
4. **Inventario** — registro y listado (INV)
5. **Ficha técnica** (FIC)
6. **Mantenimiento** (MNT)
7. **Dashboard** — métricas y consulta (DSH)
8. **Machine Learning** (ML) — requiere FastAPI activo
9. **Regresión transversal** (REG)

## Convención de IDs

`MOD-NNN` — ejemplo: `MNT-012` = caso 12 del módulo Mantenimiento.

Estados al registrar resultados: **OK** | **FALLA** | **BLOQUEADO** | **N/A**
