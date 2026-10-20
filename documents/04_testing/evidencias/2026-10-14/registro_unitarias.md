# Registro de ejecución — Pruebas unitarias

**Proyecto:** Gestión MPA V2  
**Versión:** 0.10.7  
**Estrategia:** [estrategia_pruebas.md](../../estrategia_pruebas.md)  
**Ejecutor:** Axel Estrada Flores  
**Fecha:** 2026-10-14  
**Entorno:** Local (XAMPP). Sin navegador: Vitest, PHPUnit y pytest.

Tipo: UT. Técnica: blanca.

## Resumen

| Suite | Comando | Resultado | Casos |
|-------|---------|-----------|-------|
| Vitest (T-003) | `npm test` | OK | 20 pruebas, 2 archivos |
| PHPUnit (T-002) | `composer test` en `backend/` | OK | 33 pruebas, 89 aserciones. PHP 8.2.12, PHPUnit 11.5.0 |
| pytest (T-004) | `python -m pytest -v` en `ml/` | OK | 14 pruebas |

| Métrica | Valor |
|---------|-------|
| Total casos ejecutados | 67 |
| OK | 67 |
| FALLA | 0 |
| BLOQUEADO | 0 |
| N/A | 0 |
| % éxito | 100 % |

Cubre RNF-QUA-02 para las suites existentes. No mide cobertura de rama. No sustituye humo, E2E ni UAT.

## Defectos

Ninguno en estas tres suites.
