# Registro de ejecución — Pruebas

**Proyecto:** Gestión MPA V2  
**Versión:** 0.10.7  
**Estrategia:** [estrategia_pruebas.md](./estrategia_pruebas.md)  
**Ejecutor:** _________________________  
**Fecha inicio:** _________________________  
**Fecha fin:** _________________________  
**Entorno:** ☐ Local (XAMPP) ☐ Staging / producción ☐ Otro: ___________

Columnas **Tipo:** UT | INT | E2E | SMOKE | SEC | UAT | REG | DEG | MIG  
**Técnica:** blanca | negra | N/A

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Total casos ejecutados | |
| OK | |
| FALLA | |
| BLOQUEADO | |
| N/A | |
| % éxito | |

---

## Detalle por caso

Copie filas según el plan que esté corriendo. Capturas: `documents/04_testing/evidencias/YYYY-MM-DD/`.

| ID | Tipo | Técnica | Resultado | Observaciones | Evidencia |
|----|------|---------|-----------|---------------|-----------|
| AUTH-001 | E2E | negra | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| INT-001 | INT | negra | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| SEC-01 | SEC | negra | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| DEG-001 | DEG | negra | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| MIG-001 | MIG | N/A | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| REG-INC-08e | REG | negra | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| … | | | | | |

---

## Humo y compatibilidad (T-009)

| ID | Resultado | Observaciones | Evidencia |
|----|-----------|---------------|-----------|
| SMOKE-001 login | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| SMOKE-002 dashboard | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| SMOKE-003 inventario | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| SMOKE-004 cronograma | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| SMOKE-005 ML no tumba UI | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| CMP-001 F5 SPA | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| CMP-002 `dist/` producción | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| CMP-003 sin `ml_service_url` | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |

---

## Aceptación UAT (T-011)

| ID | Persona | Resultado | Observaciones | Firma usuario |
|----|---------|-----------|---------------|---------------|
| UAT-P1 | Carlos (Admin) | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| UAT-P2 | Ana (Técnico) | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| UAT-P3 | Luis (consulta) | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| UAT-P4 | Diana (ML) | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |
| UAT-P5 | Miguel (Practicante) | ☐ OK ☐ FALLA ☐ BLOQ ☐ N/A | | |

---

## Defectos encontrados

| # | ID caso | Severidad | Descripción | Pasos para reproducir | Estado |
|---|---------|-----------|-------------|----------------------|--------|
| 1 | | Alta / Media / Baja | | | Abierto / Corregido |
| 2 | | | | | |

---

## Bloqueos y dependencias

| ID caso | Motivo del bloqueo | Responsable | Fecha estimada resolución |
|---------|-------------------|-------------|---------------------------|
| | | | |

---

## Firmas

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Tester / QA | | | |
| Responsable técnico | | | |
| Usuario clave (UAT T-011) | | | |

---

## Notas finales

_Conclusiones, riesgos residuales (ML N/A, producción), recomendación de paso a M-001._
