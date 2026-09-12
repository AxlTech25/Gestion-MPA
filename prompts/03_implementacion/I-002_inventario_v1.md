# I-002 — Inventario CRUD

| Campo | Valor |
|-------|-------|
| **Código** | I-002 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (PDO + JSON del esqueleto I-001) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 2 / 0.2.0 |
| **Historias** | HU-INV-001, HU-INV-002 |
| **No confundir con** | [I-002-ML histórico](./I-002_microservicio_ml_v1.md) (ahora I-007/I-008) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP/React sobre el esqueleto I-001.

Contexto: Incremento 2. Tablas v2_equipos ya existen (D-001). Hace falta
el CRUD mínimo para dar de alta y listar equipos con atributos ML-ready
(ram_gb, almacenamiento_gb, fecha_adquisicion, tipo_disco). Código
patrimonial de 12 dígitos. UI: tabla + modal, Tailwind.

Objetivo: Listado y alta de equipos vía /api/v2/equipos y
src/features/inventario, sin fichas ni PDF.

Tarea:
1. Equipo.php: getAll, create; PDO parametrizado.
2. EquipoController.php: JSON {success, data, message}; 200/201/400.
3. routes/equipos.php y registro en index.php.
4. equiposService.js (Axios).
5. InventarioPage.jsx (tabla) y EquipoForm.jsx (modal alta).
6. Changelog 0.2.0 e incremento_2.md.

Entradas disponibles: I-001, v2_estructura.sql, HU-INV-001/002.

Formato de salida: código en las rutas anteriores; no snippets sueltos.

Restricciones técnicas:
- codigo_patrimonial: 12 dígitos numéricos, único.
- No texto tipo “8 GB” en RAM; usar ram_gb entero.
- No implementar PUT/DELETE si no está en el incremento (el update fino
  puede llegar después; no inventar carga masiva Excel aquí).
- No llamar a FastAPI.
- No secretos.

Criterios de aceptación:
- POST /equipos persiste y GET /equipos lo lista.
- El formulario no acepta código patrimonial de longitud distinta de 12.
- La tabla muestra tipo, RAM numérica y estado.
- V1 no se modifica.

Proceso sugerido: modelo → controlador → ruta → servicio → UI → smoke.

No hacer: no hardcodear áreas si ya hay tabla (si el seed es estático,
declararlo); no generar PDF; no timeline de mantenimiento.

Ejemplos:
json_encode(['success' => true, 'data' => $row, 'message' => '...']);
$stmt = $pdo->prepare('INSERT INTO v2_equipos (...) VALUES (...)');
```

### Checklist D1

- [x] Tarea de un incremento
- [x] Contrato JSON
- [x] Validación 12 dígitos
- [x] Ejemplo PDO/JSON
- [x] Prohibiciones (no ML, no PDF)

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| API equipos | `EquipoController.php`, `Equipo.php` | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) (F-003) |
| UI | `InventarioPage.jsx`, `EquipoForm.jsx` | idem (evolución posterior en el mismo árbol) |
| Incremento | `incremento_2.md` | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |

Salida usada como entrada de **I-003**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | HU-INV-001/002 cubiertas en 0.2.0. f086a63 documenta código que ya existía (matriz V3). |
| **N.º de iteraciones** | No medido. |
| **Diagnóstico** | N/A en origen. El alias I-002 vs I-002-ML es el riesgo de gobierno, no del código. |
| **Decisión** | **Aprobado.** |
| **Lección** | Un I-002 de inventario y un archivo histórico I-002-ML deben convivir con banner; si no, la matriz apunta al prompt equivocado. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-001 |
| **Fase siguiente** | I-003 |
| **Matriz doble entrada** | F-003 inventario |
| **Commit sugerido** | `feat(inventario): CRUD equipos y código de 12 dígitos [I-002]` |
