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

## Alcance incluido (producto actual, v0.9.0)

| Módulo | Capacidades |
|--------|-------------|
| Autenticación | Login JWT, protección de rutas y API |
| Inventario | CRUD, filtros, tipos personalizados, carga Excel, PDF de ficha |
| Ficha técnica | Evaluación, hardware/software, observaciones, bloque predictivo |
| Mantenimiento | Timeline, telemetría, correctivo estructurado, PDF |
| Configuración | Áreas y personal (RBAC) |
| Dashboard | Indicadores, consulta por etiquetas, alertas ML |
| ML (opcional) | Riesgo por equipo, lote, sugerencia de categoría, reentrenamiento |

## Fuera de alcance

- Portal ciudadano
- Inventario de bienes no informáticos
- Sustitución de SIGA/SIAF
- ML obligatorio en hosting compartido (el módulo se deshabilita si no hay FastAPI)

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
- [Ambigüedades](./ambiguedades.md) · [RNF](./requisitos_no_funcionales.md)
