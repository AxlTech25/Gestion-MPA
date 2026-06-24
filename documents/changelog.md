# Registro de Cambios (Changelog)

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [0.9.0] - Cierre Sprint 7 — Fase 2 ML y ficha predictiva

### Añadido
- **HU-FIC-008:** Bloque «Evaluación predictiva» en `FichaTecnicaPanel.jsx` (score, nivel, factores).
- **HU-ML-006:** Recálculo automático de riesgo tras `POST /mantenimientos` vía `MlService::recalcularEquipo()`.
- **HU-ML-007:** Tabla `v2_metricas_equipo`, modelo `MetricaEquipo.php`, migración `v2_metricas_equipo.sql`.
- **HU-ML-003:** Modelo `riesgo_equipo_v2.joblib` con features de telemetría; inferencia prioriza v2 si existe.
- **Backend:** `services/MlService.php` (cliente ML reutilizable).

### Cambiado
- `MlController.php` refactorizado para usar `MlService`.
- `train_model.py` acepta `--version v2`.

## [0.8.0] - Sprint 7 (Completado) — Telemetría ML y mantenimiento estructurado

### Añadido
- **Base de datos Fase 7:** columnas de telemetría en `v2_equipos` (`horas_uso`, `errores_smart`, `contador_paginas`, `salud_bateria`, `ultima_temp_cpu`, `ultima_temp_disco`, `fecha_ultimo_mantenimiento`).
- **Fichas de mantenimiento ampliadas:** `sintoma_usuario`, `causa_raiz`, `componente_principal`, `nivel_polvo`, temperaturas, lecturas de uso/batería/páginas, `tiempo_inactividad_min`.
- **ENUMs:** `tipo_mantenimiento` incluye `Predictivo`; `estado_operativo` incluye `En Reparacion`.
- **Migraciones:** `backend/sql/v2_extension_fase7.sql`, `backend/tools/migrate_fase7.php`.
- **Backend:** `Equipo::syncTelemetria()`, sincronización automática del snapshot del equipo tras registrar mantenimiento.
- **Frontend:** sección telemetría en `EquipoForm.jsx`; formulario Fase 7 en `MantenimientoForm.jsx` (campos condicionales por tipo de intervención).
- **ML:** 6 features nuevas en `features.py`, `dataset.py` y `build_dataset.py` (`horas_uso`, `errores_smart`, `salud_bateria`, `contador_paginas`, `ultima_temp_cpu`, `ultima_temp_disco`).
- **Documentación:** `documents/ml/mantenimiento_predictivo_analisis.md`, `documents/sprints/sprint_7_extension_schema_v2.md`.

### Cambiado
- `v2_estructura.sql` actualizado para instalaciones nuevas con esquema Fase 7.
- `ml/data/README.md` ampliado con diccionario de telemetría.

## [0.7.0] - Sprint 6 (Completado) — Machine Learning Predictivo

### Añadido
- **Dataset A:** CSV sintético 200 equipos (`ml/data/synthetic/equipos_riesgo_v200.csv`), scripts de generación, export MySQL y feature engineering (`ml/scripts/`).
- **Modelo A:** Random Forest entrenado (`riesgo_equipo_v1.joblib`) — accuracy 95%, F1 macro 0.92.
- **Microservicio FastAPI** (`ml/app/`): `/health`, `/predict/riesgo`, `/predict/riesgo/batch`, `/predict/categoria`, `/train`, `/metrics`.
- **Proxy PHP** (`/api/v2/ml/*`): `MlController.php`, `routes/ml.php`, `Prediccion.php`, `config/Ml.php`.
- **Base de datos:** Tabla `v2_predicciones_ml` (`backend/sql/v2_ml_predicciones.sql`, migración `migrate_ml_predicciones.php`).
- **Frontend:** `mlService.js`, `RiesgoBadge.jsx`, badges de riesgo en inventario, panel **Alertas predictivas** en dashboard (top 10), sugerencia de categoría en `MantenimientoForm.jsx`.
- **Herramientas:** `verify_sprint6_ml.py`, `predict_cli.py`, `ml/README.md`.
- Documentación actualizada en `documents/sprints/sprint_6.md` y `documents/architecture.md`.

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

## [0.5.0] - Sprint 5 (Completado)
### Añadido
- **Backend API:** Modelos, Controladores y Rutas (`/api/v2/areas`, `/api/v2/usuarios`) para el CRUD Organizacional. Encriptación BCRYPT para nuevo personal.
- **Frontend React:** Nuevo módulo de `ConfiguracionPage.jsx` con pestañas duales para administrar Áreas y Personal.
- **Frontend React:** Modales de registro de áreas y personal integrados con `organizacionService.js`.
- **Frontend React:** `EquipoForm.jsx` ahora se alimenta dinámicamente de la base de datos para mostrar las áreas reales y asignar responsables al equipo.
- Resumen detallado en `documents/sprints/sprint_5.md`.

## [0.4.0] - Sprint 4 (Completado)
### Añadido
- **Backend:** Instalación de `dompdf/dompdf` vía Composer para generación de documentos.
- **Backend API:** `ReporteController.php` y ruta `/api/v2/reportes/equipo/{id}` para descargar Fichas Técnicas.
- **Frontend React:** Filtros combinados en tiempo real (Texto, Tipo, Estado) en `InventarioPage.jsx`.
- **Frontend React:** Botón de descarga de PDF integrado en la tabla de inventario.
- Resumen en `documents/sprints/sprint_4.md`.

## [0.3.0] - Sprint 3 (Completado)
### Añadido
- **Backend API:** Modelo `Mantenimiento.php`, Controlador y Rutas para gestionar historiales.
- **Frontend React:** `MantenimientoPage.jsx` con diseño de Línea de Tiempo (Timeline).
- **Frontend React:** Modal interactivo para registrar mantenimientos con selección de `categoria_falla_id`.
- **Frontend React:** Servicio Axios para Mantenimientos (`mantenimientoService.js`).
- Resumen en `documents/sprints/sprint_3.md`.

## [0.2.0] - Sprint 2 (Completado)
### Añadido
- **Backend API:** Modelo `Equipo.php`, `EquipoController.php` y rutas `/api/v2/equipos` (GET y POST).
- **Frontend React:** `InventarioPage` rediseñado con Tailwind y tabla moderna.
- **Frontend React:** Formulario modal `EquipoForm` para alta de equipos con campos ML-ready (numéricos y fechas).
- **Frontend React:** Cliente HTTP con Axios (`equiposService.js`).
- Resumen del Sprint en `documents/sprints/sprint_2.md`.

## [0.1.0] - Sprint 1 (Completado)
### Añadido
- Carpeta `documents/` para centralizar la documentación técnica.
- Documento de arquitectura (`architecture.md`) que define la estructura V2 para soportar Machine Learning y API REST.
- Nuevo esquema de base de datos (`v2_estructura.sql`) optimizado para ML (Normalización, tipos de datos correctos, historial estructurado).

### Cambiado
- N/A

### Obsoleto
- N/A

### Eliminado
- N/A

### Arreglado
- N/A
