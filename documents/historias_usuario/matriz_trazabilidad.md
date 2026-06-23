# Matriz de trazabilidad — Historias de usuario

Relación entre historias de usuario, sprints, versiones y módulos del sistema.

**Leyenda estado:** ✅ Implementada · 🔄 En progreso · ⏳ Pendiente

---

## Por sprint / versión

| Sprint | Versión | Historias principales |
|--------|---------|----------------------|
| Sprint 1 | 0.1.0 | (Infraestructura — sin HU de usuario directa) |
| Sprint 2 | 0.2.0 | HU-INV-001, HU-INV-002 |
| Sprint 3 | 0.3.0 | HU-MNT-001, HU-MNT-002 |
| Sprint 4 | 0.4.0 | HU-INV-003, HU-FIC-001–007, HU-RPT-001, HU-RPT-004 |
| Sprint 5 | 0.5.0 | HU-CFG-001–005 |
| Sprint 6 | 0.6.0 | HU-AUTH-001–004, HU-DSH-001–004, HU-RPT-004 |
| Sprint 6 ML | 0.7.0 | HU-ML-001, HU-ML-002, HU-ML-004, HU-ML-005, HU-INV-006, HU-MNT-009 |
| Sprint 7 | 0.8.0 | HU-INV-008, HU-MNT-006–012, HU-DSH-005–006, HU-ML-003 (parcial) |
| Post-Sprint 7 | 0.8.x | HU-MNT-003–005, HU-MNT-008, HU-RPT-002–003 |
| Backlog | — | HU-INV-009, HU-FIC-008, HU-ML-006, HU-ML-007 |

---

## Matriz completa

| ID | Épica | Estado | Sprint | Módulo UI | API principal |
|----|-------|--------|--------|-----------|---------------|
| HU-AUTH-001 | Autenticación | ✅ | 0.6.0 | Login | POST `/auth/login` |
| HU-AUTH-002 | Autenticación | ✅ | 0.6.0 | App.jsx | Middleware JWT |
| HU-AUTH-003 | Autenticación | ✅ | 0.6.0 | AuthContext | — |
| HU-AUTH-004 | Autenticación | ✅ | 0.6.0 | Navbar | — |
| HU-CFG-001 | Configuración | ✅ | 5 | ConfiguracionPage | GET `/areas` |
| HU-CFG-002 | Configuración | ✅ | 5 | AreaForm | POST `/areas` |
| HU-CFG-003 | Configuración | ✅ | 5 | ConfiguracionPage | GET `/usuarios` |
| HU-CFG-004 | Configuración | ✅ | 5 | UsuarioForm | POST `/usuarios` |
| HU-CFG-005 | Configuración | ✅ | 5 | EquipoForm | GET `/areas` |
| HU-INV-001 | Inventario | ✅ | 2 | InventarioPage | GET `/equipos` |
| HU-INV-002 | Inventario | ✅ | 2,5,7 | EquipoForm | POST `/equipos` |
| HU-INV-003 | Inventario | ✅ | 4 | InventarioPage | — (client-side) |
| HU-INV-004 | Inventario | ✅ | — | InventarioPage | GET `/equipos/plantilla` |
| HU-INV-005 | Inventario | ✅ | — | InventarioPage | POST `/equipos/carga-masiva` |
| HU-INV-006 | Inventario | ✅ | 6 | InventarioPage | GET `/ml/predict/riesgo/batch` |
| HU-INV-007 | Inventario | ✅ | 3–4 | FichaTecnicaModal | GET `/fichas-tecnicas/{id}` |
| HU-INV-008 | Inventario | ✅ | 7 | EquipoForm | POST `/equipos` |
| HU-INV-009 | Inventario | ⏳ | — | — | PUT `/equipos/{id}` (501) |
| HU-FIC-001 | Ficha técnica | ✅ | 4+ | FichaTecnicaPage | GET `/fichas-tecnicas/buscar/{codigo}` |
| HU-FIC-002 | Ficha técnica | ✅ | 4 | FichaTecnicaPanel | GET `/fichas-tecnicas/{id}` |
| HU-FIC-003 | Ficha técnica | ✅ | 4 | FichaTecnicaPanel | PUT `/fichas-tecnicas/{id}` |
| HU-FIC-004 | Ficha técnica | ✅ | 4 | FichaTecnicaPanel | PUT `/fichas-tecnicas/{id}` |
| HU-FIC-005 | Ficha técnica | ✅ | 4 | FichaTecnicaPanel | GET `/reportes/equipo/{id}` |
| HU-FIC-006 | Ficha técnica | ✅ | 4 | InventarioPage | GET `/reportes/equipo/{id}` |
| HU-FIC-007 | Ficha técnica | ✅ | 4 | FichaTecnicaPanel | PUT `/fichas-tecnicas/{id}` |
| HU-FIC-008 | Ficha técnica | ⏳ | 7 | FichaTecnicaPanel | GET `/ml/predict/riesgo` |
| HU-MNT-001 | Mantenimiento | ✅ | 3 | MantenimientoPage | GET `/mantenimientos` |
| HU-MNT-002 | Mantenimiento | ✅ | 3 | MantenimientoForm | POST `/mantenimientos` |
| HU-MNT-003 | Mantenimiento | ✅ | 7+ | MantenimientoPage | GET `/mantenimientos/historial/{codigo}` |
| HU-MNT-004 | Mantenimiento | ✅ | 7+ | MantenimientoDetalleModal | GET `/mantenimientos/{id}` |
| HU-MNT-005 | Mantenimiento | ✅ | 7+ | MantenimientoPage | GET `/reportes/mantenimiento/...` |
| HU-MNT-006 | Mantenimiento | ✅ | 7+ | MantenimientoForm | GET `/fichas-tecnicas/buscar/{codigo}` |
| HU-MNT-007 | Mantenimiento | ✅ | 7+ | MantenimientoForm | POST `/mantenimientos` |
| HU-MNT-008 | Mantenimiento | ✅ | 7+ | MantenimientoForm | POST `/mantenimientos` |
| HU-MNT-009 | Mantenimiento | ✅ | 6 | MantenimientoForm | GET `/ml/predict/categoria` |
| HU-MNT-010 | Mantenimiento | ✅ | 7 | Mantenimiento.php | `Equipo::syncTelemetria` |
| HU-MNT-011 | Mantenimiento | ✅ | 7 | MantenimientoForm | POST `/mantenimientos` |
| HU-MNT-012 | Mantenimiento | ✅ | 7 | MantenimientoForm | POST `/mantenimientos` |
| HU-DSH-001 | Dashboard | ✅ | 0.6.0 | DashboardPage | GET `/dashboard` |
| HU-DSH-002 | Dashboard | ✅ | 0.6.0 | DashboardPage | GET `/dashboard` |
| HU-DSH-003 | Dashboard | ✅ | 0.6.0 | DashboardPage | GET `/dashboard` |
| HU-DSH-004 | Dashboard | ✅ | 0.6.0 | DashboardPage | GET `/dashboard` |
| HU-DSH-005 | Dashboard | ✅ | 7+ | ConsultaEquiposPanel | GET `/dashboard/consulta` |
| HU-DSH-006 | Dashboard | ✅ | 7+ | ConsultaEquiposPanel | GET `/dashboard/consulta?tipo_otro=` |
| HU-ML-001 | ML | ✅ | 6 | DashboardPage | GET `/ml/alertas` |
| HU-ML-002 | ML | ✅ | 6 | mlService | POST `/ml/predict/riesgo` |
| HU-ML-003 | ML | 🔄 | 7 | features.py | FastAPI `/train` |
| HU-ML-004 | ML | ✅ | 6 | MantenimientoForm | GET `/ml/predict/categoria` |
| HU-ML-005 | ML | ✅ | 6 | Dashboard, Inventario | Fallback graceful |
| HU-ML-006 | ML | ⏳ | 7 Fase 2 | — | POST `/mantenimientos` + ML |
| HU-ML-007 | ML | ⏳ | 7 Fase 2 | — | `v2_metricas_equipo` |
| HU-RPT-001 | Reportes | ✅ | 4 | FichaTecnicaPanel | ReporteController |
| HU-RPT-002 | Reportes | ✅ | 7+ | MantenimientoPage | `/reportes/mantenimiento/historial/` |
| HU-RPT-003 | Reportes | ✅ | 7+ | MantenimientoDetalleModal | `/reportes/mantenimiento/{id}` |
| HU-RPT-004 | Reportes | ✅ | 0.6.0 | lib/api.js | JWT en descarga blob |

---

## Cobertura de pruebas

| Tipo | Documento | Historias cubiertas |
|------|-----------|---------------------|
| Funcional | `documents/pruebas/plan_pruebas_funcionales.md` | AUTH, CFG, INV, FIC, MNT, DSH, ML, REG |
| Unitario | `documents/pruebas/unitarias/plan_pruebas_unitarias.md` | Lógica MNT-010, DSH-005/006, ML-003 |

---

## Personas más impactadas por épica

| Épica | Persona principal |
|-------|-------------------|
| EP-01 Autenticación | P1, P2 |
| EP-02 Configuración | P1 |
| EP-03 Inventario | P1, P5 |
| EP-04 Ficha técnica | P2, P3 |
| EP-05 Mantenimiento | P2, P3 |
| EP-06 Dashboard | P1, P3, P4 |
| EP-07 ML | P4 |
| EP-08 Reportes | P1, P2, P3 |

---

*Actualizar esta matriz al cerrar sprints o al cambiar el estado de una historia.*
