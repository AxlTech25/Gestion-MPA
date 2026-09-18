# Historias de usuario por épica

**Proyecto:** Sigemad MPA V2  
**Versión de referencia:** 0.9.1  
**Última actualización:** 2026-09-09

---

## Épica EP-01 — Autenticación y sesión

### HU-AUTH-001 — Iniciar sesión
**Como** usuario del sistema, **quiero** ingresar con mi usuario y contraseña, **para** acceder de forma segura a los módulos de gestión.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.6.0 |
| Estado | Implementada |
| Personas | P1, P2, P5 |

**Criterios de aceptación:**
- [ ] El formulario de login valida campos obligatorios.
- [ ] Con credenciales correctas redirige al dashboard (`/v2/dashboard`).
- [ ] Con credenciales incorrectas muestra mensaje de error sin revelar detalles de seguridad.
- [ ] El token JWT se almacena y se envía en peticiones subsiguientes.

---

### HU-AUTH-002 — Proteger rutas privadas
**Como** administrador, **quiero** que las rutas del sistema requieran autenticación, **para** evitar acceso no autorizado a datos patrimoniales.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Acceder a `/v2/*` sin sesión redirige a `/login`.
- [ ] La API V2 devuelve HTTP 401 sin token válido (excepto `/auth`).

---

### HU-AUTH-003 — Mantener sesión al recargar
**Como** técnico, **quiero** que mi sesión persista al recargar la página, **para** no tener que volver a iniciar sesión en cada refresco.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tras login exitoso, F5 mantiene al usuario autenticado.
- [ ] Token inválido o expirado limpia la sesión y redirige al login.

---

### HU-AUTH-004 — Cerrar sesión
**Como** usuario, **quiero** cerrar sesión desde la barra de navegación, **para** proteger mi cuenta en equipos compartidos.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] El botón «Salir» elimina el token y redirige al login.
- [ ] Tras cerrar sesión no se puede acceder a rutas privadas sin volver a autenticarse.

---

### HU-AUTH-005 — Autorizar mutaciones de usuarios en la API
**Como** administrador, **quiero** que solo mi rol pueda crear, editar o eliminar cuentas vía API, **para** que un técnico no escale privilegios saltándose la interfaz.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.9.1 |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] `POST`/`PUT`/`PATCH`/`DELETE` `/usuarios` con JWT de Técnico o Practicante responden HTTP 403.
- [ ] El mismo administrador autenticado no puede eliminarse a sí mismo (HTTP 403).
- [ ] No se puede eliminar ni degradar al último Administrador (HTTP 409).
- [ ] `/v2/configuracion` redirige al dashboard si el rol no es Administrador.

---

## Épica EP-02 — Configuración organizacional

### HU-CFG-001 — Listar áreas
**Como** administrador, **quiero** ver todas las áreas registradas, **para** conocer la estructura organizacional disponible en el sistema.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 5 (0.5.0) |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] La pestaña Áreas muestra nombre, jefe encargado y descripción.
- [ ] Los datos provienen de la API `/areas`, no de listas fijas en código.

---

### HU-CFG-002 — Registrar área
**Como** administrador, **quiero** crear una nueva área con su jefe responsable, **para** asignar equipos a departamentos reales.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 5 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Modal de registro con campos obligatorios validados.
- [ ] El área nueva aparece en el listado y en el selector de equipos.

---

### HU-CFG-003 — Listar personal
**Como** administrador, **quiero** ver el personal técnico registrado, **para** gestionar quién puede intervenir en mantenimientos.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 5 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tabla con nombre, usuario, rol y área asignada.

---

### HU-CFG-004 — Registrar técnico
**Como** administrador, **quiero** dar de alta un técnico con rol y área, **para** vincular intervenciones a personas reales.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 5 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Contraseña almacenada con hash BCRYPT en base de datos.
- [ ] Roles disponibles: Administrador, Técnico, Practicante.
- [ ] Select de área poblado dinámicamente.

---

### HU-CFG-006 — Editar y eliminar personal
**Como** administrador, **quiero** actualizar o dar de baja personal desde configuración, **para** mantener roles y accesos alineados con el equipo real.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.9.1 |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] Editar nombre, usuario, rol, área o contraseña (opcional) persiste en BD.
- [ ] Eliminar pide confirmación y no permite borrar la propia cuenta ni al último Administrador.
- [ ] Las acciones de edición/eliminación no aparecen para Técnico ni Practicante.
- [ ] La API aplica las mismas reglas aunque la petición no pase por la UI.

---

### HU-CFG-007 — Editar y eliminar área
**Como** administrador, **quiero** corregir o dar de baja un área, **para** mantener el organigrama alineado con la municipalidad.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.7 |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] Se puede editar nombre, jefe, descripción y gerencia; el cambio aparece en el listado y en inventario.
- [ ] Eliminar pide confirmación. Si el área tiene equipos, la API responde 409 y el área permanece.
- [ ] Al eliminar un área sin equipos se quitan sus marcas de cronograma (CASCADE).
- [ ] POST/PUT/DELETE `/areas` exigen rol Administrador.

---

### HU-CFG-008 — Catálogo de gerencias
**Como** administrador, **quiero** registrar gerencias y asignar cada área a una, **para** agrupar el cronograma como en el papel municipal.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.7 |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] Existe un catálogo de gerencias (alta y baja) en Configuración; el área elige gerencia con un selector (no texto libre como verdad).
- [ ] La gerencia es opcional (Alcaldía o servidores pueden quedar sin agrupar).
- [ ] Al borrar una gerencia, las áreas quedan sin gerencia (SET NULL); no se borran las áreas.
- [ ] SIGA/SAF siguen siendo áreas (servidor), no gerencias inventadas.

---

### HU-CFG-005 — Áreas dinámicas en inventario
**Como** registrador de equipos, **quiero** seleccionar el área desde las áreas configuradas, **para** no depender de valores predefinidos en el formulario.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 5 |
| Estado | Implementada |
| Personas | P5 |

**Criterios de aceptación:**
- [ ] `EquipoForm` carga áreas desde API al abrir el modal.
- [ ] Al seleccionar área se muestra descripción y responsable asociado.

---

## Épica EP-03 — Inventario de equipos

### HU-INV-001 — Ver inventario completo
**Como** administrador, **quiero** ver una tabla con todos los equipos registrados, **para** tener una vista centralizada del parque tecnológico.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 2 (0.2.0) |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tabla con código patrimonial, tipo, marca, modelo, área y estados.
- [ ] Carga desde API `/equipos`.

---

### HU-INV-002 — Registrar equipo individual
**Como** practicante, **quiero** registrar un equipo con código patrimonial de 12 dígitos, **para** cumplir el estándar institucional de identificación.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 2, 5, 7 |
| Estado | Implementada |
| Personas | P5 |

**Criterios de aceptación:**
- [ ] Validación de 12 dígitos numéricos en código patrimonial.
- [ ] Campos obligatorios: patrimonial, tipo, área.
- [ ] Tipo «Otro» permite especificar nombre (Plotter, Escáner, etc.).
- [ ] Campos técnicos (RAM, disco) visibles solo para CPU/Laptop.

---

### HU-INV-003 — Filtrar inventario
**Como** usuario, **quiero** filtrar equipos por texto, tipo y estado, **para** encontrar rápidamente un activo específico.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 (0.4.0) |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Búsqueda por código, marca o modelo en tiempo real.
- [ ] Filtros combinables por tipo de equipo y estado de conservación.

---

### HU-INV-004 — Descargar plantilla de carga masiva
**Como** administrador, **quiero** descargar una plantilla Excel, **para** preparar registros masivos de equipos offline.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | — |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Descarga archivo `.xlsx` con columnas esperadas por el importador, incluida `color`.
- [ ] La fila de ejemplo tiene el mismo número de columnas que el encabezado (`numero_serie` no cae en `color`).

---

### HU-INV-005 — Carga masiva desde Excel
**Como** administrador, **quiero** importar equipos desde un archivo Excel, **para** acelerar el levantamiento inicial del inventario.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | — |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Resumen de filas importadas y errores por fila.
- [ ] Rechaza códigos patrimoniales inválidos o áreas inexistentes.

---

### HU-INV-006 — Ver riesgo predictivo en inventario
**Como** analista, **quiero** ver el nivel de riesgo ML de cada equipo en la tabla, **para** priorizar revisiones sin abrir el dashboard.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 6 (0.7.0) |
| Estado | Implementada |
| Personas | P4 |

**Criterios de aceptación:**
- [ ] Columna «Riesgo ML» con badge de color (Bajo/Medio/Alto/Crítico).
- [ ] Si FastAPI no está disponible, la tabla sigue funcionando sin error fatal.

---

### HU-INV-007 — Abrir ficha técnica desde inventario
**Como** técnico, **quiero** abrir la ficha técnica de un equipo desde el inventario, **para** evaluar su estado sin buscar por código.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 3–4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Acción en fila abre modal con `FichaTecnicaPanel` del equipo seleccionado.

---

### HU-INV-008 — Telemetría en registro de equipo
**Como** analista predictivo, **quiero** registrar telemetría inicial del equipo (horas de uso, SMART, batería), **para** alimentar el modelo ML.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7 (0.8.0) |
| Estado | Implementada |
| Personas | P4 |

**Criterios de aceptación:**
- [ ] Campos de telemetría disponibles en formulario de equipo según tipo.
- [ ] Valores persistidos en `v2_equipos`.

---

### HU-INV-009 — Editar equipo existente
**Como** administrador, **quiero** modificar los datos de un equipo ya registrado, **para** corregir errores de carga.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | — |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Formulario de edición con datos precargados.
- [ ] API PUT `/equipos/{id}` operativa.

---

## Épica EP-04 — Ficha técnica y evaluación

### HU-FIC-001 — Buscar equipo por código patrimonial
**Como** técnico, **quiero** buscar un equipo por su código patrimonial, **para** acceder a su ficha sin navegar por todo el inventario.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4+ |
| Estado | Implementada |
| Personas | P2 |

**Criterios de aceptación:**
- [ ] Página `/v2/ficha-tecnica` con campo de búsqueda.
- [ ] Código inexistente muestra mensaje claro.

---

### HU-FIC-002 — Consultar datos generales del equipo
**Como** responsable patrimonial, **quiero** ver marca, modelo, área, ubicación y fechas del equipo, **para** verificar su asignación.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Panel muestra grid con datos patrimoniales y organizacionales.

---

### HU-FIC-003 — Evaluar hardware y software (CPU/Laptop)
**Como** técnico, **quiero** registrar procesador, RAM, SO, MAC e IP, **para** documentar la configuración técnica del equipo.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Secciones Hardware, Software y Red visibles solo para tipos técnicos.
- [ ] Monitor/Impresora muestran mensaje de no aplicabilidad.

---

### HU-FIC-004 — Registrar evaluación de estado
**Como** técnico, **quiero** actualizar conservación, estado operativo y observaciones, **para** dejar constancia de la inspección realizada.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Badges visuales de conservación y operativo.
- [ ] `fecha_evaluacion` actualizada al guardar.
- [ ] Observaciones en texto libre persistidas.

---

### HU-FIC-005 — Exportar ficha técnica en PDF
**Como** jefe de área, **quiero** descargar la ficha técnica en PDF, **para** adjuntarla a expedientes o auditorías.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 (0.4.0) |
| Estado | Implementada |
| Personas | P3 |

**Criterios de aceptación:**
- [ ] Botón PDF genera documento vía Dompdf.
- [ ] PDF incluye datos generales; hardware solo si aplica al tipo.

---

### HU-FIC-006 — PDF desde inventario
**Como** administrador, **quiero** descargar el PDF directamente desde la tabla de inventario, **para** agilizar la emisión de documentos.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Icono de descarga en fila abre PDF autenticado en nueva pestaña.

---

### HU-FIC-007 — Guardar evaluación sincronizada con inventario
**Como** técnico, **quiero** que los cambios de estado en la ficha se reflejen en el inventario, **para** mantener una única fuente de verdad.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Al guardar ficha, `v2_equipos` actualiza conservación, operativo y specs.

---

### HU-FIC-008 — Ver evaluación predictiva en ficha
**Como** analista, **quiero** ver el score de riesgo y recomendaciones ML dentro de la ficha técnica, **para** decidir mantenimiento preventivo en el mismo contexto.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7 |
| Estado | Implementada |

**Criterios de aceptación:**
- [x] Bloque «Evaluación predictiva» en `FichaTecnicaPanel`.
- [x] Muestra nivel, score y factores principales del modelo.

---

## Épica EP-05 — Mantenimiento

### HU-MNT-001 — Ver historial general de intervenciones
**Como** técnico, **quiero** ver un timeline de todas las intervenciones recientes, **para** entender la carga de trabajo del área de soporte.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 3 (0.3.0) |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Timeline ordenado por fecha descendente.
- [ ] Diferencia visual entre correctivo y preventivo.

---

### HU-MNT-002 — Registrar mantenimiento con categoría estructurada
**Como** técnico, **quiero** clasificar la intervención con una categoría de falla predefinida, **para** habilitar análisis estadístico y ML.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 3 |
| Estado | Implementada |
| Personas | P2 |

**Criterios de aceptación:**
- [ ] Select de categoría obligatorio (no texto libre como única opción).
- [ ] Catálogo desde `v2_categorias_falla`.

---

### HU-MNT-003 — Buscar historial por código patrimonial
**Como** responsable de área, **quiero** buscar el historial de mantenimientos de un equipo por su código, **para** conocer su historial de fallas antes de solicitar soporte.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |
| Personas | P3 |

**Criterios de aceptación:**
- [ ] Formulario de búsqueda en página Mantenimiento.
- [ ] Muestra resumen del equipo y timeline filtrado.
- [ ] Botón «Ver todo» restaura listado general.

---

### HU-MNT-004 — Ver detalle de una intervención
**Como** técnico, **quiero** abrir el detalle completo de una ficha de mantenimiento, **para** revisar diagnóstico, piezas y telemetría registrada.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Modal con datos de intervención, equipo, telemetría y actividades.
- [ ] Sección de reparación visible solo si fue correctivo.

---

### HU-MNT-005 — Exportar historial y ficha en PDF
**Como** administrador, **quiero** exportar el historial o una ficha individual en PDF, **para** documentación formal similar a las fichas técnicas.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] PDF historial con cronología tabular del equipo.
- [ ] PDF ficha individual con datos de intervención y equipo.

---

### HU-MNT-006 — Validar equipo al registrar mantenimiento
**Como** técnico, **quiero** ingresar el código patrimonial y ver tipo y modelo del equipo, **para** confirmar que registro la intervención en el activo correcto.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Búsqueda automática al escribir código patrimonial.
- [ ] Recuadro verde con tipo y modelo si existe.
- [ ] Guardar deshabilitado si el código no es válido.

---

### HU-MNT-007 — Campos condicionales por tipo de equipo
**Como** técnico, **quiero** ver solo los campos de telemetría que aplican al tipo de equipo, **para** no llenar datos irrelevantes (ej. batería en una impresora).

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Laptop/CPU: polvo, temperaturas, horas, batería, inactividad.
- [ ] Impresora: contador de páginas.
- [ ] Monitor/Otro: sin campos de telemetría PC.

---

### HU-MNT-008 — Campos de reparación en correctivo
**Como** técnico, **quiero** registrar diagnóstico, piezas reemplazadas y costo solo en mantenimiento correctivo, **para** documentar reparaciones con trazabilidad de costos.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Sección visible solo si tipo = Correctivo.
- [ ] Campos: diagnóstico, piezas, costo (S/).

---

### HU-MNT-009 — Sugerencia de categoría por IA
**Como** técnico, **quiero** recibir una sugerencia de categoría de falla al registrar un correctivo, **para** clasificar más rápido y con consistencia.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 6 |
| Estado | Implementada |
| Personas | P2, P4 |

**Criterios de aceptación:**
- [ ] Al seleccionar equipo en correctivo, se consulta `/ml/predict/categoria`.
- [ ] Banner con categoría sugerida y probabilidad.
- [ ] El técnico puede cambiar la categoría manualmente.

---

### HU-MNT-010 — Sincronizar telemetría al equipo
**Como** sistema, **quiero** actualizar el snapshot de telemetría del equipo tras guardar mantenimiento, **para** que el ML use datos actualizados.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] `fecha_ultimo_mantenimiento` actualizada en `v2_equipos`.
- [ ] Horas, batería, páginas y temperaturas sincronizadas si fueron informadas.
- [ ] Estado «Dañado» post-mantenimiento → equipo en «En Reparacion».

---

### HU-MNT-011 — Registrar mantenimiento predictivo
**Como** analista, **quiero** registrar intervenciones de tipo Predictivo, **para** distinguirlas de preventivos rutinarios y correctivos reactivos.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tipo «Predictivo» disponible en select.
- [ ] Campos preventivos/telemetría aplican según tipo de equipo.

---

### HU-MNT-012 — Registrar evaluación técnica
**Como** técnico, **quiero** registrar una intervención de tipo Evaluación, **para** documentar inspecciones sin reparación.

| Campo | Valor |
|-------|-------|
| Prioridad | Baja |
| Incremento | 7 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tipo «Evaluación» guardado correctamente en BD.

---

## Épica EP-06 — Dashboard y consultas

### HU-DSH-001 — Ver resumen operativo
**Como** administrador, **quiero** ver totales de equipos, mantenimientos, áreas y dañados, **para** tener una foto instantánea del parque tecnológico.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.6.0 |
| Estado | Implementada |
| Personas | P1 |

**Criterios de aceptación:**
- [ ] Cuatro tarjetas con métricas desde API `/dashboard`.

---

### HU-DSH-002 — Ver distribución por estado y tipo
**Como** gestor, **quiero** ver gráficos de barras por estado operativo y tipo de equipo, **para** identificar concentraciones de riesgo.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Barras proporcionales al total de cada categoría.

---

### HU-DSH-003 — Ver fallas por categoría
**Como** administrador, **quiero** ver qué categorías de falla son más frecuentes, **para** planificar capacitación o repuestos.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Listado top categorías con severidad y conteo.

---

### HU-DSH-004 — Ver mantenimientos recientes
**Como** técnico senior, **quiero** ver las últimas intervenciones en el dashboard, **para** supervisar actividad reciente sin ir al módulo completo.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tabla con orden, equipo, tipo, categoría y fecha.

---

### HU-DSH-005 — Consultar equipos con etiquetas
**Como** jefe de área, **quiero** filtrar equipos por etiquetas de tipo y estado, **para** saber cuántos laptops están dañados o en excedencia.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7+ |
| Estado | Implementada |
| Personas | P3 |

**Criterios de aceptación:**
- [ ] Panel expandible «Consultar equipos».
- [ ] Etiquetas con contador por tipo, estado operativo y conservación.
- [ ] Tabla de resultados al seleccionar filtros.

---

### HU-DSH-006 — Buscar equipos «Otro» por nombre
**Como** administrador, **quiero** escribir el tipo específico junto a la etiqueta «Otro» (plotter, detector), **para** encontrar equipos no estándar.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Campo de texto aparece al seleccionar «Otro».
- [ ] Búsqueda por coincidencia en tipo, marca o modelo.
- [ ] Sin texto: muestra todos los equipos no estándar.

---

## Épica EP-07 — Machine Learning predictivo

### HU-ML-001 — Ver alertas de riesgo en dashboard
**Como** analista, **quiero** ver el top 10 de equipos con mayor riesgo, **para** priorizar mantenimiento preventivo.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 6 (0.7.0) |
| Estado | Implementada |
| Personas | P4 |

**Criterios de aceptación:**
- [ ] Tabla con código, tipo, área, badge de riesgo y score.
- [ ] Mensaje claro si FastAPI no está disponible.

---

### HU-ML-002 — Calcular riesgo por equipo
**Como** sistema, **quiero** consultar el modelo ML para cada equipo, **para** clasificar su nivel de riesgo (Bajo/Medio/Alto/Crítico).

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 6 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Endpoint `/ml/predict/riesgo` y batch operativos.
- [ ] Predicciones persistidas en `v2_predicciones_ml`.

---

### HU-ML-003 — Usar telemetría en el modelo
**Como** analista, **quiero** que el modelo considere horas de uso, SMART, batería y temperaturas, **para** predicciones más precisas.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 7 |
| Estado | Implementada |

**Criterios de aceptación:**
- [x] Features de telemetría en `features.py` y pipeline de dataset.
- [x] Modelo v2 reentrenado (`riesgo_equipo_v2.joblib`) y desplegado en inferencia.

---

### HU-ML-004 — Sugerir categoría de falla
**Como** técnico, **quiero** que el sistema sugiera la categoría más probable al registrar un correctivo, **para** reducir errores de clasificación.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 6 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-MNT-009.

---

### HU-ML-005 — Degradación graceful sin ML
**Como** usuario, **quiero** que el sistema funcione aunque el servicio ML esté caído, **para** no bloquear operaciones diarias.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 6 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Inventario y dashboard cargan sin ML.
- [ ] Mensajes informativos, no errores fatales en UI.

---

### HU-ML-006 — Recalcular riesgo al guardar mantenimiento
**Como** analista, **quiero** que el riesgo se actualice automáticamente tras registrar mantenimiento, **para** tener predicciones al día sin recargar inventario manualmente.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7 (Fase 2) |
| Estado | Implementada |

**Criterios de aceptación:**
- [x] Tras `POST /mantenimientos`, se dispara recálculo ML del equipo afectado.

---

### HU-ML-007 — Métricas históricas por equipo
**Como** analista, **quiero** almacenar series temporales de telemetría en tabla dedicada, **para** análisis de tendencias a largo plazo.

| Campo | Valor |
|-------|-------|
| Prioridad | Baja |
| Incremento | 7 Fase 2 |
| Estado | Implementada |

**Criterios de aceptación:**
- [x] Tabla `v2_metricas_equipo` creada y alimentada en cada mantenimiento.

---

## Épica EP-08 — Reportes

### HU-RPT-001 — PDF ficha técnica institucional
**Como** auditor, **quiero** un PDF con formato institucional de la ficha técnica, **para** cumplir requisitos de documentación patrimonial.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-FIC-005.

---

### HU-RPT-002 — PDF historial de mantenimiento
**Como** responsable patrimonial, **quiero** exportar el historial completo de un equipo en PDF, **para** adjuntarlo a expedientes de soporte.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-MNT-005.

---

### HU-RPT-003 — PDF ficha de intervención
**Como** técnico, **quiero** exportar una intervención individual en PDF, **para** entregar comprobante al usuario final.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] PDF incluye orden, fecha, técnico, equipo y actividades.

---

### HU-RPT-004 — Descarga autenticada de PDF
**Como** administrador, **quiero** que los PDF requieran sesión activa, **para** proteger información sensible.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Descarga vía Axios con token Bearer (blob).
- [ ] Sin token, la API rechaza la petición.

---

## Épica EP-09 — Cronograma anual de preventivo

**Prompt:** [R-006](../../../prompts/01_requisitos/R-006_cronograma_anual_v1.md).  
No confundir con EP-05: aquí se **planifica la visita al área**; la ficha de cada equipo sigue siendo HU-MNT-002.

### HU-CRN-001 — Ver el horario anual por área
**Como** técnico, **quiero** ver el cronograma del año como en el papel (áreas × días, con cantidad de PC, laptop e impresora), **para** organizar cuántos días necesita cada área.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] La vista muestra el rango anual (o la campaña) con días como columnas.
- [ ] Cada fila es un **área** municipal o la fila de servidor institucional.
- [ ] Cada fila muestra conteos de PC, laptop e impresora tomados del inventario (no tecleados a mano).
- [ ] Las celdas ocupadas se distinguen de las libres (marca **Xn** = n PC/laptop ese día).
- [ ] Una misma área puede tener **varios días** con cantidades distintas (p. ej. X2 un día y X3 otro).
- [ ] Lo que se muestra corresponde al **cronograma abierto** del historial (HU-CRN-008), no a “todo el año mezclado”.

---

### HU-CRN-002 — Marcar días y cantidades del área como asientos de cine
**Como** técnico o administrador, **quiero** hacer clic en un día libre de la fila del área y elegir cuántos PC/laptop atenderé (X1, X2, X3…), **para** repartir el parque en varios días sin una columna por equipo.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.4 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Clic en día libre abre selector **X1…Xn** (n = PC + laptop del área). Un área con 1 equipo marca X1 directo.
- [ ] Un día puede ser X2 y otro X3; no hay columnas X1 y X2 por turno.
- [ ] Las marcas de un cronograma no aparecen en otro del mismo año.
- [ ] Un practicante autenticado no puede marcar (HTTP 403 en API si lo intenta).
- [ ] No se calcula ni se rellena solo cuántos días hacen falta: el conteo se ve y el técnico decide.
- [ ] Marcar celdas no crea fichas de mantenimiento.

---

### HU-CRN-003 — Liberar o cambiar días y cantidades de un área
**Como** técnico o administrador, **quiero** desmarcar un día o cambiar su Xn, **para** reprogramar si el área no puede atender o si hace falta alargar la visita.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.4 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Una celda ocupada (día + cantidad) se puede liberar o cambiar de X2 a X3.
- [ ] Se pueden añadir o quitar días de la misma fila sin borrar el resto.
- [ ] La impresión posterior muestra el horario actual, no el anterior.

---

### HU-CRN-004 — Imprimir el cronograma por área
**Como** administrador, **quiero** imprimir el horario (áreas, conteos y días), **para** avisar a cada área cuándo irá el técnico y qué equipos cubre esa visita.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.6 |
| Estado | Implementada |
| Personas | P1, P2, P3 |

**Criterios de aceptación:**
- [ ] Existe acción de imprimir o exportar PDF del horario tipo matriz.
- [ ] La salida agrupa por **área**, con N°, PC / laptop / impresora, días laborables y marca **Xn**.
- [ ] Hoja **A4 apaisada**, **dos meses por página**, **sin sábados ni domingos**. Columnas de día compactas.
- [ ] Las fechas (ENE-2028, weekday) son del **año del documento**, no del año civil actual.
- [ ] Los equipos del área (código patrimonial) quedan asociados a esas fechas.
- [ ] Áreas sin ningún día marcado se ven como pendientes de programar.
- [ ] La descarga requiere sesión (mismo patrón JWT que HU-RPT-004).
- [ ] El PDF indica el **año** y el identificador del cronograma impreso.
- [ ] HORA PROGRAMADA (personas) y la nota al usuario van al pie de la última hoja.
- [ ] HORA PROGRAMADA muestra **N°, EQUIPO y HORARIO** con borde en cada celda.
- [ ] N° cabe en dos dígitos; **PC / LAPTOP / IMPRESORA** van con el nombre completo y columnas compactas; las áreas no se parten letra a letra.
- [ ] La descarga es un archivo PDF (no una pestaña de búsqueda).

---

### HU-CRN-010 — Subtotal y total de equipos
**Como** técnico, **quiero** ver la suma de PC, laptop e impresora por área y al pie de la matriz, **para** dimensionar la carga del preventivo de un vistazo.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.1 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Cada fila muestra un subtotal (PC + laptop + impresora).
- [ ] El pie muestra subtotal por tipo (PC, Lap, Imp) y un total general.
- [ ] Las cifras coinciden con el inventario vigente (sin Baja).

---

### HU-CRN-011 — Horario por equipo en la visita
**Como** técnico, **quiero** asignar hora de atención a cada equipo del área (equipo 1, equipo 2, …) cuando marco un turno, **para** que la impresión indique a qué hora se revisa cada uno.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.1 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Al ocupar un turno se listan los equipos del área (CPU, laptop, impresora).
- [ ] Se puede editar hora de inicio y fin de cada equipo.
- [ ] El valor inicial es el horario del turno (X1 10:00–13:00 / X2 14:00–17:00).
- [ ] El PDF imprime esas horas. Liberar el turno borra también los horarios.
- [ ] Un practicante no puede guardar horas (HTTP 403).

---

### HU-CRN-013 — Cantidad Xn por día
**Como** técnico, **quiero** indicar cuántos PC o laptop atenderé cada día (X1…X10) sin partir el día en turnos, **para** repartir un área grande en varios días (2 un día, 3 otro).

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.4 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Hay una sola columna por día; la celda muestra X2, X3, etc.
- [ ] El máximo del selector es PC + laptop del área (las impresoras no suman a Xn).
- [ ] No se generan columnas X1…X10 ni se auto-rellenan los días restantes.
- [ ] El PDF imprime la misma marca Xn.

---

### HU-CRN-014 — Eliminar un cronograma del historial
**Como** técnico o administrador, **quiero** borrar un cronograma creado, **para** quitar planes de prueba o campañas que ya no aplican.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.5 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] En el historial hay acción de eliminar con confirmación (nombre del plan).
- [ ] Se borran el documento, sus celdas, horarios y personal (CASCADE).
- [ ] Un practicante no ve la acción; `DELETE /cronogramas/{id}` responde 403.
- [ ] Tras borrar, el ítem no aparece en el listado ni en GET por id (404).

---

### HU-CRN-015 — Agrupar el cronograma por gerencia
**Como** técnico, **quiero** ver las áreas bajo su gerencia (fila banda, como el papel), **para** leer el horario igual que el documento municipal.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.7 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] La matriz y el PDF insertan una fila de gerencia (sin N° de equipo y sin Xn) al cambiar de grupo.
- [ ] El N° de área sigue 1, 2, 3… en todo el documento.
- [ ] Si ninguna área tiene gerencia, no aparecen bandas (compatibilidad).
- [ ] Áreas sin gerencia, cuando sí hay otras agrupadas, van al final bajo **OTRAS ÁREAS**.

---

### HU-CRN-005 — Incluir servidores institucionales
**Como** técnico, **quiero** ver en el cronograma el servidor donde corren SIGA, SAF u otro sistema de la entidad, **para** no dejar ese equipo fuera del preventivo anual.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] El servidor aparece como fila (o filas) del horario, no como gerencia municipal.
- [ ] No hay pantalla ni API de “módulo SIGA”: solo el activo de inventario que hospeda el software.
- [ ] Se le puede marcar fecha igual que al resto.

---

### HU-CRN-006 — Ver cobertura del mínimo anual
**Como** administrador, **quiero** ver qué **áreas** aún no tienen días de preventivo este año, **para** no dejar oficinas ni su parque de equipos fuera de la visita anual.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P4 |

**Criterios de aceptación:**
- [ ] Indicador o listado de áreas con PC/laptop vigentes cuya suma de Xn aún no cubre ese parque en **ese cronograma**.
- [ ] Se muestra el total de PC + laptop + impresora de esas áreas pendientes.
- [ ] No exige que las fichas de mantenimiento ya estén registradas: cuenta la **planificación**.
- [ ] El listado corresponde al cronograma abierto, no a mezclar todos los del año.

---

### HU-CRN-007 — Menú «Cronograma»
**Como** técnico, **quiero** entrar por un ítem de menú llamado Cronograma, **para** no confundirlo con Mantenimiento (fichas de intervención).

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] En el menú principal el texto es **Cronograma** (no “Cronograma de mantenimiento”).
- [ ] La ruta es distinta a `/v2/mantenimiento`.
- [ ] Al entrar se muestra el **historial**, no la matriz vacía de un año.

---

### HU-CRN-008 — Historial de cronogramas por año
**Como** administrador, **quiero** ver cada cronograma que se programó, agrupado por año, **para** tener trazabilidad (incluso 2 o 3 en el mismo año).

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P2, P3 |

**Criterios de aceptación:**
- [ ] Listado de cronogramas ya registrados (historial).
- [ ] Cada ítem muestra al menos año, identificador y fecha de registro.
- [ ] Se puede filtrar o agrupar por año.
- [ ] Un mismo año admite varios ítems (caso típico: 2 o 3).
- [ ] Abrir un ítem lleva a la matriz de **ese** cronograma (HU-CRN-001).
- [ ] Los ítems no se mezclan: las celdas de uno no aparecen en otro.

---

### HU-CRN-009 — Registrar un cronograma nuevo
**Como** técnico o administrador, **quiero** crear un cronograma nuevo indicando el año, **para** abrir otra campaña sin borrar las anteriores.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Incremento | 8 / 0.10.0 |
| Estado | Implementada |
| Personas | P1, P2 |

**Criterios de aceptación:**
- [ ] Existe acción de crear un cronograma (año obligatorio).
- [ ] Queda un ítem nuevo en el historial, vacío de marcas.
- [ ] Un practicante no puede crearlo (HTTP 403 si lo intenta).
- [ ] Crear el documento no genera fichas de mantenimiento ni rellena celdas.

---

## Resumen de backlog pendiente

EP-09 / Incremento 8 (**0.10.7**): **cerrado** el 2026-09-17. No quedan HU-CRN pendientes.

| ID | Historia | Prioridad | Nota |
|----|----------|-----------|------|
| — | — | — | Sin backlog de cronograma. Un cambio nuevo exige R-* (no reabrir I-017). |

---

*Documento vivo: actualizar al cerrar cada incremento SDLC o al implementar nuevas historias.*
