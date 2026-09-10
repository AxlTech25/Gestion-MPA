# Personas — Gestión MPA V2

Perfiles ficticios que representan a los usuarios del sistema. Sirven como referencia al redactar y priorizar historias de usuario.

---

## P1 — Administrador del sistema

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Carlos Mendoza |
| **Rol en el sistema** | Administrador |
| **Área** | Tecnologías de la Información |
| **Objetivos** | Mantener el inventario actualizado, configurar áreas y personal, supervisar el estado del parque tecnológico |
| **Frustraciones** | Datos duplicados, áreas hardcodeadas, falta de visibilidad global |
| **Uso típico** | Configuración, dashboard, consultas, carga masiva, reportes |

---

## P2 — Técnico de soporte

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Ana Ruiz |
| **Rol en el sistema** | Técnico |
| **Área** | Soporte técnico |
| **Objetivos** | Registrar intervenciones correctivas y preventivas con el detalle necesario para auditoría y análisis |
| **Frustraciones** | Formularios largos sin contexto del equipo, categorías de falla ambiguas |
| **Uso típico** | Mantenimiento, ficha técnica, búsqueda por código patrimonial |

---

## P3 — Jefe de área / Responsable patrimonial

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Luis Vargas |
| **Rol en el sistema** | Usuario consulta (futuro) / Responsable asignado en equipos |
| **Área** | Recursos Humanos, Contabilidad, etc. |
| **Objetivos** | Saber qué equipos tiene su área, cuáles están dañados o en excedencia |
| **Frustraciones** | No tener historial de fallas al solicitar soporte |
| **Uso típico** | Consulta en dashboard, historial de mantenimiento por equipo |

---

## P4 — Analista / Gestor predictivo

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Diana Soto |
| **Rol en el sistema** | Administrador o Técnico senior |
| **Área** | TI / Planificación |
| **Objetivos** | Identificar equipos en riesgo antes de que fallen, priorizar mantenimiento preventivo |
| **Frustraciones** | Decisiones reactivas, sin datos estructurados para ML |
| **Uso típico** | Dashboard alertas ML, inventario con badges de riesgo, telemetría en fichas |

---

## P5 — Practicante / Registrador

| Atributo | Descripción |
|----------|-------------|
| **Nombre** | Miguel Torres |
| **Rol en el sistema** | Practicante |
| **Área** | Soporte |
| **Objetivos** | Dar de alta equipos nuevos siguiendo el formato institucional (12 dígitos patrimoniales) |
| **Frustraciones** | Errores de validación poco claros al registrar códigos |
| **Uso típico** | Registro individual o carga masiva desde Excel |

---

## Mapa persona ↔ módulos

| Módulo | P1 | P2 | P3 | P4 | P5 |
|--------|:--:|:--:|:--:|:--:|:--:|
| Login | ● | ● | ○ | ● | ● |
| Configuración | ● | ○ | — | ○ | — |
| Inventario | ● | ○ | ○ | ● | ● |
| Ficha técnica | ● | ● | ○ | ● | ○ |
| Mantenimiento | ○ | ● | ○ | ● | ○ |
| Dashboard | ● | ○ | ● | ● | ○ |
| ML / Alertas | ● | ● | — | ● | — |
| Reportes PDF | ● | ● | ● | ○ | ○ |

● Uso principal · ○ Uso ocasional · — No aplica en v0.8.0
