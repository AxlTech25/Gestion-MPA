# Matriz de doble entrada — trazabilidad de mantenimiento (Sigemad MPA)

Instrumento V3 (Amaro et al. 2025 + Jiang et al. 2025) aplicado al caso **Sigemad MPA V2**. Sirve para controlar el desarrollo asistido por IA desde GitHub: cada módulo apunta al **prompt** que lo generó y al **commit** donde quedó el código.

| Archivo | Uso |
|---------|-----|
| [prompts_detallados.md](./prompts_detallados.md) | Hoja **Prompts Detallados** (Jiang): una fila por función F-001…F-008 + I-008/I-009 |
| [MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx) | Caso lleno (este software); regenerar con `_generar_matriz_sigemad.py` |
| [MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx) | Plantilla original (caso Flutter Money Me) |

En GitHub: [carpeta](https://github.com/AxlTech25/Gestion-MPA/tree/main/documents/matriz_doble_entrada) · [Excel Sigemad](https://github.com/AxlTech25/Gestion-MPA/blob/main/documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx)

**Traza vigente (oleada 3):** [prompts_detallados.md](./prompts_detallados.md) — mismos campos que Money Me (ID prompt, función, prompt exacto, técnica, versión, iteraciones, motivo, versión final, estado, resultado, evidencia = commit).

## Cadena de evidencia

```text
Prompt versionado                          Commit en GitHub     Código
prompts/03_implementacion/I-00N_*.md   →   /commit/{sha}     →  archivo en ese SHA
```

Índice: [prompts/03_implementacion/README.md](../../prompts/03_implementacion/README.md) · [catálogo](../../prompts/gobernanza/catalogo.md) · [prompts detallados](./prompts_detallados.md).

En la hoja **Matriz Consolidada**:

1. **ID Prompt** abre el markdown del prompt en `main`.
2. **Commit** abre el diff de GitHub de ese SHA.
3. **Link GitHub** abre el archivo principal tal como quedó en ese commit.

## SHA de código por módulo (implementación)

| Función | Módulo | Prompt vigente | Commit | Archivo en ese commit |
|---------|--------|----------------|--------|------------------------|
| F-001 | auth | [I-006](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-006_auth_dashboard_v1.md) | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [Login.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/src/features/auth/Login.jsx) |
| F-002 | configuracion | [I-005](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-005_configuracion_v1.md) | [4e08b9e](https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e) | [ConfiguracionPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/4e08b9e/src/features/configuracion/components/ConfiguracionPage.jsx) |
| F-003 | inventario | [I-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-002_inventario_v1.md) | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) | [EquipoController.php](https://github.com/AxlTech25/Gestion-MPA/blob/f086a63/backend/api/v2/controllers/EquipoController.php) |
| F-004 | ficha | [I-003](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md) | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) | [FichaTecnicaController.php](https://github.com/AxlTech25/Gestion-MPA/blob/f086a63/backend/api/v2/controllers/FichaTecnicaController.php) |
| F-005 | mantenimiento | [I-003](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md) | [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) | [MantenimientoController.php](https://github.com/AxlTech25/Gestion-MPA/blob/8b20337/backend/api/v2/controllers/MantenimientoController.php) |
| F-006 | dashboard | [I-006](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-006_auth_dashboard_v1.md) | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [DashboardPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/src/features/dashboard/components/DashboardPage.jsx) |
| F-007 | ml | [I-007](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-007_microservicio_ml_v1.md) | [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) | [ml/app/main.py](https://github.com/AxlTech25/Gestion-MPA/blob/e9a0965/ml/app/main.py) |
| F-008 | reportes | [I-004](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-004_reportes_pdf_v1.md) | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) | [ReporteController.php](https://github.com/AxlTech25/Gestion-MPA/blob/f086a63/backend/api/v2/controllers/ReporteController.php) |

Evoluciones posteriores (mismo módulo, otro prompt):

| Función | Prompt adicional | Qué cambió |
|---------|------------------|------------|
| F-001 / F-002 | [I-009](../../prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md) | `requireRole` en `/usuarios`, Navbar |
| F-003 / F-005 / F-007 | [I-008](../../prompts/03_implementacion/I-008_telemetria_ficha_predictiva_v1.md) | Telemetría, sync, ficha predictiva |

`f086a63` y `4e08b9e` son commits **nuevos** que documentan código que ya existía en el working tree y no estaba en GitHub. El origen de auth/dashboard/ML no se reescribió. Un mismo SHA puede anclar dos funciones (p. ej. F-003 y F-008); los prompts igual son distintos.

Alias históricos (no usar como ID vigente): [I-001-MACRO](../../prompts/03_implementacion/I-001_api_auth_inventario_v1.md), [I-002-ML](../../prompts/03_implementacion/I-002_microservicio_ml_v1.md).

## Commits de documentación por fase (2026-09-09)

| Prompt | Commit | Qué quedó en GitHub |
|--------|--------|---------------------|
| [R-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/01_requisitos/R-001_elicitacion_v1.md) / [R-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/01_requisitos/R-002_historias_usuario_v1.md) | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) | `documents/01_requisitos/` |
| [D-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/02_diseno/D-001_modelo_datos_v1.md) / [D-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/02_diseno/D-002_decision_arquitectura_v1.md) | [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) | `documents/02_diseno/` |
| I-001…I-008 (índice de incrementos) | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) | `documents/03_implementacion/incrementos/` |
| [T-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/04_testing/T-001_plan_pruebas_v1.md) | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) | `documents/04_testing/` |
| [M-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/05_mantenimiento/M-001_deploy_hostinger_v1.md) | [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134) | `documents/05_mantenimiento/` |

## Convención a partir de ahora

Cada cambio asistido por IA se cierra con un commit que cite el prompt **del incremento**, no el macro:

```text
feat(inventario): validar código patrimonial de 12 dígitos [I-002]
fix(ml): degradación si FastAPI no responde [I-007]
fix(auth): requireRole en /usuarios [I-009]
docs(matriz): actualizar SHA de F-003 [I-002]
```

Luego se actualiza en el Excel: **Versión del prompt**, **N.º de iteraciones**, **Commit**, **Link GitHub**.

Metodología: [../metodologia.md](../metodologia.md). Repositorio de prompts: [../../prompts/](../../prompts/).
