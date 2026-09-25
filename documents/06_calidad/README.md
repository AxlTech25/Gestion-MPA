# Fase 06 — Calidad y pruebas estáticas

Carpeta de **calidad de código** (ISO 9001 cl. 9.1 + hallazgo del asesor en la matriz V4). No sustituye a [04_testing/](../04_testing/): allí viven E2E, unitarias, integración, UAT y humo.

| Recurso | Uso |
|---------|-----|
| [sonarqube/](./sonarqube/) | Configuración del analizador y evidencia por función F-* |
| [sonarqube/sonar-project.properties](./sonarqube/sonar-project.properties) | Archivo canónico de Sonar (movido desde la raíz del repo) |
| [sonarqube/plantilla_registro_analisis.md](./sonarqube/plantilla_registro_analisis.md) | Una ficha por corrida |
| [sonarqube/evidencias/](./sonarqube/evidencias/) | Capturas / export del reporte (columna V4 *SonarQube: Evidencia*) |
| [no_conformidades/](./no_conformidades/) | NC-YYYY-NNN a partir de [plantilla_no_conformidad.md](../ISO/plantillas/plantilla_no_conformidad.md) |
| [ISO/plantillas/](../ISO/plantillas/) | Fichas de macroproceso, procedimiento y actividad |

## Relación con la matriz V4

Por cada F-NNN:

| Columna V4 | Valores |
|------------|---------|
| SonarQube: ¿Código limpio validado? | **Sí** / **Parcial** / **No** / **No aplica** |
| SonarQube: Evidencia (Link GitHub) | Archivo en `documents/06_calidad/sonarqube/evidencias/` |

Marcar **Sí** solo si esa función (o su archivo principal) aparece en el reporte sin issues abiertos de blocker/critical. Si el análisis es del módulo entero, usar **Parcial**. Si aún no se corrió Sonar: **No**.

## Orden respecto a 04_testing

1. Unitarias / integración / E2E (`04_testing`)
2. Análisis estático (esta carpeta)
3. Si hay hallazgo: NC + corrección + re-análisis
4. Actualizar la fila F-* en la matriz V4
