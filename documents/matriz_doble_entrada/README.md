# Matriz de doble entrada — trazabilidad de mantenimiento (Sigemad MPA)

Instrumento V3 (Amaro et al. 2025 + Jiang et al. 2025) aplicado al caso **Sigemad MPA V2**. Sirve para controlar el desarrollo asistido por IA desde GitHub: cada módulo apunta al **prompt** que lo generó y al **commit** donde quedó el código.

| Archivo | Uso |
|---------|-----|
| [MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx) | Caso lleno (este software) |
| [MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx](./MATRIZ-DOBLE-ENTRADA-V3-AMARO-JIANG-MONEY-ME.xlsx) | Plantilla original (caso Flutter Money Me) |

En GitHub: [carpeta](https://github.com/AxlTech25/Gestion-MPA/tree/main/documents/matriz_doble_entrada) · [Excel Sigemad](https://github.com/AxlTech25/Gestion-MPA/blob/main/documents/matriz_doble_entrada/MATRIZ-DOBLE-ENTRADA-V3-SIGEMAD-MPA.xlsx)

## Cadena de evidencia

```text
Prompt versionado          Commit en GitHub              Código
prompts/03_implementacion/  →  /commit/{sha}          →  archivo en ese SHA
I-001 / I-002
```

En la hoja **Matriz Consolidada**:

1. **ID Prompt** abre el markdown del prompt en `main`.
2. **Commit** abre el diff de GitHub de ese SHA.
3. **Link GitHub** abre el archivo principal tal como quedó en ese commit.

## SHA de código por módulo (implementación)

| Función | Módulo | Prompt | Commit | Archivo en ese commit |
|---------|--------|--------|--------|------------------------|
| F-001 | auth | [I-001](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-001_api_auth_inventario_v1.md) | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [Login.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/src/features/auth/Login.jsx) |
| F-002 | configuracion | I-001 | [9950f99](https://github.com/AxlTech25/Gestion-MPA/commit/9950f99) | [ConfiguracionPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/9950f99/src/features/configuracion/components/ConfiguracionPage.jsx) |
| F-003 | inventario | I-001 | [9950f99](https://github.com/AxlTech25/Gestion-MPA/commit/9950f99) | [EquipoController.php](https://github.com/AxlTech25/Gestion-MPA/blob/9950f99/backend/api/v2/controllers/EquipoController.php) |
| F-004 | ficha | I-001 | [9950f99](https://github.com/AxlTech25/Gestion-MPA/commit/9950f99) | [FichaTecnicaController.php](https://github.com/AxlTech25/Gestion-MPA/blob/9950f99/backend/api/v2/controllers/FichaTecnicaController.php) |
| F-005 | mantenimiento | I-001 | [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) | [MantenimientoController.php](https://github.com/AxlTech25/Gestion-MPA/blob/8b20337/backend/api/v2/controllers/MantenimientoController.php) |
| F-006 | dashboard | I-001 | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [DashboardPage.jsx](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/src/features/dashboard/components/DashboardPage.jsx) |
| F-007 | ml | [I-002](https://github.com/AxlTech25/Gestion-MPA/blob/main/prompts/03_implementacion/I-002_microservicio_ml_v1.md) | [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) | [ml/app/main.py](https://github.com/AxlTech25/Gestion-MPA/blob/e9a0965/ml/app/main.py) |
| F-008 | reportes | I-001 | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) | [ReporteController.php](https://github.com/AxlTech25/Gestion-MPA/blob/5ce7575/backend/api/v2/controllers/ReporteController.php) |

Los prompts I-001 e I-002 se registraron de forma **retrospectiva**. El historial Git anterior es **agregado** (pocos commits grandes), no un SHA por cada prompt. Eso es una limitación del caso, no del instrumento.

## Convención a partir de ahora

Cada cambio asistido por IA se cierra con un commit que cite el prompt:

```text
feat(inventario): validar código patrimonial de 12 dígitos [I-001]
fix(ml): degradación si FastAPI no responde [I-002]
docs(matriz): actualizar SHA de F-003 [I-001]
```

Luego se actualiza en el Excel: **Versión del prompt**, **N.º de iteraciones**, **Commit**, **Link GitHub**.

Metodología: [../metodologia.md](../metodologia.md). Repositorio de prompts: [../../prompts/](../../prompts/).
