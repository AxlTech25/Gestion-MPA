# Registro de ejecución — Humo

**Proyecto:** Gestión MPA V2  
**Versión:** 0.10.7  
**Plan:** [plan_humo_compatibilidad.md](../../plan_humo_compatibilidad.md) (T-009)  
**Ejecutor:** Axel Estrada Flores  
**Fecha:** 2026-10-15  
**Entorno:** Local (XAMPP: Apache + MySQL, frontend en desarrollo)

Tipo: SMOKE. Técnica: negra.

## Resumen

| Métrica | Valor |
|---------|-------|
| Total casos ejecutados | 5 |
| OK | 5 |
| FALLA | 0 |
| BLOQUEADO | 0 |
| N/A | 0 |
| % éxito | 100 % |

## Detalle

| ID | Resultado | Esperado cubierto |
|----|-----------|-------------------|
| SMOKE-001 | OK | Login redirige a `/v2/dashboard` |
| SMOKE-002 | OK | Dashboard con las cuatro tarjetas, sin pantalla en blanco |
| SMOKE-003 | OK | `/v2/inventario` carga sin HTTP 500 |
| SMOKE-004 | OK | `/v2/cronograma` abre el historial, no la pantalla de mantenimiento |
| SMOKE-005 | OK | El dashboard sigue usable al recargar |

La corrida la ejecutó el responsable en el navegador. Esta carpeta no tiene capturas.

## Fuera de esta corrida

CMP-001, CMP-002 y CMP-003 no se ejecutaron. CMP-001 queda pendiente antes de un despliegue (M-001).

## Defectos

Ninguno en SMOKE-001…005.
