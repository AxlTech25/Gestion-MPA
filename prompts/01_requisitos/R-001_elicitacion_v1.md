# R-001 — Elicitación y ficha de proyecto

| Campo | Valor |
|-------|-------|
| **Código** | R-001 |
| **Fase** | Requisitos |
| **Versión** | v1 |
| **Modelo** | Cursor Agent |
| **Estado** | Ejecutado |

---

## Prompt ejecutado

**Rol:** Eres un Analista de requisitos de software institucional.

**Contexto:** Sigemad MPA V2, gestión de equipos de cómputo, fichas técnicas, mantenimiento y ML opcional. Cliente: unidad de informática / patrimonio TI de la Municipalidad Provincial de Acobamba. Metodología Prompt-Centered SDLC v1.2 (no Scrum).

**Tarea:** Redactar ficha de proyecto: objetivo, usuarios, alcance incluido y excluido, stack tentativo y criterios de aceptación globales.

**Formato:** Markdown tabular, sin ceremonias ágiles.

**Restricciones:** No inventar integraciones SIGA/SIAF ni portal ciudadano. ML es opcional.

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Ficha | `documents/01_requisitos/ficha-proyecto.md` |
| Personas | `documents/01_requisitos/historias_usuario/personas.md` |

## Métricas

Alcance alineado con módulos reales del código (auth, inventario, ficha, mantenimiento, configuración, dashboard, ML, reportes).

## Decisión

**Aprobado** — base de la fase de requisitos.
