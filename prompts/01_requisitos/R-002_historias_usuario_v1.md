# R-002 — Historias de usuario y criterios de aceptación

| Campo | Valor |
|-------|-------|
| **Código** | R-002 |
| **Fase** | Requisitos |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1.1 |
| **Estado** | Reconstruido a posteriori / Aprobado |
| **Modelo** | Cursor Agent |
| **Técnica** | Few-shot (formato `Como / quiero / para` + tabla de campos) |
| **Autor** | AxlTech25 (equipo Sigemad MPA) |
| **Revisor** | Equipo de desarrollo Sigemad MPA |
| **Fecha del artefacto** | 2026-09-09 (catálogo v0.9.0 / referencia 0.9.1) |
| **Fecha de reconstrucción** | 2026-09-11 |
| **Incremento / versión producto** | 56 HU en 8 épicas; producto 0.9.1 |
| **Plantilla** | [`gobernanza/_plantilla_prompt.md`](../gobernanza/_plantilla_prompt.md) |

Publicado en [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1). Las historias son artefactos de requisitos SDLC, no ítems de sprint Scrum.

---

## Prompt ejecutado (anatomía D1)

```text
Rol: Actúa como analista de requisitos. Convierte necesidades operativas en
historias testeables. No actúes como Scrum Master ni estimes en sprints.

Contexto: Sigemad MPA V2. Ficha R-001 aprobada. Roles de sistema:
Administrador, Técnico, Practicante. Personas P1–P5 en
documents/01_requisitos/historias_usuario/personas.md. Módulos: AUTH, CFG,
INV, FIC, MNT, DSH, ML, RPT. El software ya existe en incrementos 1–7; el
catálogo debe reflejar el producto real (v0.9.x), no un backlog imaginario.
Metodología Prompt-Centered SDLC v1.2: épicas e incrementos, no sprints.

Objetivo: Un catálogo de historias con criterios de aceptación verificables
y una matriz historia → incremento → versión → módulo.

Tarea:
1. Agrupar necesidades en 8 épicas (EP-01 a EP-08) alineadas a los módulos.
2. Redactar cada historia como: Como [rol], quiero [acción], para [beneficio].
3. Asignar ID HU-{EPICA}-{NNN}, prioridad, incremento de implementación,
   estado y personas impactadas.
4. Añadir criterios de aceptación en lista verificable (checkbox).
5. Generar matriz de trazabilidad: ID, épica, estado, incremento, módulo UI,
   API principal.

Entradas disponibles:
- Ficha R-001 (alcance y fuera de alcance).
- Personas.md (P1 administrador, P2 técnico, P3 jefe de área, P4 perfil ML,
  P5 practicante / carga).
- Incrementos documentados en documents/03_implementacion/incrementos/.
- Comportamiento real de rutas /v2/* y API /api/v2/*.

Formato de salida:
- Archivo historias_por_epica.md con encabezado por épica y bloque por HU.
- IDs HU-AUTH-001 … HU-RPT-00N.
- Tabla por historia: prioridad, incremento, estado, personas.
- Criterios de aceptación como checkboxes observables (UI, API, mensaje,
  persistencia).
- matriz_trazabilidad.md: por incremento y matriz completa.

Restricciones técnicas:
- Historias pequeñas y verificables; no “el sistema de inventario completo”.
- No usar sprint, story points ni Product Backlog como unidad de plan.
- Vincular a versión semántica (0.2.0 … 0.9.1) cuando la entrega exista.
- ML opcional: las HU-ML deben admitir degradación si FastAPI no responde.
- No inventar portal ciudadano ni SIGA/SIAF.
- Código patrimonial de 12 dígitos donde aplique inventario.

Criterios de aceptación:
- Toda HU tiene al menos dos criterios observables.
- Toda HU implementada apunta a incremento o versión.
- Cobertura de las 8 épicas del producto.
- Un tester puede ejecutar los criterios sin leer el código fuente.

Proceso sugerido: 1) recorrer módulos del código y de la ficha, 2) redactar
HU por capacidad de usuario, 3) pegar criterios a pantallas/endpoints, 4)
llenar la matriz, 5) marcar huecos como pendiente (no inventar implementado).

No hacer: no convertir una épica en una sola HU; no copiar criterios vagos
(“el sistema debe ser amigable”); no numerar HU por sprint.

Ejemplos (patrón few-shot del propio catálogo):

Como usuario del sistema, quiero ingresar con usuario y contraseña, para
acceder de forma segura a los módulos de gestión.
Criterios:
- El formulario valida campos obligatorios.
- Credenciales correctas redirigen a /v2/dashboard.
- Credenciales incorrectas muestran error sin filtrar si el usuario existe.
- El JWT se envía en peticiones posteriores.
```

### Checklist D1

- [x] Rol definido
- [x] Contexto (ficha + módulos + no Scrum)
- [x] Tarea verificable
- [x] Formato `HU-{EPICA}-{NNN}`
- [x] Restricciones
- [x] Ejemplo few-shot
- [x] Criterios de aceptación
- [x] Prohibiciones

---

## Resultado

| Artefacto | Ubicación | Commit |
|-----------|-----------|--------|
| Catálogo | `documents/01_requisitos/historias_usuario/historias_por_epica.md` | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) |
| Matriz | `documents/01_requisitos/historias_usuario/matriz_trazabilidad.md` | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) |
| Índice de la fase | `documents/01_requisitos/historias_usuario/README.md` | [5cd92d1](https://github.com/AxlTech25/Gestion-MPA/commit/5cd92d1) |

Salida usada como entrada de **D-001**, **D-002** e implementación (I-001…I-009).

---

## Evaluación D2

| Campo | Valor |
|-------|-------|
| **Medición** | 56 historias en 8 épicas; todas marcadas implementadas en catálogo v0.9.0 / matriz 0.9.1. Completitud documental ≥ 90 % de ítems de la plantilla 10.2 (falta Gherkin formal Dado/Cuando/Entonces; se usó checkbox). |
| **N.º de iteraciones** | No registrado en origen. El catálogo absorbió HU posteriores (AUTH-005, CFG-006, INV-004 en 0.9.1). |
| **Diagnóstico** | El registro v1 pedía “prioridad, incremento, estado” pero no **entradas** (ficha R-001) ni **no hacer** (sprint). El formato Gherkin de la guía se sustituyó por checkboxes; es una desviación consciente, no un olvido. |
| **Refinamiento v1.1** | Anatomía D1 completa + lección sobre Gherkin vs checkbox. No se reescribió el catálogo. |
| **Decisión** | **Aprobado.** Las historias son requisitos SDLC, no backlog Scrum. |
| **Lección** | Si el código ya existe, anclar cada HU a incremento/versión evita un catálogo “deseado” que no coincide con el producto. Gherkin queda como mejora de oleada 3, no como bloqueo. |

### Checklist D2

- [x] Revisión humana
- [x] Documento completo y usable en pruebas
- [x] Trazabilidad historia → incremento → módulo
- [x] Prompt y métrica registrados (v1.1)

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior** | R-001 ficha + personas.md |
| **Fase siguiente** | D-001 / D-002; cobertura de pruebas en T-001 |
| **Matriz doble entrada** | Documentación de fase requisitos |
| **Commit sugerido** | `docs(requisitos): catálogo HU por épica [R-002]` |
