# Plan de pruebas funcionales — Gestión MPA V2

**Versión del plan:** 1.0  
**Versión del sistema:** 0.8.0  
**Fecha:** 2026-06-21  
**Alcance:** Validación funcional end-to-end de la aplicación web (React + API PHP V2 + MySQL + microservicio ML opcional)

---

## 1. Objetivo

Verificar que las funcionalidades implementadas hasta la versión **0.8.0** cumplen los requisitos de negocio y operan correctamente desde la interfaz de usuario, incluyendo:

- Autenticación y control de acceso
- Gestión de inventario y fichas técnicas
- Registro e historial de mantenimiento
- Dashboard operativo y consulta filtrada de equipos
- Integración predictiva ML (cuando el servicio FastAPI esté disponible)

Este plan **no cubre** pruebas de carga, penetración ni pruebas unitarias automatizadas (salvo mención de herramientas auxiliares).

---

## 2. Entorno y preparación

### 2.1 Requisitos previos

| Componente | Requisito | Comando / verificación |
|------------|-----------|------------------------|
| XAMPP | Apache + MySQL activos | Panel XAMPP → Start Apache, MySQL |
| Base de datos | `gestion_equipos_mpa_v2` creada y migrada | Ejecutar `v2_estructura.sql`, `v2_extension_fase7.sql`, `v2_ml_predicciones.sql` según instalación |
| Migración Fase 7 | Columnas telemetría presentes | `php backend/tools/migrate_fase7.php` |
| Frontend | Dependencias instaladas | `npm install` |
| Dev server | Vite en ejecución | `npm run dev` (típicamente `http://localhost:5173`) |
| API | Accesible vía proxy o ruta configurada | `GET /gestion_mpa/backend/api/v2/dashboard` (con token) |
| ML (opcional) | FastAPI puerto 8000 | `cd ml && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| Composer | dompdf instalado | `backend/vendor/` presente |

### 2.2 Credenciales de prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador (seed en `v2_estructura.sql`) |

### 2.3 Datos de prueba recomendados

Crear **antes** de ejecutar casos de mantenimiento, ficha técnica y consultas:

| Código patrimonial | Tipo | Estado operativo | Notas |
|--------------------|------|------------------|-------|
| `740000001001` | Laptop | Operativo | Para telemetría PC |
| `740000001002` | CPU | Dañado | Correctivo + ML |
| `740000001003` | Impresora | Operativo | Contador páginas |
| `740000001004` | Monitor | Excedencia | Consulta dashboard |
| `740000001005` | Otro → `Plotter` | Operativo | Campo «Otro» personalizado |
| `740000001006` | Otro → `Detector de billetes` | Operativo | Búsqueda texto «Otro» |

> Los códigos patrimoniales deben ser **12 dígitos numéricos** según validación del formulario.

### 2.4 Rutas de la aplicación

| Ruta | Módulo |
|------|--------|
| `/login` | Autenticación |
| `/v2/dashboard` | Dashboard |
| `/v2/inventario` | Inventario |
| `/v2/ficha-tecnica` | Ficha técnica (búsqueda) |
| `/v2/mantenimiento` | Mantenimiento |
| `/v2/configuracion` | Áreas y personal |

### 2.5 Criterios generales de aceptación

- La acción completada muestra confirmación visual o mensaje coherente.
- Los datos persisten tras recargar la página o reconsultar el listado.
- Los campos condicionales aparecen/desaparecen según reglas de negocio documentadas.
- Las exportaciones PDF abren o descargan un documento legible sin error HTTP.
- Sin token JWT válido, las rutas privadas redirigen a login.
- Errores de validación muestran mensaje claro al usuario (no pantalla en blanco).

---

## 3. Matriz de módulos y prioridad

| Módulo | ID prefijo | Casos | Prioridad |
|--------|------------|-------|-----------|
| Autenticación | AUTH | 6 | Alta |
| Configuración | CFG | 5 | Media |
| Inventario | INV | 12 | Alta |
| Ficha técnica | FIC | 8 | Alta |
| Mantenimiento | MNT | 18 | Alta |
| Dashboard | DSH | 10 | Alta |
| Machine Learning | ML | 7 | Media |
| Regresión / transversal | REG | 5 | Alta |

**Total aproximado: 71 casos**

---

## 4. Casos de prueba

### 4.1 Autenticación (AUTH)

#### AUTH-001 — Login exitoso
- **Prioridad:** Alta
- **Precondición:** Usuario `admin` existe en BD.
- **Pasos:**
  1. Abrir `/login`.
  2. Ingresar `admin` / `admin123`.
  3. Enviar formulario.
- **Resultado esperado:** Redirección a `/v2/dashboard`. Navbar visible. Token almacenado en `localStorage`.

#### AUTH-002 — Login con credenciales incorrectas
- **Pasos:** Ingresar usuario o contraseña inválidos.
- **Resultado esperado:** Mensaje de error. No se accede al dashboard.

#### AUTH-003 — Protección de rutas privadas
- **Precondición:** Sesión cerrada (limpiar localStorage o ventana incógnito).
- **Pasos:** Navegar directamente a `/v2/inventario`.
- **Resultado esperado:** Redirección a `/login`.

#### AUTH-004 — Cierre de sesión
- **Precondición:** Sesión activa.
- **Pasos:** Cerrar sesión desde la UI (si disponible) o eliminar token y disparar evento logout.
- **Resultado esperado:** Usuario no puede acceder a rutas V2 sin volver a autenticarse.

#### AUTH-005 — Token expirado / 401
- **Pasos:** Manipular token en localStorage con valor inválido; intentar cargar inventario.
- **Resultado esperado:** Redirección o limpieza de sesión; no datos sensibles expuestos.

#### AUTH-006 — Persistencia de sesión
- **Pasos:** Login correcto → recargar página (F5).
- **Resultado esperado:** Usuario permanece autenticado.

---

### 4.2 Configuración (CFG)

#### CFG-001 — Listar áreas
- **Pasos:** Ir a `/v2/configuracion` → pestaña Áreas.
- **Resultado esperado:** Listado de áreas cargado desde API.

#### CFG-002 — Registrar área nueva
- **Pasos:** Crear área con nombre único, jefe y descripción.
- **Resultado esperado:** Área aparece en listado; usable en formulario de equipos.

#### CFG-003 — Listar personal
- **Pasos:** Pestaña Personal / Usuarios.
- **Resultado esperado:** Listado de usuarios del sistema.

#### CFG-004 — Registrar técnico
- **Pasos:** Crear usuario con rol Técnico vinculado a un área.
- **Resultado esperado:** Usuario creado; contraseña encriptada en BD (verificación opcional en MySQL).

#### CFG-005 — Área disponible en registro de equipo
- **Precondición:** Área creada en CFG-002.
- **Pasos:** Abrir registro de equipo en Inventario → desplegable Área.
- **Resultado esperado:** Nueva área visible y seleccionable.

---

### 4.3 Inventario (INV)

#### INV-001 — Listar equipos
- **Pasos:** Abrir `/v2/inventario`.
- **Resultado esperado:** Tabla con equipos, columnas patrimonial, tipo, estado, riesgo ML (si aplica).

#### INV-002 — Filtro por texto
- **Pasos:** Escribir código patrimonial parcial en buscador.
- **Resultado esperado:** Tabla filtrada en tiempo real.

#### INV-003 — Filtro por tipo y estado
- **Pasos:** Combinar filtros Tipo = Laptop y Estado = Operativo.
- **Resultado esperado:** Solo equipos que cumplan ambos criterios.

#### INV-004 — Registrar Laptop
- **Pasos:** Nuevo equipo → Laptop, código 12 dígitos, área, marca, modelo, campos técnicos si aplican.
- **Resultado esperado:** Equipo en listado; telemetría inicial en BD (ceros/null según campo).

#### INV-005 — Registrar Impresora
- **Pasos:** Tipo Impresora, completar datos mínimos.
- **Resultado esperado:** Sin campos de RAM/CPU obligatorios; equipo registrado.

#### INV-006 — Registrar tipo «Otro» personalizado
- **Pasos:** Tipo = Otro → escribir «Plotter» en campo específico → guardar.
- **Resultado esperado:** En listado/inventario el tipo muestra «Plotter» (o valor ingresado).

#### INV-007 — Validación código patrimonial
- **Pasos:** Intentar guardar con código ≠ 12 dígitos.
- **Resultado esperado:** Validación HTML/bloqueo de envío.

#### INV-008 — Código patrimonial duplicado
- **Pasos:** Registrar mismo código dos veces.
- **Resultado esperado:** Error claro; no duplicado en BD.

#### INV-009 — Descargar plantilla Excel
- **Pasos:** Botón plantilla de carga masiva (si visible).
- **Resultado esperado:** Archivo `.xlsx` descargado.

#### INV-010 — Carga masiva válida
- **Precondición:** Plantilla con filas válidas.
- **Pasos:** Subir archivo → confirmar.
- **Resultado esperado:** Resumen de importación; equipos nuevos en listado.

#### INV-011 — Abrir ficha técnica desde inventario
- **Pasos:** Clic en acción de ficha técnica de un equipo Laptop.
- **Resultado esperado:** Modal/panel con datos del equipo y secciones hardware/software.

#### INV-012 — Badge riesgo ML en inventario
- **Precondición:** FastAPI activo; predicciones calculadas.
- **Pasos:** Revisar columna Riesgo ML.
- **Resultado esperado:** Badge con nivel (Bajo/Medio/Alto/Crítico) o mensaje de servicio no disponible.

---

### 4.4 Ficha técnica (FIC)

#### FIC-001 — Buscar por código patrimonial existente
- **Pasos:** `/v2/ficha-tecnica` → ingresar código válido → Buscar.
- **Resultado esperado:** Panel con datos del equipo.

#### FIC-002 — Código inexistente
- **Pasos:** Buscar código no registrado.
- **Resultado esperado:** Mensaje «No se encontró equipo…».

#### FIC-003 — Evaluación Laptop (hardware/software)
- **Precondición:** Equipo Laptop/CPU.
- **Pasos:** Editar procesador, RAM, SO, MAC → Guardar evaluación.
- **Resultado esperado:** Datos persisten al reabrir ficha; `fecha_evaluacion` actualizada.

#### FIC-004 — Equipo no técnico (Monitor)
- **Precondición:** Equipo Monitor.
- **Resultado esperado:** Mensaje de que specs hardware/software no aplican; evaluación conservación/operativo sí disponible.

#### FIC-005 — Cambio estado conservación y operativo
- **Pasos:** Cambiar a Regular / Dañado → guardar.
- **Resultado esperado:** Reflejado en panel y en inventario.

#### FIC-006 — Exportar PDF ficha técnica
- **Pasos:** Botón PDF en ficha.
- **Resultado esperado:** PDF abre en nueva pestaña con datos del equipo.

#### FIC-007 — PDF equipo técnico vs no técnico
- **Pasos:** Generar PDF para Laptop y para Monitor.
- **Resultado esperado:** Laptop incluye tabla hardware; Monitor muestra nota de no aplicabilidad.

#### FIC-008 — Observaciones de evaluación
- **Pasos:** Completar textarea observaciones → guardar → reconsultar.
- **Resultado esperado:** Texto persistido.

---

### 4.5 Mantenimiento (MNT)

#### MNT-001 — Listar historial general
- **Pasos:** `/v2/mantenimiento` sin búsqueda.
- **Resultado esperado:** Timeline de intervenciones recientes ordenadas por fecha.

#### MNT-002 — Buscar historial por código patrimonial
- **Pasos:** Ingresar código válido → Buscar historial.
- **Resultado esperado:** Resumen del equipo + timeline solo de ese equipo.

#### MNT-003 — Código patrimonial inexistente en historial
- **Resultado esperado:** Mensaje de error; no timeline falso.

#### MNT-004 — Ver detalle de intervención
- **Pasos:** Clic «Ver detalle» en una ficha del timeline.
- **Resultado esperado:** Modal con datos completos (técnico, telemetría, actividades).

#### MNT-005 — PDF historial completo
- **Precondición:** Equipo con ≥1 intervención.
- **Pasos:** Exportar historial PDF tras búsqueda por código.
- **Resultado esperado:** PDF con cronología tabular del equipo.

#### MNT-006 — PDF ficha individual
- **Pasos:** Desde modal detalle → PDF.
- **Resultado esperado:** PDF de una intervención con datos de equipo e intervención.

#### MNT-007 — Registro preventivo Laptop
- **Pasos:** Registrar → código patrimonial Laptop → tipo Preventivo.
- **Validar:** Aparecen nivel polvo, temps, horas, batería, inactividad.
- **Resultado esperado:** Ficha guardada; campos telemetría en BD.

#### MNT-008 — Registro correctivo Laptop
- **Pasos:** Tipo Correctivo → síntoma, componente, causa raíz.
- **Validar:** Sección «Reparación y cambio de piezas» visible (diagnóstico, piezas, costo).
- **Resultado esperado:** Datos guardados; sugerencia ML de categoría si FastAPI activo.

#### MNT-009 — Campos correctivo ocultos en preventivo
- **Pasos:** Tipo Preventivo.
- **Resultado esperado:** No aparecen piezas/costo/diagnóstico correctivo.

#### MNT-010 — Validación código patrimonial en registro
- **Pasos:** Escribir código válido en formulario mantenimiento.
- **Resultado esperado:** Recuadro verde «Equipo identificado» con tipo y modelo.

#### MNT-011 — Código inválido bloquea guardado
- **Pasos:** Código inexistente o vacío → intentar guardar.
- **Resultado esperado:** Botón Guardar deshabilitado o alerta de validación.

#### MNT-012 — Campos PC solo para Laptop/CPU
- **Pasos:** Registrar mantenimiento para Impresora.
- **Resultado esperado:** No aparecen polvo, temps, horas, batería, inactividad; sí contador páginas.

#### MNT-013 — Mantenimiento Impresora
- **Pasos:** Preventivo en impresora con contador páginas.
- **Resultado esperado:** `contador_paginas_lectura` guardado; sync a `v2_equipos.contador_paginas`.

#### MNT-014 — Mantenimiento Monitor (sin telemetría PC)
- **Resultado esperado:** Solo campos generales + actividades; sin telemetría irrelevante.

#### MNT-015 — Sync telemetría post-mantenimiento
- **Precondición:** Laptop con horas_uso previas.
- **Pasos:** Registrar mantenimiento con nuevas horas de uso → consultar equipo en BD o inventario.
- **Resultado esperado:** `fecha_ultimo_mantenimiento` y snapshot telemetría actualizados en `v2_equipos`.

#### MNT-016 — Estado posterior «Dañado» → En Reparación
- **Pasos:** Guardar ficha con estado posterior Dañado.
- **Resultado esperado:** `estado_operativo` del equipo = `En Reparacion`.

#### MNT-017 — Tipo Predictivo y Evaluación
- **Pasos:** Registrar con tipo Predictivo y Evaluación respectivamente.
- **Resultado esperado:** Campos preventivos (polvo/temp) visibles en PC; ficha guardada con tipo correcto.

#### MNT-018 — Historial se actualiza tras nuevo registro
- **Pasos:** Registrar intervención → verificar timeline general y búsqueda por código.
- **Resultado esperado:** Nueva intervención visible sin recargar manualmente (o tras recarga).

---

### 4.6 Dashboard (DSH)

#### DSH-001 — Carga de métricas
- **Pasos:** Abrir dashboard autenticado.
- **Resultado esperado:** 4 tarjetas (equipos, mantenimientos, áreas, dañados) con números coherentes.

#### DSH-002 — Gráficos por estado operativo y tipo
- **Resultado esperado:** Barras con totales alineados a datos reales de BD.

#### DSH-003 — Fallas por categoría
- **Precondición:** Mantenimientos correctivos registrados.
- **Resultado esperado:** Listado top categorías con severidad.

#### DSH-004 — Mantenimientos recientes
- **Resultado esperado:** Tabla con últimas 5 intervenciones.

#### DSH-005 — Abrir consulta de equipos
- **Pasos:** Botón «Consultar equipos».
- **Resultado esperado:** Panel expandible con etiquetas de filtro.

#### DSH-006 — Filtro por tipo Laptop
- **Pasos:** Etiqueta Laptop.
- **Resultado esperado:** Tabla solo laptops; contador coincide con etiqueta.

#### DSH-007 — Filtro combinado tipo + estado
- **Pasos:** Laptop + Dañado.
- **Resultado esperado:** Intersección correcta de filtros.

#### DSH-008 — Filtro Excedencia
- **Pasos:** Etiqueta estado operativo Excedencia.
- **Resultado esperado:** Equipos en excedencia listados.

#### DSH-009 — Filtro «Otro» sin texto
- **Pasos:** Seleccionar Otro sin escribir en campo adyacente.
- **Resultado esperado:** Todos los equipos no estándar / tipo Otro.

#### DSH-010 — Filtro «Otro» con texto específico
- **Pasos:** Otro + escribir «plotter» o «detector».
- **Resultado esperado:** Subconjunto filtrado por tipo/marca/modelo; debounce ~400 ms.

---

### 4.7 Machine Learning (ML)

> **Nota:** Casos ML-001 a ML-005 requieren FastAPI en `127.0.0.1:8000`. ML-006 y ML-007 validan degradación graceful.

#### ML-001 — Health check FastAPI
- **Pasos:** `GET http://127.0.0.1:8000/health`
- **Resultado esperado:** Respuesta JSON status ok.

#### ML-002 — Alertas predictivas en dashboard
- **Precondición:** FastAPI activo; equipos en BD.
- **Pasos:** Recargar dashboard.
- **Resultado esperado:** Tabla top 10 riesgo con score y badge; no mensaje ámbar de servicio caído.

#### ML-003 — FastAPI detenido — dashboard
- **Pasos:** Detener uvicorn → recargar dashboard.
- **Resultado esperado:** Mensaje informativo; resto del dashboard funcional.

#### ML-004 — Badge riesgo en inventario
- **Precondición:** FastAPI activo.
- **Pasos:** Abrir inventario.
- **Resultado esperado:** Badges de riesgo por fila (o fallback sin romper tabla).

#### ML-005 — Sugerencia categoría en correctivo
- **Pasos:** Nuevo mantenimiento correctivo para equipo con predicción.
- **Resultado esperado:** Banner «Sugerencia IA» con categoría y probabilidad.

#### ML-006 — Proxy batch inventario (regresión Sprint 6)
- **Verificación técnica opcional:** Network tab → llamada batch ML con body `{}` no `[]`.
- **Resultado esperado:** HTTP 200; datos de riesgo parseados.

#### ML-007 — Predicciones persistidas
- **Verificación BD opcional:** Tabla `v2_predicciones_ml` recibe registros tras consulta inventario/dashboard.
- **Resultado esperado:** Filas con `equipo_id`, `score_riesgo`, `nivel_riesgo`.

---

### 4.8 Regresión transversal (REG)

#### REG-001 — Navegación Navbar
- **Pasos:** Recorrer Dashboard → Inventario → Ficha técnica → Mantenimiento → Configuración.
- **Resultado esperado:** Sin errores de consola críticos; rutas correctas.

#### REG-002 — Responsive básico
- **Pasos:** Reducir ventana a ~768px.
- **Resultado esperado:** Formularios y tablas usables (scroll horizontal aceptable).

#### REG-003 — Consistencia estado operativo
- **Pasos:** Cambiar estado en ficha técnica → verificar inventario y consulta dashboard.
- **Resultado esperado:** Mismo estado en todas las vistas.

#### REG-004 — API sin autenticación
- **Pasos:** `GET /gestion_mpa/backend/api/v2/equipos` sin header Authorization.
- **Resultado esperado:** HTTP 401 JSON.

#### REG-005 — CORS / OPTIONS
- **Verificación técnica:** Preflight OPTIONS desde frontend.
- **Resultado esperado:** HTTP 200; peticiones subsecuentes OK.

---

## 5. Fuera de alcance (v0.8.0)

No bloquear release funcional si fallan únicamente estos ítems pendientes de roadmap:

| Ítem | Referencia |
|------|------------|
| Reentrenamiento modelo ML v2 con telemetría real | Sprint 7 pendiente |
| Bloque evaluación predictiva en `FichaTecnicaPanel` | Sprint 7 pendiente |
| Tabla `v2_metricas_equipo` | Fase 2 |
| Recálculo automático ML al guardar mantenimiento | Diseño futuro |
| Edición/eliminación de equipos vía API PUT/DELETE | HTTP 501 actual |

Marcar casos relacionados como **N/A** o **BLOQUEADO** con referencia al ítem.

---

## 6. Gestión de defectos

### Severidad sugerida

| Nivel | Criterio | Ejemplo |
|-------|----------|---------|
| **Alta** | Impide operación crítica o pérdida de datos | No guarda mantenimiento, login roto |
| **Media** | Funcionalidad degradada con workaround | PDF falla en un tipo de equipo |
| **Baja** | Cosmético o texto | Typo en etiqueta, alineación |

### Flujo

1. Registrar en plantilla (`plantilla_registro_resultados.md`).
2. Captura en `documents/pruebas/evidencias/YYYY-MM-DD/`.
3. Corregir → re-ejecutar caso afectado + regresión del módulo.

---

## 7. Herramientas auxiliares (opcional)

| Herramienta | Uso |
|-------------|-----|
| DevTools → Network | Verificar status HTTP, payloads ML |
| DevTools → Application → Local Storage | Token JWT |
| phpMyAdmin | Verificar persistencia BD |
| Postman / curl | API directa con Bearer token |
| `ml/scripts/verify_sprint6_ml.py` | Smoke test microservicio ML |

### Ejemplo curl — login y consulta

```bash
# Login (ajustar URL según entorno)
curl -X POST http://localhost/gestion_mpa/backend/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"admin\",\"password\":\"admin123\"}"

# Consulta dashboard (usar token del login)
curl http://localhost/gestion_mpa/backend/api/v2/dashboard/consulta?tipo_equipo=Laptop \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 8. Cronograma sugerido

| Fase | Duración estimada | Actividades |
|------|-------------------|-------------|
| Día 1 | 2–3 h | Entorno, AUTH, CFG, datos semilla |
| Día 2 | 3–4 h | INV, FIC, PDFs |
| Día 3 | 3–4 h | MNT completo (todos los tipos) |
| Día 4 | 2–3 h | DSH, consulta etiquetas |
| Día 5 | 2 h | ML + REG + cierre y reporte |

**Total estimado:** 12–16 horas de prueba manual.

---

## 9. Criterio de salida (Exit criteria)

Se considera la ronda de pruebas **aprobada** cuando:

- [ ] ≥ **95%** de casos de prioridad **Alta** en estado OK
- [ ] **0** defectos **Alta** abiertos
- [ ] Defectos **Media** documentados con plan de corrección o aceptación explícita
- [ ] Plantilla de resultados completada y firmada
- [ ] Evidencias archivadas para casos críticos (login, registro equipo, mantenimiento correctivo, PDF, consulta dashboard)

---

## 10. Referencias

- `documents/changelog.md` — versiones 0.6.0 a 0.8.0
- `documents/sprints/sprint_6.md` — ML predictivo
- `documents/sprints/sprint_7_extension_schema_v2.md` — telemetría y mantenimiento Fase 7
- `documents/architecture.md` — stack y rutas API
- `ml/README.md` — puesta en marcha FastAPI

---

*Documento generado para la fase de pruebas funcionales del proyecto Gestión MPA V2.*
