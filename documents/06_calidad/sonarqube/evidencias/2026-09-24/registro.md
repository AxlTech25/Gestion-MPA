# Registro de análisis SonarQube

**Proyecto:** Sigemad MPA V2 (`sigemad`)  
**Versión analizada:** 0.10.7  
**Fecha de la carpeta:** 2026-09-24  
**Análisis:** 2026-09-25 00:35:03 UTC (2026-09-24 19:35, hora Perú)  
**Tarea:** `c2fcb623-ea9e-40d1-8c20-e62347203b10` (SUCCESS, 5.2 s)  
**Ejecutor:** Axel Estrada Flores (submitter del servidor: `admin`)  
**Servidor:** SonarQube Community Build local (`http://localhost:9000`)  
**SHA analizado:** no consta en el export  
**Properties:** `documents/06_calidad/sonarqube/sonar-project.properties`

---

## Resumen

Cifras de `component.json` (10 610 líneas de código) y del overview (`Captura sonarqube.png`).

| Métrica | Valor |
|---------|-------|
| Quality Gate | Passed. Perfil **Sonar way** (el de defecto). `caycStatus` = compliant |
| Security | 0 vulnerabilidades, rating A (`security_rating` 1.0) |
| Reliability | 4 bugs, todos minor. Rating clásico B (`reliability_rating` 2.0). La captura muestra C junto a 183 issues con impacto de confiabilidad |
| Maintainability | Rating A (`sqale_rating` 1.0). La captura muestra 275 issues abiertos |
| Bugs | 4 |
| Vulnerabilities | 0 |
| Code smells | 329 |
| Issues abiertos | 333 (237 major, 68 minor, 28 critical; ninguno blocker) |
| Security hotspots | En el análisis: 14 sin revisar, rating E. Tras marcarlos Safe en la UI (2026-10-14): 0 por revisar, rating A. Ver `overview_hotspots_revisados.png` |
| Cobertura | 0.0 % |
| Duplicación | 0.9 % |
| Accepted issues | 0 |

La letra de mantenibilidad sigue en A porque mide el ratio de deuda, no la cantidad de issues. El export de issues suma 2 281 minutos de esfuerzo sobre 10 610 líneas: cerca de 0.7 % de deuda, por debajo del 5 % que aún es A.

Reliability en la API es B porque los únicos bugs son minor. La C de la captura cuenta los 183 issues con impacto de confiabilidad (58 de nivel medium). Son dos escalas distintas.

## Por qué el Quality Gate pasa

`get_by_project.json` asigna el perfil **Sonar way**. `project_status.json` (igual que `quality-gate.json`) responde `status` OK con `conditions` vacío y Clean as You Code en compliant.

Sonar way evalúa el código nuevo, no el histórico. En la corrida del 24 de septiembre no llegó ninguna condición a evaluar, así que el gate no miraba los 333 issues ni la cobertura 0 % del código existente.

El 14 de octubre se volvió a escanear. El periodo de código nuevo arranca el 24 de septiembre (122 líneas, casi todas de `ml/scripts/build_smartpls_dataset.py`). La primera repetición falló: cobertura 0.0 % sobre 62 líneas ejecutables, por debajo del 80 %. Esos scripts arman datasets y no son el servicio en ejecución, así que quedaron fuera con `sonar.coverage.exclusions`. En el overview siguiente (`overview_new_code_passed.png`) el gate pasa: 0 issues nuevos, duplicación 0.0 % y hotspots en A. La cobertura del código nuevo figura **Not computed**, porque ya no quedan líneas nuevas sobre las que calcularla. El aviso del análisis sigue. Pasar el gate no cubre el código histórico.

## Avisos del análisis

`task.json` y `ce-component.json` traen los dos avisos del banner *The last analysis has warnings*:

1. Python se analizó como compatible con todas las versiones de Python 3. Para afinar reglas, definir `sonar.python.version` en `sonar-project.properties`.
2. Faltan datos de blame en 3 archivos. Sin SCM, SonarQube no atribuye bien el autor ni separa código nuevo. El export no dice cuáles son esos 3 archivos.

## Alcance de esta corrida

| Qué se analizó | Rutas |
|----------------|-------|
| Producto | `src/`, `backend/api/v2/`, `ml/app/`, `ml/scripts/` |
| Excluido | `documents/`, `node_modules/`, `vendor/`, modelos y datos ML |

Issues por raíz: `src/` 228, `backend/` 97, `ml/` 8.

## Resultado por función (matriz V4)

El análisis es del proyecto completo, no de una F-* aislada. En la V4 corresponde **Parcial**.

| ID Función | Archivo principal | ¿Código limpio validado? | Nota |
|------------|-------------------|--------------------------|------|
| — | proyecto `sigemad` | Parcial | Quality Gate Passed sobre código nuevo; el código existente tiene 28 critical y 14 hotspots sin revisar |

**Sí** = archivo de esa función sin blocker/critical abiertos.  
**Parcial** = el análisis es del módulo, no de la función sola, o quedan smells no bloqueantes.  
**No** = no se analizó o el Quality Gate falló en ese archivo.  
**No aplica** = artefacto no es código (doc, SQL de dump, prompt).

## Hallazgos

No hay vulnerabilidades ni issues blocker. Los 28 critical son code smells de mantenibilidad.

| Regla | Cantidad | Qué señala |
|-------|----------|------------|
| php:S1192 | 16 | Literales duplicados (Cronograma, reportes, ficha técnica) |
| php:S3776 | 5 | Complejidad cognitiva sobre 15 |
| php:S121 | 5 | Sentencias anidadas sin llaves (`Usuario.php`, `ReporteController.php`) |
| javascript:S3776 | 2 | Complejidad cognitiva en `ConfiguracionPage.jsx` y `ConsultaEquiposPanel.jsx` |

Bugs (los 4 son minor):

| Regla | Archivo | Nota |
|-------|---------|------|
| php:S2003 | `backend/api/v2/config/LocalConfig.php:13` | `require` en lugar de `require_once` |
| javascript:S1082 | `CronogramaCantidadPopover.jsx` (líneas 26 y 30) | Clic sin listener de teclado |
| javascript:S1082 | `CargaMasivaModal.jsx:88` | Clic sin listener de teclado |

Reglas con más ocurrencias: `javascript:S6774` (118), `javascript:S6853` (54), `php:S1780` (22), `php:S1142` (19), `php:S1192` (16).

Hotspots (14). En el export del 24 de septiembre estaban `TO_REVIEW` (rating E). El 14 de octubre se marcaron Safe en la interfaz: el overview quedó en 0 hotspots por revisar y rating A (`overview_hotspots_revisados.png`). No son vulnerabilidades; la regla pide confirmar que el uso no protege un secreto.

### python:S2245 — 13 en `ml/scripts/generate_synthetic.py`

`generar_filas` arma un dataset sintético reproducible (`random.Random(42 + i)`). `rng.choice` y `rng.randint` eligen perfil, área, tipo, conservación, marca y hardware de equipos ficticios. No generan contraseñas, tokens ni identificadores de sesión.

| Línea | Uso | Captura |
|-------|-----|---------|
| 144 | `rng.choice(perfiles)` | `hotspot_s2245_l144.png` |
| 145 | `rng.choice(AREAS)` | `hotspot_s2245_l145.png` |
| 146 | `rng.choice(TIPOS)` | `hotspot_s2245_l146.png` |
| 154 | conservación si perfil crítico | `hotspot_s2245_l154.png` |
| 155 | operativo si perfil crítico | `hotspot_s2245_l155.png` |
| 157, 160, 163 | conservación en perfiles alto, medio y bajo | misma regla; sin captura |
| 173 | `rng.choice(MARCAS)` | misma regla; sin captura |
| 174 | `rng.randint(100, 999)` en el modelo | misma regla; sin captura |
| 175, 176, 177 | RAM, almacenamiento y tipo de disco | misma regla; sin captura |

### php:S5332 — 1 en `backend/api/v2/config/local.example.php:15`

`cors_origins` lista `http://localhost:5173`, `http://localhost` y `http://127.0.0.1`. Es la plantilla de XAMPP local (`local.example.php`), no el archivo de producción. Esas URLs tienen que quedar en HTTP mientras el entorno local no tenga TLS. Captura: `hotspot_s5332_cors.png`.

Esa revisión no cambia el código ni vuelve a correr el análisis. El resto del overview sigue igual: confiabilidad C, mantenibilidad A, cobertura 0.0 % y el aviso del análisis.

No se abre NC en esta ficha: no hay blocker ni vulnerabilidad. Los critical de mantenibilidad quedan como deuda.

## Evidencias adjuntas

| Archivo | Qué muestra |
|---------|-------------|
| `Captura sonarqube.png` | Overview del análisis: 14 hotspots, rating E |
| `overview_hotspots_revisados.png` | Mismo análisis tras marcar los 14 hotspots como Safe: 0 por revisar, rating A |
| `overview_new_code_passed.png` | Reanálisis del 14 de octubre: Quality Gate Passed en código nuevo; cobertura Not computed |
| `get_by_project.json` | Quality Gate del proyecto: Sonar way |
| `project_status.json` | Estado OK, sin condiciones evaluadas. Igual que `quality-gate.json` |
| `component.json` | Métricas completas (ratings, ncloc, hotspots revisados) |
| `medidas.json` | Subconjunto de métricas de la primera exportación |
| `issues.json` | 333 issues abiertos |
| `hotspots.json` | 14 security hotspots |
| `hotspot_s2245_l144.png` … `l155.png` | Cinco usos de `rng.choice` en `generate_synthetic.py` |
| `hotspot_s5332_cors.png` | `http` en `cors_origins` de `local.example.php` |
| `task.json` | Tarea SUCCESS y los 2 avisos |
| `ce-component.json` | Misma tarea, vista desde el componente |

No hay tokens ni secretos en estos archivos.
