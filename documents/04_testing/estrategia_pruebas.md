# Estrategia de pruebas — Sigemad MPA V2

**Prompt:** [T-006](../../prompts/04_testing/T-006_estrategia_pruebas_v1.md)  
**Producto:** 0.10.7 (Incremento 8 cerrado)  
**Fecha:** 2026-09-17  
**Fase SDLC:** Pruebas (Prompt-Centered SDLC v1.2)

Este documento **ordena** qué se prueba, dónde y cómo. No sustituye los casos de [T-001](../../prompts/04_testing/T-001_plan_pruebas_v1.md) ni las suites [T-002](../../prompts/04_testing/T-002_phpunit_v1.md) / [T-003](../../prompts/04_testing/T-003_vitest_v1.md) / [T-004](../../prompts/04_testing/T-004_pytest_ml_v1.md). Si un test falla: [T-005](../../prompts/04_testing/T-005_diagnostico_test_fallido_v1.md).

La IA redacta planes. El humano **ejecuta**, interpreta fallos y cubre riesgos ([metodologia.md](../metodologia.md) §4).

---

## 1. Pirámide

```text
        pocos E2E (humano, UI, XAMPP + Vite)
       menos integración HTTP (API + BD, sin navegador)
    muchas unitarias (Vitest, PHPUnit, pytest; sin Apache)
```

| Capa | Coste de mantener | Qué atrapa | Qué no atrapa |
|------|-------------------|------------|---------------|
| Unitaria | Bajo | Reglas puras (Xn, 409, roles, features ML) | JWT real, PDF, Navbar |
| Integración | Medio | Status HTTP, contrato D-003, persistencia | Layout, debounce, PDF visual |
| E2E | Alto | Flujo de usuario y persistencia visible | Ramas internas no ejercidas en la UI |

ML FastAPI es **opcional**. Si está caído, los casos ML/DEG se marcan **N/A**; el resto no se bloquea (ADR-002).

---

## 2. Tres distinciones (no mezclarlas)

| Pregunta | Nombre | Ejemplos en este repo |
|----------|--------|------------------------|
| ¿En qué capa del sistema? | **Nivel** | Unitaria, integración, E2E |
| ¿Con qué información se diseñó el caso? | **Técnica** | Caja blanca (código), caja negra (HU/RNF) |
| ¿Qué riesgo de negocio cubre? | **Tipo complementario** | Humo, seguridad, UAT, regresión, degradación, migración, compatibilidad |

Caja blanca y caja negra **no** son niveles. Un caso unitario suele ser blanca; un E2E suele ser negra; la integración puede ser ambas (INT-007 nace del contrato = negra; INT-011 nace de `Area::delete` 409 = blanca).

---

## 3. Niveles

| Nivel | Oráculo | Runner / cómo | Prefijo ID | Prompt | Plan |
|-------|---------|---------------|------------|--------|------|
| Unitaria | Función / modelo aislado | `npm test`, `composer test`, `pytest -v` | `UT-FE-*`, `UT-PHP-*`, `UT-ML-*` | T-002, T-003, T-004 | [unitarias/plan_pruebas_unitarias.md](./unitarias/plan_pruebas_unitarias.md) |
| Integración | [contrato_api_v2.md](../02_diseno/contrato_api_v2.md) | HTTP a `/api/v2/*` + BD (plan; scripts en oleada posterior) | `INT-*` | T-007 | [plan_pruebas_integracion.md](./plan_pruebas_integracion.md) |
| Extremo a extremo | HU + UI | Humano en Vite `localhost:5173` + Apache/MySQL | `AUTH-*` … `CRN-*`, `REG-*` | T-001 | [plan_pruebas_funcionales.md](./plan_pruebas_funcionales.md) |

---

## 4. Técnicas

| Técnica | Se diseña mirando | Prompt | Plan | Ejemplo |
|---------|-------------------|--------|------|---------|
| Caja blanca | Ramas y condiciones del código | T-008 | [plan_caja_blanca.md](./plan_caja_blanca.md) | `cantidadValida(0)` y `(31)`; `delete` con equipos |
| Caja negra | HU, RNF, personas, contrato | T-001 v1.7 | [plan_caja_negra.md](./plan_caja_negra.md) | Código patrimonial 11 / 12 / 13 dígitos |

IDs de caja blanca: `CB-PHP-*`, `CB-FE-*`, `CB-ML-*` (apuntan a un UT existente o pendiente). No se duplica el assert: el plan blanca **clasifica** las suites.

---

## 5. Tipos complementarios

Cubren un **riesgo**; se ejecutan encima de un nivel.

| Tipo | Riesgo | Prefijo | Prompt | Plan | RNF / ADR |
|------|--------|---------|--------|------|-----------|
| Humo | El sistema no arranca | `SMOKE-*` | T-009 | [plan_humo_compatibilidad.md](./plan_humo_compatibilidad.md) | RNF-QUA-01; entrada de M-001 |
| Compatibilidad | Vite ≠ `dist/` Hostinger; F5 404 | `CMP-*` | T-009 | mismo | RNF-UX-01, RNF-OPS |
| Seguridad funcional | Authz rota (no es pentest) | `SEC-*` | T-010 | [plan_seguridad_funcional.md](./plan_seguridad_funcional.md) | RNF-SEC-01…10 |
| Aceptación (UAT) | El rol no termina su trabajo | `UAT-P*` | T-011 | [plan_aceptacion_uat.md](./plan_aceptacion_uat.md) | R-003 personas |
| Regresión | Un incremento rompe el anterior | `REG-*`, `REG-INC-*` | T-012 | [plan_regresion.md](./plan_regresion.md) | changelog 0.1.0–0.10.7 |
| Degradación ML | FastAPI caído tumba el núcleo | `DEG-*` | T-013 | [plan_degradacion_ml.md](./plan_degradacion_ml.md) | RNF-AVA, ADR-002 |
| Migración / integridad | ALTER borra filas; 12 dígitos | `MIG-*` | T-014 | [plan_migracion_datos.md](./plan_migracion_datos.md) | RNF-DAT |

### Referencias cruzadas (no copiar el caso dos veces)

| Caso “dueño” | También satisface |
|--------------|-------------------|
| AUTH-001 | SMOKE-001, UAT (login de todas las personas) |
| AUTH-007 / INT-004 | SEC-02 |
| REG-004 / INT-002 | SEC-01 |
| CRN-011 | UAT-P5 (no escribe cronograma), SEC RBAC |
| CFG-010 / INT-011 / MIG-005 | mismo 409 de área |
| ML-003 / INT-013 / DEG-001 / SMOKE-005 | degradación |
| INV-007 | caja negra límite 12 dígitos; MIG-004 unicidad |

---

## 6. Mapa RNF → plan

| RNF | Plan que puede fallarlo |
|-----|-------------------------|
| RNF-SEC-01…10 | T-010; parte en T-007 y T-001 AUTH/REG |
| RNF-AVA-01…04 | T-013; T-001 ML-003/006; INT-013 |
| RNF-DAT-01…05 | T-014; INV-007/008; INT-011 |
| RNF-UX-01…04 | T-009 CMP; T-001 CFG-008, MNT campos condicionales |
| RNF-OPS-01…05 | T-009; M-001 (no es fase T) |
| RNF-QUA-01 | Este índice + T-001 |
| RNF-QUA-02 | T-002…T-004 en verde antes de release |
| RNF-QUA-03 | Revisión humana de cada T-* (política de IA) |

---

## 7. Orden de ejecución (cuando se corra, no ahora)

1. Unitarias (minutos).
2. Humo local (SMOKE).
3. Integración INT-* (cuando existan scripts o curl documentado).
4. Seguridad SEC-* que no estén ya en INT.
5. E2E caja negra por módulo (T-001), ML en N/A si aplica.
6. Degradación DEG-* (FastAPI apagado a propósito).
7. UAT con usuario clave (T-011).
8. Regresión REG-INC-* si hubo cambio desde la última corrida.
9. Migración MIG-* sobre **copia** de BD, nunca producción.
10. Compatibilidad CMP-* antes de M-001; humo otra vez en Hostinger.

Estados al registrar: **OK** | **FALLA** | **BLOQUEADO** | **N/A**. Plantilla: [plantilla_registro_resultados.md](./plantilla_registro_resultados.md).

---

## 8. Criterios de salida

### 8.1 De esta oleada (planificación)

- [x] Estrategia T-006 publicada
- [x] Planes T-007…T-014 y T-001 v1.7 existen y se enlazan desde el [README](./README.md)
- [x] Un técnico distingue nivel / técnica / tipo
- [x] IDs con dueño único o referencia cruzada

### 8.2 De una ronda de ejecución (más adelante)

- Suites UT en verde (RNF-QUA-02)
- ≥ 95 % de casos E2E de prioridad Alta en OK (T-001 §9)
- 0 defectos Alta abiertos
- SMOKE OK en el entorno que se va a publicar
- DEG o N/A documentado; ML no bloquea release institucional
- UAT firmado si hay usuario clave
- Evidencias en `evidencias/YYYY-MM-DD/` sin secretos

---

## 9. Fuera de alcance (R-005 y T-001)

| Ítem | Motivo |
|------|--------|
| Pruebas de carga / estrés | Excluidas en R-005 |
| Pentest formal / OWASP ZAP como entregable | Excluidas; SEC-* es verificación de RNF |
| HA multi-región, SLA contractual | No son RNF del producto |
| Playwright / Cypress | E2E sigue siendo humano en esta oleada |
| Testing Library de páginas React | Deuda del plan unitario §5 |
| Cobertura de rama ≥ 80 % medida | Deuda D2 de T-002…T-004 |
| Inferencia ML E2E con `.joblib` | Deuda; no bloquea |
| CI GitHub Actions | Opcional en plan unitario §6 |

---

## 10. Credenciales y datos

Solo entorno **local**. Seed: `admin` / `admin123`. En producción hay que cambiarlo (RNF-SEC-10, M-001). Códigos patrimoniales de prueba: 12 dígitos (`740000001001` …). No commitear `local.php` ni JWT reales.

---

## 11. Referencias

- [R-005 RNF](../01_requisitos/requisitos_no_funcionales.md)
- [R-003 personas](../01_requisitos/historias_usuario/personas.md)
- [Contrato API](../02_diseno/contrato_api_v2.md)
- [ADR-002](../02_diseno/adr/ADR-002-degradacion-ml.md)
- [Changelog](../05_mantenimiento/changelog.md)
- [Catálogo de prompts](../../prompts/gobernanza/catalogo.md)
