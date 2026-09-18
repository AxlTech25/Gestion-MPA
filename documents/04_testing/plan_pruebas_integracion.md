# Plan de pruebas de integración — API V2

**Prompt:** [T-007](../../prompts/04_testing/T-007_integracion_api_v1.md)  
**Producto:** 0.10.7  
**Oráculo:** [contrato_api_v2.md](../02_diseno/contrato_api_v2.md)  
**Nivel:** integración (PHP + BD + HTTP). **Sin navegador.**

Estrategia: [estrategia_pruebas.md](./estrategia_pruebas.md). Scripts PHPUnit de estas rutas: oleada posterior.

---

## 1. Entorno

| Ítem | Valor |
|------|--------|
| Base URL local | `http://localhost/gestion_mpa/backend/api/v2` |
| Auth | `Authorization: Bearer <token>` salvo INT-001 |
| Cuerpo | `Content-Type: application/json` |
| Éxito de negocio | `{ "success": true, "data": …, "message": … }` |
| BD | MySQL `gestion_equipos_mpa_v2` o SQLite de test (cuando existan scripts) |
| ML | Opcional. INT-013 exige FastAPI **apagado** o `ml_service_url` vacío |

Credenciales seed: `admin` / `admin123` (solo local).

### Login de apoyo

```bash
curl -s -X POST http://localhost/gestion_mpa/backend/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"admin\",\"password\":\"admin123\"}"
```

Guardar `data.token`. Para INT-004/006 hace falta un JWT de Técnico y de Practicante (crear usuarios en CFG o seed de prueba).

---

## 2. Casos

### INT-001 — Login válido

- **Precondición:** Usuario `admin` en BD.
- **Pasos:** `POST /auth/login` con `{usuario, password}` correctos.
- **Esperado:** 200; `success` true; `data.token` no vacío; `data.usuario.rol` = Administrador.
- **Cruza:** AUTH-001 (E2E), SMOKE-001.

### INT-002 — Listado sin token

- **Pasos:** `GET /equipos` sin header Authorization.
- **Esperado:** 401 JSON; `success` false; sin lista de equipos.
- **Cruza:** REG-004, SEC-01.

### INT-003 — Token inválido

- **Pasos:** `GET /equipos` con `Authorization: Bearer not-a-jwt`.
- **Esperado:** 401; mensaje de token inválido o equivalente; sin datos.

### INT-004 — Técnico no muta usuarios

- **Precondición:** JWT rol Tecnico.
- **Pasos:** `PUT` y `DELETE /usuarios?id=1` con ese Bearer.
- **Esperado:** 403; el usuario id=1 no cambia.
- **Cruza:** AUTH-007, SEC-02.

### INT-005 — Practicante no crea cronograma

- **Precondición:** JWT Practicante.
- **Pasos:** `POST /cronogramas` `{ "anio": 2026, "nombre": "UAT" }`.
- **Esperado:** 403.
- **Cruza:** CRN-011, UAT-P5.

### INT-006 — Admin o Técnico crea cronograma

- **Precondición:** JWT Administrador o Tecnico.
- **Pasos:** `POST /cronogramas` `{ "anio": 2026, "nombre": "INT Preventivo" }`.
- **Esperado:** 201 (o 200 si el contrato unifica); `data.id` numérico. `GET /cronogramas?anio=2026` incluye el nombre.
- **Cruza:** CRN-003.

### INT-007 — Celda Xn en día laborable del año

- **Precondición:** Cronograma 2026 de INT-006; `area_id` con PC/laptop.
- **Pasos:** `POST /cronogramas/{id}/celdas` `{ "area_id": N, "fecha": "2026-09-16", "cantidad": 2 }` (miércoles).
- **Esperado:** 200/201; celda con cantidad 2; `GET /cronogramas/{id}` muestra marca X2.
- **Cruza:** CRN-006/007.

### INT-008 — Fecha de otro año

- **Pasos:** `POST …/celdas` con `fecha: 2025-12-31` en plan 2026.
- **Esperado:** 400; mensaje de año inválido.
- **Cruza:** CRN-012; UT `fechaPerteneceAlAnio`.

### INT-009 — Sábado rechazado

- **Pasos:** `POST …/celdas` con sábado del año del documento (p. ej. `2026-09-19`).
- **Esperado:** 400 (solo L–V).
- **Cruza:** CRN-015.

### INT-010 — Baja del plan

- **Pasos:** `DELETE /cronogramas/{id}` con JWT Admin/Técnico; luego `GET /cronogramas/{id}`.
- **Esperado:** DELETE 200; GET 404. Practicante DELETE → 403 (variante).
- **Cruza:** CRN-014.

### INT-011 — DELETE área con equipos

- **Precondición:** Área con ≥1 equipo; JWT Administrador.
- **Pasos:** `DELETE /areas?id={id}`.
- **Esperado:** 409; el área sigue en `GET /areas`.
- **Cruza:** CFG-010, MIG-005.

### INT-012 — DELETE gerencia no borra áreas

- **Precondición:** Área con `gerencia_id` asignado; JWT Administrador.
- **Pasos:** `DELETE /gerencias?id={id}`.
- **Esperado:** 200; `GET /areas` sigue listando el área; `gerencia_id` null.
- **Cruza:** CFG-011.

### INT-013 — Proxy ML caído

- **Precondición:** FastAPI detenido o `ml_service_url` vacío.
- **Pasos:** `GET /ml/status` y `GET /equipos` con JWT.
- **Esperado:** `/equipos` 200; `/ml/status` no 500 (degradado / no disponible). Inventario usable.
- **Cruza:** DEG-001, ML-003, RNF-AVA-01. Si FastAPI está arriba: **N/A** para este caso (usar DEG-001 con el servicio parado).

### INT-014 — OPTIONS CORS

- **Pasos:** `OPTIONS /equipos` (o la ruta que use el front) desde origen Vite.
- **Esperado:** 200; peticiones GET/POST subsecuentes OK.
- **Cruza:** REG-005.

---

## 3. Fuera de este plan

Controladores PDF (blob) y carga masiva Excel: se cubren en E2E INV/CRN. Inferencia `.joblib`: deuda T-004. Carga / pentest: R-005.

---

## 4. Criterio de salida (ejecución futura)

- INT-001…012 y 014 en OK.
- INT-013 OK o N/A documentado.
- 0 defectos Alta en auth/RBAC/409.
