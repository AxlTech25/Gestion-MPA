# D-004 — Frontend por features

| Campo | Valor |
|-------|-------|
| **Código** | D-004 |
| **Fase** | Diseño |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | RAG sobre `src/features` |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Producto** | 0.9.1 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto frontend (React 19 + Vite).

Contexto: architecture.md propuso features y Zustand para sesión. El
código usa AuthContext (I-006). Ficha técnica vive en inventario.

Objetivo: Mapa real de src/features, rutas /v2/* y reglas (no fetch a
:8000, PDF blob, RoleRoute).

Tarea: Tabla ruta / feature / guard; tabla feature / UI / servicio;
deuda vs architecture.md.

Entradas: src/features/**, App.jsx, RNF-UX, D-003.

Formato: documents/02_diseno/frontend_features.md.

Restricciones: no rediseñar; documentar lo que hay. No crear feature
reportes si no existe.

Criterios: 6 features reales; AuthContext vs Zustand explícito.

Proceso: listar carpetas → rutas → reglas → deuda documental.

No hacer: no mover archivos en esta pasada.

Ejemplos: N/A.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Mapa front | `documents/02_diseno/frontend_features.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Árbol coincide con 6 features del repo |
| **Iteraciones** | 1 |
| **Decisión** | **Aprobado** |
| **Lección** | El doc de arquitectura se desactualiza; un D-004 de “as-built” evita que el ADR mienta |

| Relación | Valor |
|----------|-------|
| Anterior | D-002, I-006 |
| Siguiente | T-003 |
| Commit | `docs(diseno): mapa frontend as-built [D-004]` |
