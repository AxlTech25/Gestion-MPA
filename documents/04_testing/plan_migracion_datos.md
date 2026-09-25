# Plan de migración e integridad de datos

**Prompt:** [T-014](../../prompts/04_testing/T-014_migracion_datos_v1.md)  
**Producto:** 0.10.7  
**Oráculo:** RNF-DAT-01…05  
**Entorno:** copia local de MySQL. **Prohibido** en producción.

Antes: dump (`mysqldump` o phpMyAdmin). Anotar `COUNT(*)` de `v2_equipos` y `v2_areas`.

---

| ID | Pasos | Esperado | RNF | Cruza |
|----|--------|----------|-----|-------|
| MIG-001 | En BD con datos 0.7.x (o actual): `php backend/tools/migrate_fase7.php`. Comparar COUNT equipos | Mismo número de equipos; columnas de telemetría existen; sin error SQL | DAT-05, I-008 | incremento 7 |
| MIG-002 | `php backend/tools/migrate_cronograma.php` dos veces | Segunda corrida no duplica tablas/filas de planes; `CREATE IF NOT EXISTS` / ALTER idempotente | DAT-05 | I-010 |
| MIG-003 | `php backend/tools/migrate_gerencias.php`. Áreas previas | Áreas siguen; `gerencia_id` nullable; `v2_gerencias` existe | DAT-05, I-017 | CFG-011 |
| MIG-004 | `POST /equipos` con un `codigo_patrimonial` ya usado (12 dígitos) | Error de negocio; no segunda fila | DAT-01 | INV-008 |
| MIG-005 | `DELETE /areas?id=` de un área con equipos | 409; COUNT áreas igual | DAT (integridad referencial de negocio) | INT-011, CFG-010, CB-PHP-024 |

Código patrimonial inválido (≠ 12 dígitos): caja negra [plan_caja_negra.md](./plan_caja_negra.md) / INV-007, no este plan.

### Criterio de salida

MIG-001…003 OK en la copia usada para upgrade. MIG-004 y 005 OK en la BD de desarrollo 0.10.7.
