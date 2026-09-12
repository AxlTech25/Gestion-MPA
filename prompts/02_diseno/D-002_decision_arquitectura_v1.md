# D-002 — Decisión de arquitectura

| Campo | Valor |
|-------|-------|
| **Código** | D-002 |
| **Fase** | Diseño |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Tree-of-Thought (comparar alternativas y concluir) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-04-30 (ADR-001; incremento 1) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | Incremento 1; evolución ML en incrementos 6–7 |
| **Historias o ADR** | ADR-001; R-001 (restricción Hostinger); RNF de ML opcional |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Publicado con [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765).

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como arquitecto de software senior.

Contexto: Sigemad MPA V2. Equipo pequeño (un desarrollador principal).
Hosting objetivo: PHP compartido (Hostinger) + desarrollo local en XAMPP.
Necesidad de ML opcional (riesgo de falla, categoría de falla) sin que el
núcleo de inventario dependa de Python. Ya existe una V1 a migrar de forma
progresiva (Strangler Fig). Ficha R-001: sin portal ciudadano ni SIGA/SIAF.

Objetivo: Una decisión de stack y de separación de capas, registrada como
ADR, que I-001…I-007 puedan implementar sin rediscutir el diagrama cada
incremento.

Tarea:
1. Evaluar al menos tres alternativas de arquitectura.
2. Recomendar una con justificación según capacidad real del equipo, plazo
   y hosting.
3. Definir flujo de autenticación (JWT) y patrón de acceso al ML.
4. Describir estructura de carpetas frontend (features) y backend (API v2).
5. Redactar ADR-001 (contexto, decisión, consecuencias, alternativas).

Entradas disponibles:
- R-001: stack tentativo React / PHP / MySQL / FastAPI.
- Restricción: Hostinger no ejecuta el microservicio Python.
- Comparación informal con SGMI (Laravel + Vue) — otro producto, no este.
- D-001 (prefijo v2_, MySQL).

Formato de salida:
- documents/02_diseno/architecture.md: stack, directorios, flujo ML,
  convención JSON, RBAC.
- documents/02_diseno/adr/ADR-001-stack-arquitectura.md según plantilla 10.3:
  contexto, decisión, alternativas, consecuencias, riesgos.
- Tabla comparativa: complejidad, aprendizaje, escalabilidad, mantenimiento,
  costo, tiempo.

Alternativas a evaluar (Tree-of-Thought):
A) SPA React + API PHP PDO + MySQL + FastAPI opcional detrás de PHP.
B) Monolito Laravel + Vue (patrón SGMI).
C) Exponer FastAPI al navegador además de PHP (o reemplazar PHP por Python).

Restricciones técnicas:
- No exponer Python al navegador.
- Operación degradada si ML está caído (el inventario sigue).
- JWT en API; el front no es la fuente de autorización.
- Respuesta JSON estándar {success, data, message}.
- Evitar arquitectura que exceda a un equipo de una persona en hosting
  compartido (Kubernetes, bus de eventos, múltiples BDs).

Criterios de aceptación:
- El ADR elige una opción y descarta las otras con motivo.
- Queda escrito que PHP es el único cliente del puerto 8000.
- Queda escrito el patrón Strangler Fig respecto de V1.
- Un implementador puede crear carpetas src/features y backend/api/v2
  sin preguntar de nuevo el stack.

Proceso sugerido: 1) fijar restricciones de hosting y equipo, 2) comparar
A/B/C, 3) elegir, 4) dibujar flujo React → PHP → FastAPI → MySQL, 5) listar
consecuencias negativas (ML ausente en Hostinger).

No hacer: no recomendar Laravel “porque es más profesional”; no poner el
token JWT solo en el front; no asumir VPS para el MVP; no inventar cola
RabbitMQ.

Ejemplos: N/A.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto de equipo y hosting
- [x] Tarea (comparar + ADR)
- [x] Formato ADR + architecture.md
- [x] Restricciones de seguridad (no exponer Python)
- [x] Criterios de aceptación
- [x] Prohibiciones
- [x] Alternativas explícitas (ToT)

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Arquitectura | `documents/02_diseno/architecture.md` | [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) |
| ADR-001 | `documents/02_diseno/adr/ADR-001-stack-arquitectura.md` | [87d5765](https://github.com/AxlTech25/Gestion-MPA/commit/87d5765) |

**Decisión:** React + Vite + PHP API + MySQL + FastAPI opcional (alternativa A).

Salida usada como entrada de **I-001…I-007**.

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | ADR aceptado. Alternativas descartadas documentadas (Laravel+Vue; FastAPI al cliente; texto libre). El sistema en 0.9.1 sigue el ADR. |
| **N.º de iteraciones** | 1 decisión de stack (abr-2026) + refinamientos de documento (RBAC 0.9.1, flujo ML inc. 6–7) sin nuevo ADR. |
| **Diagnóstico** | El registro v1 no pedía tabla comparativa ni plantilla 10.3 completa (faltan criterios usados y responsables en el ADR). Desvío de **formato**. Un segundo ADR para degradación ML (D-006 previsto) no se abrió: se embebó en architecture.md. |
| **Refinamiento v1.1** | Anatomía ToT reconstruida. No se reescribe ADR-001 en esta oleada. |
| **Decisión** | **Aprobado.** |
| **Lección** | Fijar “PHP es el único cliente de FastAPI” como restricción del prompt evita que el modelo genere `fetch('http://localhost:8000')` desde React. |

### Checklist D2

- [x] Revisión humana
- [x] ADR registrado (política 8.2)
- [x] Decisiones justificadas
- [x] Sirve de entrada a implementación
- [x] ADR-002 degradación ML ([D-006](./D-006_adr_degradacion_ml_v1.md))

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | R-001, D-001 |
| **Fase siguiente** | I-001…I-007, M-001 (Hostinger sin Python) |
| **Matriz doble entrada** | Arquitectura transversal a F-001…F-008 |
| **Commit sugerido** | `docs(diseno): ADR-001 stack React/PHP/MySQL/FastAPI [D-002]` |
