# T-001 — Plan de pruebas

| Campo | Valor |
|-------|-------|
| **Código** | T-001 |
| **Fase** | Pruebas |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.7 |
| **Estado** | Aprobado (v1.6) / Ejecutado v1.7 (E2E caja negra 0.10.7; D1 no reescrito) |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (IDs `MOD-NNN`, criterios OK/FALLA) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 (plan v1.1, sistema 0.9.1) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | 0.10.7 |
| **Historias** | AUTH, CFG, INV, FIC, MNT, DSH, ML, RPT (R-002); HU-CRN-001–015 (R-006) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Publicado con [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175). La guía cap. 5.4 define T-01 como **archivo de test ejecutable**. Este registro es el **plan**. Los runners: [T-002](./T-002_phpunit_v1.md), [T-003](./T-003_vitest_v1.md), [T-004](./T-004_pytest_ml_v1.md). Diagnóstico: [T-005](./T-005_diagnostico_test_fallido_v1.md).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de calidad (QA) de un sistema web institucional.
No inventes cobertura: deriva casos de las HU aprobadas y del código V2.

Contexto: Sigemad MPA V2 versión 0.9.1. Stack de prueba: UI React (Vite),
API PHP V2 + MySQL (XAMPP), ML FastAPI opcional en :8000. Tres runners
unitarios ya previstos: Vitest, PHPUnit, pytest. Criterios de historia en
R-002. Módulos: AUTH, CFG, INV, FIC, MNT, DSH, ML. Convención de IDs de
caso funcional: MOD-NNN (ejemplo MNT-012). Estados de ejecución: OK,
FALLA, BLOQUEADO, N/A.

Objetivo: Un plan ejecutable por un humano en XAMPP, más la matriz
unitaria de reglas críticas, sin sustituir la ejecución real.

Tarea:
1. Plan funcional: objetivo, entorno, credenciales de prueba, datos
   (códigos patrimoniales de 12 dígitos), rutas /v2/*, criterios
   generales, casos por módulo, orden de ejecución.
2. Plantilla de registro de resultados y evidencias.
3. Plan unitario: qué se prueba en JS/PHP/Python y comandos.
4. Marcar ML como condicionado a FastAPI activo (N/A si está caído).
5. Incluir regresión transversal (REG) al final.

Entradas disponibles:
- historias_por_epica.md y matriz_trazabilidad.md.
- architecture.md (JWT, RBAC, proxy ML).
- changelog 0.9.1 (requireRole en /usuarios, plantilla Excel).
- Suites existentes: src/lib/*.test.js, backend/tests/, ml/tests/.

Formato de salida:
- documents/04_testing/plan_pruebas_funcionales.md
- documents/04_testing/plantilla_registro_resultados.md
- documents/04_testing/unitarias/plan_pruebas_unitarias.md
- README de fase con orden AUTH → CFG → INV → FIC → MNT → DSH → ML → REG.

Restricciones técnicas:
- No pedir herramientas de carga ni pentest en este plan.
- No usar sleeps fijos en la parte unitaria.
- Credenciales solo las de seed (admin/admin123) en entorno local;
  recordar cambio en producción (M-001).
- Cada caso funcional: precondición, pasos, resultado esperado,
  HU relacionada si existe.
- ML no bloquea el resto del plan.

Criterios de aceptación:
- Un técnico puede seguir el plan sin leer el código.
- Todo módulo AUTH…ML tiene al menos un caso.
- Estados OK/FALLA/BLOQUEADO/N/A definidos.
- Comandos unitarios copiables (npm test, composer test, pytest).
- Casos 0.9.1: mutación de usuarios solo Administrador; plantilla Excel
  con columnas alineadas.

Proceso sugerido: 1) listar HU implementadas, 2) traducir a casos UI,
3) añadir negativos (401, rol, validación), 4) alinear unitarias a reglas
sin UI, 5) definir orden para no depender de datos no creados.

No hacer: no generar tests triviales del tipo expect(true).toBe(true);
no asumir datos de producción; no marcar ML como obligatorio.

Ejemplos:
INV-00N — registrar equipo con código 740000001001 de 12 dígitos.
AUTH-00N — sin token, GET /api/v2/dashboard → 401.
ML-00N — FastAPI down → inventario usable, alertas N/A.
```

### Checklist D1

- [x] Rol QA
- [x] Contexto 0.9.1 y runners
- [x] Tarea plan + plantilla + unitario
- [x] Formato MOD-NNN
- [x] ML condicional
- [x] Criterios
- [x] Ejemplo de caso
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Plan funcional E2E | `documents/04_testing/plan_pruebas_funcionales.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Caja negra (equivalencias) | `documents/04_testing/plan_caja_negra.md` | oleada 4 |
| Plantilla de resultados | `documents/04_testing/plantilla_registro_resultados.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Plan unitario | `documents/04_testing/unitarias/plan_pruebas_unitarias.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Suites (código) | `src/lib/*.test.js`, `backend/tests/`, `ml/tests/` | [06d75b1](https://github.com/AxlTech25/Gestion-MPA/commit/06d75b1) y posteriores |

Salida usada como entrada de **M-001** (verificación post-despliegue) y de ejecución humana antes de release.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Plan funcional documentado por módulo; unitarias con matriz UT-FE / UT-PHP / pytest. La guía pide cobertura de rama ≥ 80 % cuando aplique: **no está medida en este registro**. Tests críticos existen; pass@k del plan funcional depende de corrida humana (plantilla de resultados). |
| **N.º de iteraciones** | v1.1 (0.9.1) + v1.2 (CRN 0.10.0) + v1.3 (Xn cantidad, I-014) + v1.4 (PDF A4 y baja, I-015) + v1.5 (encaje PDF, I-016) + v1.6 (gerencias y CRUD áreas, I-017) + v1.7 (reclasificación E2E caja negra; T-006). |
| **Diagnóstico** | El registro v1 pedía “plan” y no **archivos de test**. Desvío de **tarea** respecto de T-01 de la guía: se cubrió documentación de pruebas, no generación T-01 “archivo de test completo”. Las suites en código son un entregable paralelo. |
| **Refinamiento v1.1** | Se declara el desvío y se reserva T-002–T-004. Se añade el caso 0.9.1 al prompt reconstruido. |
| **Decisión** | **Aprobado** como fase de pruebas del SDLC (plan + índice). No cerrado como “T-01 ejecutable único”. |
| **Lección** | Separar “plan para humanos” de “genera el archivo PHPUnit” evita un prompt que produce markdown cuando se necesitaba assert. |

### Checklist D2

- [x] Revisión humana
- [x] Plan ejecutable
- [x] Unitarias referenciadas
- [ ] Cobertura de rama medida (deuda)
- [x] ML no bloqueante
- [x] Prompt y métrica registrados

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | R-002, I-001…I-010 |
| **Fase siguiente** | T-006 estrategia; T-002/T-003; T-009 humo; M-001 |
| **Matriz doble entrada** | Calidad transversal |
| **Commit sugerido** | `docs(testing): T-001 v1.7 E2E caja negra 0.10.7 [T-001]` |

### Refinamiento v1.2 (2026-09-15)

```text
Prompt original: T-001 v1.1
Resultado observado: el plan funcional cerraba en 0.9.1 (AUTH…ML) y no tenía CRN
Evidencia: I-010 ejecutado; HU-CRN-001–009 en producto 0.10.0
Diagnóstico: contexto D1 desactualizado (versión), no error de tarea
Nuevo prompt: no se reescribe D1; se añaden casos CRN-001…012 al plan
Criterio para cerrar: un técnico prueba historial, matriz, turnos, PDF y RBAC
Decisión final: T-001 v1.2
```

### Refinamiento v1.3 (2026-09-15)

```text
Prompt original: T-001 v1.2
Resultado observado: CRN-006/007/008 hablaban de turnos mañana/tarde
Evidencia: I-014; HU-CRN-013; selector X1…Xn
Diagnóstico: contexto de caso desactualizado, D1 intacto
Nuevo prompt: no se reescribe D1; se reescriben CRN-006…008 (cantidad, no turno)
Criterio para cerrar: técnico prueba X2 un día y X3 otro en la misma fila
Decisión final: T-001 v1.3
```

### Refinamiento v1.4 (2026-09-16)

```text
Prompt original: T-001 v1.3
Resultado observado: CRN-010 hablaba de A3; no había baja ni calendario 2027/2028
Evidencia: I-015; HU-CRN-004/014
Diagnóstico: contexto de impresión desactualizado, D1 intacto
Nuevo prompt: no se reescribe D1; CRN-010 A4 L–V; CRN-013…016
Criterio para cerrar: PDF 2 meses A4 sin sáb/dom; plan 2028 muestra 2028; DELETE del historial
Decisión final: T-001 v1.4
```

### Refinamiento v1.5 (2026-09-17)

```text
Prompt original: T-001 v1.4
Resultado observado: CRN-010 no pedía reja de HORA PROGRAMADA ni columnas de equipos compactas
Evidencia: I-016; HU-CRN-004
Diagnóstico: pie sin borde por CSS; textos aplastados en 0.10.5
Nuevo prompt: no se reescribe D1; CRN-010/016 encaje y pie bordeado
Criterio para cerrar: PDF con N°/EQUIPO/HORARIO bordeados; PC/LAPTOP/IMPRESORA completos y estrechos
Decisión final: T-001 v1.5
```

### Refinamiento v1.6 (2026-09-17)

```text
Prompt original: T-001 v1.5
Resultado observado: no había casos de gerencia ni de baja de área
Evidencia: I-017; HU-CFG-007/008; HU-CRN-015
Diagnóstico: organigrama incompleto
Nuevo prompt: no se reescribe D1; CFG-009…011; CRN-017
Criterio para cerrar: selector de gerencia; 409 al borrar área con equipos; banda en matriz/PDF
Decisión final: T-001 v1.6
```

### Cierre Incremento 8 (2026-09-17)

```text
Prompt original: T-001 v1.6
Resultado observado: el responsable cerró R-006 / I-017
Evidencia: «ya estaríamos dando por terminado esta parte»
Diagnóstico: no hay más casos CRN de alcance en implementación
Nuevo prompt: no se reescribe D1; no hay T-001 v1.7 de producto
Criterio para cerrar: plan v1.6 cubre 0.10.7 en CRN/CFG
Decisión final: Incremento 8 cerrado; T-001 permanecía v1.6 hasta la fase T
```

### Refinamiento v1.7 (2026-09-17) — fase de pruebas

```text
Prompt original: T-001 v1.6
Resultado observado: el plan se leía como “todas las pruebas”; faltaban
  integración, caja blanca/negra explícitas y tipos complementarios
Evidencia: T-006 estrategia; R-005; deuda HTTP en plan unitario
Diagnóstico: contexto de fase (T), no error de tarea D1
Nuevo prompt: no se reescribe D1; se reclasifica el artefacto como E2E
  caja negra 0.10.7; anexo plan_caja_negra.md; cabecera y conteos
Criterio para cerrar: un técnico distingue T-001 (E2E negra) de T-007 (INT)
  y T-008 (blanca)
Decisión final: T-001 v1.7
```
