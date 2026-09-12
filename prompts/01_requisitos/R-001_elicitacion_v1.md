# R-001 — Elicitación y ficha de proyecto

| Campo | Valor |
|-------|-------|
| **Código** | R-001 |
| **Fase** | Requisitos |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Chain-of-Thought guiado |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-02 (ficha v1.0) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Alcance cerrado a v0.9.0 (ficha); producto actual 0.9.1 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

La ficha se publicó en GitHub con [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1). Este registro reconstruye el prompt D1 a partir de ese entregable; no finge una ejecución anterior a la fecha del documento.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de requisitos de software institucional.

Contexto: Proyecto Sigemad MPA V2 (código SIGEMAD-MPA-V2). Cliente: unidad de
informática / patrimonio TI de la Municipalidad Provincial de Acobamba. El
producto gestiona equipos de cómputo, fichas técnicas y mantenimiento, con un
componente opcional de ML para riesgo operativo. Metodología: Prompt-Centered
SDLC v1.2 (propuesta en validación; no Scrum). Stack tentativo alineado con
hosting PHP compartido y XAMPP local: React + Vite, API PHP, MySQL, FastAPI
opcional. Roles de sistema previstos: Administrador, Técnico, Practicante.

Objetivo: Cerrar la entrada mínima de la fase de requisitos (guía cap. 4.1):
una ficha de proyecto que un humano pueda aprobar y que sirva de contexto
obligatorio para R-002, D-001 y D-002.

Tarea: Redactar la ficha de proyecto en Markdown tabular con: identificación,
objetivo del sistema, usuarios principales, alcance incluido por módulo, fuera
de alcance, stack tentativo y documentos relacionados. El alcance debe
describir el producto real (auth, inventario, ficha, mantenimiento,
configuración, dashboard, ML, reportes), no un sistema genérico.

Entradas disponibles:
- Necesidad operativa: inventario patrimonial de equipos de cómputo,
  historial de mantenimiento y priorización de intervenciones.
- Restricción de despliegue: Hostinger compartido (PHP + MySQL; Python no
  disponible en el plan).
- Personas de usuario (borrador): administrador TI, técnico de soporte,
  responsable de área, perfil de consulta / ML.
- Decisión preliminar de no integrar SIGA/SIAF ni portal ciudadano.

Formato de salida: Markdown con tablas. Campos de la plantilla 10.1 de la
guía: nombre, objetivo, usuarios, problema, alcance incluido, fuera de
alcance, stack, restricciones, criterios globales. Sin ceremonias ágiles
(no sprints, no Daily, no Product Owner como rol Scrum).

Restricciones técnicas:
- No inventar integraciones con SIGA, SIAF ni sede electrónica.
- ML es opcional y degradable: el sistema debe funcionar si FastAPI no corre.
- Inventario limitado a bienes informáticos, no patrimonio general.
- Usar nombres de módulos reales del código (AUTH, INV, FIC, MNT, CFG, DSH,
  ML, RPT) cuando se liste el alcance.

Criterios de aceptación:
- Un revisor puede decir sí/no al alcance sin leer el código.
- Fuera de alcance explícito (portal, SIGA/SIAF, ML obligatorio en hosting).
- Stack coherente con XAMPP y Hostinger PHP.
- Enlace a personas e historias cuando existan.

Proceso sugerido: 1) resumir el problema institucional, 2) listar usuarios,
3) recortar alcance incluido vs excluido, 4) fijar stack tentativo,
5) marcar supuestos. Si un dato no está confirmado, etiquetarlo como supuesto.

No hacer: no inventar requisitos de trámites municipales, no proponer
microservicios adicionales, no copiar alcance de SGMI (Laravel+Vue), no
usar la palabra sprint.

Ejemplos: N/A (zero-shot acotado por la plantilla 10.1).
```

### Checklist D1

- [x] Rol definido
- [x] Contexto suficiente
- [x] Tarea verificable
- [x] Formato definido
- [x] Restricciones de alcance y seguridad (no SIGA, ML opcional)
- [ ] Ejemplos (N/A — plantilla de ficha basta)
- [x] Criterios de aceptación
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Ficha de proyecto | `documents/01_requisitos/ficha-proyecto.md` | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) |
| Personas (entrada de R-002) | `documents/01_requisitos/historias_usuario/personas.md` | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) |

Salida usada como entrada de **R-002**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | Checklist de completitud de ficha (plantilla 10.1): 9/9 campos presentes. Alcance alineado con módulos reales del código. |
| **N.º de iteraciones** | No registrado en origen (reconstrucción). Estimado ≥2: el alcance de la ficha refleja v0.9.0, no el borrador inicial de V2. |
| **Diagnóstico** | El registro v1 era solo rol + tarea corta. Fallaba **formato** (no pedía la plantilla 10.1) y **restricciones** (ML opcional y no-SIGA estaban implícitos). |
| **Refinamiento v1.1** | Se reconstruyó la anatomía D1 y se documentó la reconstrucción a posteriori. No se reejecutó el LLM. |
| **Decisión** | **Aprobado** — base de la fase de requisitos. |
| **Lección** | Pedir fuera de alcance en la misma pasada que el alcance incluido evita que el modelo invente portal ciudadano o integración SIGA. |

### Checklist D2

- [x] Revisión humana del alcance
- [x] Documento completo
- [x] Sin secretos
- [x] Prompt y métrica registrados (v1.1)
- [x] Sirve de entrada a R-002 / D-002

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | Entrada mínima del cliente (necesidad institucional) |
| **Fase siguiente** | R-002 historias de usuario |
| **Matriz doble entrada** | Documentación de fase requisitos |
| **Commit sugerido** | `docs(requisitos): ficha de proyecto [R-001]` |
