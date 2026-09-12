# D-003 — Contrato API V2

| Campo | Valor |
|-------|-------|
| **Código** | D-003 |
| **Fase** | Diseño |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | RAG sobre `backend/api/v2/routes` + few-shot JSON |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Producto** | 0.9.1 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de API REST.

Contexto: Sigemad MPA V2. ADR-001. JSON {success, data, message}. JWT
salvo /auth. PHP único cliente de FastAPI. Rutas reales en
backend/api/v2/routes/*.php e index.php.

Objetivo: Contrato que I-* y T-001 puedan citar sin leer el router.

Tarea: Tabla método / ruta / auth / notas de todos los recursos v2
(auth, equipos, fichas, mantenimientos, áreas, usuarios, dashboard,
reportes, ml). Códigos HTTP. Errores de integración conocidos ([] vs {}).

Entradas: index.php, routes/*, RNF-SEC, I-006, I-007, I-009.

Formato: documents/02_diseno/contrato_api_v2.md.

Restricciones: no documentar endpoints que no existan; no OpenAPI
completo si no hay generador — Markdown basta.

Criterios: /usuarios escritura = Administrador; /ml/train igual;
PDF listados; batch FastAPI anotado.

Proceso: leer routers → unificar paths → marcar auth → trampas.

No hacer: no inventar GraphQL ni /v1.

Ejemplos: POST /auth/login | Pública | {usuario, password}.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Contrato | `documents/02_diseno/contrato_api_v2.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Recursos alineados a routes/*.php (8 archivos + reportes en index) |
| **Iteraciones** | 1 |
| **Decisión** | **Aprobado** |
| **Lección** | El contrato se escribe desde el router, no desde la ficha de proyecto |

| Relación | Valor |
|----------|-------|
| Anterior | D-002, R-005 |
| Siguiente | T-001, I-* (consulta) |
| Commit | `docs(diseno): contrato API v2 [D-003]` |
