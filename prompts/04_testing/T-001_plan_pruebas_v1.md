# T-001 — Plan de pruebas

| Campo | Valor |
|-------|-------|
| **Código** | T-001 |
| **Fase** | Pruebas |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (IDs `MOD-NNN`, criterios OK/FALLA) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 (plan v1.1, sistema 0.9.1) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | 0.9.1 |
| **Historias** | Cobertura AUTH, CFG, INV, FIC, MNT, DSH, ML, RPT (matriz R-002) |
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
| Plan funcional | `documents/04_testing/plan_pruebas_funcionales.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Plantilla de resultados | `documents/04_testing/plantilla_registro_resultados.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Plan unitario | `documents/04_testing/unitarias/plan_pruebas_unitarias.md` | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) |
| Suites (código) | `src/lib/*.test.js`, `backend/tests/`, `ml/tests/` | [06d75b1](https://github.com/AxlTech25/Gestion-MPA/commit/06d75b1) y posteriores |

Salida usada como entrada de **M-001** (verificación post-despliegue) y de ejecución humana antes de release.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Plan funcional documentado por módulo; unitarias con matriz UT-FE / UT-PHP / pytest. La guía pide cobertura de rama ≥ 80 % cuando aplique: **no está medida en este registro**. Tests críticos existen; pass@k del plan funcional depende de corrida humana (plantilla de resultados). |
| **N.º de iteraciones** | Plan v1.1 (fecha 2026-09-09) incorpora 0.9.1. Iteraciones de origen no numeradas. |
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
| **Fase anterior** | R-002, I-001…I-009 |
| **Fase siguiente** | M-001 (smoke en Hostinger) |
| **Matriz doble entrada** | Calidad transversal |
| **Commit sugerido** | `docs(testing): plan funcional y unitario [T-001]` |
