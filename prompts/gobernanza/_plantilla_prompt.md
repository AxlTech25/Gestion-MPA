# Plantilla maestra de registro de prompt

**Fuente:** Prompt-Centered SDLC v1.2, cap. 3 (anatomía D1) y cap. 6 (ciclo D2).  
**Uso:** copiar este archivo, renombrar `{FASE}-{NNN}_{slug}_v1.md` y completar todos los bloques. No dejar secciones vacías: si no aplica, escribir `N/A` y por qué.

Un registro no es el historial de un chat. Es la instrucción de ingeniería que un humano puede reejecutar, evaluar y aprobar.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **Código** | `{R\|D\|I\|T\|M}-NNN` |
| **Título** | |
| **Fase** | Requisitos / Diseño / Implementación / Pruebas / Mantenimiento |
| **Versión del prompt** | v1 |
| **Versión del registro** | v1 |
| **Estado** | Borrador / Ejecutado / Reconstruido a posteriori / Aprobado / Rechazado / Superado |
| **Modelo** | Cursor Agent / otro — fecha |
| **Técnica** | Zero-shot / Few-shot / CoT guiado / Tree-of-Thought / RAG / Agentico |
| **Autor** | Quién ejecutó |
| **Revisor** | Quién aprobó (obligatorio antes de integrar código) |
| **Fecha de ejecución** | YYYY-MM-DD |
| **Incremento / versión producto** | p. ej. Incremento 2 / 0.2.0 |
| **Historias o ADR relacionados** | HU-… / ADR-… |

**Estados permitidos**

- **Ejecutado:** el prompt se escribió antes o durante el cambio.
- **Reconstruido a posteriori:** el artefacto ya existía; el registro se armó después (limitación conocida del caso Sigemad).
- **Aprobado:** revisión humana + evidencia D2.
- **Superado:** una versión posterior o un prompt más fino lo reemplaza (no borrar el archivo).

---

## Prompt (anatomía D1)

Pegar aquí el texto que se envió al modelo, con estos bloques. La guía exige los seis primeros; los cuatro siguientes evitan alucinación y recortes tardíos.

```text
Rol: Actúa como [perfil experto requerido].

Contexto: [sistema, stack, dominio, restricciones del proyecto, estado actual].

Objetivo: [resultado de esta fase del SDLC].

Tarea: [acción concreta, verificable y acotada].

Entradas disponibles: [requisitos, código, diagrama, issue, criterios, logs].

Formato de salida: [tabla, código, Mermaid, Gherkin, informe, rutas de archivo].

Restricciones técnicas: [lenguaje, versión, patrones, seguridad, convenciones].

Criterios de aceptación: [condiciones observables para aprobar la respuesta].

Proceso sugerido: [analiza → identifica riesgos → propone → justifica → genera → valida].

No hacer: [suposiciones prohibidas, dependencias no autorizadas, secretos, reescrituras totales].

Ejemplos: [few-shot si hay patrón del proyecto; si no, N/A].
```

### Checklist D1 (cap. 11.1) — prompt listo para ejecutar

- [ ] El rol del LLM está definido.
- [ ] El contexto del sistema es suficiente (no “este sistema” sin más).
- [ ] La tarea es específica y verificable.
- [ ] El formato de salida está definido.
- [ ] Hay restricciones técnicas y de seguridad.
- [ ] Hay ejemplos si la tarea tiene patrón repetible.
- [ ] Hay criterios de aceptación observables.
- [ ] Se prohibieron acciones riesgosas o supuestos no autorizados.

---

## Resultado

| Artefacto | Ubicación | Commit (si aplica) |
|-----------|-----------|--------------------|
| | | |

Salida usada como entrada de la fase siguiente: [enlace].

---

## Evaluación D2 (cap. 6)

| Campo | Valor |
|-------|-------|
| **Medición** | Tests, checklist, cobertura, revisión de completitud, SAST… |
| **N.º de iteraciones** | 1 = aprobado al primer output |
| **Diagnóstico** | Si hubo desvío: ¿falló rol, contexto, tarea, formato, restricción, ejemplo o faltó dato? |
| **Refinamiento** | Qué se cambió en v1.1 / v2. Enlace al archivo `*_v2_refinado.md` si existe |
| **Decisión** | Aprobado / Refinado / Rechazado / Dividir tarea |
| **Lección** | Aprendizaje reutilizable para el siguiente prompt |

### Checklist D2 (cap. 11.2) — output listo para aprobar

- [ ] Revisión humana por una persona competente.
- [ ] El código compila o el documento está completo.
- [ ] Se ejecutaron pruebas relevantes (o el plan es ejecutable).
- [ ] No hay secretos ni vulnerabilidades críticas conocidas.
- [ ] Las decisiones técnicas están justificadas (ADR si cambió arquitectura).
- [ ] Se registró código, versión y métrica.
- [ ] La salida puede usarse como entrada de la siguiente fase.

### Plantilla de refinamiento (si la decisión no es “Aprobado”)

```text
Prompt original: [código y versión]
Resultado observado: [qué falló o quedó incompleto]
Evidencia: [test fallido, error, métrica, feedback]
Diagnóstico: [elemento D1 que causó el desvío]
Nuevo prompt: [versión refinada o decisión de dividir la tarea]
Criterio para cerrar: [condición observable]
Decisión final: [aprobado / otra iteración / dividir / rechazar]
```

---

## Trazabilidad

| Relación | Valor |
|----------|-------|
| **Fase anterior (entrada)** | p. ej. R-002 → este D-001 |
| **Fase siguiente (salida)** | p. ej. este I-006 → T-001 |
| **Matriz doble entrada** | Función F-NNN / módulo |
| **Mensaje de commit sugerido** | `feat(modulo): resumen [I-00N]` |

---

## Reglas de granularidad (Sigemad)

1. Un registro = un entregable que un humano puede aprobar en una pasada.
2. No crear un prompt por cada historia de usuario.
3. En implementación, el corte es el **incremento** (I-001…I-009). No reabrir los macros Superados.
4. Versionar el prompt que funcionó; no volcar el chat completo.
5. Si el artefacto nació sin registro, marcarlo **Reconstruido a posteriori** — no fingir fecha de ejecución.
