# Contrato API V2

**Prompt:** [D-003](../../prompts/02_diseno/D-003_contrato_api_v1.md)  
**Base:** `/gestion_mpa/backend/api/v2/` (XAMPP) o `https://{dominio}/backend/api/v2/` (Hostinger)  
**Producto:** 0.10.7. Recurso `/cronogramas` ([I-010](../../prompts/03_implementacion/I-010_cronograma_v1.md) … [I-017](../../prompts/03_implementacion/I-017_gerencias_crud_areas_v1.md)).

## Sobre

- `Content-Type: application/json` salvo PDF (binario) y carga Excel (`multipart`).
- Cuerpo de éxito / error de negocio:

```json
{ "success": true, "data": {}, "message": "Operación exitosa" }
```

- Autenticación: `Authorization: Bearer <JWT>` en todas las rutas excepto `POST /auth/login`.
- Fechas: `YYYY-MM-DD` o `YYYY-MM-DD HH:MM:SS`.

| HTTP | Uso |
|------|-----|
| 200 / 201 | OK / creado |
| 400 | Validación |
| 401 | Sin token o token inválido |
| 403 | Rol insuficiente |
| 404 | Recurso no encontrado |
| 500 | Error interno (no filtrar secretos) |

---

## Recursos

| Método | Ruta | Auth | Notas |
|--------|------|------|-------|
| POST | `/auth/login` | Pública | `{usuario, password}` → token + usuario |
| GET | `/equipos` | JWT | Listado |
| POST | `/equipos` | JWT | Alta; `codigo_patrimonial` 12 dígitos |
| GET | `/equipos/{id}` | JWT | Detalle |
| PUT | `/equipos/{id}` | JWT | Edición |
| DELETE | `/equipos/{id}` | JWT | No priorizado en HU |
| GET | `/equipos/plantilla` | JWT | Excel de carga |
| POST | `/equipos/carga-masiva` | JWT | Multipart |
| GET | `/fichas-tecnicas/{id}` | JWT | |
| GET | `/fichas-tecnicas/buscar/{codigo}` | JWT | Código 12 dígitos |
| PUT/POST | `/fichas-tecnicas/{id}` | JWT | Evaluación |
| GET | `/mantenimientos` | JWT | Timeline |
| POST | `/mantenimientos` | JWT | Alta; puede disparar recálculo ML |
| GET | `/mantenimientos/{id}` | JWT | Detalle |
| GET | `/mantenimientos/historial/{codigo}` | JWT | |
| GET | `/areas` | JWT | Incluye `gerencia_id` y nombre de gerencia |
| POST/PUT/PATCH/DELETE | `/areas` | JWT + **Administrador** | PUT/DELETE `?id=`; DELETE 409 si hay equipos |
| GET | `/gerencias` | JWT | |
| POST/PUT/PATCH/DELETE | `/gerencias` | JWT + **Administrador** | PUT/DELETE `?id=`; DELETE SET NULL en áreas |
| GET | `/usuarios` | JWT | Lectura autenticada |
| POST/PUT/PATCH/DELETE | `/usuarios` | JWT + **Administrador** | I-009 |
| GET | `/dashboard` | JWT | Métricas |
| GET | `/dashboard/consulta` | JWT | Query: `tipo_equipo`, `estado_operativo`, `estado_conservacion`, `tipo_otro` |
| GET | `/reportes/equipo/{id}` | JWT | PDF (blob) |
| GET | `/reportes/mantenimiento/historial/{codigo}` | JWT | PDF |
| GET | `/reportes/mantenimiento/{id}` | JWT | PDF |
| GET | `/ml/status` | JWT | Salud del proxy / FastAPI |
| GET | `/ml/alertas` | JWT | Top riesgo; vacío/N/A si ML down |
| GET | `/ml/equipos/riesgo` | JWT | Batch |
| GET | `/ml/equipos/{id}/riesgo` | JWT | |
| POST | `/ml/predict/categoria` | JWT | |
| POST | `/ml/train` | JWT + **Administrador** | |
| GET | `/cronogramas` | JWT | Historial; query `anio` opcional |
| POST | `/cronogramas` | JWT + **Tecnico o Administrador** | `{ anio, nombre }` |
| GET | `/cronogramas/{id}` | JWT | Cabecera + matriz (áreas, conteos, celdas) |
| DELETE | `/cronogramas/{id}` | JWT + Tec/Admin | Borra el plan (CASCADE celdas/personal/horarios) |
| POST | `/cronogramas/{id}/celdas` | JWT + Tec/Admin | `{ area_id, fecha, cantidad }` — upsert; cantidad 0 libera; 400 si la fecha no es del `anio` o es sábado/domingo |
| DELETE | `/cronogramas/{id}/celdas/{id}` | JWT + Tec/Admin | Libera asiento |
| GET | `/cronogramas/{id}/cobertura` | JWT | Áreas sin celdas en ese documento |
| GET | `/reportes/cronograma/{id}` | JWT | PDF A4 apaisado, 2 meses/hoja, L–V, año del documento; HORA PROGRAMADA con borde |
| PUT | `/cronogramas/{id}/celdas/{celdaId}/horarios` | JWT + **Tecnico o Administrador** | Horas por equipo |

El cliente de FastAPI es **solo PHP** (`MlService`). Contrato interno Python: `/health`, `/predict/riesgo`, `/predict/riesgo/batch` (objeto `{}`, no `[]`), `/predict/categoria`, `/train`, `/metrics`.

---

## Errores de integración conocidos (no repetir)

- Batch hacia FastAPI: cuerpo objeto, no array (I-007).
- PDF: enviar Bearer; no `window.open` anónimo (I-006).
- 403 vs 401: sin token = 401; token de Técnico en `/usuarios` escritura = 403.
