# Historias de usuario por épica

**Proyecto:** Sigemad MPA V2  
**Versión de referencia:** 0.9.0  
**Última actualización:** 2026-06-21

---

## Épica EP-01 — Autenticación y sesión

### HU-AUTH-001 — Iniciar sesión
**Como** usuario del sistema, **quiero** ingresar con mi usuario y contraseña, **para** acceder de forma segura a los módulos de gestión.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 0.6.0 |
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
| Sprint | 0.6.0 |
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
| Sprint | 0.6.0 |
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
| Sprint | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] El botón «Salir» elimina el token y redirige al login.
- [ ] Tras cerrar sesión no se puede acceder a rutas privadas sin volver a autenticarse.

---

## Épica EP-02 — Configuración organizacional

### HU-CFG-001 — Listar áreas
**Como** administrador, **quiero** ver todas las áreas registradas, **para** conocer la estructura organizacional disponible en el sistema.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 5 (0.5.0) |
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
| Sprint | 5 |
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
| Sprint | 5 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tabla con nombre, usuario, rol y área asignada.

---

### HU-CFG-004 — Registrar técnico
**Como** administrador, **quiero** dar de alta un técnico con rol y área, **para** vincular intervenciones a personas reales.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 5 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Contraseña almacenada con hash BCRYPT en base de datos.
- [ ] Roles disponibles: Administrador, Técnico, Practicante.
- [ ] Select de área poblado dinámicamente.

---

### HU-CFG-005 — Áreas dinámicas en inventario
**Como** registrador de equipos, **quiero** seleccionar el área desde las áreas configuradas, **para** no depender de valores predefinidos en el formulario.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 5 |
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
| Sprint | 2 (0.2.0) |
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
| Sprint | 2, 5, 7 |
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
| Sprint | 4 (0.4.0) |
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
| Sprint | — |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Descarga archivo `.xlsx` con columnas esperadas por el importador.

---

### HU-INV-005 — Carga masiva desde Excel
**Como** administrador, **quiero** importar equipos desde un archivo Excel, **para** acelerar el levantamiento inicial del inventario.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | — |
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
| Sprint | 6 (0.7.0) |
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
| Sprint | 3–4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Acción en fila abre modal con `FichaTecnicaPanel` del equipo seleccionado.

---

### HU-INV-008 — Telemetría en registro de equipo
**Como** analista predictivo, **quiero** registrar telemetría inicial del equipo (horas de uso, SMART, batería), **para** alimentar el modelo ML.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 7 (0.8.0) |
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
| Sprint | — |
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
| Sprint | 4+ |
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
| Sprint | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Panel muestra grid con datos patrimoniales y organizacionales.

---

### HU-FIC-003 — Evaluar hardware y software (CPU/Laptop)
**Como** técnico, **quiero** registrar procesador, RAM, SO, MAC e IP, **para** documentar la configuración técnica del equipo.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 4 |
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
| Sprint | 4 |
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
| Sprint | 4 (0.4.0) |
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
| Sprint | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Icono de descarga en fila abre PDF autenticado en nueva pestaña.

---

### HU-FIC-007 — Guardar evaluación sincronizada con inventario
**Como** técnico, **quiero** que los cambios de estado en la ficha se reflejen en el inventario, **para** mantener una única fuente de verdad.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Al guardar ficha, `v2_equipos` actualiza conservación, operativo y specs.

---

### HU-FIC-008 — Ver evaluación predictiva en ficha
**Como** analista, **quiero** ver el score de riesgo y recomendaciones ML dentro de la ficha técnica, **para** decidir mantenimiento preventivo en el mismo contexto.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 7 |
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
| Sprint | 3 (0.3.0) |
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
| Sprint | 3 |
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
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 6 |
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
| Sprint | 7 |
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
| Sprint | 7 |
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
| Sprint | 7 |
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
| Sprint | 0.6.0 |
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
| Sprint | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Barras proporcionales al total de cada categoría.

---

### HU-DSH-003 — Ver fallas por categoría
**Como** administrador, **quiero** ver qué categorías de falla son más frecuentes, **para** planificar capacitación o repuestos.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Listado top categorías con severidad y conteo.

---

### HU-DSH-004 — Ver mantenimientos recientes
**Como** técnico senior, **quiero** ver las últimas intervenciones en el dashboard, **para** supervisar actividad reciente sin ir al módulo completo.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Tabla con orden, equipo, tipo, categoría y fecha.

---

### HU-DSH-005 — Consultar equipos con etiquetas
**Como** jefe de área, **quiero** filtrar equipos por etiquetas de tipo y estado, **para** saber cuántos laptops están dañados o en excedencia.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 7+ |
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
| Sprint | 7+ |
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
| Sprint | 6 (0.7.0) |
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
| Sprint | 6 |
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
| Sprint | 7 |
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
| Sprint | 6 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-MNT-009.

---

### HU-ML-005 — Degradación graceful sin ML
**Como** usuario, **quiero** que el sistema funcione aunque el servicio ML esté caído, **para** no bloquear operaciones diarias.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 6 |
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
| Sprint | 7 (Fase 2) |
| Estado | Implementada |

**Criterios de aceptación:**
- [x] Tras `POST /mantenimientos`, se dispara recálculo ML del equipo afectado.

---

### HU-ML-007 — Métricas históricas por equipo
**Como** analista, **quiero** almacenar series temporales de telemetría en tabla dedicada, **para** análisis de tendencias a largo plazo.

| Campo | Valor |
|-------|-------|
| Prioridad | Baja |
| Sprint | 7 Fase 2 |
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
| Sprint | 4 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-FIC-005.

---

### HU-RPT-002 — PDF historial de mantenimiento
**Como** responsable patrimonial, **quiero** exportar el historial completo de un equipo en PDF, **para** adjuntarlo a expedientes de soporte.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Ver HU-MNT-005.

---

### HU-RPT-003 — PDF ficha de intervención
**Como** técnico, **quiero** exportar una intervención individual en PDF, **para** entregar comprobante al usuario final.

| Campo | Valor |
|-------|-------|
| Prioridad | Media |
| Sprint | 7+ |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] PDF incluye orden, fecha, técnico, equipo y actividades.

---

### HU-RPT-004 — Descarga autenticada de PDF
**Como** administrador, **quiero** que los PDF requieran sesión activa, **para** proteger información sensible.

| Campo | Valor |
|-------|-------|
| Prioridad | Alta |
| Sprint | 0.6.0 |
| Estado | Implementada |

**Criterios de aceptación:**
- [ ] Descarga vía Axios con token Bearer (blob).
- [ ] Sin token, la API rechaza la petición.

---

## Resumen de backlog pendiente

| ID | Historia | Prioridad |
|----|----------|-----------|
| HU-FIC-008 | Evaluación predictiva en ficha | Media |
| HU-ML-003 | Reentrenar modelo v2 (parcial) | Alta |
| HU-ML-006 | Recálculo ML post-mantenimiento | Media |
| HU-ML-007 | Tabla métricas históricas | Baja |

---

*Documento vivo: actualizar al cerrar cada sprint o al implementar nuevas historias.*
