# I-001 — API V2, autenticación e inventario

| Campo | Valor |
|-------|-------|
| **Código** | I-001 |
| **Fase** | Implementación |
| **Versión** | v1 |
| **Estado** | Aprobado |

---

## Prompt ejecutado

**Rol:** Desarrollador senior PHP/React.

**Contexto:** API en `backend/api/v2`, frontend por features, JWT, RBAC (Administrador, Técnico, Practicante).

**Tarea:** Implementar autenticación, CRUD de equipos, fichas, mantenimientos, áreas, usuarios, dashboard y reportes PDF.

**Restricciones:** JSON estándar `{success, data, message}`. Middleware JWT en rutas salvo `/auth`. Código patrimonial de 12 dígitos.

---

## Resultado

Incrementos 1–5 y parte del 6: `src/features/*`, `backend/api/v2/`.

**Decisión:** Aprobado y evolucionado en versiones 0.1.0–0.6.0.
