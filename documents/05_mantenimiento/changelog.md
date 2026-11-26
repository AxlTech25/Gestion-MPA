# Registro de Cambios (Changelog)

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [0.12.3] - 2026-11-25 — Seed demo para Render (opción A)

### Añadido
- `backend/sql/v2_seed_demo.sql`: 2 gerencias, 3 áreas, 8 equipos, 2 tickets, admin/técnico.
- `backend/tools/seed_demo.php` (aplica estructura + seed; `--force` para reaplicar).
- Docs: opción A = seed demo; opción B = dump completo.

### Qué probar
- `php backend/tools/seed_demo.php` contra una BD vacía → inventario con 8 equipos.
- Login `admin` / `DemoMPA2026!Segura`.

## [0.12.2] - 2026-11-25 — Blueprint Render (API + MySQL)

### Añadido
- [`render.yaml`](../../render.yaml): MySQL private service + web `sigemad-api` (Docker `backend/`).
- Docs de producción actualizadas a **Vercel + Render** (Railway queda como alternativa).

### Qué probar
- New → Blueprint en Render con el repo; `GET /health.php` en el API.
- Actualizar `VITE_API_BASE_URL` en Vercel a la URL `*.onrender.com` y redesplegar.

## [0.12.1] - 2026-11-25 — Deploy Vercel + Railway

### Añadido
- `backend/Dockerfile` + `docker-entrypoint.sh` + `railway.toml` (PHP 8.2 Apache, DocumentRoot `api/v2`).
- `GET /health.php` para healthcheck.
- Soporte `db_port` y variables Railway `MYSQL*` en `LocalConfig` / `Database`.
- `PATCH` en CORS; `vercel.json` y `.env.production.example` con API absoluta.
- Script `backend/tools/reset_user_passwords.php` para rotar claves de `v2_usuarios` (salida solo en consola).
- Sección Vercel+Railway en `documents/05_mantenimiento/produccion.md` (sustituida en 0.12.2 por Render).

### Qué probar
- Build local del Dockerfile; `/health.php` → JSON ok.
- Tras importar dump: rotar passwords y login con la nueva clave.
- Frontend en Vercel llamando a la URL pública del API.

## [0.12.0] - 2026-11-22 — Tickets de soporte públicos

### Añadido
- Formulario público `/soporte` (sin login): Gerencia → Área → Motivo, nombre/detalle opcionales.
- Código de seguimiento `TK-AAAA-NNNN` y consulta de estado en la misma página.
- Cola interna `/v2/tickets` para usuarios del sistema; Admin/Técnico cambian estado.
- API: `GET /tickets/catalogo`, `POST /tickets`, `GET /tickets?codigo=`, `GET /tickets`, `PATCH /tickets/{id}`.
- Tabla `v2_tickets` + `php backend/tools/migrate_tickets.php`.
- Límite de envíos por IP y honeypot anti-bots.

### Qué probar
- Abrir `/soporte` sin sesión, enviar una solicitud y anotar el código.
- Consultar el código en el bloque inferior.
- Entrar como técnico, abrir **Tickets**, filtrar y pasar un ticket a «En atencion».

## [0.11.8] - 2026-11-22 — Catálogo de fallas en mantenimiento

### Añadido
- En Registrar mantenimiento, el selector de categoría/falla carga el catálogo desde la base.
- Botón **Agregar falla** para registrar nuevas fallas (nombre + severidad) y reutilizarlas.
- `GET/POST /mantenimientos/categorias-falla`.

### Qué probar
- Abrir una ficha de mantenimiento: debe listar las fallas existentes.
- Agregar una falla nueva, guardarla y usarla en la intervención.

## [0.11.7] - 2026-11-22 — Endurecimiento del login

### Seguridad
- Límite de intentos de login: tras 5 fallos (por IP y por usuario+IP) responde 429 y bloquea 15 minutos (`login_max_attempts`, `login_lockout_seconds`).
- Verificación de contraseña a tiempo constante aunque el usuario no exista.
- Mensajes de error de BD ya no se exponen al cliente.
- Contraseñas de usuario nuevas/editadas: mínimo 8 y máximo 200 caracteres.
- JWT incluye `nbf` además de `exp`.

### Qué probar
- 5 logins fallidos seguidos: mensaje de bloqueo y espera. Luego login correcto con credenciales válidas.
- Crear usuario con contraseña de 7 caracteres: debe rechazarse.

## [0.11.6] - 2026-11-22 — Catálogo de ficha y reporte ENAD

### Añadido
- Catálogo reutilizable en la ficha (`v2_catalogo_ficha`) para procesador, sistema operativo, software y tipo de impresora, con opción «Otro» que se guarda y se reutiliza.
- En Reportes, bloque **ENAD / inventario digital**: un PDF con las tablas 14, 16, 20, 21 y 24 a partir del inventario y las fichas.
- `GET /reportes/enad` → `enad_inventario_digital_{anio}.pdf`.

### Qué probar
- En una ficha de CPU/laptop, elegir SO/procesador/software del catálogo o «Otro»; al reabrir deben aparecer. Borrar solo entradas no predefinidas.
- En Reportes, **Descargar PDF ENAD**: tablas 14/16 (CPU/laptop operativos por procesador y SO), 20 (estados), 21 (red) y 24 (impresoras).

## [0.11.5] - 2026-11-18 — Hoja técnica en una A4 y versiones en el reporte

### Cambiado
- El PDF de la hoja de revisión técnica cabe en una página A4. La información general va en dos columnas. En CPU, laptop o PC, las especificaciones de hardware y software quedan al lado de la evaluación técnica y el resultado. Si hay diagnóstico y conclusión, también comparten la fila.
- Las fotos van en la misma tabla que el rótulo IMAGEN, alineadas con el resto de la hoja. Una foto usa todo ese ancho; dos se reparten en partes iguales.
- En Reportes, **Ficha técnica de un equipo** ya no trae solo la hoja vigente. El PDF adjunta cada versión que ese equipo tuvo, de la primera a la actual, una por página. Esas versiones se arman con los guardados de `v2_ficha_tecnica_historial`. Si la ficha nunca se volvió a guardar, el PDF tiene una sola hoja.
- El botón PDF de la ficha y el reporte por año siguen imprimiendo la hoja vigente. El archivo del reporte por equipo se llama `fichas_tecnicas_{codigo}.pdf`.

### Qué probar
- Descargar el PDF de un CPU o laptop con diagnóstico, conclusión y una foto: una página A4, y el recuadro de la foto alineado con el título IMAGEN. Con dos fotos, cada una ocupa la mitad.
- En Reportes, un equipo guardado más de una vez (por ejemplo `740000000000`) debe traer la hoja original y cada guardado posterior. Un equipo que solo tiene la carga inicial trae una hoja.
- Un código inexistente no descarga archivo y muestra «Equipo no encontrado».

## [0.11.4] - 2026-11-18 — Reportes en dos bloques, por año

### Cambiado
- Reportes tiene dos bloques: **Fichas técnicas** y **Fichas de mantenimiento**. En cada uno se descarga la ficha de un equipo o las fichas de un año, juntas en un PDF.
- El filtro por día pasa a un menú de años. El año sale de la fecha de la ficha técnica o de la fecha de la intervención.

### Qué probar
- En cada bloque, un código existente descarga sus fichas y uno inexistente muestra «Equipo no encontrado».
- Elegir un año con fichas y otro sin ellas. El segundo PDF trae el aviso.

## [0.11.3] - 2026-11-18 — Reportes con las fichas completas

### Cambiado
- Reportes ya no imprime el historial de cambios. **Fichas del equipo** junta en un PDF la ficha técnica y cada ficha de mantenimiento de ese código, una por hoja. **Fichas de una fecha** junta las fichas de mantenimiento de los equipos atendidos ese día. Un equipo o un día sin fichas igual devuelve el PDF, con el aviso correspondiente.
- En Mantenimiento, «Exportar fichas PDF» descarga esas fichas de mantenimiento, no la tabla de intervenciones.

### Qué probar
- Un equipo con ficha técnica y dos mantenimientos debe salir en tres hojas. Un código inexistente muestra «Equipo no encontrado».
- Un día con intervenciones descarga una ficha por intervención. Un día vacío descarga el aviso.

## [0.11.2] - 2026-11-18 — Apartado de reportes

### Añadido
- Menú **Reportes** (Administrador y Técnico). Cuatro PDF:
  - Historial del equipo: datos del bien, cambios de la ficha y mantenimientos.
  - Historial de fichas técnicas: cada guardado, con el valor anterior y el nuevo.
  - Historial de mantenimientos de un equipo.
  - Mantenimientos de una fecha: equipos atendidos ese día y el total.
- `GET /reportes/historial-equipo/{codigo}`, `GET /reportes/ficha-historial/{codigo}`, `GET /reportes/mantenimientos-fecha/{YYYY-MM-DD}`.

### Qué probar
- Con un código que exista, descargar los tres historiales. Con un código inexistente, el PDF no se genera y la pantalla muestra el aviso.
- Elegir un día con intervenciones y otro sin ellas. El segundo PDF indica cero equipos.

## [0.11.1] - 2026-11-18 — Historial de la ficha técnica

### Añadido
- Cada guardado de la hoja de revisión deja una fila en `v2_ficha_tecnica_historial`: quién la guardó, cuándo, y el antes y el después de cada campo que cambió. La ficha muestra esa lista.
- Migración: `php backend/tools/migrate_ficha_historial.php`.
- `GET /fichas-tecnicas/{id}/historial`.

### Qué probar
- Guardar una ficha dos veces, cambiando el resultado. El historial debe mostrar la actualización, el usuario de la sesión y el valor anterior y el nuevo.
- Un equipo que todavía no se evaluó en el sistema muestra «Aún no hay cambios».

## [0.11.0] - 2026-11-18 — Hoja de revisión técnica 2026 y carga patrimonial

### Añadido
- La ficha técnica sigue el formato **Hoja de revisión técnica 2026**. Campos nuevos en `v2_fichas_tecnicas`: `funcionamiento` (Sin fallas / Con fallas), `obsolescencia_tecnologica` (Si / No), `repuestos_disponibles` (Si / No) y `resultado_evaluacion` (cinco resultados). Migración: `php backend/tools/migrate_hoja_revision.php`.
- **N° de orden** (`numero_ficha`, único, se guarda como `N° {n}`) y **fecha de evaluación** se editan en la ficha. En blanco, el número se conserva o se asigna el siguiente; la fecha vacía usa la del día. Un número ya usado en otra ficha responde **409**.
- El filtro de inventario lista los tipos que hay cargados: Laptop, CPU, Monitor, Impresora, Escáner, Teclado, Mouse, Estabilizador, Switch, Access point, UPS, Router, Disco externo, Cámara y Equipo de audio.
- Carga del inventario municipal de cómputo y red (756 equipos, 47 áreas con jefe). Reglas y conteos: [carga_patrimonial_2026.md](./carga_patrimonial_2026.md).

### Cambiado
- Hardware, software y red de la ficha (y del PDF) solo aparecen si el tipo contiene `cpu`, `laptop` o `pc`. En el resto esos campos no se guardan.
- El PDF usa el número y la fecha guardados, el año de adquisición y la evaluación 2026. La firma impresa sigue siendo Tec. Denky Navarro Navarro, con el rótulo Técnico PAD.
- `tipo_equipo` en la base en uso y en `v2_estructura.sql` es `VARCHAR(100)`. Así se guarda el nombre real (Teclado, Cámara, etc.). El filtro **Otro** del dashboard sigue agrupando todo lo que no es Laptop, CPU, Impresora o Monitor.
- Cada área muestra su **jefe a cargo** (`v2_areas.jefe_encargado`). El encargado de un equipo sigue en `responsable_nombre` y no es un usuario del sistema.

### Qué probar
- Buscar un CPU o laptop: la ficha muestra hardware, N° de orden y fecha editables, y las cinco opciones de resultado.
- Buscar un teclado, una cámara o un equipo de audio: no aparecen procesador, sistema operativo, MAC ni IP.
- Guardar un N° de orden ya usado en otra ficha y comprobar el mensaje de duplicado.
- En inventario, filtrar por Cámara y por Malo. En Configuración, cada área debe mostrar un jefe.

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
