# Pruebas unitarias — Gestión MPA V2

Suite de pruebas automatizadas para lógica de negocio aislada (sin navegador ni API HTTP completa).

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [plan_pruebas_unitarias.md](./plan_pruebas_unitarias.md) | Alcance, matriz de casos y comandos de ejecución ([T-002](../../../prompts/04_testing/T-002_phpunit_v1.md), [T-003](../../../prompts/04_testing/T-003_vitest_v1.md), [T-004](../../../prompts/04_testing/T-004_pytest_ml_v1.md)) |

## Ejecución rápida

Desde la raíz del proyecto:

```bash
# Frontend (Vitest)
npm install
npm test

# Backend PHP (PHPUnit)
cd backend
composer install
composer test

# ML Python (pytest)
cd ml
pip install -r requirements.txt
pytest -v
```

## Estructura de archivos de prueba

```
src/lib/equipoTipo.test.js
src/features/cronograma/utils/cronogramaUtils.test.js
backend/tests/MantenimientoTest.php
backend/tests/DashboardConsultaTest.php
backend/tests/UsuarioTest.php
backend/tests/AuthMiddlewareTest.php
backend/tests/EquipoPlantillaTest.php
backend/tests/CronogramaTest.php
backend/tests/AreaTest.php
ml/tests/test_features.py
ml/tests/test_ml_schemas.py
```

Caja blanca (ramas): [plan_caja_blanca.md](../plan_caja_blanca.md). Integración HTTP: [plan_pruebas_integracion.md](../plan_pruebas_integracion.md) (T-007; scripts en oleada posterior).

## Relación con pruebas funcionales

Las pruebas unitarias validan **reglas y transformaciones**; el [E2E caja negra](../plan_pruebas_funcionales.md) valida el flujo en la UI. Integración HTTP: [plan_pruebas_integracion.md](../plan_pruebas_integracion.md). Ejecute unitarias + humo antes de un release.
