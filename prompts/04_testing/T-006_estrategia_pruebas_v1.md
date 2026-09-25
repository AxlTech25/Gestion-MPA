# T-006 — Estrategia de pruebas

| Campo | Valor |
|-------|-------|
| **Código** | T-006 |
| **Título** | Estrategia de pruebas (niveles, técnicas, tipos complementarios) |
| **Fase** | Pruebas |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | Few-shot (tabla nivel × técnica × tipo; IDs del repositorio) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Incremento / versión producto** | Incremento 8 cerrado / 0.10.7 |
| **Historias o ADR relacionados** | R-002, R-003, R-005, R-006, D-003, ADR-002, ADR-003; T-001…T-005 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

T-001 es el plan **E2E caja negra**. T-002…T-004 son **unitarias**. Este registro no los sustituye: ordena la pirámide y abre T-007…T-014.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de calidad (QA) y diseñador de estrategia de
pruebas de un sistema web institucional. No inventes runners ni RNF.

Contexto: Sigemad MPA V2 0.10.7 (Incremento 8 cerrado). Stack: UI React
(Vite), API PHP V2 + MySQL (XAMPP), ML FastAPI opcional en :8000, PHP
único cliente de FastAPI (ADR-001/002). Prompt-Centered SDLC v1.2: la
IA produce planes; el humano ejecuta. Ya existen T-001 (plan funcional
UI), T-002 PHPUnit, T-003 Vitest, T-004 pytest, T-005 diagnóstico.
R-005 excluye carga, pentest y SLA. FastAPI no es obligatorio en producción.

Objetivo: Un documento de estrategia que un revisor de tesis o un
técnico pueda usar para saber qué tipo de prueba cubre cada riesgo,
sin mezclar nivel (dónde) con técnica (cómo).

Tarea:
1. Distinguir tres niveles: unitaria, integración, extremo a extremo.
2. Distinguir dos técnicas: caja blanca (desde el código) y caja negra
   (desde HU/RNF).
3. Incluir tipos complementarios: humo, compatibilidad, seguridad
   funcional, UAT por personas, regresión por incremento, degradación
   ML, migración/integridad.
4. Tabla nivel × técnica × tipo × prompt × oráculo × IDs.
5. Pirámide: muchas unitarias, menos INT, pocos E2E.
6. Criterio de salida de planificación vs de ejecución.
7. Fuera de alcance explícito: carga, pentest, HA, Playwright en esta
   oleada, cobertura de rama ≥ 80 % (deuda).

Entradas disponibles:
- documents/04_testing/plan_pruebas_funcionales.md y unitarias/.
- documents/01_requisitos/requisitos_no_funcionales.md (R-005).
- documents/01_requisitos/historias_usuario/personas.md (R-003).
- documents/02_diseno/contrato_api_v2.md (D-003).
- ADR-002 degradación ML.
- Catálogo T-001…T-005.

Formato de salida:
- documents/04_testing/estrategia_pruebas.md
- Índice en documents/04_testing/README.md (enlace a la estrategia).

Restricciones técnicas:
- No pedir JMeter, OWASP ZAP ni herramientas de carga.
- No reescribir el D1 de T-001.
- Credenciales solo seed local admin/admin123.
- ML no bloquea el resto del plan (N/A si FastAPI caído).
- Un ID no se duplica entre planes sin referencia cruzada.

Criterios de aceptación:
- Un lector distingue nivel vs técnica vs tipo complementario.
- Cada RNF-SEC, AVA, DAT, QUA-01/02 apunta a al menos un plan.
- T-007…T-014 quedan nombrados como siguientes entregables.
- Un técnico no necesita leer modelos PHP para entender la estrategia.

Proceso sugerido: 1) inventario T-001…T-005, 2) clasificar huecos,
3) pirámide, 4) tabla de trazabilidad, 5) fuera de alcance, 6)
criterios de salida.

No hacer: no generar archivos de test; no marcar la oleada como
ejecución; no tratar caja blanca como un quinto nivel.

Ejemplos:
UT-PHP-004 — caja blanca unitaria (Dañado → En Reparacion).
AUTH-001 — caja negra E2E (login admin).
INT-001 — integración HTTP POST /auth/login.
```

### Checklist D1

- [x] Rol QA / estrategia
- [x] Contexto 0.10.7, runners, R-005
- [x] Tarea pirámide + tabla + T-007…T-014
- [x] Formato `estrategia_pruebas.md`
- [x] Restricciones (sin carga/pentest; D1 T-001 intacto)
- [x] Ejemplo UT / AUTH / INT
- [x] Criterios observables
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Estrategia | `documents/04_testing/estrategia_pruebas.md` | (esta oleada) |

Salida usada como entrada de **T-007** (integración), **T-008** (caja blanca), **T-001 v1.7** (E2E negra), **T-009…T-014** (complementarios).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Documento con pirámide, tres tablas (niveles, técnicas, complementarios) y mapa a RNF. T-007…T-014 referenciados. |
| **N.º de iteraciones** | 1 |
| **Diagnóstico** | N/A (primer output de planificación de fase T ampliada). |
| **Refinamiento** | N/A |
| **Decisión** | **Ejecutado** — pendiente de aprobación humana del revisor. |
| **Lección** | Nivel ≠ técnica ≠ tipo de riesgo. T-001 no era “todas las pruebas”: era E2E caja negra. |

### Checklist D2

- [ ] Revisión humana (pendiente)
- [x] Documento completo (secciones de la tarea)
- [x] Plan ejecutable en el sentido de estrategia (no sustituye corrida)
- [x] Sin secretos
- [x] ADR-002 citado, no reabierto
- [x] Código T-006, versión v1, métrica (tablas)
- [x] Sirve de entrada a T-007…T-014

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | R-002, R-003, R-005, D-003, ADR-002, T-001…T-005, Incremento 8 / 0.10.7 |
| **Fase siguiente** | T-007…T-014; T-001 v1.7; ejecución futura + M-001 smoke |
| **Matriz doble entrada** | Calidad transversal (no una función F-NNN) |
| **Commit sugerido** | `docs(testing): estrategia de pruebas niveles y técnicas [T-006]` |
