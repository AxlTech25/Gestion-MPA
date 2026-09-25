# Plantilla — ficha de macroproceso (ISO 9001)

**Cláusula:** 4.4. Copiar a `MP-NN_{slug}.md`. Inventario: [inventario_procesos.md](./inventario_procesos.md).

---

## Identificación

| Campo | Contenido |
|-------|-----------|
| **ID Proceso** | MP-NN |
| **Nombre** | |
| **Tipo** | Estratégico / Operativo / Soporte |
| **Dueño del proceso** | Cargo (p. ej. Jefe de informática / patrimonio TI) |
| **Alcance** | Qué entra y qué queda fuera |
| **Objetivo** | Resultado medible |
| **Partes interesadas** | Admin, Técnico, Practicante, asesoría / municipalidad |
| **Versión / fecha** | v1 / YYYY-MM-DD |
| **Documentos relacionados** | Procedimientos PR-*, ficha de proyecto, ADR |

## Interacción

| | Código | Nombre |
|--|--------|--------|
| **Proveedores (procesos anteriores)** | | |
| **Clientes (procesos siguientes)** | | |

## Procedimientos que agrupa

| ID PR | Procedimiento | Responsable | ¿Automatizado en Sigemad? |
|-------|---------------|-------------|---------------------------|
| PR-NN-01 | | | Sí / Parcial / No |
| PR-NN-02 | | | |

## Indicadores (cl. 9.1)

| Indicador | Fórmula o fuente | Meta | Frecuencia |
|-----------|------------------|------|------------|
| | | | |

## Riesgos y oportunidades (cl. 6.1)

| Riesgo u oportunidad | Efecto | Control actual |
|----------------------|--------|----------------|
| | | |

## Registros

| Registro | Dónde vive | Retención |
|----------|------------|-----------|
| | Sigemad / papel / Excel | |

---

## Ejemplo rellenado — MP-01

| Campo | Contenido |
|-------|-----------|
| **ID Proceso** | MP-01 |
| **Nombre** | Gestión patrimonial de activos TI |
| **Tipo** | Operativo |
| **Dueño** | Unidad de informática / patrimonio TI (MPA) |
| **Alcance** | Equipos de cómputo con código patrimonial de 12 dígitos. Fuera: bienes no TI, SIGA/SIAF, portal ciudadano. |
| **Objetivo** | Inventario trazable y ficha técnica consultable |
| **Procedimientos** | PR-01-01 Control de inventario · PR-01-02 Ficha técnica · PR-01-03 Reportes patrimoniales |
| **Indicador** | Equipos con código válido en `v2_equipos` / total declarado |
| **Riesgo** | Código duplicado o de longitud distinta de 12 → validación en EquipoForm / API |
