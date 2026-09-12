# T-002 — Tests PHPUnit

| Campo | Valor |
|-------|-------|
| **Código** | T-002 |
| **Fase** | Pruebas |
| **Versión del prompt / registro** | v1 / v1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (PHPUnit + SQLite en memoria) |
| **Autor / revisor** | AxlTech25 / equipo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 (suites) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Guía cap. 5.4 T-01: archivo de test ejecutable, no solo el plan T-001.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como ingeniero QA especializado en PHPUnit 10+.

Contexto: backend/ PHP 8.1. Reglas críticas: syncTelemetría (I-008),
filtros dashboard/consulta (I-008), roles (I-009), plantilla Excel
(I-009). Sin MySQL productivo: SQLite en memoria donde aplique.

Objetivo: Tests UT-PHP-001…019 que pasen con `composer test`.

Tarea: Generar / completar MantenimientoTest, DashboardConsultaTest,
UsuarioTest, AuthMiddlewareTest, EquipoPlantillaTest. Escenarios:
éxito, vacío, estado post-mantenimiento, filtros Otro, rol, columnas
Excel.

Entradas: plan_pruebas_unitarias.md, modelos PHP, I-008, I-009.

Formato: archivos en backend/tests/ con nombres descriptivos.

Restricciones: no sleeps; no pegar secretos JWT reales; cada test
asserta resultado. No tests HTTP de controladores (deuda del plan).

Criterios: composer test en verde; tiempo de suite corto.

Proceso: extraer funciones puras / payload → fixtures → asserts.

No hacer: expect(true); no mockear toda la aplicación.

Ejemplos: UT-PHP-004 Dañado → En Reparacion.
```

---

## Resultado

| Artefacto | Ubicación |
|-----------|-----------|
| Suite PHP | `backend/tests/*.php` |
| Plan | `documents/04_testing/unitarias/plan_pruebas_unitarias.md` §2.2–2.3c |

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | UT-PHP-001…019 documentados; commit [06d75b1](https://github.com/AxlTech25/Gestion-MPA/commit/06d75b1) y posteriores |
| **Iteraciones** | No medido en origen |
| **Decisión** | **Aprobado** |
| **Lección** | T-001 no genera asserts; T-002 sí. Separarlos evita un markdown que “parece” calidad |

| Relación | Valor |
|----------|-------|
| Anterior | T-001, I-008, I-009 |
| Siguiente | T-005 si falla |
| Commit | `test(php): sync, consulta, RBAC y plantilla [T-002]` |
