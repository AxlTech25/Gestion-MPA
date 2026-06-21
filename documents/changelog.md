# Registro de Cambios (Changelog)

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased] - Sprints Finales

## [0.6.0] - Migración V2 y Dashboard
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
