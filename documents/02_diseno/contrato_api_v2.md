# Contrato API V2

**Prompt:** [D-003](../../prompts/02_diseno/D-003_contrato_api_v1.md)  
**Base:** `/gestion_mpa/backend/api/v2/` (XAMPP) o `https://{dominio}/backend/api/v2/` (producción)  
**Producto:** 0.11.5. Recurso `/cronogramas` ([I-010](../../prompts/03_implementacion/I-010_cronograma_v1.md) … [I-017](../../prompts/03_implementacion/I-017_gerencias_crud_areas_v1.md)). Hoja de revisión 2026 en `/fichas-tecnicas`.

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
| GET | `/fichas-tecnicas/{id}` | JWT | Incluye N° de orden, fecha y evaluación 2026 |
| GET | `/fichas-tecnicas/buscar/{codigo}` | JWT | Código 12 dígitos |
| PUT/POST | `/fichas-tecnicas/{id}` | JWT | Evaluación. 400 si el N° o la fecha no son válidos. 409 si el N° ya está en otra ficha. Deja historial si algún campo cambió |
| GET | `/fichas-tecnicas/{id}/historial` | JWT | Lista `{ id, accion, fecha, usuario, cambios: [{ campo, antes, despues }] }`, la más reciente primero |
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
| GET | `/reportes/mantenimiento/historial/{codigo}` | JWT | PDF del historial de intervenciones |
| GET | `/reportes/historial-equipo/{codigo}` | JWT | PDF: datos del equipo, historial de ficha y mantenimientos. 404 si no existe |
| GET | `/reportes/ficha-historial/{codigo}` | JWT | PDF del historial de la hoja de revisión. 404 si no existe |
| GET | `/reportes/mantenimientos-fecha/{fecha}` | JWT | PDF del día `YYYY-MM-DD`. 400 si la fecha no es válida. Cero equipos también devuelve PDF |
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

## Ficha técnica (0.11.0)

`PUT` o `POST /fichas-tecnicas/{id}` recibe JSON. El `{id}` es el id del equipo.

| Campo | Valores |
|-------|---------|
| `numero_ficha` | Dígitos, o texto que los contenga (`51`, `N° 51`). Se guarda `N° {n}`. Vacío: conserva el actual o asigna el máximo + 1. |
| `fecha_evaluacion` | `YYYY-MM-DD` o `dd/mm/aaaa`. Vacío: fecha del servidor. |
| `funcionamiento` | `Sin fallas`, `Con fallas`, o vacío |
| `obsolescencia_tecnologica` | `Si`, `No`, o vacío |
| `repuestos_disponibles` | `Si`, `No`, o vacío |
| `resultado_evaluacion` | `Puede continuar en servicio`, `Requiere mantenimiento`, `Requiere reparación`, `Técnicamente no resulta ser utilizado`, `Se recomienda retirar del servicio` |
| `diagnostico`, `conclusion_motivo` | Texto |
| `procesador`, `sistema_operativo`, `licencia_so`, `mac_address`, `ip_asignada`, `software_base`, `ram_gb`, `almacenamiento_gb`, `tipo_disco` | Solo se persisten si `tipo_equipo` contiene `cpu`, `laptop` o `pc`. En otro tipo se guardan nulos y no se modifica RAM ni disco del equipo. |

Un valor que no está en la lista permitida se guarda vacío. `estado_conservacion` y `estado_operativo` siguen escribiéndose en el equipo.

El PDF `GET /reportes/equipo/{id}` imprime la hoja vigente en una página A4: N° y fecha guardados, año de adquisición, información general en dos columnas, evaluación y resultado. En CPU, laptop o PC el hardware y el software van al lado de la evaluación; el diagnóstico y la conclusión comparten fila si ambos tienen texto. Las fotos van en una tabla del mismo ancho que el resto: una ocupa todo el ancho y dos se reparten en partes iguales.

Al guardar, si algún campo cambió, se inserta una fila en `v2_ficha_tecnica_historial`. `GET /fichas-tecnicas/{id}/historial` devuelve esa lista, la más reciente primero. 404 si el equipo no existe.

## Reportes (0.11.5)

El menú **Reportes** lo ven Administrador y Técnico. Las rutas PDF siguen pidiendo JWT, igual que el resto de `/reportes`. Cada ficha ocupa una hoja del mismo PDF. Hay dos bloques: fichas técnicas y fichas de mantenimiento.

| PDF | Ruta | Contenido |
|-----|------|-----------|
| Años del menú | `GET /reportes/anios` | JSON `data.tecnicas` y `data.mantenimientos`, años descendentes. Siempre incluye el año en curso. |
| Ficha técnica de un equipo | `GET /reportes/ficha-historial/{codigo}` | Cada versión de la hoja, de la primera a la vigente, una por página. Se reconstruye con `v2_ficha_tecnica_historial`; sin guardados posteriores, solo la vigente. Archivo `fichas_tecnicas_{codigo}.pdf`. 404 si el código no existe. |
| Fichas técnicas de un año | `GET /reportes/fichas-tecnicas-anio/{anio}` | Hojas cuya `fecha_evaluacion` cae en ese año. `anio` es cuatro dígitos entre 1990 y 2100. 400 si no lo es. Sin fichas, el PDF lo indica. |
| Fichas de mantenimiento de un equipo | `GET /reportes/mantenimiento/historial/{codigo}` | Cada ficha de mantenimiento de ese equipo. |
| Fichas de mantenimiento de un año | `GET /reportes/fichas-mantenimiento-anio/{anio}` | Fichas cuya fecha de intervención cae en ese año. Misma validación de año. Sin fichas, el PDF lo indica. |

El código es el patrimonial de 12 dígitos. El reporte por año de fichas técnicas usa la hoja vigente. La tabla de antes y después no se imprime: se consulta en la ficha y en `GET /fichas-tecnicas/{id}/historial`. Si el primer registro del historial es una actualización, la hoja anterior a ese guardado también entra en el PDF del equipo.

## ML

El cliente de FastAPI es **solo PHP** (`MlService`). Contrato interno Python: `/health`, `/predict/riesgo`, `/predict/riesgo/batch` (objeto `{}`, no `[]`), `/predict/categoria`, `/train`, `/metrics`.

---

## Errores de integración conocidos (no repetir)

- Batch hacia FastAPI: cuerpo objeto, no array (I-007).
- PDF: enviar Bearer; no `window.open` anónimo (I-006).
- 403 vs 401: sin token = 401; token de Técnico en `/usuarios` escritura = 403.
