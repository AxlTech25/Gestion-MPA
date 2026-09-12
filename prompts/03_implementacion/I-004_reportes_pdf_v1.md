# I-004 — Reportes PDF y filtros de inventario

| Campo | Valor |
|-------|-------|
| **Código** | I-004 |
| **Fase** | Implementación |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Zero-shot (dompdf) + few-shot (InventarioPage I-002) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 4 / 0.4.0 |
| **Historias** | HU-RPT-001, HU-INV-003, HU-FIC-001–007 (consulta/PDF) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como desarrollador senior PHP (dompdf) y React.

Contexto: Incremento 4. Inventario y ficha ya existen (I-002, I-003).
Hace falta ficha oficial en PDF y filtros en el listado (texto, tipo,
estado) en el cliente. Composer ya está en backend/.

Objetivo: GET /api/v2/reportes/equipo/{id} genera PDF; InventarioPage
filtra en tiempo real y ofrece “Descargar ficha PDF”.

Tarea:
1. composer require dompdf/dompdf.
2. ReporteController: HTML de ficha → Dompdf → stream/download.
3. Ruta reportes en index.php.
4. Filtros client-side en InventarioPage (código, marca, modelo, tipo,
   estado de conservación).
5. Botón PDF en la fila (ícono FileText).
6. Changelog 0.4.0 e incremento_4.md.

Entradas disponibles: FichaTecnicaController, HU-RPT-001, HU-INV-003.

Formato de salida: PHP + JSX en rutas del repo; PDF binario en el
endpoint, no base64 en JSON.

Restricciones técnicas:
- No subir vendor al diseño del prompt como secreto; vendor se genera.
- No window.open a una URL sin auth si más adelante hay JWT (I-006
  cambiará a blob; no bloquear 0.4.0 por eso).
- No reportes de mantenimiento aún (HU-RPT-002/003 son posteriores).
- No inventar plantilla Word.

Criterios de aceptación:
- El PDF abre o descarga y muestra código patrimonial y datos de ficha.
- Filtrar por texto reduce filas sin recargar la API.
- Sin 500 si el equipo existe.
- Composer.lock actualizado.

Proceso sugerido: dependencia → controlador HTML → ruta → botón UI →
probar un id real de I-002.

No hacer: no generar Excel aquí; no incrustar logo binario enorme en Git.

Ejemplos: N/A.
```

### Checklist D1

- [x] Tarea PDF + filtros
- [x] Fuera de alcance reportes de mantenimiento
- [x] Criterios observables
- [x] Nota JWT/blob para I-006

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| PDF | `ReporteController.php` | [f086a63](https://github.com/AxlTech25/Gestion-MPA/commit/f086a63) (F-008) |
| Filtros / botón | `InventarioPage.jsx` | idem |
| Incremento | `incremento_4.md` | [12f881c](https://github.com/AxlTech25/Gestion-MPA/commit/12f881c) |

Salida usada como entrada de **I-005**; I-006 ajusta descarga autenticada (blob).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Endpoint de ficha PDF y filtros en 0.4.0. |
| **N.º de iteraciones** | ≥1 posterior (0.6.0: blob + JWT). |
| **Diagnóstico** | El prompt 0.4.0 no anticipó Authorization en descarga; I-006 lo corrigió. Desvío de **restricción** futura, no de 0.4.0. |
| **Decisión** | **Aprobado.** |
| **Lección** | Si el ADR ya promete JWT, el prompt de PDF debe dejar gancho “descarga autenticada” aunque el token llegue dos incrementos después. |

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | I-003 |
| **Fase siguiente** | I-005; ajuste de descarga en I-006 |
| **Matriz doble entrada** | F-008 reportes |
| **Commit sugerido** | `feat(reportes): PDF de ficha y filtros [I-004]` |
