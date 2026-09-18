# Plan de regresión por incremento

**Prompt:** [T-012](../../prompts/04_testing/T-012_regresion_v1.md)  
**Producto bajo prueba:** 0.10.7  
**Fuente:** [changelog.md](../05_mantenimiento/changelog.md)

Tras un **nuevo** I-*, correr solo la fila del incremento tocado + SMOKE + REG-001…006. No repetir T-001 entero.

---

## 1. Transversal (ya en T-001)

| ID | Qué no debe romperse | Detalle |
|----|----------------------|---------|
| REG-001 | Navbar | Dashboard → Inventario → Ficha → Mantenimiento → Cronograma → Configuración |
| REG-002 | Responsive ~768px | Tablas usables |
| REG-003 | Estado operativo | Ficha = inventario = dashboard |
| REG-004 | API sin JWT | 401 |
| REG-005 | OPTIONS CORS | 200 |
| REG-006 | Plantilla Excel | `color` y `numero_serie` no intercambiados (`EquipoPlantillaTest`) |

---

## 2. Por incremento (`REG-INC-*`)

| ID | Versión | Comprobación mínima | Esperado |
|----|---------|---------------------|----------|
| REG-INC-01 | 0.1.0–0.2.0 | Listar equipos; código 12 dígitos | API V2 responde; validación 12 dígitos |
| REG-INC-02 | 0.3.0 | Ficha + historial mantenimiento | Timeline y búsqueda por código |
| REG-INC-03 | 0.4.0 | PDF ficha o historial | Blob/descarga, no 401 silencioso |
| REG-INC-04 | 0.5.0 | Configuración áreas (solo admin) | Técnico no ve Configuración |
| REG-INC-05 | 0.6.0 | Login JWT + dashboard 4 tarjetas | AUTH-001 + DSH-001 |
| REG-INC-06 | 0.7.0–0.9.0 | Inventario con FastAPI **down** | Sin crash; badges N/A (ADR-002) |
| REG-INC-07 | 0.9.1 | Plantilla Excel + `requireRole` usuarios | REG-006 + AUTH-007 |
| REG-INC-08a | 0.10.0–0.10.3 | Menú Cronograma ≠ Mantenimiento | CRN-001 |
| REG-INC-08b | 0.10.4 | Celda muestra X2 (cantidad), no “Mañana” | CRN-006/007 |
| REG-INC-08c | 0.10.5 | PDF A4, L–V, año del documento | CRN-010/013 |
| REG-INC-08d | 0.10.6 | Pie HORA PROGRAMADA con borde | CRN-016 |
| REG-INC-08e | 0.10.7 | Bandas de gerencia; DELETE área 409 | CRN-017, CFG-010 |

---

## 3. Criterio de salida

REG-001, 004, 006 y REG-INC-08b…08e OK en 0.10.7. El resto OK o N/A si el módulo no se tocó en la corrida.
