# Pruebas unitarias — Gestión MPA V2

Suite de pruebas automatizadas para lógica de negocio aislada (sin navegador ni API HTTP completa).

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [plan_pruebas_unitarias.md](./plan_pruebas_unitarias.md) | Alcance, matriz de casos y comandos de ejecución |

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
ml/tests/test_features.py           → Pipeline features ML
ml/tests/test_ml_schemas.py         → Validación Pydantic API ML
```

## Relación con pruebas funcionales

Las pruebas unitarias validan **reglas y transformaciones**; las [pruebas funcionales](./plan_pruebas_funcionales.md) validan el flujo completo en la UI. Ejecute ambas antes de un release.
