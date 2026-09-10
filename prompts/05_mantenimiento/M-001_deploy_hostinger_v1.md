# M-001 — Despliegue Hostinger

| Campo | Valor |
|-------|-------|
| **Código** | M-001 |
| **Fase** | Mantenimiento |
| **Versión** | v1 |
| **Estado** | Aprobado |

---

## Prompt ejecutado

**Rol:** Ingeniero de despliegue.

**Contexto:** Hosting PHP compartido, frontend estático compilado, MySQL en hPanel, ML no disponible o deshabilitado.

**Tarea:** Documentar `composer install --no-dev`, `local.php`, `npm run build:hostinger`, importación SQL, SSL y cambio de credenciales.

**Restricciones:** No versionar secretos. Documentar rollback (respaldo BD + restore de `dist/`).

---

## Resultado

`documents/05_mantenimiento/hostinger.md` y sección de despliegue en el README raíz.

**Decisión:** Aprobado.
