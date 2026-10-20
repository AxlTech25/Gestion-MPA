# Registro de ejecución — E2E autenticación

**Proyecto:** Gestión MPA V2  
**Versión:** 0.10.7  
**Plan:** [plan_pruebas_funcionales.md](../../plan_pruebas_funcionales.md) §4.1 (T-001)  
**Ejecutor:** Axel Estrada Flores  
**Fecha:** 2026-10-15  
**Entorno:** Local (XAMPP + Vite en `http://localhost:5173`)

Tipo: E2E. Técnica: negra. Prioridad: Alta.

## Resumen

| Métrica | Valor |
|---------|-------|
| Total casos ejecutados | 7 |
| OK | 7 |
| FALLA | 0 |
| BLOQUEADO | 0 |
| N/A | 0 |
| % éxito | 100 % |

## Detalle

| ID | Caso | Resultado |
|----|------|-----------|
| AUTH-001 | Login exitoso | OK |
| AUTH-002 | Credenciales incorrectas | OK |
| AUTH-003 | Ruta privada sin sesión | OK |
| AUTH-004 | Cierre de sesión | OK |
| AUTH-005 | Token inválido | OK |
| AUTH-006 | La sesión sobrevive a F5 | OK |
| AUTH-007 | Mutaciones de usuarios solo Administrador | OK |

La corrida la ejecutó el responsable en el navegador. Esta carpeta no tiene capturas de estos casos.

## Defectos

Ninguno en AUTH-001…007.
