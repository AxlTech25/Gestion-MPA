# Metodología — Prompt-Centered SDLC v1.2

**Estado:** propuesta en validación (no es un estándar cerrado)  
**Caso de estudio:** Sigemad MPA V2  
**Qué se pone a prueba:** sustituir Scrum (sprints, ceremonias y roles asociados) por un ciclo de vida centrado en prompts, porque la IA comprime el tiempo de implementación  
**Corpus:** [desarrollo_softwareIA/](./desarrollo_softwareIA/)

---

## 1. Qué estamos proponiendo

Prompt-Centered SDLC v1.2 es una **metodología de trabajo en elaboración**. Se propone como alternativa a Scrum cuando el equipo usa IA generativa de forma sistemática: el cuello de botella deja de ser “cuántas historias caben en dos semanas” y pasa a ser **qué se pide a la IA, cómo se revisa y cómo se verifica**.

Sigemad MPA no es solo el producto institucional; es el **software con el que se está validando** esa propuesta. Por eso la documentación, los incrementos y el repositorio de prompts pueden tener huecos, inconsistencias o prácticas mejorables: forman parte del experimento, no de un marco ya cerrado.

La hipótesis de trabajo es:

> Si la IA genera requisitos, diseño, código, pruebas y documentación en una fracción del tiempo humano, el sprint Scrum (caja de tiempo + ceremonias diseñadas para ritmo humano) deja de ser la unidad útil. La unidad útil es el **prompt versionado** dentro de una **fase del SDLC**, con revisión humana y evidencia de calidad.

## 2. Por qué Scrum queda corto con IA

Scrum organiza el trabajo en sprints de duración fija, backlog, Daily, Planning, Review y Retrospectiva. Eso encaja cuando **personas** implementan la mayor parte del código.

Con IA ocurre lo contrario, y la literatura del corpus lo señala:

| Limitación de Scrum en este contexto | Qué cambia con IA |
|--------------------------------------|-------------------|
| El sprint dimensiona capacidad humana de implementación | La generación de código y documentos se comprime; Hymel (AI-Native SDLC / V-Bounce) describe un “rebote” en la base de la V: se pasa poco tiempo implementando y más tiempo especificando y validando |
| Ceremonias asumen coordinación de implementadores | El rol humano se desplaza a **verificar** salidas de modelos (Hymel; Shrivastava et al., 2025) |
| El backlog de sprint es la traza principal | La traza útil es **prompt → artefacto → métrica → decisión**, reutilizable entre fases |
| Historias “estimables en un sprint” | Una historia puede cerrarse en horas si el prompt y la revisión están bien definidos; estimar en sprints subutiliza la IA o inventa ritmo artificial |

No se niega el valor de Scrum en equipos sin IA o con IA ocasional. Se sostiene que **no es el mejor contenedor** cuando la IA es el motor de implementación.

Se conservan, en cambio, las **fases clásicas del SDLC** (requisitos, diseño, implementación, pruebas, mantenimiento), que Yas, Alazzawi y Rahmatullah (2023) recuerdan como estructura común a modelos tradicionales y ágiles. La IA se aplica **dentro** de esas fases, no en lugar de ellas.

## 3. Fundamento (estado del arte)

Fuentes en [desarrollo_softwareIA/](./desarrollo_softwareIA/). Síntesis usada en esta propuesta:

1. **SDLC como esqueleto** — Yas et al. (2023): no hay un modelo universal; sí hay fases estables donde se puede insertar IA (requisitos, diseño, código, pruebas, mantenimiento).
2. **IA transversal al ciclo** — Shrivastava et al. (2025): GenAI en planificación, codificación, pruebas, CI/CD y documentación; el valor depende de la **ingeniería de prompts** y de la supervisión humana (seguridad, sesgos, propiedad intelectual).
3. **Ingeniería, no solo el chat** — Huyen (2025): evaluación, guardrails y revisión continua; el software con modelos no se valida igual que el software determinista.
4. **DevOps / pruebas / operación** — Krishna y Meda (2024): la IA también entra en testing, SRE y operación, no solo en el IDE.
5. **Obstáculos reales** — Paladino y Pons (2025): integrar IA en el SDLC tiene barreras (calidad, gobernanza, adopción); hace falta estrategia, no solo herramientas.
6. **SDLC nativo de IA** — Hymel: el ciclo debe rediseñarse; implementación casi instantánea; humanos como validadores; el V-Bounce comprime la fase de código y acelera lo que en ágil serían ciclos de sprint.

Prompt-Centered SDLC toma de (1) las fases, de (2)–(3) el prompt y la gobernanza, y de (6) el argumento de que **el sprint ya no calibra el trabajo**.

## 4. Cómo funciona la propuesta

Cada fase del ciclo produce artefactos **y**, cuando hay IA, un **registro de prompt** (código, versión, resultado, métrica, decisión). El humano no “hace el sprint”: **aprueba o rechaza** la salida y pide refinamiento (bucle input → generación → revisión → refinamiento → aprobación), cercano al V-Bounce.

| Fase | Código | Qué se le pide a la IA | Qué debe hacer el humano |
|------|--------|------------------------|---------------------------|
| Requisitos | R | Ficha, historias, ambigüedades | Confirmar alcance y criterios de aceptación |
| Diseño | D | Arquitectura, ADR, esquema | Aceptar o corregir decisiones técnicas |
| Implementación | I | Código, migraciones, UI | Revisar, integrar, no copiar a ciegas |
| Pruebas | T | Casos, planes, scripts | Ejecutar, interpretar fallos, cubrir riesgos |
| Mantenimiento | M | Despliegue, rollback, operación | Verificar entorno real y secretos |

Repositorio: [`prompts/`](../prompts/).  
Política: [`prompts/gobernanza/politicas_uso_ia.md`](../prompts/gobernanza/politicas_uso_ia.md).

Las **historias de usuario** se mantienen como técnica de requisitos (`Como… quiero… para…`), no como artefacto Scrum. Se trazan a incrementos y versiones en la [matriz](./01_requisitos/historias_usuario/matriz_trazabilidad.md).

## 5. Cómo se validó hasta ahora en este software

En Sigemad las entregas que antes se habrían llamado sprints se documentan como **incrementos** de la fase de implementación: la IA permitió cerrar módulos completos sin una caja de dos semanas como unidad de planificación.

| Incremento | Versión | Alcance |
|------------|---------|---------|
| 1 | 0.1.0 | Cimientos, arquitectura y esquema V2 |
| 2 | 0.2.0 | Inventario |
| 3 | 0.3.0 | Fichas y mantenimiento |
| 4 | 0.4.0 | Reportes PDF y filtros |
| 5 | 0.5.0 | Configuración organizacional |
| 6 | 0.6.0–0.7.0 | Auth JWT, dashboard y microservicio ML |
| 7 | 0.8.0–0.9.0 | Telemetría, mantenimiento estructurado y ficha predictiva |

Índice del repositorio: [README.md](./README.md).  
Incrementos: [03_implementacion/incrementos/](./03_implementacion/incrementos/).  
Trazabilidad de mantenimiento (prompt → commit GitHub → archivo): [matriz de doble entrada](./matriz_doble_entrada/README.md).

## 6. Definition of Done (para un trabajo asistido por IA)

Un incremento o historia no se cierra solo porque “el modelo ya generó código”:

- [ ] Criterios de aceptación verificables
- [ ] Prompt (si hubo IA) versionado en `prompts/`
- [ ] Revisión humana de lo integrado
- [ ] Pruebas relevantes en verde
- [ ] Sin secretos en el repositorio
- [ ] Documentación de la fase actualizada
- [ ] ADR si cambió la arquitectura
- [ ] Trazabilidad historia → incremento → versión → módulo

## 7. Limitaciones de la propuesta y de este caso

Esto es deliberado: **validar implica encontrar fallos**.

| Hallazgo en Sigemad / en la propuesta | Mejora abierta |
|---------------------------------------|----------------|
| Parte de los prompts se documentó a posteriori; no todo el código nació con un registro R/D/I/T/M | Oleadas 1–3: mapa D3 completo (R/D/I/T/M). R-004, D-006 y M-004 se **ejecutaron** al documentar. El código de producto sigue siendo en gran parte reconstruido. Próximo cambio de código: registrar **antes** |
| Quedan nombres técnicos de la etapa Scrum (`verify_sprint6_ml.py`) | Renombrar en un incremento de higiene, sin reescribir historia |
| I-001 fue un macro-prompt; las iteraciones de origen no se midieron en caliente | Oleada 2 (2026-09-11): I-001…I-009 por incremento; macros en Superado. Medir iteraciones en el próximo cambio |
| Había un solo ADR (stack) | Oleada 3 (2026-09-11): ADR-002 degradación FastAPI. Nuevas decisiones de arquitectura → ADR, no solo `architecture.md` |
| El ML es opcional y FastAPI no es obligatorio en el servidor web | El caso no cubre un SDLC de ML en producción (ver también CRISP-ML(Q) en `metodologia CRISP_ML/`) |
| La calidad del código generado no es uniforme | Añadir linters/Sonar y no tratar el plan funcional como único filtro |
| Un solo producto municipal no generaliza la metodología | Hace falta comparar con otro caso (p. ej. SGMI) y con un equipo Scrum “clásico” |
| Riesgos de GenAI (alucinación, secretos en prompts, IP) | La política de IA existe; hay que auditar cumplimiento de forma periódica |

Métricas vivas: [`prompts/gobernanza/registro_metricas.md`](../prompts/gobernanza/registro_metricas.md).

## 8. Qué se espera demostrar con Sigemad

1. Que un sistema real (inventario, mantenimiento, ML opcional, despliegue) puede construirse y mantenerse **sin ceremonias Scrum**, usando fases SDLC + prompts.
2. Que los incrementos pueden ser **más cortos y más densos** que un sprint, porque la implementación está comprimida.
3. Que la calidad no se da por sentada: hace falta revisión humana, pruebas y registro de decisiones.
4. Qué partes de la propuesta fallan en la práctica, para corregir la v1.2 (plantillas de prompt, DoD, métricas, gobierno).

Mientras no se cierre esa evaluación, conviene citar esta metodología como **propuesta aplicada y en revisión**, no como receta normativa.
