# Plantilla — análisis de impacto (M-01)

**Prompt reutilizable:** [M-002](../../prompts/05_mantenimiento/M-002_analisis_impacto_v1.md)  
**Cuándo:** antes de un prompt de implementación que toque BD, contrato API o despliegue.

Completar una ficha por cambio. No sustituye el ADR si la decisión es arquitectónica.

---

## Ficha

| Campo | Contenido |
|-------|-----------|
| **Título del cambio** | |
| **Solicitante / fecha** | |
| **Prompt de implementación previsto** | I-0NN |
| **Entradas** | issue, HU, ADR, SQL actual |

### Impacto por categoría

| Categoría | Nivel (Alto/Medio/Bajo) | Archivos / componentes | Riesgo |
|-----------|-------------------------|------------------------|--------|
| Base de datos | | | |
| Modelos / API | | | |
| Frontend | | | |
| ML / FastAPI | | | |
| Tests | | | |
| Documentación | | | |
| Despliegue / Hostinger | | | |
| Datos existentes | | | |

### Rollback

| Paso | Acción | Responsable |
|------|--------|-------------|
| 1 | Respaldo BD (mysqldump o phpMyAdmin) | |
| 2 | Conservar `dist/` y `backend/` actuales | |
| 3 | Cómo revertir migración (script o restore) | |
| 4 | Pruebas de regresión mínimas (IDs T-001) | |

### Decisión

- [ ] Seguir a implementación (prompt I-*)
- [ ] Abrir ADR
- [ ] Rechazar / recortar alcance

---

## Ejemplo reconstruido — telemetría Fase 7 (I-008)

| Categoría | Nivel | Notas |
|-----------|-------|-------|
| Base de datos | Alto | ALTER `v2_equipos` y `v2_fichas_mantenimiento`; ENUM nuevos |
| API / modelos | Alto | `syncTelemetria`, controladores |
| Frontend | Alto | EquipoForm, MantenimientoForm condicional |
| ML | Medio | Features v2; joblib nuevo; I-007 sigue si no hay v2 |
| Tests | Medio | UT-PHP sync y consulta |
| Despliegue | Medio | Correr `migrate_fase7.php` en cada entorno |
| Datos existentes | Bajo–medio | DEFAULT 0 / NULL; no DELETE |

Rollback: restore dump pre-ALTER o no aplicar migrate en Hostinger hasta validar XAMPP.
