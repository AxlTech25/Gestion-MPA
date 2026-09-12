# Incremento 3 — Fichas técnicas y mantenimiento

> Registro de la **fase de implementación** (Prompt-Centered SDLC v1.2). No es un sprint Scrum. Prompt: [I-003](../../../prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md).

**Fecha de finalización:** 2026-04-30
**Estado:** Completado

## Objetivos del incremento
Implementar el registro histórico de mantenimientos e incidentes de cada equipo. La meta principal fue garantizar que la recolección de datos esté estructurada mediante identificadores fijos (Categoría de Fallas) en lugar de texto libre, sentando las bases para el modelo de Machine Learning.

## Entregables
1. **Backend PHP (API V2)**
   - Creación del modelo `Mantenimiento.php` con métodos PDO (`getAll`, `create`). La consulta `getAll` une (JOIN) múltiples tablas para devolver el nombre de la categoría de falla y el nombre del técnico.
   - Creación del `MantenimientoController.php` bajo `/api/v2/mantenimientos`.

2. **Frontend React (Servicios y UI)**
   - `mantenimientoService.js` para peticiones Axios.
   - `MantenimientoPage.jsx`: Se implementó un diseño de **Línea de Tiempo (Timeline)** dinámico usando TailwindCSS, permitiendo visualizar fácilmente cuándo falló un equipo y por qué.
   - `MantenimientoForm.jsx`: Un modal moderno con el campo `categoria_falla_id` que obliga al usuario a elegir un tipo específico de falla ("Sobrecalentamiento", "Fallo Disco") en lugar de escribirlo.

3. **Documentación**
   - El `changelog.md` ha sido actualizado a la versión **0.3.0**.
   - Creación de este registro de incremento.
