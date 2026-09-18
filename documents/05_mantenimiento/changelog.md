# Registro de Cambios (Changelog)

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [0.10.7] - 2026-09-17 — Gerencias, CRUD de áreas y bandas (I-017)

Cierra el **Incremento 8** (R-006 / I-010…I-017). Revisión humana: esta parte queda terminada.

### Añadido
- **HU-CFG-008:** Catálogo `v2_gerencias`. Cada área puede asignarse a una gerencia (selector).
- **HU-CRN-015:** La matriz y el PDF agrupan con una **fila banda** de gerencia (sin Xn). Sin asignaciones, no hay bandas.

### Cambiado
- **HU-CFG-007:** Se puede **editar y eliminar** un área. Si tiene equipos, DELETE responde 409.

## [0.10.6] - 2026-09-17 — Encaje del PDF y HORA PROGRAMADA con borde (I-016)

### Arreglado
- **HU-CRN-004:** El PDF es **una sola tabla**: áreas y meses en la misma fila. El `colspan` del mes cuenta solo lunes a viernes. N° cabe en dos dígitos; **PC / LAPTOP / IMPRESORA** van completos y más estrechos.
- **HORA PROGRAMADA** imprime **N°, EQUIPO y HORARIO** con reja (misma tabla que la nota; ya no se anidan celdas sin borde). Columnas PC / LAPTOP / IMPRESORA al ancho del texto (no absorben el blanco de la hoja).

## [0.10.5] - 2026-09-16 — PDF A4 laborable, año del plan y baja (I-015)

### Arreglado
- **HU-CRN-004:** El PDF es **A4 apaisado**, **dos meses por hoja**, solo **lunes a viernes**. N°, área, PC, laptop e impresora se conservan; las columnas de día son más estrechas.
- Las fechas impresas y las de la matriz son del **año del documento** (un plan 2028 muestra ENE-2028 y el weekday de 2028).
- Encabezados de área y de equipos (PC / LAP / IMP) ya no se aplastan: el `colspan` del mes coincide con los días laborables.

### Añadido
- **HU-CRN-014:** Eliminar un cronograma del historial (confirmación; CASCADE; practicante 403).

## [0.10.4] - 2026-09-15 — Cantidad Xn por día (I-014)

### Cambiado
- **Xn** es cuántos **PC o laptop** se atienden ese día (X1 = 1 equipo, X3 = 3), no un turno mañana/tarde.
- La matriz y el PDF tienen **una columna por día**. Clic abre el selector X1…Xn (n = PC + laptop del área): un día puede ser X2 y el siguiente X3, sin diez columnas.
- Cobertura: suma de cantidades vs PC+laptop. Las impresoras se cuentan en la tabla pero no en Xn.
- Asiento: `cronograma + área + fecha + cantidad`. Migración fusiona las celdas duplicadas que había por turno.

## [0.10.3] - 2026-09-15 — Equipo de trabajo en HORA PROGRAMADA (I-013)

### Cambiado
- El recuadro **HORA PROGRAMADA** del PDF lista las **personas** que realizan el preventivo (N°, nombre, horario), no las horas de cada PC del inventario.
- En la matriz hay un panel pequeño para editar esas filas (por defecto PC 01 / PC 02).

## [0.10.2] - 2026-09-15 — PDF del cronograma tipo papel (I-012)

### Cambiado
- **HU-CRN-004:** La impresión es la **matriz** del documento (N°, área, PC/laptop/impresora, meses y días, marcas X1/X2), no un listado. A3 apaisado. Última hoja: leyenda de turnos, horas por equipo y nota al usuario.

## [0.10.1] - 2026-09-15 — Totales, horas por equipo e impresión (I-011)

### Añadido
- **HU-CRN-010:** Columna Tot por área; pie **Subtotal** (PC/Lap/Imp) y **Total equipos**.
- **HU-CRN-011:** Horas de cada equipo del área en la visita (`v2_cronograma_horarios`); modal al marcar o al clic en celda ocupada.
- El PDF lista Equipo 1, Equipo 2… con hora inicio/fin.

### Arreglado
- **HU-CRN-004:** Imprimir PDF descarga el archivo (`link.download` + `Content-Disposition: attachment`) en lugar de abrir una pestaña en blanco / buscador.

## [0.10.0] - 2026-09-15 — Cronograma de preventivo (I-010)

### Añadido
- **HU-CRN-007/008/009:** Menú **Cronograma**, historial de documentos y alta (año + nombre). Varios planes por año.
- **HU-CRN-001–003:** Matriz por área × día × turno (X1 10:00–13:00, X2 14:00–17:00); marcado y liberación manual.
- **HU-CRN-004:** PDF autenticado `GET /reportes/cronograma/{id}`.
- **HU-CRN-005/006:** Filas desde `v2_areas`; cobertura de áreas con equipos sin visita.
- Tablas `v2_cronogramas` y `v2_cronograma_celdas` (ADR-003). Migración `backend/tools/migrate_cronograma.php`.

### Seguridad
- Escritura (POST/DELETE) restringida a Administrador y Técnico (`requireRole`). El practicante solo consulta.

## [0.9.1] - 2026-09-09 — Mitigación RBAC usuarios y plantilla Excel

### Añadido
- **HU-AUTH-005:** `AuthMiddleware::requireRole()` aplica autorización por rol en la API (además del JWT).
- **HU-CFG-006:** `POST`/`PUT`/`PATCH`/`DELETE` `/usuarios` restringidos a **Administrador**. La API rechaza autoeliminación y la eliminación o degradación del último administrador.
- Ruta `/v2/configuracion` y enlace del Navbar visibles solo para Administrador.

### Arreglado
- **HU-INV-004:** La fila de ejemplo de `plantilla_carga_equipos.xlsx` incluye `color`; `numero_serie` y `area` ya no quedan desplazados.

### Seguridad
- Un Técnico o Practicante autenticado ya no puede crear, editar roles/contraseñas ni eliminar cuentas llamando a `/api/v2/usuarios` de forma directa.

## [0.9.0] - Cierre incremento 7 — Fase 2 ML y ficha predictiva

### Añadido
- **HU-FIC-008:** Bloque «Evaluación predictiva» en `FichaTecnicaPanel.jsx` (score, nivel, factores).
- **HU-ML-006:** Recálculo automático de riesgo tras `POST /mantenimientos` vía `MlService::recalcularEquipo()`.
- **HU-ML-007:** Tabla `v2_metricas_equipo`, modelo `MetricaEquipo.php`, migración `v2_metricas_equipo.sql`.
- **HU-ML-003:** Modelo `riesgo_equipo_v2.joblib` con features de telemetría; inferencia prioriza v2 si existe.
- **Backend:** `services/MlService.php` (cliente ML reutilizable).

### Cambiado
- `MlController.php` refactorizado para usar `MlService`.
- `train_model.py` acepta `--version v2`.

## [0.8.0] - Incremento 7 (Completado) — Telemetría ML y mantenimiento estructurado

### Añadido
- **Base de datos Fase 7:** columnas de telemetría en `v2_equipos` (`horas_uso`, `errores_smart`, `contador_paginas`, `salud_bateria`, `ultima_temp_cpu`, `ultima_temp_disco`, `fecha_ultimo_mantenimiento`).
- **Fichas de mantenimiento ampliadas:** `sintoma_usuario`, `causa_raiz`, `componente_principal`, `nivel_polvo`, temperaturas, lecturas de uso/batería/páginas, `tiempo_inactividad_min`.
- **ENUMs:** `tipo_mantenimiento` incluye `Predictivo`; `estado_operativo` incluye `En Reparacion`.
- **Migraciones:** `backend/sql/v2_extension_fase7.sql`, `backend/tools/migrate_fase7.php`.
- **Backend:** `Equipo::syncTelemetria()`, sincronización automática del snapshot del equipo tras registrar mantenimiento.
- **Frontend:** sección telemetría en `EquipoForm.jsx`; formulario Fase 7 en `MantenimientoForm.jsx` (campos condicionales por tipo de intervención).
- **ML:** 6 features nuevas en `features.py`, `dataset.py` y `build_dataset.py` (`horas_uso`, `errores_smart`, `salud_bateria`, `contador_paginas`, `ultima_temp_cpu`, `ultima_temp_disco`).
- **Documentación:** `documents/02_diseno/ml/mantenimiento_predictivo_analisis.md`, `documents/03_implementacion/incrementos/incremento_7_extension_schema_v2.md`.

### Cambiado
- `v2_estructura.sql` actualizado para instalaciones nuevas con esquema Fase 7.
- `ml/data/README.md` ampliado con diccionario de telemetría.

## [0.7.0] - Incremento 6 (Completado) — Machine Learning Predictivo

### Añadido
- **Dataset A:** CSV sintético 200 equipos (`ml/data/synthetic/equipos_riesgo_v200.csv`), scripts de generación, export MySQL y feature engineering (`ml/scripts/`).
- **Modelo A:** Random Forest entrenado (`riesgo_equipo_v1.joblib`) — accuracy 95%, F1 macro 0.92.
- **Microservicio FastAPI** (`ml/app/`): `/health`, `/predict/riesgo`, `/predict/riesgo/batch`, `/predict/categoria`, `/train`, `/metrics`.
- **Proxy PHP** (`/api/v2/ml/*`): `MlController.php`, `routes/ml.php`, `Prediccion.php`, `config/Ml.php`.
- **Base de datos:** Tabla `v2_predicciones_ml` (`backend/sql/v2_ml_predicciones.sql`, migración `migrate_ml_predicciones.php`).
- **Frontend:** `mlService.js`, `RiesgoBadge.jsx`, badges de riesgo en inventario, panel **Alertas predictivas** en dashboard (top 10), sugerencia de categoría en `MantenimientoForm.jsx`.
- **Herramientas:** `verify_sprint6_ml.py`, `predict_cli.py`, `ml/README.md`.
- Documentación actualizada en `documents/03_implementacion/incrementos/incremento_6.md` y `documents/02_diseno/architecture.md`.

### Cambiado
- `InventarioPage.jsx`: columna **Estado** separada de **Riesgo ML** (semáforo predictivo).
- `DashboardPage.jsx`: carga paralela de métricas operativas y alertas ML.

### Arreglado
- Proxy PHP enviaba `[]` en peticiones batch; FastAPI requiere `{}` — corregido en `MlController.php`.
- Respuestas PHP con cuerpo JSON válido pero código HTTP 503 en fallos internos de curl — corregido para devolver HTTP 200 en respuestas exitosas con fallback.

## [0.6.0] - Migración V2, Dashboard y mejoras operativas
### Añadido
- **Auth JWT:** Login con token Bearer (`firebase/php-jwt`), middleware aplicado a todas las rutas excepto `/auth`.
- **Frontend:** Cliente Axios centralizado en `src/lib/api.js` con interceptores de autenticación.
- **Dashboard:** Endpoint `/api/v2/dashboard` con métricas operativas y UI en `DashboardPage.jsx`.
- Usuario administrador seed en `v2_estructura.sql` (`admin` / `admin123`).

### Eliminado
- Código huérfano V1: `ModalFichaTecnica.jsx`, `GenerarFichaPDF.js`, módulos legacy y endpoints PHP V1.

### Cambiado
- `AuthContext` reemplaza Zustand como gestor de sesión (token + usuario).
- Descarga de PDF autenticada vía blob en lugar de `window.open` directo.

## [0.5.0] - Incremento 5 (Completado)
### Añadido
- **Backend API:** Modelos, Controladores y Rutas (`/api/v2/areas`, `/api/v2/usuarios`) para el CRUD Organizacional. Encriptación BCRYPT para nuevo personal.
- **Frontend React:** Nuevo módulo de `ConfiguracionPage.jsx` con pestañas duales para administrar Áreas y Personal.
- **Frontend React:** Modales de registro de áreas y personal integrados con `organizacionService.js`.
- **Frontend React:** `EquipoForm.jsx` ahora se alimenta dinámicamente de la base de datos para mostrar las áreas reales y asignar responsables al equipo.
- Resumen detallado en `documents/03_implementacion/incrementos/incremento_5.md`.

## [0.4.0] - Incremento 4 (Completado)
### Añadido
- **Backend:** Instalación de `dompdf/dompdf` vía Composer para generación de documentos.
- **Backend API:** `ReporteController.php` y ruta `/api/v2/reportes/equipo/{id}` para descargar Fichas Técnicas.
- **Frontend React:** Filtros combinados en tiempo real (Texto, Tipo, Estado) en `InventarioPage.jsx`.
- **Frontend React:** Botón de descarga de PDF integrado en la tabla de inventario.
- Resumen en `documents/03_implementacion/incrementos/incremento_4.md`.

## [0.3.0] - Incremento 3 (Completado)
### Añadido
- **Backend API:** Modelo `Mantenimiento.php`, Controlador y Rutas para gestionar historiales.
- **Frontend React:** `MantenimientoPage.jsx` con diseño de Línea de Tiempo (Timeline).
- **Frontend React:** Modal interactivo para registrar mantenimientos con selección de `categoria_falla_id`.
- **Frontend React:** Servicio Axios para Mantenimientos (`mantenimientoService.js`).
- Resumen en `documents/03_implementacion/incrementos/incremento_3.md`.

## [0.2.0] - Incremento 2 (Completado)
### Añadido
- **Backend API:** Modelo `Equipo.php`, `EquipoController.php` y rutas `/api/v2/equipos` (GET y POST).
- **Frontend React:** `InventarioPage` rediseñado con Tailwind y tabla moderna.
- **Frontend React:** Formulario modal `EquipoForm` para alta de equipos con campos ML-ready (numéricos y fechas).
- **Frontend React:** Cliente HTTP con Axios (`equiposService.js`).
- Resumen del incremento en `documents/03_implementacion/incrementos/incremento_2.md`.

## [0.1.0] - Incremento 1 (Completado)
### Añadido
- Carpeta `documents/` para centralizar la documentación técnica.
- Documento de arquitectura (`documents/02_diseno/architecture.md`) que define la estructura V2 para soportar Machine Learning y API REST.
- Nuevo esquema de base de datos (`v2_estructura.sql`) optimizado para ML (Normalización, tipos de datos correctos, historial estructurado).

### Cambiado
- N/A

### Obsoleto
- N/A

### Eliminado
- N/A

### Arreglado
- N/A
