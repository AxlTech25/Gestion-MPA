# M-001 — Despliegue a producción

| Campo | Valor |
|-------|-------|
| **Código** | M-001 |
| **Fase** | Mantenimiento |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.2 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Zero-shot acotado + CoT para orden de pasos y riesgos |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Guía alineada a 0.9.x en servidor de producción |
| **ADR** | ADR-001 (PHP + MySQL; ML degradable) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Publicado con [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134). La guía cap. 5.5 define M-01 como **análisis de impacto**. Este registro es **despliegue + operación**; el análisis de impacto genérico queda como M-002 (oleada 3). v1.2 actualiza el destino: servidor de producción convencional (Apache + PHP + MySQL), no un proveedor concreto.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero de despliegue de PHP en un servidor de
producción convencional (Apache + PHP + MySQL). Prioriza un procedimiento
reproducible y seguro antes que un script agentico.

Contexto: Sigemad MPA V2. Frontend React compilado (Vite), backend PHP
API v2, MySQL en el servidor. FastAPI es opcional: si no corre, dejar
ml_service_url vacío o ausente. Secretos solo en local.php en el
servidor, nunca en Git. Build local: npm run build. Dependencias
PHP: composer install --no-dev. SPA necesita .htaccess en el DocumentRoot.

Objetivo: Una guía paso a paso para publicar el sistema y un checklist
post-despliegue, incluyendo degradación ML y cambio de credenciales seed.

Tarea:
1. Ubicar artefactos: dist/ → DocumentRoot, backend/ → DocumentRoot/backend/.
2. Crear BD e importar SQL (dump o v2_estructura.sql + extensiones).
3. Configurar local.php desde plantilla (host, usuario, password, cors,
   jwt_secret, ml_service_url).
4. Copiar vendor generado con --no-dev.
5. SSL, CORS con https, prueba de POST /auth/login y rutas /v2/*.
6. Seguridad: cambiar admin/admin123; no servir sql/ ni local.php.
7. Documentar rollback: respaldo de BD + restore de dist/ y backend.
8. Nota opcional si se quiere ML (uvicorn + supervisor en el mismo servidor).

Entradas disponibles:
- ADR-001 y architecture.md.
- I-007 / HU-ML-005 (fallback).
- README de build de producción si existe.
- Estructura public/.htaccess.

Formato de salida:
- documents/05_mantenimiento/produccion.md con pasos numerados, tabla
  síntoma/causa/solución y checklist.
- Mencionar changelog como registro de versiones (M-003 futuro).

Restricciones técnicas:
- No versionar secretos ni pegar passwords reales en el prompt.
- No instruir chmod 777 ni desactivar SSL.
- No afirmar que uvicorn corre si no se desplegó el microservicio.
- composer --no-dev; no subir node_modules.
- Rollback debe ser restaurar archivos + dump SQL, no “git push --force”
  al servidor.

Criterios de aceptación:
- Un operador que no escribió el código puede seguir los pasos.
- Queda explícito que ML ausente es normal.
- Login JSON contra /backend/api/v2/auth/login está en la guía.
- Checklist incluye cambio de password admin.
- Hay estrategia de rollback (aunque sea manual).

Proceso sugerido: 1) preparar artefactos en PC, 2) BD, 3) config, 4)
copia al servidor, 5) smoke login, 6) endurecer, 7) qué hacer si falla.

No hacer: no commitear local.php; no documentar claves de ejemplo de
producción; no mezclar instrucciones de ML como si fueran obligatorias
(separar sección).

Ejemplos: N/A.
```

### Checklist D1

- [x] Rol de despliegue
- [x] Contexto producción + ML opcional
- [x] Tarea por pasos
- [x] Formato guía + checklist
- [x] No secretos
- [x] Criterios
- [x] Rollback pedido
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Guía de producción | `documents/05_mantenimiento/produccion.md` | [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134) |
| Changelog | `documents/05_mantenimiento/changelog.md` | [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134) |
| README raíz (sección despliegue) | `README.md` | asociado al mismo cierre |

Salida: operación del producto en un servidor de producción; entrada para incidentes futuros (M-002).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Guía de deploy + (oleada 3) apartado Rollback en [M-004](./M-004_rollback_secretos_v1.md). |
| **N.º de iteraciones** | No registrado. Una publicación documental [56e7134](https://github.com/AxlTech25/Gestion-MPA/commit/56e7134). |
| **Diagnóstico** | Desvío de **formato** en v1 (rollback sin heading). Cerrado con M-004, no reescribiendo este registro como si siempre hubiera estado. |
| **Refinamiento** | Oleada 3: [M-004](./M-004_rollback_secretos_v1.md). v1.2: destino genérico de producción. |
| **Decisión** | **Aprobado** como guía de despliegue. Rollback = M-004. |
| **Lección** | Si el criterio de aceptación nombra rollback, el formato de salida debe incluir el heading “Rollback”; si no, el LLM (y el redactor) lo omiten. |

### Checklist D2

- [x] Revisión humana
- [x] Guía completa para servidor de producción
- [x] Sin secretos en el repo (se indica local.php fuera de Git)
- [x] ML degradado documentado
- [x] Procedimiento de rollback explícito ([M-004](./M-004_rollback_secretos_v1.md))
- [x] Prompt y métrica registrados

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | D-002, I-001…I-009, T-001 (smoke) |
| **Fase siguiente** | Operación; M-002 impacto de cambios futuros |
| **Matriz doble entrada** | Despliegue / docs fase M |
| **Commit sugerido** | `docs(mantenimiento): guía de producción [M-001]` |
