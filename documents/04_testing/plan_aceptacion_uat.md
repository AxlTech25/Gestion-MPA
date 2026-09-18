# Plan de aceptación (UAT) — personas

**Prompt:** [T-011](../../prompts/04_testing/T-011_aceptacion_uat_v1.md)  
**Producto:** 0.10.7  
**Personas:** [personas.md](../01_requisitos/historias_usuario/personas.md)  
**No es:** el plan E2E T-001. Aquí el criterio es “¿terminó su trabajo?”

Firma en [plantilla_registro_resultados.md](./plantilla_registro_resultados.md).

---

| ID | Persona | Rol de sistema | Escenario | Listo cuando | Cruza |
|----|---------|----------------|-----------|--------------|-------|
| UAT-P1 | Carlos Mendoza | Administrador | Crear gerencia, asignarla a un área, crear usuario Técnico | Gerencia visible; área en inventario; técnico puede entrar | CFG-004, CFG-009 |
| UAT-P2 | Ana Ruiz | Técnico | Preventivo de laptop + correctivo + PDF de una ficha; marcar Xn en cronograma | Fichas en historial; PDF abre; celda Xn persiste | MNT-007/008, CRN-006, FIC-006 |
| UAT-P3 | Luis Vargas | Consulta (sin Configuración) | Dashboard: dañados y excedencia de “su” parque | Ve números/listado; **no** entra a Configuración (si entra con admin, el journey no vale) | DSH-008, CFG-008 (como negativo: no es admin) |
| UAT-P4 | Diana Soto | Admin o Técnico senior | Alertas / badges de riesgo **o** mensaje N/A si FastAPI down | Decisión con datos o N/A explícito; inventario usable | ML-002/003, DEG-001 |
| UAT-P5 | Miguel Torres | Practicante | Alta de equipo código 12 dígitos; abrir cronograma | Equipo en listado; **no** “Nuevo cronograma”; clic en celda no escribe | INV-004, INV-007, CRN-011, INT-005 |

### Notas

- P3 en R-003 es “usuario consulta / futuro”. En 0.10.7 se simula con un Técnico **sin** usar Configuración, o se marca **N/A** si no hay usuario de solo lectura. No inventar un rol.
- P4 no bloquea el UAT institucional si ML está N/A (ADR-002).
- Un FALLA de UAT-P1 o P2 es defecto Alta de aceptación.

### Criterio de salida

UAT-P1, P2 y P5 OK y firmados. P3 y P4 OK, N/A o firmados con observación.
