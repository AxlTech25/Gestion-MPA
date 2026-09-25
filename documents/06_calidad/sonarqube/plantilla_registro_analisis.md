# Registro de análisis SonarQube

**Proyecto:** Sigemad MPA V2  
**Versión analizada:** 0.10.7  
**Fecha:** 2026-09-24  
**Ejecutor:** Axel Estrada Flores
**Servidor:** x Local ☐ SonarCloud ☐ Otro: ___________  
**SHA analizado:** _______________  
**Properties:** `documents/06_calidad/sonarqube/sonar-project.properties`

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Quality Gate | x Passed ☐ Failed ☐ N/A |
| Bugs | 0 |
| Vulnerabilities |  |
| Code smells | |
| Security hotspots | 14 |
| Cobertura (si hay) | 0% |
| Duplicación | 0.9% |

## Alcance de esta corrida

| Qué se analizó | Rutas |
|----------------|-------|
| Producto | `src/`, `backend/api/v2/`, `ml/app/`, `ml/scripts/` |
| Excluido | `documents/`, `node_modules/`, `vendor/`, modelos y datos ML |

## Resultado por función (matriz V4)

Copiar solo las F-* tocadas. Evidencia: este archivo o captura en la misma carpeta `evidencias/YYYY-MM-DD/`.

| ID Función | Archivo principal | ¿Código limpio validado? | Nota |
|------------|-------------------|--------------------------|------|
| F-NNN | | ☐ Sí ☐ Parcial ☐ No ☐ N/A | |

**Sí** = archivo de esa función sin blocker/critical abiertos.  
**Parcial** = el análisis es del módulo, no de la función sola, o quedan smells no bloqueantes.  
**No** = no se analizó o el Quality Gate falló en ese archivo.  
**No aplica** = artefacto no es código (doc, SQL de dump, prompt).

## Hallazgos que abren NC

| Regla Sonar | Severidad | Archivo | NC |
|-------------|-----------|---------|-----|
| | | | NC-YYYY-NNN |

## Evidencias adjuntas

| Archivo | Qué muestra |
|---------|-------------|
| `quality-gate.png` | |
| `issues.csv` / export | |

No commitear tokens ni reportes con secretos.
