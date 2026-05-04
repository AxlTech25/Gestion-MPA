# Resumen - Sprint 4: Reportes PDF y Filtros Avanzados

**Fecha de finalización:** 2026-04-30
**Estado:** Completado

## Objetivos del Sprint
Brindar capacidades de consulta avanzada sobre el inventario y permitir la extracción física/digital de la información de los equipos mediante generación de documentos PDF oficiales.

## Entregables
1. **Backend PHP (Generación de PDF)**
   - Integración de la librería `dompdf/dompdf` a través de Composer.
   - Creación de `ReporteController.php`, un controlador especializado en armar una vista HTML limpia de la *Ficha Técnica del Equipo* e inyectarla en el motor de Dompdf para renderizarla.
   - Endpoint disponible en `/api/v2/reportes/equipo/{id}`.

2. **Frontend React (Búsqueda y Filtros)**
   - Se modificó `InventarioPage.jsx` añadiendo un motor de filtrado en tiempo real puramente en React (Client-side filtering para respuesta inmediata).
   - Ahora se puede buscar por texto libre (Código, Marca, Modelo) y combinarlo con selectores dropdown (Tipo de Equipo y Estado de Conservación).
   - Se añadió un botón "Descargar Ficha PDF" a la tabla, con un ícono `FileText` verde, que abre automáticamente el reporte oficial generado por el servidor en una nueva pestaña.

3. **Documentación**
   - El `changelog.md` se actualizó a la versión **0.4.0**.
   - Se redactó este registro de sprint y el *Walkthrough* final del hito.
