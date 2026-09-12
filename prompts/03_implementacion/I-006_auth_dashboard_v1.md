# I-006 — Autenticación JWT y dashboard

| Campo | Valor |
|-------|-------|
| **Código** | I-006 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (flujo login → token → interceptor → rutas) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-06 (cierre 0.6.0) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | 0.6.0 (auth + dashboard; no es el archivo incremento_6.md, que documenta ML 0.7.0) |
| **Historias** | HU-AUTH-001–004, HU-DSH-001–004, HU-RPT-004 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP (firebase/php-jwt) y React
(AuthContext, Axios).

Contexto: Versión 0.6.0. La API v2 y los módulos INV/MNT/CFG existen
sin JWT obligatorio. ADR-001 exige Bearer en /api/v2/* salvo /auth.
Seed admin en v2_estructura.sql. Dashboard operativo (conteos), no ML.
Zustand ya no debe ser la fuente de sesión.

Objetivo: Login, persistencia de sesión, protección de /v2/* y de la
API, métricas en GET /api/v2/dashboard, PDF con token (blob).

Tarea:
1. POST /auth/login → JWT; AuthMiddleware::requireAuth en index.php
   excepto /auth.
2. Login.jsx; AuthContext (token + usuario); PrivateRoute.
3. src/lib/api.js: interceptor Authorization; 401 → login.
4. DashboardController + DashboardPage (métricas operativas).
5. Navbar con Salir (limpia token).
6. Descarga PDF por blob autenticado (sustituye window.open).
7. Retirar huérfanos V1 (ModalFichaTecnica, endpoints PHP V1).
8. Changelog 0.6.0.

Entradas disponibles: AuthMiddleware esqueleto (I-001), HU-AUTH-*,
HU-DSH-001–004, ADR-001.

Formato de salida: código en features/auth, features/dashboard, lib/api.js,
middleware y controllers.

Restricciones técnicas:
- firebase/php-jwt; secret solo en config no versionada.
- No exponer si el usuario existe en el mensaje de login fallido.
- No FastAPI ni badges de riesgo (eso es I-007; el archivo
  documents/.../incremento_6.md habla de ML 0.7.0 — no mezclar).
- requireRole en /usuarios queda para I-009.

Criterios de aceptación:
- Login correcto → /v2/dashboard; F5 mantiene sesión.
- Sin token, /v2/* redirige a /login; API 401.
- Credenciales malas: error genérico.
- Salir limpia token y bloquea rutas privadas.
- Dashboard muestra conteos persistidos.
- PDF de ficha funciona con Authorization.

Proceso sugerido: login API → middleware → Axios → AuthContext →
PrivateRoute → dashboard → PDF blob → borrar V1 huérfana.

No hacer: no guardar JWT en código; no localStorage de password;
no llamar a :8000.

Ejemplos: Authorization: Bearer <token>
```

### Checklist D1

- [x] Flujo JWT completo
- [x] Distinción 0.6.0 vs incremento_6.md (ML)
- [x] PDF blob
- [x] I-009 fuera de alcance
- [x] Criterios AUTH + DSH

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Login / sesión | `Login.jsx`, AuthContext | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) (F-001) |
| Dashboard | `DashboardPage.jsx` | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) (F-006) |
| Axios | `src/lib/api.js` | 0.6.0 |

Salida usada como entrada de **I-007** (proxy ML ya autenticado) e **I-009**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | AUTH-001–004 y DSH-001–004 en 0.6.0. Commit 5ce7575 es el ancla de F-001 y F-006. |
| **N.º de iteraciones** | No medido. |
| **Diagnóstico** | Confusión documental: “incremento 6” en una carpeta es ML. El prompt de 0.6.0 debe citar versión semántica, no solo el número de incremento. |
| **Decisión** | **Aprobado.** |
| **Lección** | En el commit message usar `[I-006]` y `v0.6.0`; no “sprint 6” ni “incremento 6” a secas. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-001 (middleware vacío), I-004 (PDF), I-005 |
| **Fase siguiente** | I-007, I-009, T-001 |
| **Matriz doble entrada** | F-001 auth, F-006 dashboard |
| **Commit sugerido** | `feat(auth): JWT, Axios y dashboard operativo [I-006]` |
