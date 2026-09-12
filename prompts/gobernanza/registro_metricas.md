# Registro de métricas D2 — Sigemad MPA V2

**Metodología:** Prompt-Centered SDLC v1.2 (cap. 6 y 11)  
**Caso:** Sigemad MPA V2  
**Última actualización:** 2026-09-11 (oleada 3: huecos R/D/T/M de la guía)

Umbrales de la guía (orientativos): tests críticos en verde; documentación ≥ 90 % de ítems de plantilla; 0 secretos en repo; vulnerabilidades críticas 0 antes de merge.

---

## Resumen ejecutivo

| Métrica | Valor | Umbral guía | Estado |
|---------|-------|-------------|--------|
| Historias de usuario | 56 implementadas (catálogo v0.9.0 / matriz 0.9.1) | Alcance cerrado | OK |
| Incrementos de implementación | 7 (+ parche 0.9.1) | Trazables a versión **y a prompt I-*** | OK |
| Prompts vigentes | 29 (R×5, D×6, I×9, T×5, M×4) | Mapa D3 por fase | OK |
| Prompts superados | 2 (I-001-MACRO, I-002-ML) | No borrar; no citar en commits nuevos | OK |
| Anatomía D1 completa | 29/29 vigentes + 2 históricos | Plantilla maestra | OK |
| Ciclo D2 documentado | Sí (iteraciones de origen I-* no medidas) | Versión, métrica, decisión, lección | Parcial |
| Plan + tests ejecutables | T-001 + T-002/003/004 | Guía T-01 por runner | OK |
| Suites unitarias | Vitest + PHPUnit + pytest | Críticos en verde antes de release | OK (cobertura de rama no medida) |
| ADR | 2 (stack + degradación ML) | Decisiones de arquitectura | OK |
| Reconstrucción vs ejecución | Mixto (I-* reconstruidos; R-004/D-006/M-004 ejecutados) | Registrar antes del próximo cambio de código | Parcial |

---

## Indicadores de prompts (cap. 8.3)

| Indicador | Valor oleada 3 | Comentario |
|-----------|----------------|------------|
| Tasa de aprobación | 29/29 vigentes | Macros Superados |
| Plantillas reutilizables | T-005, M-002, M-003 | Se llenan en el próximo incidente/cambio |
| Prompts obsoletos | 2 | I-001-MACRO, I-002-ML |
| Huecos cap. 5 de la guía | Cerrados en el repositorio | ER Mermaid: D-001 v2 |
| Granularidad I-* | 1 prompt ≈ 1 incremento | Oleada 2 |

---

## Registro por prompt

### Requisitos, diseño, pruebas, mantenimiento

| Código | Fase | Registro | Iteraciones origen | Medición D2 | Decisión | Lección breve |
|--------|------|----------|--------------------|-------------|----------|---------------|
| [R-001](../01_requisitos/R-001_elicitacion_v1.md) | Requisitos | v1.1 | ≥2 (estimado) | Ficha 9/9 campos plantilla 10.1 | Aprobado | Pedir fuera de alcance en la misma pasada |
| [R-002](../01_requisitos/R-002_historias_usuario_v1.md) | Requisitos | v1.1 | No medido | 56 HU / 8 épicas; sin Gherkin formal | Aprobado | Anclar HU a incremento/versión |
| [D-001](../02_diseno/D-001_modelo_datos_v1.md) | Diseño | v1.1 | Varias (inc. 1 y 7) | DDL + migraciones | Aprobado | Separar install vs ALTER desde el primer prompt |
| [D-001 v2](../02_diseno/D-001_modelo_datos_v2_refinado.md) | Diseño | v2 | 1 | ER Mermaid as-built (`er_v2.md`) | Aprobado | El ER se deriva del SQL, no de las HU |
| [D-002](../02_diseno/D-002_decision_arquitectura_v1.md) | Diseño | v1.1 | 1 decisión + docs | ADR-001; falta ADR-002 ML | Aprobado | “PHP único cliente de FastAPI” como restricción |
| [T-001](../04_testing/T-001_plan_pruebas_v1.md) | Pruebas | v1.1 | Plan v1.1 | Plan por módulo; no es T-01 archivo de test | Aprobado | Separar plan humano vs asserts |
| [M-001](../05_mantenimiento/M-001_deploy_hostinger_v1.md) | Mantenimiento | v1.1 | 1 publicación | Guía + checklist; rollback sin heading | Aprobado | Si pides rollback, exige el apartado |

### Implementación vigente (oleada 2)

| Código | Versión producto | Iteraciones origen | Medición D2 | Decisión | Lección breve |
|--------|------------------|--------------------|-------------|----------|---------------|
| [I-001](../03_implementacion/I-001_cimientos_v1.md) | 0.1.0 | No medido | Esqueleto API + DDL | Aprobado | Dejar AuthMiddleware en su sitio |
| [I-002](../03_implementacion/I-002_inventario_v1.md) | 0.2.0 | No medido | F-003 / HU-INV-001–002 | Aprobado | I-002 ya no es ML |
| [I-003](../03_implementacion/I-003_fichas_mantenimiento_v1.md) | 0.3.0 | No medido | F-004, F-005 | Aprobado | Un SHA puede cubrir dos prompts; el registro no |
| [I-004](../03_implementacion/I-004_reportes_pdf_v1.md) | 0.4.0 | ≥1 (blob en I-006) | F-008 | Aprobado | Gancho JWT si el ADR ya lo promete |
| [I-005](../03_implementacion/I-005_configuracion_v1.md) | 0.5.0 | + I-009 | F-002; RBAC incompleto | Aprobado (CFG, no RBAC) | La UI no autoriza |
| [I-006](../03_implementacion/I-006_auth_dashboard_v1.md) | 0.6.0 | No medido | F-001, F-006 | Aprobado | Citar v0.6.0, no “incremento 6” |
| [I-007](../03_implementacion/I-007_microservicio_ml_v1.md) | 0.7.0 | ≥2 (batch, HTTP) | F-007; acc. 95 % / F1 0.92 | Aprobado | Schema `{}` no `[]` |
| [I-008](../03_implementacion/I-008_telemetria_ficha_predictiva_v1.md) | 0.8.0–0.9.0 | 2 fases | Telemetría + ficha predictiva | Aprobado | ALTER + install nueva juntos |
| [I-009](../03_implementacion/I-009_rbac_plantilla_excel_v1.md) | 0.9.1 | 1 parche | AUTH-005, CFG-006, INV-004 | Aprobado | Hallazgo de seguridad = prompt nuevo |

### Oleada 3 (guía cap. 5)

| Código | Medición D2 | Decisión | Lección breve |
|--------|-------------|----------|---------------|
| R-003 | 5 personas + mapa | Aprobado | Persona ≠ rol de sistema |
| R-004 | 14 hallazgos R-01 | Aprobado | Estado honesto (cerrado/supuesto) |
| R-005 | RNF con columna evidencia | Aprobado | Sin evidencia no es RNF |
| D-003 | Contrato = routers | Aprobado | No escribir la API desde la ficha |
| D-004 | 6 features as-built | Aprobado | Architecture.md se desactualiza |
| D-005 | Análisis → I-008 | Aprobado | “No de una vez” es diseño |
| D-006 | ADR-002 opción D | Aprobado | Lo tácito no existe para la tesis |
| T-002 | UT-PHP-001…019 | Aprobado | T-01 es el archivo de test |
| T-003 | UT-FE-001…005 | Aprobado | Extraer `equipoTipo` |
| T-004 | UT-ML-001…009 | Aprobado | Sin joblib en la suite |
| T-005 | Plantilla T-02 | Aprobado | Se llena por fallo |
| M-002 | Plantilla M-01 + ejemplo I-008 | Aprobado | Antes de tocar BD/API |
| M-003 | Checklist changelog/contrato | Aprobado | Post-cambio es fase M |
| M-004 | Heading Rollback en hostinger.md | Aprobado | Cierra deuda D2 de M-001 |

### Superados

| Código | Registro | Decisión | Reemplazo |
|--------|----------|----------|-----------|
| [I-001-MACRO](../03_implementacion/I-001_api_auth_inventario_v1.md) | v1.2 | Superado | I-001…I-006 |
| [I-002-ML](../03_implementacion/I-002_microservicio_ml_v1.md) | v1.2 | Superado | I-007, I-008 |

---

## Deudas D2 abiertas (no son fallos de producto)

| Deuda | Prompt | Notas |
|-------|--------|-------|
| ER Mermaid | D-001 v2 | Cerrado (`er_v2.md`) |
| Medir iteraciones en caliente | todos | Próximo cambio de código |
| Excel matriz V3 | matriz | README ya tiene I-00N vigentes |
| Cobertura de rama ≥ 80 % | T-002…T-004 | No medida |
| Linters / SAST | RNF-QUA | Abierto en metodologia.md |

---

## Cómo cargar una medición nueva

Tras cada incremento o prompt:

1. Añadir o actualizar la fila del código (versión `v1.1` / `v2` si se reejecuta).
2. Anotar modelo, iteraciones reales, tests corridos y decisión.
3. Si se refinó el prompt, crear `{codigo}_..._v2_refinado.md` — no editar en silencio la v1.
4. Actualizar [catalogo.md](./catalogo.md) y la [matriz de doble entrada](../../documents/matriz_doble_entrada/README.md) si cambió un SHA.

No abrir un sprint. Abrir un incremento o una iteración D2 del prompt afectado.
