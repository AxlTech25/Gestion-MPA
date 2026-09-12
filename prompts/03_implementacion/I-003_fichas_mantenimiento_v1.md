# I-003 — Fichas técnicas y mantenimiento

| Campo | Valor |
|-------|-------|
| **Código** | I-003 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (patrón Equipo de I-002) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 3 / 0.3.0 |
| **Historias** | HU-MNT-001, HU-MNT-002; HU-INV-007 (ficha desde inventario) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP/React. Replica el patrón I-002
(modelo PDO → controlador → ruta → servicio → página).

Contexto: Incremento 3. Equipos ya se listan y crean (I-002). Hace falta
historial de intervenciones y ficha técnica, con categoria_falla_id del
catálogo v2_categorias_falla (D-001). Sin texto libre como fuente de
verdad de la falla.

Objetivo: Registrar y listar mantenimientos; consultar ficha del equipo.
UI: timeline + modal de alta.

Tarea:
1. Mantenimiento.php: getAll (JOIN categoría y técnico), create.
2. MantenimientoController y routes/mantenimientos.php.
3. Ficha técnica: controlador/modelo/ruta para GET por id / código.
4. mantenimientoService.js; MantenimientoPage (timeline);
   MantenimientoForm con select de categoria_falla_id.
5. Acceso a ficha desde inventario (modal o ruta).
6. Changelog 0.3.0 e incremento_3.md.

Entradas disponibles: I-002, v2_fichas_mantenimiento, HU-MNT-001/002.

Formato de salida: código en backend/api/v2 y src/features/mantenimiento
(y ficha). JSON estándar.

Restricciones técnicas:
- categoria_falla_id obligatorio en correctivo; no VARCHAR “descripcion
  de falla” como verdad.
- JOIN para devolver nombre de categoría y técnico, no solo IDs crudos.
- PDO parametrizado.
- No PDF (I-004). No telemetría (I-008). No sugerencia ML (I-007).

Criterios de aceptación:
- POST /mantenimientos crea una ficha ligada a equipo_id.
- El timeline muestra fecha, tipo y categoría nombrada.
- El formulario no permite enviar correctivo sin categoría del catálogo.
- GET ficha por equipo o código devuelve evaluación existente o vacío
  controlado (no 500).

Proceso sugerido: modelo con JOIN → controlador → UI timeline → smoke
con un equipo de I-002.

No hacer: no inventar cronograma preventivo automático; no usar
textarea como categoría.

Ejemplos: patrón EquipoController de I-002.
```

### Checklist D1

- [x] Patrón few-shot I-002
- [x] Catálogo de fallas obligatorio
- [x] Fuera de alcance PDF/ML
- [x] Criterios UI + API

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| API mantenimiento | `MantenimientoController.php` | [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) (F-005) |
| API ficha | `FichaTecnicaController.php` | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) (F-004; el SHA agrupa evolución de ficha) |
| UI | `MantenimientoPage.jsx`, `MantenimientoForm.jsx` | 0.3.0 |
| Incremento | `incremento_3.md` | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |

Salida usada como entrada de **I-004**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Timeline + categoría de catálogo en 0.3.0. F-004/F-005 ahora apuntan aquí, no al macro. |
| **N.º de iteraciones** | No medido. |
| **Diagnóstico** | f086a63 mezcla ficha (I-003) y PDF (I-004): el SHA de GitHub no es atómico por prompt. Limitación de reconstrucción. |
| **Decisión** | **Aprobado.** |
| **Lección** | Un commit que toca ficha y PDF obliga a dos filas de matriz con el mismo SHA; el prompt igual debe ser uno por incremento. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-002 |
| **Fase siguiente** | I-004 |
| **Matriz doble entrada** | F-004 ficha, F-005 mantenimiento |
| **Commit sugerido** | `feat(mantenimiento): timeline y categoría de falla [I-003]` |
