# Ficha de proyecto — Sigemad MPA V2

| Campo | Contenido |
|-------|-----------|
| **Código** | SIGEMAD-MPA-V2 |
| **Nombre** | Sigemad MPA — Gestión de equipos y mantenimiento predictivo |
| **Cliente** | Municipalidad Provincial de Acobamba (unidad de informática / patrimonio TI) |
| **Versión documento** | 1.0 |
| **Fecha** | 2026-09-02 |
| **Metodología** | Prompt-Centered SDLC v1.2 (propuesta en validación; caso de estudio de este software) |

---

## Objetivo del sistema

Centralizar el inventario patrimonial de equipos de cómputo, las fichas técnicas y el historial de mantenimiento, e incorporar un componente opcional de aprendizaje automático para estimar riesgo operativo y priorizar intervenciones.

## Usuarios principales

Ver [historias_usuario/personas.md](./historias_usuario/personas.md). Roles de sistema: Administrador, Técnico, Practicante.

## Alcance incluido (producto actual, v0.10.7)

| Módulo | Capacidades |
|--------|-------------|
| Autenticación | Login JWT, protección de rutas y API |
| Inventario | CRUD, filtros, tipos personalizados, carga Excel, PDF de ficha |
| Ficha técnica | Evaluación, hardware/software, observaciones, bloque predictivo |
| Mantenimiento | Timeline, telemetría, correctivo estructurado, PDF |
| Cronograma | Historial de planes, matriz área×día laborable con marca **Xn**, cobertura, PDF A4 (2 meses, L–V, textos encajados), HORA PROGRAMADA con borde, baja del documento, **bandas de gerencia** |
| Configuración | Áreas (CRUD + gerencia), gerencias, personal (RBAC) |
| Dashboard | Indicadores, consulta por etiquetas, alertas ML |
| ML (opcional) | Riesgo por equipo, lote, sugerencia de categoría, reentrenamiento |

## Incremento 8 (I-010 … I-017) — cerrado 2026-09-17

**Prompt:** [R-006](../../prompts/01_requisitos/R-006_cronograma_anual_v1.md) → [I-010](../../prompts/03_implementacion/I-010_cronograma_v1.md) … [I-017](../../prompts/03_implementacion/I-017_gerencias_crud_areas_v1.md).  
**Estado:** cerrado por el responsable («ya estaríamos dando por terminado esta parte»). Producto **0.10.7**.

Cronograma de preventivo **por área**, agrupable por **gerencia**. **Xn** = cuántos PC o laptop se atienden ese día. PDF **A4**, dos meses por hoja, lunes–viernes; fechas del **año del plan**. Se puede **eliminar** un cronograma del historial. Las áreas se editan y se dan de baja (sin equipos).

## Fuera de alcance

- Portal ciudadano
- Inventario de bienes no informáticos
- Sustitución de SIGA/SIAF (el cronograma no opera esos sistemas; solo agenda el servidor que los hospeda)
- ML obligatorio en producción (el módulo se deshabilita si no hay FastAPI)
- Generación automática del Gantt (I-003 / R-006: el marcado es manual)

## Stack (confirmado en ADR-001)

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite |
| Backend | PHP 8.1+ API REST |
| Datos | MySQL |
| ML | Python 3.10+, FastAPI, Scikit-learn |
| Calidad | Vitest, PHPUnit, pytest |

## Documentos relacionados

- [Metodología](../metodologia.md)
- [Historias de usuario](./historias_usuario/README.md)
- [Arquitectura](../02_diseno/architecture.md)
- [ADR-001](../02_diseno/adr/ADR-001-stack-arquitectura.md)
- [ADR-002](../02_diseno/adr/ADR-002-degradacion-ml.md)
- [ADR-003](../02_diseno/adr/ADR-003-cronograma-documento-celdas.md)
- [Ambigüedades](./ambiguedades.md) · [RNF](./requisitos_no_funcionales.md)
