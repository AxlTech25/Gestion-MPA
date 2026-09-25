# Registro de métricas D2 — Sigemad MPA V2

**Metodología:** Prompt-Centered SDLC v1.2 (cap. 6 y 11)  
**Caso:** Sigemad MPA V2  
**Última actualización:** 2026-09-17 (oleada 4: T-006…T-014; Incremento 8 / 0.10.7 cerrado)

Umbrales de la guía (orientativos): tests críticos en verde; documentación ≥ 90 % de ítems de plantilla; 0 secretos en repo; vulnerabilidades críticas 0 antes de merge.

---

## Resumen ejecutivo

| Métrica | Valor | Umbral guía | Estado |
|---------|-------|-------------|--------|
| Historias de usuario | 74 implementadas (matriz v0.10.7; 14 CRN + 8 CFG) | Alcance Incremento 8 cerrado | OK |
| Incrementos de implementación | 8 (0.10.7) + parche 0.9.1 | Trazables a versión **y a prompt I-*** | OK |
| Prompts vigentes | 38 (R×6, D×7, I×17, T×14, M×4; macros aparte) | Mapa D3 por fase | OK |
| Prompts superados | 2 (I-001-MACRO, I-002-ML) | No borrar; no citar en commits nuevos | OK |
| Anatomía D1 completa | T-001…T-014 + R/D/I/M vigentes | Plantilla maestra | OK |
| Ciclo D2 documentado | Sí (iteraciones de origen I-* no medidas) | Versión, métrica, decisión, lección | Parcial |
| Plan + tests ejecutables | T-006 estrategia; T-001 E2E; T-007 INT (plan); T-002/003/004 suites | Guía T-01 por runner | Parcial (INT sin scripts) |
| Suites unitarias | Vitest + PHPUnit + pytest | Críticos en verde antes de release | OK (cobertura de rama no medida) |
| ADR | 3 (stack, degradación ML, cronograma) | Decisiones de arquitectura | OK |
| Reconstrucción vs ejecución | Mixto (I-* reconstruidos; R-004/D-006/M-004 ejecutados) | Registrar antes del próximo cambio de código | Parcial |

---

## Indicadores de prompts (cap. 8.3)

| Indicador | Valor oleada 3 | Comentario |
|-----------|----------------|------------|
| Tasa de aprobación | Oleada 4: T-006…T-014 Ejecutado (pendiente revisor) | No sustituye aprobación humana |
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
| [R-006](../01_requisitos/R-006_cronograma_anual_v1.md) | Requisitos | v1.9 | 9 | Papel 2024 → 0.10.7; gerencias + CRUD áreas | **Cerrado** (inc. 8, 2026-09-17) | No más I-* de cronograma sin R-* |
| [D-001](../02_diseno/D-001_modelo_datos_v1.md) | Diseño | v1.1 | Varias (inc. 1 y 7) | DDL + migraciones | Aprobado | Separar install vs ALTER desde el primer prompt |
| [D-001 v2](../02_diseno/D-001_modelo_datos_v2_refinado.md) | Diseño | v2 | 1 | ER Mermaid as-built (`er_v2.md`) | Aprobado | El ER se deriva del SQL, no de las HU |
| [D-002](../02_diseno/D-002_decision_arquitectura_v1.md) | Diseño | v1.1 | 1 decisión + docs | ADR-001; falta ADR-002 ML | Aprobado | “PHP único cliente de FastAPI” como restricción |
| [D-007](../02_diseno/D-007_cronograma_v1.md) | Diseño | v1 | 1 + enmiendas I-014…I-017 | cronograma.md + ADR-003 | **Cerrado** (inc. 8) | Historial raíz; matriz detalle |
| [T-001](../04_testing/T-001_plan_pruebas_v1.md) | Pruebas | v1.7 | 7 | E2E caja negra 0.10.7; no es T-01 archivo de test | Ejecutado v1.7 | Nivel ≠ técnica; T-001 no es “todas las pruebas” |
| [I-014](../03_implementacion/I-014_cronograma_cantidad_xn_v1.md) | Implementación | v1 | 1 | Selector X1…Xn; unique área+fecha | Ejecutado | Xn no es turno |
| [I-015](../03_implementacion/I-015_cronograma_pdf_a4_baja_v1.md) | Implementación | v1 | 1 | PDF A4 L–V 2 meses; DELETE plan | Ejecutado | Calendario = anio del documento |
| [I-016](../03_implementacion/I-016_cronograma_pdf_encaje_v1.md) | Implementación | v1 | 2 | Encaje textos; pie HORA PROGRAMADA con borde | Ejecutado | Una tabla; colspan laborable; pie-grid 1px; equipos width 1% |
| [I-017](../03_implementacion/I-017_gerencias_crud_areas_v1.md) | Implementación | v1 | 1 | Gerencias; CRUD área; bandas cronograma | **Aprobado** (inc. 8 cerrado) | Selector no etiqueta libre; 409 si hay equipos |
| [M-001](../05_mantenimiento/M-001_deploy_produccion_v1.md) | Mantenimiento | v1.2 | 1 publicación | Guía + checklist; rollback sin heading | Aprobado | Si pides rollback, exige el apartado |

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
| M-004 | Heading Rollback en produccion.md | Aprobado | Cierra deuda D2 de M-001 |

### Oleada 4 (fase T ampliada, 2026-09-17)

| Código | Medición D2 | Decisión | Lección breve |
|--------|-------------|----------|---------------|
| T-006 | Pirámide + mapa RNF | Ejecutado | Nivel ≠ técnica ≠ tipo de riesgo |
| T-007 | INT-001…014 | Ejecutado | Oráculo = D-003, no Navbar |
| T-008 | CB-* cubierto/pendiente/legado | Ejecutado | Caja blanca se ancla a ramas |
| T-009 | 5 SMOKE + 3 CMP | Ejecutado | Humo = ¿puedo publicar? |
| T-010 | SEC-01…10 = RNF-SEC | Ejecutado | No es pentest |
| T-011 | UAT-P1…P5 | Ejecutado | Persona ≠ rol |
| T-012 | REG-INC-01…08e | Ejecutado | Recortar por incremento |
| T-013 | DEG-001…005 | Ejecutado | ML N/A no bloquea release |
| T-014 | MIG-001…005 | Ejecutado | Conteo de filas, no “el script corrió” |

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
| Scripts PHPUnit de INT-* | T-007 | Plan listo; asserts HTTP en oleada posterior |
| Linters / SAST | RNF-QUA | Abierto en metodologia.md |

---

## Cómo cargar una medición nueva

Tras cada incremento o prompt:

1. Añadir o actualizar la fila del código (versión `v1.1` / `v2` si se reejecuta).
2. Anotar modelo, iteraciones reales, tests corridos y decisión.
3. Si se refinó el prompt, crear `{codigo}_..._v2_refinado.md` — no editar en silencio la v1.
4. Actualizar [catalogo.md](./catalogo.md) y la [matriz de doble entrada](../../documents/matriz_doble_entrada/README.md) si cambió un SHA.

No abrir un sprint. Abrir un incremento o una iteración D2 del prompt afectado.
