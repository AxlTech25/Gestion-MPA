# Plan de caja negra — técnicas y equivalencias

**Prompt:** [T-001 v1.7](../../prompts/04_testing/T-001_plan_pruebas_v1.md)  
**Nivel:** E2E (e integración donde se indique).  
**Técnica:** casos diseñados desde HU/RNF, **sin** abrir el modelo PHP.  
**Casos detallados:** [plan_pruebas_funcionales.md](./plan_pruebas_funcionales.md)

Estrategia: [estrategia_pruebas.md](./estrategia_pruebas.md). Caja blanca (código): [plan_caja_blanca.md](./plan_caja_blanca.md).

---

## 1. Técnicas usadas

| Técnica | Uso en Sigemad | Ejemplo |
|---------|----------------|---------|
| Partición de equivalencia | Clases válidas vs inválidas | Código patrimonial 12 dígitos vs resto |
| Valor límite | Bordes de la clase | 11, 12, 13 dígitos; Xn 0 / 1 / n / n+1 / 30 / 31 |
| Tabla de decisión | Combinaciones de rol × acción | Admin/Técnico/Practicante × POST cronograma |
| Transición de estado | Estado operativo del equipo | Ficha Dañado → inventario En Reparación |
| Caso de uso (journey) | Personas R-003 | [plan_aceptacion_uat.md](./plan_aceptacion_uat.md) |

---

## 2. Código patrimonial (RNF-DAT-01, INV)

| Clase | Ejemplo | Esperado | Caso T-001 |
|-------|---------|----------|------------|
| Válido 12 dígitos | `740000001001` | Alta OK | INV-004 |
| Corto | 11 dígitos | Bloqueo validación | INV-007 |
| Largo | 13 dígitos | Bloqueo validación | INV-007 |
| No numérico | `74000000100A` | Bloqueo | INV-007 (extensión: mismo caso) |
| Duplicado válido | mismo 12 dígitos dos veces | Error; una fila | INV-008, MIG-004 |

---

## 3. Cantidad Xn (HU-CRN-013)

n = PC + laptop del área (impresoras no entran en Xn).

| Clase | Entrada | Esperado | Caso |
|-------|---------|----------|------|
| Mínimo | X1 en área de 1 equipo | Celda X1; sin selector de turno | CRN-006 |
| Reparto | X2 un día, X3 otro (área 10) | Ambas marcas; tope del 3.er día = resto | CRN-007 |
| Liberar | cantidad 0 / Liberar | Celda libre | CRN-008 |
| Inválido 0 por API | `cantidad: 0` puede ser “libera” (contrato) | No X0 | INT-007 variante / CRN-008 |
| Sobre máximo | elegir más que el resto | UI no ofrece; API 400 si se fuerza | pendiente INT si no cubierto |
| Techo absoluto 31 | `cantidad: 31` | 400 / `cantidadValida` false | CB-PHP-013 (blanca); API = integración |

---

## 4. Calendario (HU-CRN-004)

| Clase | Ejemplo | Esperado | Caso |
|-------|---------|----------|------|
| Laborable del año del plan | miércoles 2026-09-16 en plan 2026 | POST OK | CRN-006, INT-007 |
| Fin de semana | sábado | 400; no columna en matriz | CRN-013, CRN-015, INT-009 |
| Otro año | 2025-12-31 en plan 2026 | 400 | CRN-012, INT-008 |
| Año impreso | plan 2028 | Cabecera ENE-2028; primer día ene = lun 3 | CRN-010, CRN-013 |

---

## 5. Roles (tabla de decisión)

| Acción | Administrador | Técnico | Practicante |
|--------|---------------|---------|-------------|
| Login / inventario / ficha | sí | sí | sí |
| Configuración UI | sí | no | no |
| PUT/DELETE usuarios | sí | 403 | 403 |
| POST cronograma / celdas | sí | sí | 403 |
| DELETE cronograma | sí | sí | 403 |
| POST /ml/train | sí | 403 | 403 |

Casos: CFG-008, AUTH-007, CRN-011, SEC-02/06, INT-004/005, UAT-P5.

---

## 6. ML up / down

| Clase | Esperado | Caso |
|-------|----------|------|
| FastAPI up | Alertas y badges | ML-002, ML-004 |
| FastAPI down | Núcleo OK; ML N/A | ML-003, DEG-001, INT-013 |

---

## 7. Journeys E2E cortos (persona)

No sustituyen UAT firmado (T-011). Sirven para ordenar una corrida QA.

1. **P1** Configuración: gerencia + área + técnico (CFG-009, CFG-004).
2. **P2** Mantenimiento + cronograma Xn (MNT-007, CRN-006).
3. **P5** Alta 12 dígitos y cronograma solo lectura (INV-004, CRN-011).

---

## 8. Criterio de salida

Las clases de las tablas 2–6 tienen al menos un ID T-001 o INT/SEC. No hace falta un caso E2E nuevo por cada celda de equivalencia si INT o UT ya la cubren (anotar cruza).
