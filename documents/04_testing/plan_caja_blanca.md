# Plan de caja blanca — Sigemad MPA V2

**Prompt:** [T-008](../../prompts/04_testing/T-008_caja_blanca_v1.md)  
**Producto:** 0.10.7  
**Técnica:** diseño de casos desde **ramas y condiciones** del código.  
**Suites:** T-002 PHPUnit, T-003 Vitest, T-004 pytest.

Cobertura de rama medida (HTML/Clover) **no** forma parte de esta oleada.

Convención: **Cubierto** = hay assert; **Pendiente** = hay que añadir UT; **Legado** = código vivo o deprecado que aún se ejecuta.

---

## 1. PHP — `Cronograma.php`

| ID | Condición / camino | Resultado esperado | Suite | Estado |
|----|--------------------|--------------------|-------|--------|
| CB-PHP-001 | `horasDeTurno('Manana')` | codigo X1, 10:00:00 | `test_turnos_x1_x2` | **Legado** (Xn ya no es turno; el método sigue) |
| CB-PHP-002 | `horasDeTurno('Tarde')` | X2, 14:00:00 | idem | **Legado** |
| CB-PHP-003 | `horasDeTurno` clave inexistente | cae a TURNOS['Manana'] | — | **Pendiente** |
| CB-PHP-004 | `fechaPerteneceAlAnio('2026-09-16', 2026)` | true | `test_fecha_pertenece_al_anio` | Cubierto |
| CB-PHP-005 | fecha 2025 o formato `16-09-2026` | false | idem | Cubierto |
| CB-PHP-006 | `turnoValido('Noche')` | false | `test_turno_valido` | **Legado** |
| CB-PHP-007 | `rangoHorasValido` inicio ≥ fin | false | `test_rango_horas_valido` | Cubierto |
| CB-PHP-008 | `normalizarHora('10:30')` | `10:30:00` | idem | Cubierto |
| CB-PHP-009 | `normalizarHora` basura | null (vía rango inválido) | — | **Pendiente** (assert directo) |
| CB-PHP-010 | `codigoCantidad(1/3/10)` | X1/X3/X10 | `test_codigo_cantidad` | Cubierto |
| CB-PHP-011 | `codigoCantidad(0)` | `''` | idem | Cubierto |
| CB-PHP-012 | `cantidadValida(10)` | true | idem | Cubierto |
| CB-PHP-013 | `cantidadValida(0)` y `(31)` (`CANTIDAD_MAX=30`) | false | idem | Cubierto |
| CB-PHP-014 | `cantidadValida(30)` límite superior | true | — | **Pendiente** (límite) |
| CB-PHP-015 | `esFinDeSemana` 2028-01-01/02 vs 03 | true/true/false | `test_es_fin_de_semana` | Cubierto |
| CB-PHP-016 | `fechasLaborablesDeMeses(2028, [1])` omite 1–2 ene | primer día 2028-01-03 | `test_fechas_laborables_siguen_el_anio_del_documento` | Cubierto |
| CB-PHP-017 | `paresDeMesesParaPdf` vacío → 6 pares | 12 meses | `test_pares_de_meses_para_pdf` | Cubierto |
| CB-PHP-018 | `cantidadLaborablesDelMes(2026, 9)` | 22 | `test_cantidad_laborables_del_mes_no_cuenta_fines` | Cubierto |
| CB-PHP-019 | `hayGerenciasAsignadas` todas null | false | `test_bandas_de_gerencia` | Cubierto |
| CB-PHP-020 | `debeMostrarBandaGerencia` índice 0 / mismo grupo / cambio | true / false / true | idem | Cubierto |
| CB-PHP-021 | `etiquetaGerencia` sin nombre | `OTRAS ÁREAS` | idem | Cubierto |
| CB-PHP-022 | `debeMostrarBandaGerencia` index &lt; 0 o ≥ count | false | — | **Pendiente** |
| CB-PHP-023 | `claveGerencia` id 0 o '' | `'ninguna'` | — | **Pendiente** |

`crearCelda` (año, sábado, cantidad 0 libera): se ejercita en **INT-007…009**, no en unitarias de modelo. Deuda de integración, no de este plan.

---

## 2. PHP — `Area.php`

| ID | Condición / camino | Esperado | Suite | Estado |
|----|--------------------|----------|-------|--------|
| CB-PHP-024 | `delete` con equipos (`countEquipos` > 0) | status 409 | `AreaTest::test_no_elimina_area_con_equipos` | Cubierto |
| CB-PHP-025 | `delete` sin equipos | `eliminada` true; getById null | `test_elimina_area_sin_equipos` | Cubierto |
| CB-PHP-026 | `delete` id inexistente | 404 | — | **Pendiente** |
| CB-PHP-027 | `update` nombre + gerencia_id | persiste | `test_actualiza_nombre_y_gerencia` | Cubierto |
| CB-PHP-028 | `gerenciaIdDe` vacío → null | null | implícito en update | Parcial |

---

## 3. PHP — `AuthMiddleware.php`

| ID | Condición / camino | Esperado | Suite | Estado |
|----|--------------------|----------|-------|--------|
| CB-PHP-029 | `tieneRol` Administrador vs lista | true solo si coincide | `AuthMiddlewareTest` UT-PHP-016…018 | Cubierto |
| CB-PHP-030 | payload **sin** `rol` | false | UT-PHP-018 | Cubierto |
| CB-PHP-031 | `requireAuth` sin Bearer / expirado / inválido | 401 + exit | HTTP (INT-002/003) | No unitario (exit); cubierto en T-007 |

---

## 4. PHP — sync mantenimiento y consulta

Cubiertos por `MantenimientoTest` y `DashboardConsultaTest` (UT-PHP-001…013): payload vacío, Dañado → En Reparacion, filtros Otro. Sin IDs CB nuevos: ver [plan unitario](./unitarias/plan_pruebas_unitarias.md).

`UsuarioTest` / `EquipoPlantillaTest`: UT-PHP-014…019.

---

## 5. JS — `cronogramaUtils.js`

| ID | Condición | Esperado | Suite | Estado |
|----|-----------|----------|-------|--------|
| CB-FE-001 | `puedeEscribirCronograma` Admin/Tecnico/Practicante | true/true/false | `cronogramaUtils.test.js` | Cubierto |
| CB-FE-002 | `diasDelMes` feb 2024 bisiesto | 29; ISO 2024-02-29 | idem | Cubierto |
| CB-FE-003 | `diasDelMes` mes 0 o 13 | `[]` | — | **Pendiente** |
| CB-FE-004 | `esFinDeSemana` | sáb/dom true | idem | Cubierto |
| CB-FE-005 | `diasLaborablesDelMes(2028, 1)` | sin 01-01 ni 01-02 | idem | Cubierto |
| CB-FE-006 | `codigoCantidad` | X1/X3/X10/`''` | idem | Cubierto |
| CB-FE-007 | `mapaCeldas` indexa por fecha | `cantidad` 2 | idem | Cubierto |
| CB-FE-008 | `maxCantidadDia` resto vs edición del mismo día | 8 vs 10 (área 10, un día X2) | idem | Cubierto |
| CB-FE-009 | `totalesDeFilas` | pc/laptop/impresora/total | idem | Cubierto |
| CB-FE-010 | `rangoHorasValido` | inicio &lt; fin | idem | Cubierto |
| CB-FE-011 | bandas gerencia / `OTRAS ÁREAS` | igual que PHP | idem | Cubierto |
| CB-FE-012 | `fechaPerteneceAlAnio` fecha vacía o anio 0 | false | — | **Pendiente** |
| CB-FE-013 | `TURNOS` Manana/Tarde | deprecado en comentario | — | **Legado**; no ampliar |

`equipoTipo.test.js`: UT-FE-001…005 (tipo PC vs impresora, `countMapFromItems`).

El plan unitario §2.1b dice `mapaCeldas` clave `fecha|turno`: **desactualizado**; el test indexa por `fecha`. Corregir en T-001 v1.7 / plan unitario.

---

## 6. Python — features y schemas

| ID | Condición | Esperado | Suite | Estado |
|----|-----------|----------|-------|--------|
| CB-ML-001 | `FEATURE_COLUMNS` incluye telemetría inc. 7 | 6 numéricas de telemetría | `test_features.py` | Cubierto |
| CB-ML-002 | `preparar_dataframe` sin columnas | numéricas 0, categóricas Desconocido | idem | Cubierto |
| CB-ML-003 | nulos / strings vacíos → 0 | coerción | idem | Cubierto |
| CB-ML-004 | no muta el DataFrame original | copia | idem | Cubierto |
| CB-ML-005 | `RiesgoRequest` id ≤ 0 | ValidationError | `test_ml_schemas.py` | Cubierto |
| CB-ML-006 | batch limit &gt; 500 | ValidationError | idem | Cubierto |
| CB-ML-007 | `HealthResponse` sin modelo | `modelo_disponible=false` | idem | Cubierto |
| CB-ML-008 | inferencia con `.joblib` | — | — | **Pendiente** (deuda T-004; no bloquea) |

---

## 7. Criterio de salida (planificación)

Matriz publicada. Pendientes no bloquean 0.10.7. Próxima oleada de código de test: CB-PHP-003, 009, 014, 022, 023, 026; CB-FE-003, 012.

## 8. Criterio de salida (ejecución)

`npm test`, `composer test`, `pytest -v` verdes. Si falla: [T-005](../../prompts/04_testing/T-005_diagnostico_test_fallido_v1.md).
