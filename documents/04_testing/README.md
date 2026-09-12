# Pruebas funcionales — Gestión MPA V2

Documentación para validar el sistema antes de entrega o despliegue. Corresponde a la **fase de pruebas** del Prompt-Centered SDLC v1.2.

Prompts: [T-001](../../prompts/04_testing/T-001_plan_pruebas_v1.md) plan · [T-002](../../prompts/04_testing/T-002_phpunit_v1.md) PHPUnit · [T-003](../../prompts/04_testing/T-003_vitest_v1.md) Vitest · [T-004](../../prompts/04_testing/T-004_pytest_ml_v1.md) pytest · [T-005](../../prompts/04_testing/T-005_diagnostico_test_fallido_v1.md) diagnóstico. Catálogo: [prompts/gobernanza/catalogo.md](../../prompts/gobernanza/catalogo.md).

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [plan_pruebas_funcionales.md](./plan_pruebas_funcionales.md) | Plan maestro: alcance, entorno, casos por módulo, criterios de aceptación |
| [plantilla_registro_resultados.md](./plantilla_registro_resultados.md) | Plantilla para registrar ejecución, evidencias y firmas |
| [unitarias/README.md](./unitarias/README.md) | Pruebas unitarias automatizadas (Vitest, PHPUnit, pytest) |
| [diagnostico_test_fallido.md](./diagnostico_test_fallido.md) | Plantilla T-02 por fallo |

## Versión bajo prueba

**0.9.1** — incluye telemetría, mantenimiento ampliado, consulta en dashboard, integración ML, ficha predictiva, RBAC de usuarios en API y plantilla Excel alineada.

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
