# Pruebas — Gestión MPA V2

Fase de **pruebas** del Prompt-Centered SDLC v1.2. Índice: [estrategia_pruebas.md](./estrategia_pruebas.md) ([T-006](../../prompts/04_testing/T-006_estrategia_pruebas_v1.md)).

Catálogo: [prompts/gobernanza/catalogo.md](../../prompts/gobernanza/catalogo.md).

## Versión bajo prueba

**0.10.7** — Incremento 8 cerrado (cronograma Xn, PDF A4, gerencias, CRUD áreas). ML opcional (ADR-002).

## Contenido

| Documento | Tipo | Prompt |
|-----------|------|--------|
| [estrategia_pruebas.md](./estrategia_pruebas.md) | Pirámide, niveles, técnicas, complementarios | T-006 |
| [plan_pruebas_funcionales.md](./plan_pruebas_funcionales.md) | E2E caja negra (AUTH…CRN, REG) | T-001 v1.7 |
| [plan_caja_negra.md](./plan_caja_negra.md) | Equivalencia y límites | T-001 v1.7 |
| [plan_caja_blanca.md](./plan_caja_blanca.md) | Ramas de código → UT | T-008 |
| [plan_pruebas_integracion.md](./plan_pruebas_integracion.md) | HTTP API + BD (`INT-*`) | T-007 |
| [unitarias/README.md](./unitarias/README.md) | Vitest, PHPUnit, pytest | T-002…T-004 |
| [plan_humo_compatibilidad.md](./plan_humo_compatibilidad.md) | SMOKE / CMP | T-009 |
| [plan_seguridad_funcional.md](./plan_seguridad_funcional.md) | RNF-SEC (`SEC-*`) | T-010 |
| [plan_aceptacion_uat.md](./plan_aceptacion_uat.md) | Personas P1–P5 | T-011 |
| [plan_regresion.md](./plan_regresion.md) | Por incremento | T-012 |
| [plan_degradacion_ml.md](./plan_degradacion_ml.md) | FastAPI down | T-013 |
| [plan_migracion_datos.md](./plan_migracion_datos.md) | ALTER / 12 dígitos / 409 | T-014 |
| [plantilla_registro_resultados.md](./plantilla_registro_resultados.md) | Ejecución y firmas | — |
| [diagnostico_test_fallido.md](./diagnostico_test_fallido.md) | Fallo de suite | T-005 |

## Orden de ejecución (cuando se corra)

1. Unitarias (`npm test`, `composer test`, `pytest`)
2. Humo (T-009)
3. Integración (T-007)
4. Seguridad que no esté en INT (T-010)
5. E2E T-001: AUTH → CFG → INV → FIC → MNT → DSH → ML → **CRN** → REG
6. Degradación ML (T-013) con uvicorn parado
7. UAT (T-011)
8. Regresión INC si hubo cambio (T-012)
9. Migración sobre **copia** de BD (T-014)
10. Compatibilidad / humo Hostinger (T-009 → M-001)

Estados: **OK** | **FALLA** | **BLOQUEADO** | **N/A**

## Convención de IDs

| Prefijo | Plan |
|---------|------|
| `UT-*` | Unitarias |
| `CB-*` | Caja blanca (apunta a UT) |
| `INT-*` | Integración |
| `AUTH`…`CRN`, `REG-*` | E2E T-001 |
| `SMOKE-*`, `CMP-*` | Humo / compatibilidad |
| `SEC-*` | Seguridad funcional |
| `UAT-P*` | Aceptación |
| `REG-INC-*` | Regresión por incremento |
| `DEG-*` | Degradación ML |
| `MIG-*` | Migración |

No commitear evidencias con secretos: [evidencias/](./evidencias/).
