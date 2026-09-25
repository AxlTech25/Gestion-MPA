# Catálogo de prompts — Sigemad MPA V2

Índice D3 (mapa de prompts por fase) según Prompt-Centered SDLC v1.2, cap. 4.3 y 5.

**Oleada 1 (2026-09-11):** plantilla + anatomía D1/D2 de los registros iniciales.  
**Oleada 2 (2026-09-11):** I-001…I-009 por incremento; macros Superados.  
**Oleada 3 (2026-09-11):** huecos de la guía (R-01, RNF, contrato, as-built front, D-005, ADR-002, T-01 por runner, T-02, M-01, M-02, rollback).  
**Oleada 4 (2026-09-17):** estrategia T-006 y planes T-007…T-014 (niveles, técnicas, complementarios). T-001 v1.7 = E2E caja negra.

Plantilla: [`_plantilla_prompt.md`](./_plantilla_prompt.md).  
Métricas: [`registro_metricas.md`](./registro_metricas.md).  
Política: [`politicas_uso_ia.md`](./politicas_uso_ia.md).  
Índice I-*: [`../03_implementacion/README.md`](../03_implementacion/README.md).

---

## Inventario vigente

### Requisitos

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [R-001](../01_requisitos/R-001_elicitacion_v1.md) | v1.1 | Reconstruido | `ficha-proyecto.md` |
| [R-002](../01_requisitos/R-002_historias_usuario_v1.md) | v1.1 | Reconstruido | `historias_por_epica.md` |
| [R-003](../01_requisitos/R-003_personas_v1.md) | v1 | Reconstruido | `personas.md` |
| [R-004](../01_requisitos/R-004_ambiguedades_v1.md) | v1 | Ejecutado | `ambiguedades.md` |
| [R-005](../01_requisitos/R-005_rnf_v1.md) | v1 | Ejecutado | `requisitos_no_funcionales.md` |
| [R-006](../01_requisitos/R-006_cronograma_anual_v1.md) | v1.9 | **Cerrado** | Incremento 8 / 0.10.7 (I-017) |

### Diseño

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [D-001](../02_diseno/D-001_modelo_datos_v1.md) | v1.1 | Reconstruido | `v2_estructura.sql` |
| [D-001 v2](../02_diseno/D-001_modelo_datos_v2_refinado.md) | v2 | Ejecutado | `er_v2.md` |
| [D-002](../02_diseno/D-002_decision_arquitectura_v1.md) | v1.1 | Reconstruido | ADR-001 |
| [D-003](../02_diseno/D-003_contrato_api_v1.md) | v1 | Ejecutado | `contrato_api_v2.md` |
| [D-004](../02_diseno/D-004_frontend_features_v1.md) | v1 | Ejecutado | `frontend_features.md` |
| [D-005](../02_diseno/D-005_analisis_ml_v1.md) | v1 | Reconstruido | `ml/mantenimiento_predictivo_analisis.md` |
| [D-006](../02_diseno/D-006_adr_degradacion_ml_v1.md) | v1 | Ejecutado | ADR-002 |
| [D-007](../02_diseno/D-007_cronograma_v1.md) | v1 | Cerrado | `cronograma.md`, ADR-003 (inc. 8) |

### Implementación

Ver [README de I-*](../03_implementacion/README.md). I-001…I-017 vigentes; I-001-MACRO e I-002-ML Superados.

### Pruebas

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [T-001](../04_testing/T-001_plan_pruebas_v1.md) | v1.7 | Ejecutado | E2E caja negra 0.10.7 + `plan_caja_negra.md` |
| [T-002](../04_testing/T-002_phpunit_v1.md) | v1 | Reconstruido | `backend/tests/` |
| [T-003](../04_testing/T-003_vitest_v1.md) | v1 | Reconstruido | `src/lib/*.test.js`, `cronogramaUtils.test.js` |
| [T-004](../04_testing/T-004_pytest_ml_v1.md) | v1 | Reconstruido | `ml/tests/` |
| [T-005](../04_testing/T-005_diagnostico_test_fallido_v1.md) | v1 | Plantilla | `diagnostico_test_fallido.md` |
| [T-006](../04_testing/T-006_estrategia_pruebas_v1.md) | v1 | Ejecutado | `estrategia_pruebas.md` |
| [T-007](../04_testing/T-007_integracion_api_v1.md) | v1 | Ejecutado | `plan_pruebas_integracion.md` |
| [T-008](../04_testing/T-008_caja_blanca_v1.md) | v1 | Ejecutado | `plan_caja_blanca.md` |
| [T-009](../04_testing/T-009_humo_compatibilidad_v1.md) | v1 | Ejecutado | `plan_humo_compatibilidad.md` |
| [T-010](../04_testing/T-010_seguridad_funcional_v1.md) | v1 | Ejecutado | `plan_seguridad_funcional.md` |
| [T-011](../04_testing/T-011_aceptacion_uat_v1.md) | v1 | Ejecutado | `plan_aceptacion_uat.md` |
| [T-012](../04_testing/T-012_regresion_v1.md) | v1 | Ejecutado | `plan_regresion.md` |
| [T-013](../04_testing/T-013_degradacion_ml_v1.md) | v1 | Ejecutado | `plan_degradacion_ml.md` |
| [T-014](../04_testing/T-014_migracion_datos_v1.md) | v1 | Ejecutado | `plan_migracion_datos.md` |

### Mantenimiento

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [M-001](../05_mantenimiento/M-001_deploy_produccion_v1.md) | v1.2 | Reconstruido | `produccion.md` (deploy) |
| [M-002](../05_mantenimiento/M-002_analisis_impacto_v1.md) | v1 | Plantilla | `plantilla_analisis_impacto.md` |
| [M-002 cronograma](../05_mantenimiento/M-002_cronograma_v1.md) | v1 | Ejecutado | `impacto_cronograma.md` |
| [M-003](../05_mantenimiento/M-003_documentacion_post_cambio_v1.md) | v1 | Plantilla | changelog + plantilla M-02 |
| [M-004](../05_mantenimiento/M-004_rollback_secretos_v1.md) | v1 | Ejecutado | `produccion.md` § Rollback |

---

## Cadena de evidencia

```text
R-001 ficha → R-003 personas → R-004 ambigüedades → R-005 RNF
  → R-002 historias
  → R-006 cronograma anual (cerrado, Incremento 8 / 0.10.7)
    → M-002 impacto cronograma → ADR-003 + D-007
      → I-010 (0.10.0) → I-011 (0.10.1) → I-012 (0.10.2) → I-013 (0.10.3) → I-014 (0.10.4) → I-015 (0.10.5) → I-016 (0.10.6) → I-017 (0.10.7) [cierre 2026-09-17]
    → D-002 stack + D-001 datos + D-003 contrato + D-004 front
      → D-005 análisis ML → D-006 ADR-002
        → I-001 … I-009
          → T-006 estrategia
            → T-001 E2E caja negra + T-008 caja blanca
            → T-007 integración INT-*
            → T-002 PHPUnit / T-003 Vitest / T-004 pytest
              → T-005 si falla
            → T-009 humo/compat → T-010 SEC → T-011 UAT
            → T-012 regresión → T-013 degradación → T-014 migración
              → M-002 impacto → I-* → M-003 docs → M-001 deploy → M-004 rollback
```

Matriz V3 (código): [documents/matriz_doble_entrada/README.md](../../documents/matriz_doble_entrada/README.md). Prompts por función (Jiang): [prompts_detallados.md](../../documents/matriz_doble_entrada/prompts_detallados.md).

---

## Convención de commits

```text
docs(requisitos): ambigüedades R-01 [R-004]
docs(diseno): ADR-002 degradación ML [D-006]
docs(testing): estrategia de pruebas [T-006]
docs(mantenimiento): rollback producción [M-004]
feat(inventario): … [I-002]
```

No usar `[I-001]` para inventario ni `[I-002]` para ML.
