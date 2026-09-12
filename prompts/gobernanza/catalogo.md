# Catálogo de prompts — Sigemad MPA V2

Índice D3 (mapa de prompts por fase) según Prompt-Centered SDLC v1.2, cap. 4.3 y 5.

**Oleada 1 (2026-09-11):** plantilla + anatomía D1/D2 de los registros iniciales.  
**Oleada 2 (2026-09-11):** I-001…I-009 por incremento; macros Superados.  
**Oleada 3 (2026-09-11):** huecos de la guía (R-01, RNF, contrato, as-built front, D-005, ADR-002, T-01 por runner, T-02, M-01, M-02, rollback).

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

### Implementación

Ver [README de I-*](../03_implementacion/README.md). I-001…I-009 vigentes; I-001-MACRO e I-002-ML Superados.

### Pruebas

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [T-001](../04_testing/T-001_plan_pruebas_v1.md) | v1.1 | Reconstruido | Plan funcional |
| [T-002](../04_testing/T-002_phpunit_v1.md) | v1 | Reconstruido | `backend/tests/` |
| [T-003](../04_testing/T-003_vitest_v1.md) | v1 | Reconstruido | `src/lib/*.test.js` |
| [T-004](../04_testing/T-004_pytest_ml_v1.md) | v1 | Reconstruido | `ml/tests/` |
| [T-005](../04_testing/T-005_diagnostico_test_fallido_v1.md) | v1 | Plantilla | `diagnostico_test_fallido.md` |

### Mantenimiento

| Código | Registro | Estado | Artefacto |
|--------|----------|--------|-----------|
| [M-001](../05_mantenimiento/M-001_deploy_hostinger_v1.md) | v1.1 | Reconstruido | `hostinger.md` (deploy) |
| [M-002](../05_mantenimiento/M-002_analisis_impacto_v1.md) | v1 | Plantilla | `plantilla_analisis_impacto.md` |
| [M-003](../05_mantenimiento/M-003_documentacion_post_cambio_v1.md) | v1 | Plantilla | changelog + plantilla M-02 |
| [M-004](../05_mantenimiento/M-004_rollback_secretos_v1.md) | v1 | Ejecutado | `hostinger.md` § Rollback |

---

## Cadena de evidencia

```text
R-001 ficha → R-003 personas → R-004 ambigüedades → R-005 RNF
  → R-002 historias
    → D-002 stack + D-001 datos + D-003 contrato + D-004 front
      → D-005 análisis ML → D-006 ADR-002
        → I-001 … I-009
          → T-001 plan → T-002 PHPUnit / T-003 Vitest / T-004 pytest
            → T-005 si falla
              → M-002 impacto → I-* → M-003 docs → M-001 deploy → M-004 rollback
```

Matriz V3 (código): [documents/matriz_doble_entrada/README.md](../../documents/matriz_doble_entrada/README.md). Prompts por función (Jiang): [prompts_detallados.md](../../documents/matriz_doble_entrada/prompts_detallados.md).

---

## Convención de commits

```text
docs(requisitos): ambigüedades R-01 [R-004]
docs(diseno): ADR-002 degradación ML [D-006]
test(php): sync y RBAC [T-002]
docs(mantenimiento): rollback Hostinger [M-004]
feat(inventario): … [I-002]
```

No usar `[I-001]` para inventario ni `[I-002]` para ML.
