# Plan de pruebas unitarias — Gestión MPA V2

**Versión:** 1.0  
**Fecha:** 2026-06-21  
**Alcance:** Lógica aislada en frontend (JS), backend (PHP) y microservicio ML (Python)

---

## 1. Objetivo

Comprobar automáticamente que las reglas de negocio críticas funcionan sin depender de la interfaz gráfica ni de servicios externos (MySQL productivo, FastAPI en ejecución).

| Capa | Herramienta | Qué se prueba |
|------|-------------|---------------|
| Frontend | Vitest | Clasificación de tipos de equipo, agregación de contadores |
| Backend PHP | PHPUnit + SQLite en memoria | Sync telemetría, filtros de consulta dashboard |
| ML Python | pytest | Preparación de features, validación de schemas API |

---

## 2. Matriz de casos implementados

### 2.1 Frontend — `src/lib/equipoTipo.test.js`

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| UT-FE-001 | `isTipoComputadora('Laptop')` | `true` |
| UT-FE-002 | `isTipoComputadora('Impresora')` | `false` |
| UT-FE-003 | `isTipoImpresora('impresora')` | `true` (case insensitive) |
| UT-FE-004 | `countMapFromItems` con totales string/number | Mapa `{ label: number }` |
| UT-FE-005 | `countMapFromItems(null)` | `{}` |

**Origen en producción:** `MantenimientoForm.jsx` (campos condicionales), `ConsultaEquiposPanel.jsx` (contadores en etiquetas).

### 2.2 Backend — `backend/tests/MantenimientoTest.php`

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| UT-PHP-001 | `buildEquipoSyncPayload` fecha | `fecha_ultimo_mantenimiento` = `YYYY-MM-DD` |
| UT-PHP-002 | Telemetría completa | horas, batería, páginas, temperaturas redondeadas |
| UT-PHP-003 | Campos vacíos ignorados | No incluye claves vacías en payload |
| UT-PHP-004 | Estado posterior Dañado | `estado_operativo` → `En Reparacion` |
| UT-PHP-005 | Estado posterior Operativo | `estado_operativo` → `Operativo` |
| UT-PHP-006 | Estado posterior Baja | `estado_operativo` → `Baja` |

### 2.3 Backend — `backend/tests/DashboardConsultaTest.php`

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| UT-PHP-007 | Filtro `tipo_equipo=Laptop` | 1 equipo |
| UT-PHP-008 | Filtro `estado_operativo=Dañado` | Solo CPU dañada |
| UT-PHP-009 | Filtro combinado CPU + Dañado | Intersección correcta |
| UT-PHP-010 | `Otro` sin texto | Incluye Plotter y Detector, excluye Laptop |
| UT-PHP-011 | `Otro` + texto `plotter` | 1 resultado |
| UT-PHP-012 | Estado inválido ignorado | Devuelve todos (5) |
| UT-PHP-013 | Sin filtros | 5 equipos |

**Nota:** Usa SQLite en memoria; no requiere MySQL ni XAMPP.

### 2.4 ML — `ml/tests/test_features.py`

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| UT-ML-001 | Cantidad de `FEATURE_COLUMNS` | numéricas + categóricas |
| UT-ML-002 | Telemetría Sprint 7 en numéricas | 6 columnas presentes |
| UT-ML-003 | `preparar_dataframe` sin columnas | Numéricas = 0, categóricas = Desconocido |
| UT-ML-004 | Nulos y strings vacíos | Coerción a 0 |
| UT-ML-005 | No muta DataFrame original | Copia independiente |

### 2.5 ML — `ml/tests/test_ml_schemas.py`

| ID | Caso | Resultado esperado |
|----|------|-------------------|
| UT-ML-006 | `RiesgoRequest` id válido | Acepta id > 0 |
| UT-ML-007 | `RiesgoRequest` id ≤ 0 | `ValidationError` |
| UT-ML-008 | `RiesgoBatchRequest` limit > 500 | `ValidationError` |
| UT-ML-009 | `HealthResponse` sin modelo | `modelo_disponible=false` |

---

## 3. Comandos de ejecución

### 3.1 Todas las suites (manual)

```bash
# Raíz del proyecto
npm test

cd backend && composer test && cd ..

cd ml && pytest -v && cd ..
```

### 3.2 Frontend — modo watch (desarrollo)

```bash
npm run test:watch
```

### 3.3 PHP — un archivo específico

```bash
cd backend
vendor/bin/phpunit tests/MantenimientoTest.php
```

### 3.4 Python — un módulo

```bash
cd ml
pytest tests/test_features.py -v
```

---

## 4. Criterios de aceptación

- [ ] `npm test` → todos los casos UT-FE-* en verde
- [ ] `composer test` en `backend/` → todos UT-PHP-* en verde
- [ ] `pytest` en `ml/` → todos UT-ML-* en verde
- [ ] Tiempo total de suite < 30 segundos en entorno local

---

## 5. Cobertura futura (no implementada)

| Área | Motivo de exclusión actual | Próximo paso |
|------|---------------------------|--------------|
| Controladores HTTP PHP | Requieren mocks de request/response | Tests de integración API |
| Componentes React completos | Requiere Testing Library + mocks API | Tests de componente |
| `Equipo::normalizeTipo` | Método privado | Extraer a clase utilitaria o test vía importación |
| Inferencia ML end-to-end | Depende de `.joblib` en disco | Test con modelo fixture |
| Auth JWT | Depende de secret y headers | Test middleware aislado |

---

## 6. Integración CI (opcional)

Ejemplo GitHub Actions (referencia):

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm test
      - uses: php-actions/composer@v6
        with: { working_dir: backend }
      - run: cd backend && composer test
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r ml/requirements.txt && cd ml && pytest
```

---

## 7. Referencias

- [Plan pruebas funcionales](../plan_pruebas_funcionales.md)
- `backend/phpunit.xml`
- `vitest.config.js`
- `ml/pytest.ini`

---

*Documento complementario al plan de pruebas funcionales v1.0.*
