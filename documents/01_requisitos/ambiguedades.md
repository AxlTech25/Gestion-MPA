# Ambigüedades, implícitos y supuestos — Sigemad MPA V2

**Prompt:** [R-004](../../prompts/01_requisitos/R-004_ambiguedades_v1.md) (guía cap. 5.1, R-01).  
**Fecha del registro:** 2026-09-11  
**Fuente:** ficha R-001, personas, código 0.9.1 y decisiones ya tomadas.  
**Regla:** no se inventa un requisito; lo no confirmado queda como **supuesto** o **fuera de alcance**.

---

## Tabla R-01

| Tipo | Hallazgo | Riesgo si no se aclara | Pregunta / resolución | Prioridad | Estado |
|------|----------|------------------------|----------------------|-----------|--------|
| Implícito | El código patrimonial es de **12 dígitos numéricos** | Altas inválidas; carga Excel desalineada | ¿Formato municipal obligatorio? **Resuelto:** validación en UI/API (INV) | Alta | Cerrado |
| Implícito | Categoría de falla es **catálogo**, no texto libre | Dataset ML inservible | ¿Se permite “otros” libre? **Resuelto:** `v2_categorias_falla` | Alta | Cerrado |
| Implícito | ML **no** es obligatorio en producción | El operador espera alertas en Hostinger y reporta “sistema caído” | ¿El núcleo funciona sin FastAPI? **Resuelto:** sí (R-001, ADR-002) | Alta | Cerrado |
| Ambigüedad | Tres **roles de sistema** vs personas P1–P5 | P3 (jefe de área) no tiene login propio | ¿Hace falta rol “Consulta”? **Supuesto:** no en 0.9.1; P3 usa dashboard con cuenta existente | Media | Abierto (producto futuro) |
| Ambigüedad | Quién puede crear/editar **usuarios** | Escalada de privilegios (ocurrida hasta 0.9.1) | ¿Solo Administrador en API? **Resuelto:** I-009 `requireRole` | Alta | Cerrado |
| Contradicción | UI “solo admin ve Configuración” ≠ API abierta con JWT | Técnico muta `/usuarios` sin UI | ¿La UI es la autorización? **Resuelto:** no; la API autoriza | Alta | Cerrado |
| Implícito | Hosting **compartido** no ejecuta Python | Diseño de microservicio “en producción” irreal | ¿VPS obligatorio? **Resuelto:** no; ML opcional / VPS aparte | Alta | Cerrado |
| Fuera de alcance | Integración SIGA/SIAF o portal ciudadano | Alcance institucional inflado | ¿Hay interoperabilidad? **Resuelto:** no (R-001) | Alta | Cerrado |
| Implícito | Inventario solo de **bienes informáticos** | Pedidos de mobiliario/vehículos | ¿Patrimonio general? **Resuelto:** no | Media | Cerrado |
| Ambigüedad | Telemetría **manual** vs agente WMI/SMART | Expectativa de captura automática | ¿Hay agente? **Resuelto:** no en 0.9.1 (I-008 fuera de alcance) | Media | Cerrado |
| Implícito | Seed `admin` / `admin123` | Credencial por defecto en internet | ¿Se cambia al desplegar? **Resuelto:** checklist M-001 / M-004 | Alta | Cerrado (operación) |
| Ambigüedad | DELETE de equipos | Borrado patrimonial sin auditoría | ¿Se permite? **Parcial:** ruta existe; no es historia priorizada | Baja | Abrir si el cliente lo pide |
| Implícito | PDF de ficha requiere **memoria PHP** alta | 500 en Hostinger | ¿Límite del plan? **Supuesto:** 256M (hostinger.md) | Media | Cerrado (operación) |
| Ambigüedad | “Incremento 6” = JWT 0.6.0 o ML 0.7.0 | Trazabilidad rota | ¿Qué documento es la fuente? **Resuelto:** I-006 vs I-007 (oleada 2) | Media | Cerrado (docs) |

---

## Supuestos vigentes (no confirmados con acta de cliente)

1. Un practicante registra equipos pero no administra usuarios.
2. El jefe de área no requiere un cuarto rol en 0.9.1.
3. El modelo de riesgo se entrena con datos sintéticos hasta acumular historial real (≥200 equipos).
4. No hay obligación legal de conservar PDF firmado digitalmente.

Si un supuesto se niega, abrir incremento + prompt nuevo; no reescribir R-001 como si siempre hubiera sido así.
