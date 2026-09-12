# I-001 — Cimientos API V2 y esquema

| Campo | Valor |
|-------|-------|
| **Código** | I-001 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (capas del ADR) + zero-shot en esqueletos |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 1 / 0.1.0 |
| **Historias o ADR** | ADR-001; D-001; D-002 (sin HU de usuario directa) |
| **Sustituye** | Parte de [I-001-MACRO](./I-001_api_auth_inventario_v1.md) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8.1 y React (Vite).

Contexto: Sigemad MPA V2, incremento 1. Diseño aprobado: D-002 (Strangler
Fig, SPA + API v2 + MySQL, features en src/features) y D-001 (tablas v2_*,
RAM/almacenamiento numéricos, catálogo de fallas). Existe una V1 en
producción: no apagarla. Hosting futuro PHP compartido.

Objetivo: Cimientos instalables — documentación, DDL v2, esqueleto API y
rutas /v2/* vacías — para que I-002 pueda hacer CRUD de equipos sin
discutir carpetas ni tipos de columna.

Tarea:
1. Crear documents/ con architecture.md (ya D-002) y changelog 0.1.0.
2. Escribir backend/sql/v2_estructura.sql: equipos, áreas, usuarios,
   fichas, mantenimientos, v2_categorias_falla; ram_gb y
   almacenamiento_gb numéricos.
3. Esqueleto backend/api/v2: index.php, .htaccess, Database.php (PDO),
   AuthMiddleware.php (aún sin JWT obligatorio).
4. App.jsx: rutas /v2/inventario, /v2/mantenimiento, /v2/dashboard.
5. Zustand useGlobalStore.js y esqueletos de páginas en src/features/.

Entradas disponibles: ADR-001, D-001, ficha R-001.

Formato de salida: archivos en las rutas reales; changelog [0.1.0];
registro documents/03_implementacion/incrementos/incremento_1.md.

Restricciones técnicas:
- Prefijo v2_. PDO, no mysqli concatenado.
- No implementar CRUD completo ni FastAPI en este incremento.
- No secretos en el repo.
- JSON futuro {success, data, message} — dejar el esqueleto listo.
- No mezclar tablas v1 en el script de instalación v2.

Criterios de aceptación:
- v2_estructura.sql importa en MySQL/XAMPP sin error.
- /api/v2/ responde vía index.php (aunque sea 404 de ruta).
- /v2/* renderiza esqueletos sin romper V1.
- Categorías de falla existen como catálogo, no como VARCHAR libre.

Proceso sugerido: 1) DDL, 2) Database PDO, 3) router, 4) rutas React,
5) changelog.

No hacer: no migrar pantallas V1; no exigir login; no crear ml/.

Ejemplos: N/A.
```

### Checklist D1

- [x] Rol y stack
- [x] Tarea acotada al incremento 1
- [x] Formato de rutas
- [x] Restricciones (no CRUD, no ML)
- [x] Criterios observables
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Registro del incremento | `documents/03_implementacion/incrementos/incremento_1.md` | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |
| DDL | `backend/sql/v2_estructura.sql` | esquema vivo; origen en árbol [9950f99](https://github.com/AxlTech25/Gestion-MPA/commit/9950f99) |
| API esqueleto | `backend/api/v2/` | idem |
| Changelog | `documents/05_mantenimiento/changelog.md` [0.1.0] | — |

Salida usada como entrada de **I-002**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Entregables del incremento 1 presentes. Sin HU de usuario: cimientos. |
| **N.º de iteraciones** | No medido en origen. |
| **Diagnóstico** | El registro vivo no existía; se reconstruye desde incremento_1.md. |
| **Refinamiento** | N/A (primera ficha fina de I-001). |
| **Decisión** | **Aprobado.** |
| **Lección** | Dejar AuthMiddleware vacío pero en su sitio evita reabrir el árbol de carpetas en I-006. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | D-001, D-002 |
| **Fase siguiente** | I-002 |
| **Matriz doble entrada** | Infraestructura (sin F-NNN de UI) |
| **Commit sugerido** | `feat(core): esqueleto API v2 y esquema [I-001]` |
