# I-009 — RBAC de usuarios y plantilla Excel

| Campo | Valor |
|-------|-------|
| **Código** | I-009 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | CoT (autorización en servidor vs UI) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Parche 0.9.1 |
| **Historias** | HU-AUTH-005, HU-CFG-006, HU-INV-004 (ajuste) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Cierra la deuda de **I-005**: la UI de configuración no es la autorización efectiva.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior de API PHP y React (defensa en
profundidad).

Contexto: 0.9.1. JWT ya existe (I-006). POST/PUT/DELETE /usuarios son
accesibles a cualquier token. Un Técnico puede escalar privilegios
saltándose la UI. Plantilla Excel de carga masiva desalinea columnas
(numero_serie, area) porque falta `color` en la fila de ejemplo.

Objetivo: Autorización por rol en servidor + plantilla Excel alineada.
No rediseñar configuración ni inventario.

Tarea:
1. AuthMiddleware::requireRole() sobre el payload JWT.
2. POST/PUT/PATCH/DELETE /usuarios solo Administrador.
3. Bloquear autoeliminación (sub del JWT) y eliminar/degradar al último
   Administrador.
4. RoleRoute: /v2/configuracion y enlace Navbar solo Administrador.
5. plantilla_carga_equipos.xlsx: fila ejemplo con `color`.
6. Tests unitarios de rol y de encabezados Excel si el repo ya tiene
   PHPUnit.
7. Changelog 0.9.1.

Entradas disponibles: architecture.md (tabla RBAC), I-005, HU-AUTH-005,
HU-CFG-006, HU-INV-004.

Formato de salida: cambios mínimos en middleware, UsuarioController,
App.jsx/Navbar, xlsx, tests, changelog.

Restricciones técnicas:
- La UI no es la fuente de verdad.
- Roles: Administrador, Tecnico, Practicante (ENUM existente).
- GET /usuarios puede seguir autenticado (lectura); escritura restringida.
- No inventar OAuth ni refresh tokens.
- No secretos.

Criterios de aceptación:
- Token de Técnico en POST /usuarios → 403.
- Un admin no se borra a sí mismo.
- No queda el sistema sin ningún Administrador.
- Navbar oculta Configuración al Técnico.
- La plantilla Excel no desplaza numero_serie ni area.

Proceso sugerido: middleware rol → aplicar a rutas usuarios → reglas de
integridad → UI RoleRoute → xlsx → tests → changelog.

No hacer: no reescribir UsuarioForm; no cambiar JWT secret; no ampliar
carga masiva.

Ejemplos: 403 + {success:false, message:'No autorizado'}.
```

### Checklist D1

- [x] Tarea de parche (mínima)
- [x] Criterios 403 / último admin / Excel
- [x] Tests pedidos
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| RBAC API | `AuthMiddleware.php`, `UsuarioController.php` | 0.9.1 (changelog 2026-09-09) |
| UI | `App.jsx`, Navbar | 0.9.1 |
| Plantilla | `plantilla_carga_equipos.xlsx` / generador | HU-INV-004 |
| Tests | `AuthMiddlewareTest.php`, `EquipoPlantillaTest.php` | suites unitarias |

Salida usada como entrada de **T-001** (casos 0.9.1).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | HU-AUTH-005, CFG-006, INV-004 cerradas en changelog 0.9.1. Tests de rol y plantilla en plan unitario. |
| **N.º de iteraciones** | 1 parche documentado. |
| **Diagnóstico** | I-005 no puso requireRole. Este prompt es el refinamiento D2 de aquella omisión (otro código, no v2 del mismo archivo). |
| **Decisión** | **Aprobado.** |
| **Lección** | Un hallazgo de seguridad post-entrega abre un prompt nuevo (I-009), no se reescribe I-005 como si el RBAC hubiera existido en abril. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-005, I-006 |
| **Fase siguiente** | T-001, M-001 |
| **Matriz doble entrada** | F-001 / F-002 (evolución 0.9.1) |
| **Commit sugerido** | `fix(auth): requireRole en /usuarios y plantilla Excel [I-009]` |
