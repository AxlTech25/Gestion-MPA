# T-008 — Plan de pruebas de caja blanca

| Campo | Valor |
|-------|-------|
| **Código** | T-008 |
| **Título** | Caja blanca: ramas de modelos y utils |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado |
| **Modelo** | Cursor Agent — 2026-09-17 |
| **Técnica** | CoT guiado (condiciones → camino cubierto / pendiente) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-17 |
| **Producto** | 0.10.7 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

No mide cobertura de rama ≥ 80 % (deuda T-002…T-004). Clasifica asserts existentes y huecos.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero de pruebas de caja blanca.

Contexto: 0.10.7. Suites en backend/tests/, src/lib, cronogramaUtils,
ml/tests. Código: Cronograma.php (cantidadValida 1–30, bandas,
laborables), Area::delete 404/409/OK, AuthMiddleware::tieneRol,
cronogramaUtils (maxCantidadDia, TURNOS deprecado),
preparar_dataframe.

Objetivo: Matriz CB-* por función: condición, camino, UT que lo cubre
o pendiente. Marcar horasDeTurno/turnoValido como legado vivo.

Tarea: No reescribir tests; listar cubierto vs hueco. IDs CB-PHP,
CB-FE, CB-ML.

Entradas: T-006, plan unitario, CronogramaTest, AreaTest,
cronogramaUtils.test.js, test_features.py.

Formato: documents/04_testing/plan_caja_blanca.md.

Restricciones: no sleeps; no relajar asserts; no cobertura HTML en
esta oleada.

Criterios: cada función listada tiene al menos un camino cubierto o
una deuda explícita.

Proceso: leer if/return → mapear a test → pendiente.

No hacer: no generar expect(true); no Testing Library de páginas.

Ejemplos: CB-PHP-004 cantidadValida(0) false — cubierto en
test_codigo_cantidad.
```

### Checklist D1

- [x] Rol caja blanca
- [x] Contexto archivos reales
- [x] Tarea matriz cubierto/pendiente
- [x] Formato plan_caja_blanca.md
- [x] Restricciones
- [x] Ejemplo cantidadValida
- [x] Criterios
- [x] No páginas React

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Plan caja blanca | `documents/04_testing/plan_caja_blanca.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Matriz CB sobre Cronograma, Area, Auth, utils, features; legado TURNOS marcado. |
| **Iteraciones** | 1 |
| **Decisión** | **Ejecutado** — pendiente aprobación humana. |
| **Lección** | Caja blanca se ancla a líneas de código; no a HU. |

| Relación | Valor |
|----------|-------|
| Anterior | T-006, T-002…T-004, I-014…I-017 |
| Siguiente | Ampliar UT si hay CB pendiente; T-005 si fallan |
| Commit | `docs(testing): plan caja blanca [T-008]` |
