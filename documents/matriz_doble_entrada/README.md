# Matriz de doble entrada — trazabilidad de mantenimiento (Sigemad MPA)

Instrumento V3 (Amaro et al. 2025 + Jiang et al. 2025) aplicado al caso **Sigemad MPA V2**. Sirve para controlar el desarrollo asistido por IA desde GitHub: cada módulo apunta al **prompt** que lo generó y al **commit** donde quedó el código.

| Archivo | Uso |
|---------|-----|
| [prompts_detallados.md](./prompts_detallados.md) | Hoja **Prompts Detallados** (Jiang): una fila por I-*; las funciones atómicas F-001…F-051 viven en el Excel |
| [MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx) | Caso lleno (este software); regenerar con `_generar_matriz_sigemad.py` |
| [MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx) | Plantilla original (caso Flutter Money Me) |
| [MATRIZ-DOBLE-ENTRADA-V4-SIGEMAD-MPA.xlsx](./MATRIZ-DOBLE-ENTRADA-V4-SIGEMAD-MPA.xlsx) | Plantilla en blanco: jerarquía ISO 9001 + SonarQube. Inventario: [ISO/plantillas/inventario_procesos.md](../ISO/plantillas/inventario_procesos.md). Evidencia: [06_calidad/sonarqube/](../06_calidad/sonarqube/) |

En GitHub: [carpeta](https://github.com/AxlTech25/Gestion-MPA/tree/main/documents/matriz_doble_entrada) · [Excel Sigemad](https://github.com/AxlTech25/Gestion-MPA/blob/main/documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx)

**Traza vigente (Incremento 8 / 0.10.7):** [prompts_detallados.md](./prompts_detallados.md) — **una fila por función atómica** F-001…F-051 (login ≠ registro; alta de área ≠ baja). Código del Incremento 8: [3394712](https://github.com/AxlTech25/Gestion-MPA/commit/3394712).

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

## SHA de código por función (implementación)

Granularidad de la plantilla Money Me: **Función/Componente** es un caso (inicio de sesión, registro de usuario), no el módulo entero. `Feature/Módulo` solo agrupa.

| ID | Módulo | Función | Prompt | Commit | Archivo |
|----|--------|---------|--------|--------|---------|
| F-001 | auth | Inicio de sesión | [I-006](../../prompts/03_implementacion/I-006_auth_dashboard_v1.md) | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [Login.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/src/features/auth/Login.jsx) |
| F-005 | auth | Autorización por rol | [I-009](../../prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md) | [3394712](https://github.com/AxlTech25/Gestion-MPA/commit/3394712) | [AuthMiddleware.php](https://github.com/AxlTech25/Gestion-MPA/blob/3394712/backend/api/v2/middleware/AuthMiddleware.php) |
| F-011 | configuracion | Registro de usuario | [I-005](../../prompts/03_implementacion/I-005_configuracion_v1.md) | [4e08b9e](https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e) | [UsuarioForm.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/4e08b9e/src/features/configuracion/components/UsuarioForm.jsx) |
| F-014 | inventario | Listado de equipos | [I-002](../../prompts/03_implementacion/I-002_inventario_v1.md) | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) | [InventarioPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/f086a63/src/features/inventario/components/InventarioPage.jsx) |
| F-043 | cronograma | Menú e historial | [I-010](../../prompts/03_implementacion/I-010_cronograma_v1.md) | [3394712](https://github.com/AxlTech25/Gestion-MPA/commit/3394712) | [CronogramaListPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/3394712/src/features/cronograma/components/CronogramaListPage.jsx) |

Las **51 filas** (F-001…F-051) con resultado, ubicación, criterio, test y enlace GitHub están en el Excel y se generan desde [`_funciones_atomicas.py`](./_funciones_atomicas.py).

Un mismo SHA puede anclar varias funciones si salieron en el mismo commit; el **prompt** y el **archivo principal** sí cambian por fila.

`f086a63` y `4e08b9e` documentan código que ya existía y no estaba en GitHub. Alias históricos (no usar): [I-001-MACRO](../../prompts/03_implementacion/I-001_api_auth_inventario_v1.md), [I-002-ML](../../prompts/03_implementacion/I-002_microservicio_ml_v1.md).

## Commits de documentación por fase (2026-09-09)

| Prompt | Commit | Qué quedó en GitHub |
|--------|--------|---------------------|
| [R-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/01_requisitos/R-001_elicitacion_v1.md) / [R-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/01_requisitos/R-002_historias_usuario_v1.md) | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) | `documents/01_requisitos/` |
| [D-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/02_diseno/D-001_modelo_datos_v1.md) / [D-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/02_diseno/D-002_decision_arquitectura_v1.md) | [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) | `documents/02_diseno/` |
| I-001…I-008 (índice de incrementos) | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) | `documents/03_implementacion/incrementos/` |
| [T-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/04_testing/T-001_plan_pruebas_v1.md) | [b58e175](https://github.com/AxlTech25/Gestion-MPA/commit/b58e175) | `documents/04_testing/` |
| [M-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/05_mantenimiento/M-001_deploy_produccion_v1.md) | [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134) | `documents/05_mantenimiento/` |

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
