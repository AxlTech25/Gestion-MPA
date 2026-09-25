# Plantilla — ficha de procedimiento (ISO 9001)

**Cláusula:** 8.1 / 8.5. Copiar a `PR-NN-NN_{slug}.md`. Una fila de [inventario_procesos.md](./inventario_procesos.md) = un procedimiento.

El **ID Prompt (Procedimiento)** de la matriz V4 apunta al prompt que armó el BPMN (Bizagi), no al I-* del código.

---

## Identificación

| Campo | Contenido |
|-------|-----------|
| **ID Procedimiento** | PR-NN-NN |
| **Nombre** | |
| **Macroproceso** | MP-NN — |
| **ID Prompt (Procedimiento)** | P-ISO-NNN / N/A (BPMN aún no promptado) |
| **Diagrama** | Ruta del .bpmn o PNG (Apéndice G / Bizagi) |
| **Objetivo** | |
| **Alcance** | Incluye / no incluye |
| **Responsable** | Rol institucional |
| **Roles en Sigemad** | Administrador / Técnico / Practicante |
| **Versión / fecha** | v1 / YYYY-MM-DD |

## Entradas y salidas

| | Qué | Origen o destino |
|--|-----|------------------|
| **Entradas** | | |
| **Salidas** | | |
| **Registros** | | Tabla o PDF en Sigemad |

## Actividades (secuencia)

| Orden | ID ACT | Actividad | Quién | Funciones F-* | Criterio de hecho |
|-------|--------|-----------|-------|---------------|-------------------|
| 1 | ACT-NN-NN-01 | | | | |
| 2 | ACT-NN-NN-02 | | | | |

## Controles

| Control | Dónde | Evidencia |
|---------|-------|-----------|
| Validación (12 dígitos, rol, 409) | API / UI | Test T-* / UT-* |
| Autorización | `requireRole` | SEC-* |
| Calidad de código | SonarQube | `documents/06_calidad/sonarqube/evidencias/` |

## Excepciones

| Situación | Qué hace el procedimiento | Referencia |
|-----------|---------------------------|------------|
| FastAPI caído | | ADR-002 / T-013 |
| Rol insuficiente | 403; no se registra | HU-AUTH-005 |
| Recurso en uso | 409 | p. ej. área con equipos |

## Indicador

| Métrica | Fuente | Meta |
|---------|--------|------|
| | | |

---

## Ejemplo rellenado — PR-01-01

| Campo | Contenido |
|-------|-----------|
| **ID Procedimiento** | PR-01-01 |
| **Nombre** | Control de inventario |
| **Macroproceso** | MP-01 — Gestión patrimonial de activos TI |
| **ID Prompt (Procedimiento)** | N/A |
| **Objetivo** | Alta, consulta, edición y carga masiva de equipos TI |
| **Responsable** | Técnico (escritura) / Administrador (carga masiva y plantilla) |
| **Entradas** | Datos del bien, área, plantilla Excel |
| **Salidas** | Fila en `v2_equipos`; resumen de importación |
| **Actividades** | ACT-01-01-01…04 (consultar, registrar, lote, riesgo) |
| **Funciones** | F-014 … F-020 |
| **Prompt de código** | I-002, I-004, I-007, I-009 (no confundir con el prompt Bizagi) |
