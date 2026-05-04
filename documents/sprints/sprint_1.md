# Resumen - Sprint 1: Cimientos y Arquitectura Core

**Fecha de finalización:** 2026-04-30
**Estado:** Completado

## Objetivos del Sprint
Establecer la arquitectura base para la migración progresiva del sistema a la Versión 2 (V2), preparando el terreno para la integración futura de Machine Learning e Inteligencia de Negocios, sin interrumpir la versión actual.

## Entregables
1. **Documentación Centralizada:**
   - Creación de la carpeta `documents/`.
   - Redacción de `architecture.md` (Patrón Strangler Fig, MVC en backend, React Router + Zustand).
   - Inicialización de `changelog.md`.

2. **Base de Datos V2 (Preparación para ML):**
   - Script `v2_estructura.sql` creado.
   - Cambio de columnas de texto a numéricas (`ram_gb`, `almacenamiento_gb`).
   - Normalización de Áreas y Usuarios.
   - Creación de catálogo `v2_categorias_falla` para reemplazar texto libre en mantenimientos, habilitando análisis predictivo.

3. **Backend PHP (API V2):**
   - Estructura base en `backend/api/v2/`.
   - Enrutador centralizado con `index.php` y `.htaccess`.
   - Clase PDO `Database.php` orientada a objetos.
   - Esqueleto de `AuthMiddleware.php`.

4. **Frontend React:**
   - Adición de rutas `/v2/*` en `App.jsx`.
   - Configuración de Zustand en `src/store/useGlobalStore.js`.
   - Esqueletos de páginas V2 para Inventario, Mantenimiento y Dashboard en `src/features/`.
