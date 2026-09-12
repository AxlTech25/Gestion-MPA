# I-005 — Configuración organizacional

| Campo | Valor |
|-------|-------|
| **Código** | I-005 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (CRUD I-002) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 5 / 0.5.0 |
| **Historias** | HU-CFG-001–005 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

La autorización por rol en servidor (`requireRole` en `/usuarios`) no entra aquí: es **I-009** (0.9.1). En 0.5.0 las mutaciones quedaron solo autenticadas (o abiertas según el estado pre-JWT).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP/React.

Contexto: Incremento 5. Áreas y responsables no deben vivir hardcodeados
en EquipoForm. Tablas v2_areas y v2_usuarios existen (D-001). Ruta UI
/v2/configuracion. Roles de negocio: Administrador, Tecnico, Practicante.

Objetivo: CRUD de áreas y alta/listado de personal; EquipoForm consume
áreas (y responsable) desde la API.

Tarea:
1. Area.php / Usuario.php (PDO). password_hash BCRYPT en create.
2. AreaController, UsuarioController; rutas /api/v2/areas y /usuarios.
3. ConfiguracionPage: pestañas Áreas (tarjetas) y Personal (tabla).
4. AreaForm.jsx, UsuarioForm.jsx; organizacionService.js.
5. EquipoForm: select de áreas y responsable desde API.
6. Enlace en Navbar. Changelog 0.5.0 e incremento_5.md.

Entradas disponibles: I-002 EquipoForm, HU-CFG-001–005.

Formato de salida: código en features/configuracion y api/v2.

Restricciones técnicas:
- password_hash (PASSWORD_BCRYPT); no MD5 ni texto plano.
- Roles solo los tres del ENUM.
- No exigir JWT todavía si I-006 no está (el incremento 5 es anterior
  en el tiempo; no reescribir historia).
- No implementar requireRole Administrador (deuda conocida → I-009).
- No borrar el último administrador (tampoco en 0.5.0; I-009).

Criterios de aceptación:
- Crear un área y verla en EquipoForm sin recargar seed SQL.
- Crear un usuario con contraseña hasheada en v2_usuarios.
- /v2/configuracion muestra ambas pestañas.
- Áreas dejan de ser literales “Recursos Humanos” en el front.

Proceso sugerido: API áreas → API usuarios → UI pestañas → cablear
EquipoForm → smoke.

No hacer: no portal de autocreación de cuentas; no roles extra.

Ejemplos: password_hash($plain, PASSWORD_BCRYPT).
```

### Checklist D1

- [x] BCRYPT explícito
- [x] Deuda RBAC declarada (I-009)
- [x] Criterios de des-hardcodeo
- [x] Few-shot I-002

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| UI configuración | `ConfiguracionPage.jsx` | [4e08b9e](https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e) (F-002) |
| API | `AreaController.php`, `UsuarioController.php` | 0.5.0 |
| Incremento | `incremento_5.md` | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |

Salida usada como entrada de **I-006** (proteger la ruta) e **I-009** (autorizar mutaciones).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | CFG-001–005 en 0.5.0. Hueco de seguridad: técnico autenticado podía mutar `/usuarios` hasta 0.9.1. |
| **N.º de iteraciones** | 1 funcional + 1 de seguridad (I-009). |
| **Diagnóstico** | Faltó **restricción** de autorización en servidor. El prompt v1 de 0.5.0 no la pedía. |
| **Decisión** | **Aprobado** como incremento de configuración. No aprobado como RBAC completo. |
| **Lección** | “La UI es solo para admin” no es criterio de aceptación; el prompt debe exigir `requireRole` en la API o dejar I-00N de seguridad explícito. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-002, I-004 |
| **Fase siguiente** | I-006, I-009 |
| **Matriz doble entrada** | F-002 configuracion |
| **Commit sugerido** | `feat(configuracion): áreas y personal [I-005]` |
