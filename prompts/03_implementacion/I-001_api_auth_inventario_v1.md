# I-001-MACRO — API V2, autenticación e inventario (histórico)

> **Superado (oleada 2, 2026-09-11).** Este archivo no se borra: es la evidencia de que el núcleo se documentó como un solo prompt. La traza vigente es por incremento:
>
> [I-001 cimientos](./I-001_cimientos_v1.md) · [I-002 inventario](./I-002_inventario_v1.md) · [I-003 fichas/mantenimiento](./I-003_fichas_mantenimiento_v1.md) · [I-004 reportes](./I-004_reportes_pdf_v1.md) · [I-005 configuración](./I-005_configuracion_v1.md) · [I-006 auth/dashboard](./I-006_auth_dashboard_v1.md)

| Campo | Valor |
|-------|-------|
| **Código** | I-001-MACRO |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.2 |
| **Estado** | Reconstruido a posteriori / Aprobado / **Superado** |
| **Modelo** | Cursor Agent (nivel N2: genera módulos, humano revisa) |
| **Técnica** | Few-shot sobre convenciones del repo + zero-shot en esqueletos |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 (inc. 1–5) … 2026-06 (JWT/dashboard 0.6.0) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incrementos 1–5 y parte del 6 (0.1.0–0.6.0) |
| **Historias** | AUTH-001–004, CFG-001–005, INV-*, FIC-*, MNT-001–002, DSH-001–004, RPT-001/004 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Este archivo agrupa trabajo que la guía (cap. 5.3) trataría como varios I-01. Se conserva como evidencia. La traza vigente está en [`README.md`](./README.md) y [`gobernanza/catalogo.md`](../gobernanza/catalogo.md).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP 8.1 y React 19 (Vite).

Contexto: Sigemad MPA V2. Diseño aprobado: D-002 (SPA React + API PHP +
MySQL, JWT, features en src/features, MVC en backend/api/v2) y D-001
(tablas v2_*). Respuesta JSON {success, data, message}. Roles:
Administrador, Técnico, Practicante. Migración progresiva desde V1
(rutas /v2/*, no apagar V1 de golpe). Producción: sin
dependencias que no instalen Composer/npm.

Objetivo: Código funcional del núcleo de gestión (auth, inventario, ficha,
mantenimiento, áreas, usuarios, dashboard, PDF) alineado al esquema v2 y
a las HU de R-002, sin el microservicio ML (eso es I-002).

Tarea (alcance macro — no es una sola pasada ideal):
1. Esqueleto API v2: index.php, .htaccess, Database PDO, AuthMiddleware.
2. CRUD equipos con código patrimonial de 12 dígitos; formulario y listado.
3. Fichas técnicas y mantenimientos con categoria_falla_id (no texto libre).
4. Reportes PDF (dompdf) y filtros de inventario.
5. Configuración: áreas y usuarios (password_hash bcrypt).
6. Login JWT (firebase/php-jwt); Axios con interceptor; dashboard de métricas.
7. Páginas React por feature: InventarioPage, EquipoForm, Mantenimiento*,
   FichaTecnica*, ConfiguracionPage, DashboardPage, Login.

Entradas disponibles:
- architecture.md y ADR-001.
- backend/sql/v2_estructura.sql.
- Catálogo R-002 e incrementos 1–6 documentados.
- Código de referencia del propio repo (PDO, controladores existentes).

Formato de salida:
- Código en las rutas reales del proyecto (no snippets sueltos).
- Endpoints bajo /api/v2/{recurso}.
- Componentes en src/features/{modulo}/.
- Changelog por versión semántica 0.1.0–0.6.0.

Restricciones técnicas:
- JSON estándar {success, data, message}. HTTP coherente (200, 201, 400, 401).
- Middleware JWT en todas las rutas salvo /auth.
- PDO parametrizado; no concatenar SQL.
- No secretos en el repo; config local no versionada.
- No dependencias no autorizadas (no Laravel, no exponer FastAPI).
- No incluir el microservicio Python aquí.
- Código patrimonial: 12 dígitos numéricos.
- Front: Tailwind; no mezclar lógica V1 huérfana en features V2.
- Comentarios solo donde aporten claridad.

Criterios de aceptación:
- Compila / el front levanta con npm run dev.
- Login correcto entrega token y protege /v2/*.
- Alta de equipo persiste en v2_equipos y aparece en el listado.
- Mantenimiento exige categoría de falla de catálogo.
- PDF de ficha abre o descarga sin 500.
- Áreas dejan de estar hardcodeadas en el formulario de equipo.
- Sin token, la API responde 401 (excepto /auth).

Proceso sugerido: por incremento, 1) modelo PDO, 2) controlador, 3) ruta,
4) servicio Axios, 5) UI, 6) smoke manual, 7) changelog. No generar los
siete incrementos en un solo diff sin revisión.

No hacer: no reescribir todo el módulo si basta un endpoint; no guardar
JWT en código fuente; no llamar a localhost:8000 desde el navegador; no
usar MD5 para passwords.

Ejemplos (patrón del proyecto):
Controlador → json_encode(['success' => true, 'data' => $row, 'message' => '...']);
Modelo → prepare/execute con placeholders.
```

### Checklist D1

- [x] Rol y stack
- [x] Contexto D-001/D-002
- [x] Tarea (demasiado ancha — fallo de granularidad)
- [x] Formato de rutas de archivo
- [x] Restricciones de seguridad
- [x] Criterios por capacidad
- [x] Prohibiciones
- [x] Ejemplo de contrato JSON

**Deuda D1:** la tarea no es acotada. La guía I-01 pide “genera [clase] para [módulo]”. Oleada 2 parte este registro.

---

## Resultado

Incrementos 1–5 y parte del 6: `src/features/*`, `backend/api/v2/`. Índice: `documents/03_implementacion/incrementos/`.

| Incremento | Versión | Commit representativo |
|------------|---------|------------------------|
| 1 cimientos | 0.1.0 | árbol inicial / [9950f99](https://github.com/AxlTech25/Gestion-MPA/commit/9950f99) |
| 2 inventario | 0.2.0 | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) (F-003) |
| 3 ficha / mantenimiento | 0.3.0 | [8b20337](https://github.com/AxlTech25/Gestion-MPA/commit/8b20337) (F-005) |
| 4 PDF / filtros | 0.4.0 | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) (F-004, F-008) |
| 5 configuración | 0.5.0 | [4e08b9e](https://github.com/AxlTech25/Gestion-MPA/commit/4e08b9e) (F-002) |
| 6 JWT + dashboard | 0.6.0 | [5ce7575](https://github.com/AxlTech25/Gestion-MPA/commit/5ce7575) (F-001, F-006) |
| Índice SDLC | — | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |

Salida usada como entrada de **I-002** (ML sobre datos ya estructurados) y **T-001**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Producto 0.6.0 usable: auth, inventario, fichas, mantenimiento, PDF, configuración, dashboard. Tests unitarios del núcleo se añadieron después (`06d75b1`); I-001 original no exigía tests en la misma pasada (desvío respecto de cap. 5.3). |
| **N.º de iteraciones** | No medido. Equivale a seis incrementos; cada uno fue un ciclo generación → revisión → ajuste. |
| **Diagnóstico** | Falló la **tarea** (no acotada) y el **criterio** “testeable en la misma pasada”. El código es real; el registro no es reejecutable como un solo prompt. |
| **Refinamiento v1.1** | Se declara macro-prompt y se ancla a SHA de la matriz V3. Partición pendiente oleada 2. |
| **Decisión** | **Superado** (oleada 2). La acción “dividir” se ejecutó: I-001…I-006. |
| **Lección** | Un prompt de implementación que nombra ocho módulos no permite D2 (no hay pass@1 ni iteraciones). Cortar por incremento. |

### Checklist D2

- [x] Revisión humana acumulada por incremento
- [x] Código en producción / repo
- [ ] Pruebas en el mismo prompt (llegaron en T-001 / suites posteriores)
- [x] Sin secretos en el diseño del prompt
- [x] Limitación de granularidad registrada

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | D-001, D-002, R-002 |
| **Fase siguiente** | I-002, T-001 |
| **Matriz doble entrada** | F-001 a F-006, F-008 |
| **Commit sugerido** | `feat(modulo): resumen [I-001]` (hasta oleada 2) |
