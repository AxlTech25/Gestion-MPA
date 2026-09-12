# R-004 — Detección de ambigüedades e implícitos

| Campo | Valor |
|-------|-------|
| **Código** | R-004 |
| **Fase** | Requisitos |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Ejecutado / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Chain-of-Thought guiado (R-01 de la guía) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha de ejecución** | 2026-09-11 |
| **Producto** | 0.9.1 (análisis retrospectivo + supuestos vigentes) |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Cierra el hueco de la guía cap. 5.1 (Prompt R-01). No inventa requisitos: marca supuesto, cerrado o fuera de alcance.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de requisitos senior.

Contexto: Estoy definiendo / documentando Sigemad MPA V2. Usuarios:
Administrador, Técnico, Practicante; personas P1–P5. Cliente: unidad de
informática de la Municipalidad Provincial de Acobamba.

Entrada: ficha R-001, personas R-003, historias R-002, architecture.md,
changelog 0.9.1. No hay acta formal de entrevistas; declara supuestos.

Tarea: Identifica requisitos funcionales explícitos ya cubiertos solo si
hacen falta como contraste; céntrate en implícitos, ambigüedades,
contradicciones y preguntas al cliente. No inventes decisiones.

Formato: Tabla con columnas tipo, hallazgo, riesgo si no se aclara,
pregunta / resolución, prioridad, estado (Cerrado / Abierto / supuesto).
Archivo documents/01_requisitos/ambiguedades.md.

Restricciones: No inventes SIGA, portal ni rol extra. Marca como supuesto
todo lo no confirmado.

Criterios: Al menos 8 filas reales del caso; RBAC usuarios y ML opcional
aparecen; hay sección de supuestos vigentes.

Proceso: leer ficha → contrastar con código 0.9.1 → listar huecos →
clasificar.

No hacer: no convertir un supuesto en HU implementada.

Ejemplos: N/A (formato R-01 de la guía).
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Tabla R-01 | `documents/01_requisitos/ambiguedades.md` |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 14 hallazgos; 2 abiertos (rol consulta, DELETE equipos) |
| **Iteraciones** | 1 |
| **Decisión** | **Aprobado** |
| **Lección** | El R-01 hecho *después* del código sigue valiendo si el estado de cada fila es honesto (cerrado vs supuesto) |

| Relación | Valor |
|----------|-------|
| Anterior | R-001, R-002, R-003 |
| Siguiente | R-005, D-006 |
| Commit | `docs(requisitos): ambigüedades R-01 [R-004]` |
