# Prompts detallados por función — Sigemad MPA V2

Hoja equivalente a **Prompts Detallados** de la matriz V3 (Amaro + Jiang). Una fila por función del sistema (`F-001`…`F-008`), más dos refinamientos (I-008, I-009).

El **prompt exacto** es el texto de ingeniería (resumen del bloque D1). El registro completo está en `prompts/03_implementacion/`. La **evidencia** es el commit de GitHub donde quedó el código de esa función.

Repositorio: https://github.com/AxlTech25/Gestion-MPA

---

## Resumen (para volcar al Excel)

| ID prompt | Función asociada | Técnica | Versión prompt | N.º iteraciones | Motivo de refinamiento | Versión final | Estado | Resultado obtenido | Evidencia (commit) |
|-----------|------------------|---------|----------------|-----------------|------------------------|---------------|--------|--------------------|-------------------|
| [I-006](../../prompts/03_implementacion/I-006_auth_dashboard_v1.md) | F-001 auth | CoT guiado | v1 | 0 (aprobado en primera versión documentada) | N/A — registro retrospectivo | v1 | Aprobado | Login JWT, AuthContext, PrivateRoute, middleware | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) |
| [I-005](../../prompts/03_implementacion/I-005_configuracion_v1.md) | F-002 configuracion | Few-shot | v1 | 1 (RBAC en I-009) | Autorización solo en UI; I-009 exige `requireRole` | v1 | Aprobado (CFG; RBAC = I-009) | Áreas, personal, BCRYPT, EquipoForm dinámico | [4e08b9e](https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e) |
| [I-002](../../prompts/03_implementacion/I-002_inventario_v1.md) | F-003 inventario | Few-shot | v1 | 0 | N/A — no confundir con I-002-ML histórico | v1 | Aprobado | CRUD equipos, código 12 dígitos, `ram_gb` numérico | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) |
| [I-003](../../prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md) | F-004 ficha | Few-shot | v1 | 0 | N/A — mismo incremento que F-005 | v1 | Aprobado | GET/PUT ficha por id o código patrimonial | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) |
| [I-003](../../prompts/03_implementacion/I-003_fichas_mantenimiento_v1.md) | F-005 mantenimiento | Few-shot | v1 | 0 | N/A — telemetría es I-008 | v1 | Aprobado | Timeline, `categoria_falla_id`, JOIN técnico/categoría | [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) |
| [I-006](../../prompts/03_implementacion/I-006_auth_dashboard_v1.md) | F-006 dashboard | CoT guiado | v1 | 0 | N/A — alertas ML son I-007; consulta I-008 | v1 | Aprobado | `GET /dashboard`, DashboardPage, métricas operativas | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) |
| [I-007](../../prompts/03_implementacion/I-007_microservicio_ml_v1.md) | F-007 ml | CoT guiado | v1 | ≥2 | Batch `[]` vs `{}`; HTTP 503 de curl | v1 | Aprobado | FastAPI, proxy PHP, badges, degradación | [e9a0965](https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965) |
| [I-004](../../prompts/03_implementacion/I-004_reportes_pdf_v1.md) | F-008 reportes | Zero-shot + few-shot | v1 | 1 | Descarga anónima; I-006 pasa a blob+JWT | v1 | Aprobado | Dompdf, `GET /reportes/equipo/{id}`, filtros listado | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) |
| [I-008](../../prompts/03_implementacion/I-008_telemetria_ficha_predictiva_v1.md) | F-003, F-005, F-006, F-007 | CoT guiado | v1 | 2 fases | Extensión de esquema; no reescribir I-007 | v1 | Aprobado | Telemetría, sync, ficha predictiva, consulta | changelog 0.8.0–0.9.0 / [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) |
| [I-009](../../prompts/03_implementacion/I-009_rbac_plantilla_excel_v1.md) | F-001, F-002, F-003 | CoT guiado | v1 | 1 | Cierra deuda de I-005 (API abierta) | v1 | Aprobado | `requireRole` en `/usuarios`, plantilla Excel | changelog 0.9.1 |

---

## F-001 — Autenticación

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-006 |
| **Función asociada** | F-001 auth |
| **Prompt exacto** | Actúa como desarrollador senior PHP (`firebase/php-jwt`) y React (AuthContext, Axios). Contexto: API v2 y módulos INV/MNT/CFG sin JWT obligatorio; ADR-001 exige Bearer salvo `/auth`. Objetivo: login, sesión persistente, protección de `/v2/*` y de la API. Tarea: `POST /auth/login` → JWT; `AuthMiddleware::requireAuth` en `index.php` excepto `/auth`; `Login.jsx`, AuthContext, PrivateRoute; interceptor Axios; 401 → login; Navbar con Salir. Restricciones: secret solo en config no versionada; no revelar si el usuario existe; no FastAPI. Criterios: login correcto → `/v2/dashboard`; F5 mantiene sesión; sin token API 401. |
| **Técnica** | Chain-of-Thought guiado |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 0 (documentado retrospectivo; no hay `*_v2_refinado` de auth) |
| **Motivo de refinamiento** | N/A en origen. El endurecimiento de roles es **I-009**, no una v2 de I-006. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | Login JWT, AuthContext, middleware y rutas privadas |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575 — `src/features/auth/Login.jsx` |

---

## F-002 — Configuración

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-005 |
| **Función asociada** | F-002 configuracion |
| **Prompt exacto** | Actúa como desarrollador senior PHP/React. Contexto: áreas y responsables no deben estar hardcodeados en EquipoForm; tablas `v2_areas` y `v2_usuarios` existen; ruta `/v2/configuracion`; roles Administrador, Tecnico, Practicante. Objetivo: CRUD de áreas y alta/listado de personal. Tarea: modelos PDO; `password_hash` BCRYPT; controladores y rutas `/areas` y `/usuarios`; ConfiguracionPage (pestañas), AreaForm, UsuarioForm; EquipoForm consume áreas desde API. Restricciones: no MD5; no `requireRole` en este incremento (deuda → I-009). Criterios: crear un área y verla en EquipoForm; usuario con hash en BD. |
| **Técnica** | Few-shot (patrón CRUD I-002) |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 1 |
| **Motivo de refinamiento** | La API de usuarios quedó solo autenticada. I-009 añade `requireRole` Administrador. |
| **Versión final** | v1 (I-005) + I-009 |
| **Estado** | Aprobado como configuración; RBAC = I-009 |
| **Resultado obtenido** | Panel de áreas y personal; EquipoForm dinámico |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e — `ConfiguracionPage.jsx` |

---

## F-003 — Inventario

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-002 |
| **Función asociada** | F-003 inventario |
| **Prompt exacto** | Actúa como desarrollador senior PHP/React sobre el esqueleto I-001. Contexto: `v2_equipos` ya existe; CRUD mínimo ML-ready (`ram_gb`, `almacenamiento_gb`, fechas); código patrimonial de 12 dígitos; tabla + modal Tailwind. Objetivo: listado y alta vía `/api/v2/equipos` y `src/features/inventario`, sin fichas ni PDF. Tarea: Equipo.php (`getAll`, `create`); EquipoController JSON `{success, data, message}`; rutas; equiposService; InventarioPage y EquipoForm. Restricciones: 12 dígitos únicos; no texto “8 GB”; no FastAPI. Criterios: POST persiste y GET lista; el form rechaza código ≠ 12. |
| **Técnica** | Few-shot (PDO + JSON) |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 0 |
| **Motivo de refinamiento** | N/A. Carga Excel/plantilla se ajusta en I-009; telemetría en I-008. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | CRUD de equipos con atributos numéricos |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/f086a63 — `EquipoController.php` |

---

## F-004 — Ficha técnica

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-003 |
| **Función asociada** | F-004 ficha |
| **Prompt exacto** | Actúa como desarrollador senior PHP/React; replica el patrón I-002. Contexto: equipos ya se listan; hace falta consultar/editar ficha técnica del equipo (hardware/software, evaluación). Tarea: modelo/controlador/ruta de fichas técnicas; GET por id y por código patrimonial de 12 dígitos; acceso desde inventario (modal o `/v2/ficha-tecnica`). Restricciones: no PDF (I-004); no bloque ML (I-008). Criterios: GET ficha existente o vacío controlado (no 500). |
| **Técnica** | Few-shot |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 0 |
| **Motivo de refinamiento** | N/A. Evaluación predictiva en ficha = I-008. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | API y UI de ficha técnica |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/f086a63 — `FichaTecnicaController.php` |

---

## F-005 — Mantenimiento

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-003 |
| **Función asociada** | F-005 mantenimiento |
| **Prompt exacto** | Actúa como desarrollador senior PHP/React; patrón I-002. Contexto: historial de intervenciones con `categoria_falla_id` del catálogo `v2_categorias_falla`; no texto libre como verdad de la falla. Objetivo: registrar y listar mantenimientos. Tarea: Mantenimiento.php `getAll` (JOIN categoría y técnico) y `create`; MantenimientoController; timeline + modal; select de categoría. Restricciones: categoría obligatoria en correctivo; no telemetría (I-008); no sugerencia ML (I-007). Criterios: POST liga `equipo_id`; timeline muestra fecha, tipo y categoría nombrada. |
| **Técnica** | Few-shot |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 0 |
| **Motivo de refinamiento** | N/A. Sync de telemetría = I-008. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | Timeline y alta estructurada de mantenimientos |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/8b20337 — `MantenimientoController.php` |

---

## F-006 — Dashboard

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-006 |
| **Función asociada** | F-006 dashboard |
| **Prompt exacto** | Actúa como desarrollador senior PHP/React (mismo incremento 0.6.0 que F-001). Objetivo: métricas operativas en `GET /api/v2/dashboard` y UI DashboardPage (conteos, no ML). Tarea: DashboardController + DashboardPage; no badges de riesgo (I-007); no panel de consulta por etiquetas (I-008). Restricciones: no llamar a `:8000`. Criterios: dashboard muestra conteos persistidos tras login. |
| **Técnica** | Chain-of-Thought guiado |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 0 |
| **Motivo de refinamiento** | N/A. Consulta `tipo_otro` = I-008; alertas = I-007. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | Dashboard de métricas operativas |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575 — `DashboardPage.jsx` |

---

## F-007 — Machine Learning

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-007 |
| **Función asociada** | F-007 ml |
| **Prompt exacto** | Actúa como ingeniero de ML aplicado y backend PHP. Contexto: datos estructurados (I-002, I-003); JWT (I-006); FastAPI en `:8000`; PHP único cliente; Hostinger sin Python. Objetivo: riesgo por equipo, sugerencia de categoría, proxy JWT y UI degradable. Tarea: dataset sintético ~200; Random Forest; endpoints `/health`, `/predict/riesgo`, batch, `/predict/categoria`, `/train`; tabla `v2_predicciones_ml`; proxy `/api/v2/ml/*`; RiesgoBadge y alertas. Restricciones: batch JSON `{}` no `[]`; si FastAPI cae, inventario y login siguen (HU-ML-005). Criterios: `/health` OK; 401 sin token; UI sin crash con uvicorn down. |
| **Técnica** | Chain-of-Thought guiado |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | ≥2 |
| **Motivo de refinamiento** | Proxy enviaba `[]` en batch; curl devolvía 503 con cuerpo OK. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | Microservicio + proxy + badges; degradación controlada |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/e9a0965 — `ml/app/main.py` |

---

## F-008 — Reportes PDF

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-004 |
| **Función asociada** | F-008 reportes |
| **Prompt exacto** | Actúa como desarrollador senior PHP (dompdf) y React. Contexto: inventario y ficha ya existen. Objetivo: `GET /api/v2/reportes/equipo/{id}` genera PDF; InventarioPage filtra en cliente y ofrece descargar ficha. Tarea: Composer dompdf; ReporteController HTML→PDF; botón en la fila. Restricciones: PDF binario, no base64; no reportes de mantenimiento en este incremento. Criterios: PDF muestra código patrimonial; filtro de texto reduce filas. |
| **Técnica** | Zero-shot (dompdf) + few-shot (InventarioPage) |
| **Versión prompt** | v1 |
| **N.º de iteraciones** | 1 |
| **Motivo de refinamiento** | `window.open` sin token; I-006 cambia a blob + Authorization. |
| **Versión final** | v1 |
| **Estado** | Aprobado |
| **Resultado obtenido** | PDF de ficha y filtros de inventario |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/f086a63 — `ReporteController.php` |

---

## Refinamientos (misma función, otro prompt)

### I-008 — Telemetría y ficha predictiva (F-003, F-005, F-006, F-007)

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-008 |
| **Función asociada** | F-003, F-005, F-006, F-007 |
| **Prompt exacto** | Actúa como desarrollador PHP/React e ingeniero de datos ML. Contexto: ML 0.7.0 opera (I-007). Ampliar `v2_equipos` y `v2_fichas_mantenimiento` con telemetría y contexto de intervención; `syncTelemetria` al registrar mantenimiento; consulta de dashboard; bloque predictivo en ficha. No agente WMI ni DELETE de equipos. Criterios: migrate sobre BD 0.7.0 sin pérdida; POST mantenimiento actualiza snapshot; ficha muestra score si ML está arriba. |
| **Técnica** | CoT guiado |
| **N.º de iteraciones** | 2 (Fase 1 esquema/UI, Fase 2 métricas/recalc) |
| **Motivo de refinamiento** | I-007 no incluía telemetría; D-005 pidió evolución por fases. |
| **Estado** | Aprobado |
| **Evidencia** | https://github.com/AxlTech25/Gestion-MPA/commit/8b20337 |

### I-009 — RBAC y plantilla Excel (F-001, F-002, F-003)

| Campo | Valor |
|-------|-------|
| **ID prompt** | I-009 |
| **Función asociada** | F-001, F-002, F-003 |
| **Prompt exacto** | Actúa como desarrollador senior de API PHP y React. Contexto: 0.9.1; JWT existe; un Técnico puede mutar `/usuarios`; plantilla Excel desalinea `numero_serie`/`area` por falta de `color`. Objetivo: `requireRole` Administrador en escritura de usuarios; no autoeliminación ni borrar el último admin; RoleRoute en Configuración; fila ejemplo Excel alineada. Criterios: Técnico en POST `/usuarios` → 403. |
| **Técnica** | CoT guiado |
| **N.º de iteraciones** | 1 |
| **Motivo de refinamiento** | I-005 no puso autorización en servidor. |
| **Estado** | Aprobado |
| **Evidencia** | changelog 0.9.1 — `AuthMiddleware.php`, `EquipoPlantillaTest.php` |

---

## Cómo copiar esto al Excel V3

Hoja **Prompts Detallados**, columnas en este orden (plantilla Money Me):

1. ID prompt (hipervínculo a `prompts/03_implementacion/I-00N_*.md` en `main`)
2. Función asociada (`F-00N`)
3. Prompt exacto
4. Técnica
5. Versión prompt
6. N.º de iteraciones
7. Motivo de refinamiento
8. Versión final
9. Estado
10. Resultado obtenido
11. Evidencia (hipervínculo a `/commit/{sha}`)

El script [`_generar_matriz_sigemad.py`](./_generar_matriz_sigemad.py) usa las mismas filas. Tras publicar los markdowns en `main`, regenerar el `.xlsx`.
