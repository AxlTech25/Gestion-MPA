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
src/lib/equipoTipo.test.js          → Utilidades tipo de equipo (JS)
backend/tests/MantenimientoTest.php → Sync telemetría post-mantenimiento
backend/tests/DashboardConsultaTest.php → Filtros consulta dashboard (SQLite)
backend/tests/UsuarioTest.php → Conteo de roles y ENUM de roles
backend/tests/AuthMiddlewareTest.php → Comprobación de rol en payload JWT
backend/tests/EquipoPlantillaTest.php → Alineación fila ejemplo vs encabezados Excel
ml/tests/test_features.py           → Pipeline features ML
ml/tests/test_ml_schemas.py         → Validación Pydantic API ML
```

## Relación con pruebas funcionales

Las pruebas unitarias validan **reglas y transformaciones**; las [pruebas funcionales](./plan_pruebas_funcionales.md) validan el flujo completo en la UI. Ejecute ambas antes de un release.
