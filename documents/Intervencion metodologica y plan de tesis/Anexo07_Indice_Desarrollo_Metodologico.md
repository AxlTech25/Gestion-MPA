# Anexo 07. Desarrollo metodológico

**Tesis:** Estrada Flores, Axel Sebastián — Ingeniería de Sistemas e Informática, Universidad Continental  
**Caso:** Sigemad MPA V2 — Municipalidad Provincial de Acobamba  
**Metodología aplicada:** Prompt-Centered SDLC v1.2 (Rojas Camayo)  
**Fuente del índice:** `Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC.docx`  
**Documento:** el Word ya tiene prosa de trabajo (pasada sin 3.4/3.5). Macroprocesos y Bizagi se rellenan después.  
**Plantilla Word (guía + tablas y figuras):** [Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC.docx](./Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC.docx)  
**Solo indicaciones (respaldo):** [Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC_solo_indicaciones.docx](./Anexo7_Intervencion_Metodologica_Prompt_Centered_SDLC_solo_indicaciones.docx)  
**Plantillas en Markdown:** [Anexo07_Plantillas_Figuras_Tablas.md](./Anexo07_Plantillas_Figuras_Tablas.md)

Este anexo documenta la **intervención metodológica** (cómo se desarrolló el sistema con prompts versionados). No sustituye el Capítulo III (método de investigación) ni el Capítulo IV (resultados estadísticos). Alimenta el § 4.1 *Resumen de resultados de intervención metodológica*.

---

## Índice

### A7.1 Introducción a la intervención metodológica

- **A7.1.1** Propósito de este anexo
- **A7.1.2** Objetivos de la intervención
  - A7.1.2.1 Objetivo general
  - A7.1.2.2 Objetivos específicos
- **A7.1.3** Alcance
- **A7.1.4** Marco metodológico de referencia (dimensiones D1–D5)

*Visuales:* Figura A7-1 (cadena de la intervención), Figura A7-2 (D1–D5), Tabla A7-1 (objetivos × evidencia).

### A7.2 Justificación de la elección del Prompt-Centered SDLC

- **A7.2.1** Problema metodológico
- **A7.2.2** Posicionamiento frente a estándares
  - A7.2.2.1 ISO 9001
  - A7.2.2.2 ISO/IEC 25000
  - A7.2.2.3 ISO/IEC/IEEE 29119-2
- **A7.2.3** Posicionamiento frente a la literatura de IA en el SDLC
  - A7.2.3.1 Yas, Alazzawi y Rahmatullah (2023): esqueleto del SDLC
  - A7.2.3.2 Paladino y Pons (2025): IA en el ciclo, con barreras
  - A7.2.3.3 Hymel: el sprint deja de calibrar
  - A7.2.3.4 Wang et al.: calidad del prompt y seguridad del código
  - A7.2.3.5 Esposito et al. (2026): GenAI en arquitectura y evaluación
  - A7.2.3.6 Síntesis
- **A7.2.4** Aporte diferencial del Prompt-Centered SDLC
- **A7.2.5** Alineación con los objetivos de la tesis

*Visuales:* Tabla A7-2 (Scrum vs Prompt-Centered), Tabla A7-3 (fases × ISO 25000), Tabla A7-4 (literatura: aporta / no cubre / brecha).

### A7.3 Descripción del proyecto de software y de los procesos institucionales

- **A7.3.1** Ficha del proyecto
- **A7.3.2** Contexto y restricciones
- **A7.3.3** Justificación del caso
- **A7.3.4** Identificación de procesos (macroprocesos y procedimientos)
- **A7.3.5** Diagrama de procesos (BIZAGI)

> A7.3.4 y A7.3.5 usan el inventario de macroprocesos y los BPMN ya elaborados. En el cuerpo van las tablas y 2–4 figuras; los archivos fuente van al Apéndice G.

*Visuales:* Tabla A7-5 (ficha), Tabla A7-6 (macroprocesos–procedimientos), Figura A7-3 (jerarquía de procesos), Figuras A7-4 y A7-5 (BPMN as-is / to-be).

### A7.4 Preparación y entrada mínima del proyecto

- **A7.4.1** Política mínima de uso de IA
- **A7.4.2** Repositorio de prompts
- **A7.4.3** Definition of Done ampliada
- **A7.4.4** Herramientas y modelos de IA

*Visuales:* Figura A7-6 (árbol `prompts/`), Tabla A7-7 (DoD), Tabla A7-8 (herramienta × fase).

### A7.5 Aplicación por fases del SDLC

En cada fase: objetivo, entradas, técnicas de prompting, prompts ejecutados, evaluación D2, entregables.

- **A7.5.1** Fase de requisitos (R-001 … R-005)
  - A7.5.1.1 Objetivo
  - A7.5.1.2 Entradas (incluye el mapa de procesos de A7.3.4–A7.3.5)
  - A7.5.1.3 Técnicas de prompting
  - A7.5.1.4 Prompts ejecutados
  - A7.5.1.5 Evaluación D2
  - A7.5.1.6 Entregables
- **A7.5.2** Fase de diseño (D-001 … D-006)
  - A7.5.2.1 Objetivo
  - A7.5.2.2 Entradas
  - A7.5.2.3 Técnicas de prompting
  - A7.5.2.4 Prompts ejecutados
  - A7.5.2.5 ADR
  - A7.5.2.6 Evaluación D2
  - A7.5.2.7 Entregables
- **A7.5.3** Fase de implementación (I-001 … I-009)
  - A7.5.3.1 Objetivo
  - A7.5.3.2 Entradas
  - A7.5.3.3 Técnicas de prompting
  - A7.5.3.4 Prompts ejecutados (un prompt ≈ un incremento)
  - A7.5.3.5 Evaluación D2
  - A7.5.3.6 Entregables
- **A7.5.4** Fase de pruebas (T-001 … T-005)
  - A7.5.4.1 Objetivo
  - A7.5.4.2 Entradas
  - A7.5.4.3 Técnicas de prompting
  - A7.5.4.4 Prompts ejecutados
  - A7.5.4.5 Evaluación D2
  - A7.5.4.6 Entregables
- **A7.5.5** Fase de mantenimiento y despliegue (M-001 … M-004)
  - A7.5.5.1 Objetivo
  - A7.5.5.2 Entradas
  - A7.5.5.3 Prompts ejecutados
  - A7.5.5.4 Plan de despliegue y rollback
  - A7.5.5.5 Evaluación D2 y cierre
  - A7.5.5.6 Entregables

*Visuales:* Figura A7-7 (ciclo R–D–I–T–M con códigos), Figura A7-8 (línea de incrementos), Tablas A7-9 a A7-13 (una por fase: prompt × técnica × output × decisión D2), Tabla A7-14 (incremento × versión × SHA).

### A7.6 Evaluación, refinamiento y versionado de prompts (D2)

- **A7.6.1** Ciclo D2 aplicado
- **A7.6.2** Registro de versiones
- **A7.6.3** Ejemplo de refinamiento

*Visuales:* Figura A7-9 (ciclo D2), Tabla A7-15 (registro de versiones), Figura A7-10 o tabla antes/después del macro I-001.

### A7.7 Matriz de doble entrada: trazabilidad de funciones y prompts

- **A7.7.1** Propósito de la matriz
- **A7.7.2** Fundamento teórico
- **A7.7.3** Estructura de la matriz
- **A7.7.4** Aplicación de la matriz en este caso
- **A7.7.5** Uso de la matriz para mantenimiento
- **A7.7.6** Evidencia adjunta

*Visuales:* Figura A7-11 (prompt → commit → archivo), Tabla A7-16 (extracto F-001…F-008). Excel completo = Apéndice A.

### A7.8 Nivel de automatización agentica alcanzado

- **A7.8.1** Nivel alcanzado
- **A7.8.2** Justificación de no avanzar a niveles superiores
- **A7.8.3** Reglas de control

*Visuales:* Figura A7-12 (escala N1–N5 con marca en N2), Tabla A7-17 (reglas de control).

### A7.9 Seguridad, gobernanza y monitoreo

- **A7.9.1** Guardrails en los prompts
- **A7.9.2** Monitoreo
- **A7.9.3** Cumplimiento de la política de uso de IA

*Visuales:* Tabla A7-18 (riesgo × guardrail × control posterior).

### A7.10 Trazabilidad de artefactos (síntesis)

*Visuales:* Figura A7-13 o Tabla A7-19 (HU → prompt → diseño → código → test → versión).

### A7.11 Métricas de proceso de la intervención

*Visuales:* Tabla A7-20 (tablero de indicadores), Figura A7-14 (prompts vigentes por fase). Sin gráficos de hipótesis (eso es Cap. IV).

### A7.12 Lecciones aprendidas de la intervención

*Visuales:* Tabla A7-21 (hallazgo × mejora abierta).

### A7.13 Cierre del anexo

### A7.14 Referencias utilizadas en este anexo

- **A7.14.1** Estándares y normas
- **A7.14.2** Metodología propia
- **A7.14.3** Artículos sobre metodologías o enfoques con IA en el SDLC
- **A7.14.4** Fuentes de la matriz de doble entrada
- **A7.14.5** Libros y otras fuentes

### Apéndices del Anexo 07

- **Apéndice A.** Matriz de doble entrada (Excel / tablas)
- **Apéndice B.** Catálogo de prompts versionados
- **Apéndice C.** Outputs representativos
- **Apéndice D.** Checklists D1/D2
- **Apéndice E.** Reportes de cobertura / pruebas
- **Apéndice F.** Evidencias de revisión y despliegue
- **Apéndice G.** Macroprocesos, procedimientos y diagramas BIZAGI (BPMN)

---

## Figuras y tablas propuestas (dónde y para qué)

Numeración tentativa del anexo (`Figura A7-n`, `Tabla A7-n`). Al pasar a Word se renumeran con el estilo Continental. **Prioridad alta** = conviene sí o sí en la defensa; **media** = mejora la lectura; **baja** = solo si no satura.

### Mapa por apartado

| Dónde | Tipo | Título tentativo | Para qué sirve | Prioridad |
|-------|------|------------------|----------------|-----------|
| A7.1.1 | Figura A7-1 | Cadena de la intervención: prompt → artefacto → métrica → decisión | Explica en una vista qué se está documentando | Alta |
| A7.1.4 | Figura A7-2 | Dimensiones D1–D5 y evidencia generada en Sigemad | Ancla el marco antes de entrar al caso | Alta |
| A7.1.2 | Tabla A7-1 | Objetivos específicos de la intervención × sección donde se evidencian | Evita que el anexo se lea como un diario de prompts | Alta |
| A7.2.1 | Tabla A7-2 | Limitación de Scrum vs qué cambia con IA (Prompt-Centered) | Justifica por qué no se usó sprint | Alta |
| A7.2.2 | Tabla A7-3 | Fase R/D/I/T/M × característica ISO/IEC 25000 (adecuación funcional, mantenibilidad, eficiencia) | Ancla la calidad del producto en SQuaRE, con tres características retenidas | Alta |
| A7.2.3 | Tabla A7-4 | Cinco fuentes del corpus: aporta / no cubre / brecha que cierra esta propuesta | Sustituye páginas de paráfrasis; ancla D1–D5 | Alta |
| A7.3.1 | Tabla A7-5 | Ficha del proyecto Sigemad MPA V2 | Identidad del caso en una página | Alta |
| A7.3.4 | Tabla A7-6 | Macroproceso → proceso → procedimiento → responsable → ¿automatizado en Sigemad? | Es el entregable que Continental pide como “identificación de procesos” | Alta |
| A7.3.4 | Figura A7-3 | Jerarquía de procesos (macro → proceso → procedimiento) | Se lee más rápido que la tabla sola | Media |
| A7.3.5 | Figura A7-4 | BPMN as-is (Bizagi): gestión actual | Diagnóstico institucional | Alta |
| A7.3.5 | Figura A7-5 | BPMN to-be (Bizagi): flujo Sigemad | Contraste con el sistema construido | Alta |
| A7.3.5 | Figura (opc.) | Un procedimiento representativo (p. ej. registrar intervención) | Detalle operativo; si hay muchos, el resto al Apéndice G | Media |
| A7.4.2 | Figura A7-6 | Árbol del repositorio `prompts/` | Demuestra gobernanza, no chats sueltos | Alta |
| A7.4.3 | Tabla A7-7 | Definition of Done ampliada (asistido por IA) | Criterio de cierre auditable | Alta |
| A7.4.4 | Tabla A7-8 | Herramienta / modelo × fase en que se usó | Transparencia metodológica | Media |
| A7.5 (apertura) | Figura A7-7 | Ciclo R–D–I–T–M con códigos de prompt vigentes | Mapa de toda la aplicación | Alta |
| A7.5.3 | Figura A7-8 | Línea de incrementos 0.1.0–0.9.1 | Sustituye la idea de “sprints” | Alta |
| A7.5.1 | Tabla A7-9 | Requisitos: prompt × técnica × output × decisión D2 | Evidencia de fase, no el texto completo del prompt | Alta |
| A7.5.2 | Tabla A7-10 | Diseño: igual esquema (+ columna ADR) | Idem | Alta |
| A7.5.3 | Tabla A7-11 | Implementación: prompt × incremento × versión | Un I-\* ≈ un incremento | Alta |
| A7.5.3 | Tabla A7-14 | Incremento × versión × SHA × módulo | Puente con GitHub y con A7.7 | Alta |
| A7.5.4 | Tabla A7-12 | Pruebas: prompt × runner × entregable | Separa plan humano de asserts | Media |
| A7.5.5 | Tabla A7-13 | Mantenimiento: prompt × entregable (producción, rollback) | Cierra el ciclo de vida | Media |
| A7.6.1 | Figura A7-9 | Ciclo D2: medición → diagnóstico → refinamiento → decisión | El evaluador entiende D2 en 10 segundos | Alta |
| A7.6.2 | Tabla A7-15 | Extracto del registro de versiones (código, fase, métrica, decisión) | Sale de `registro_metricas.md` | Alta |
| A7.6.3 | Figura o tabla A7-10 | Antes / después: I-001-MACRO → I-001…I-009 (o I-002 vs I-002-ML) | Único ejemplo de refinamiento; no hace falta diez | Alta |
| A7.7.1 | Figura A7-11 | Cadena prompt versionado → commit GitHub → archivo en ese SHA | Es el argumento de la matriz | Alta |
| A7.7.4 | Tabla A7-16 | Extracto F-001…F-008 (función, prompt, commit, archivo) | Cuerpo del anexo; Excel completo al Apéndice A | Alta |
| A7.8.1 | Figura A7-12 | Escala N1–N5 con marca en N2 | Evita un párrafo abstracto sobre “agentic” | Alta |
| A7.8.3 | Tabla A7-17 | Reglas de control (revisión humana, no secretos, criterio de parada) | Justifica no subir a N4–N5 | Media |
| A7.9.1 | Tabla A7-18 | Riesgo GenAI × guardrail en el prompt × control posterior | Gobernanza visible | Alta |
| A7.10 | Figura A7-13 o Tabla A7-19 | HU → prompt → diseño → código → test → versión | Síntesis de una página para el jurado | Alta |
| A7.11 | Tabla A7-20 | Tablero de métricas de *proceso* (29 prompts, 7 incrementos, oleadas) | Solo proceso; nada inferencial | Alta |
| A7.11 | Figura A7-14 | Barras: prompts vigentes por fase (R/D/I/T/M) | Lectura inmediata de cobertura D3 | Media |
| A7.12 | Tabla A7-21 | Hallazgo en Sigemad × mejora abierta | Honestidad metodológica (reconstrucción, un solo caso) | Alta |

### Qué no graficar aquí

- Histogramas, SPSS, contrastación de hipótesis, Accuracy/F1 como “resultado de tesis” → **Capítulo IV**.
- ER, MVC, pantallas del sistema como diseño de software → informe de diseño / cuerpo técnico, no este anexo (salvo 1 captura de evidencia en Apéndice C).
- Los 29 prompts enteros ni el Excel de 8 hojas → **apéndices**.
- Más de 4 BPMN en el cuerpo: el resto al **Apéndice G**.

### Cómo usarlos al redactar

1. Cada figura o tabla se cita en el párrafo anterior (“como se observa en la Figura A7-n”).
2. Título descriptivo + fuente (elaboración propia / Bizagi / repositorio / Amaro–Jiang).
3. En A7.5, las cinco tablas de fase pueden compartir las mismas columnas para que el anexo se sienta sistemático.

---

## Límites de este anexo

| Va en el Anexo 07 | No va en el Anexo 07 |
|-------------------|----------------------|
| Aplicación del Prompt-Centered SDLC, prompts, D2, incrementos, matriz, procesos y BPMN | Capítulo III (tipo de investigación, población, instrumentos) |
| Métricas de *proceso* (n.º de prompts, iteraciones, DoD) | Contrastación de hipótesis y estadística inferencial (Cap. IV) |
| Figuras BPMN y tablas de procesos | Conclusiones y recomendaciones generales de la tesis |
| Trazabilidad HU → prompt → commit | Historial de chats; el registro es la instrucción reejecutable |

---

## Mapa rápido de evidencias (para cuando se redacte el cuerpo)

| Apartado | Evidencia principal en el repositorio |
|----------|----------------------------------------|
| A7.1 / A7.2 | `documents/metodologia.md`, corpus `documents/desarrollo_softwareIA/` |
| A7.3.1–A7.3.3 | `documents/01_requisitos/ficha-proyecto.md`, ADR-001, ADR-002 |
| A7.3.4–A7.3.5 | Macroprocesos y BPMN ya elaborados (incorporar al Apéndice G) |
| A7.4 | `prompts/gobernanza/politicas_uso_ia.md`, `catalogo.md` |
| A7.5.1 | R-001 … R-005 |
| A7.5.2 | D-001 … D-006 |
| A7.5.3 | I-001 … I-009 e incrementos 0.1.0–0.9.1 |
| A7.5.4 | T-001 … T-005 |
| A7.5.5 | M-001 … M-004 |
| A7.6 / A7.11 | `prompts/gobernanza/registro_metricas.md` |
| A7.7 / A7.10 | `documents/matriz_doble_entrada/` |
