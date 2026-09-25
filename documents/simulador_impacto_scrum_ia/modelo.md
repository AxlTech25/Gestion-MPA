# Modelo de simulación — Scrum frente a flujo IA + ISO/IEC 12207

Instrumento **didáctico**. No es una medición empírica de Sigemad ni un presupuesto de contrato. Sirve para visualizar cómo cambia el *plazo calendario* y el *coste de ingeniería* si la unidad de trabajo deja de ser el sprint y pasa a ser un flujo continuo de implementación → verificación → validación, alineado con ISO/IEC 12207 y con la propuesta Prompt-Centered SDLC v1.2.

Interfaz: [index.html](./index.html). Contexto metodológico: [../metodologia.md](../metodologia.md).

---

## 1. Hipótesis que ilustra

En Scrum el sprint (caja de dos semanas) dimensiona capacidad **humana** de implementación. Con IA sistemática, Hymel (V-Bounce) y la propuesta local sostienen que esa caja deja de calibrar el trabajo: se comprime la implementación y el esfuerzo se desplaza a verificar y validar.

El simulador compara dos *contenedores* del mismo backlog:

| Carril | Unidad de tiempo | Qué representa |
|--------|------------------|----------------|
| Scrum tradicional | Semanas / sprints de 2 semanas | Fricción de ceremonias + implementación humana |
| Flujo IA + ISO 12207 | Horas | Implementación asistida, verificación y validación en ciclo de vida |

---

## 2. Constantes del escenario didáctico

Elegidas para que el caso por defecto reproduzca la captura de referencia (40 ítems, 8 semanas, 16 h, 20×).

| Símbolo | Valor | Significado |
|---------|-------|-------------|
| `H_SEM` | 40 h | Semana laboral (5 × 8 h) |
| `H_ITEM_SCRUM` | 8 h | Un día hábil por ítem de backlog en Scrum |
| `H_ITEM_IA` | 0,4 h | 24 min por ítem en el flujo base (densidad 1×) |
| `L_SPRINT` | 2 semanas | Longitud de sprint |
| `ρ` | 1 / 2 / 3,5 | Densidad de orquestación de agentes |

La tarifa por defecto (`$65/h`) es un **coste promedio de ingeniería** ilustrativo, no un sueldo municipal.

---

## 3. Fórmulas

Sea `n` el número de ítems del backlog y `c` la tarifa horaria (USD/h).

```text
horas_scrum     = n × H_ITEM_SCRUM
semanas_scrum   = horas_scrum / H_SEM
sprints         = ceil(semanas_scrum / L_SPRINT)

horas_ia        = (n × H_ITEM_IA) / ρ
aceleracion     = horas_scrum / horas_ia          (= 20 × ρ)

coste_scrum     = horas_scrum × c
coste_ia        = horas_ia × c
ahorro          = (horas_scrum − horas_ia) × c
```

Con `n = 40`, `c = 65`, `ρ = 1`:

```text
horas_scrum   = 320 h  →  8 semanas  →  4 sprints
horas_ia      = 16 h
aceleracion   = 20×
ahorro        = 304 × 65  =  19 760 USD
```

La captura de referencia mostraba ≈ 20 484 USD. La diferencia (~724 USD, unas 11 h) se interpreta como **fricción ceremonial no modelada** (planning, daily, review, retro). Este archivo usa la fórmula transparente de arriba; el simulador puede activar un recargo ceremonial del 3,48 % sobre `horas_scrum` para reproducir esa cifra.

---

## 4. Densidad de agentes (concurrencia 12207)

No es “más programadores”. Es cuánta **orquestación concurrente** se admite entre procesos técnicos de ISO/IEC 12207 (implementación, verificación, validación) sin romper la revisión humana.

| Modo | ρ | Lectura | `horas_ia` con 40 ítems |
|------|---|---------|-------------------------|
| Estándar | 1,0 | Un hilo: implementar → verificar → validar | 16,0 h |
| Avanzado | 2,0 | Dos hilos coordinados (p. ej. implementación y verificación en paralelo sobre ítems distintos) | 8,0 h |
| Enjambre | 3,5 | Varios agentes en procesos 12207 concurrentes; el humano sigue aprobando | 4,6 h |

`aceleracion = 20 × ρ` (40× y 70× en los modos altos). Esos múltiplos son **techo didáctico**, no una promesa de throughput.

---

## 5. Reparto del flujo IA en procesos 12207

El plazo de 16 h (escenario base) se parte así, solo para animar el carril inferior:

| Tramo | Proceso 12207 (orientativo) | Peso |
|-------|-----------------------------|------|
| Implementación | Implementation process | 50 % |
| Verificación ISO | Verification process | 30 % |
| Validación ISO | Validation process | 20 % |

En Prompt-Centered SDLC esos tramos corresponden a prompts **I / T** y a la decisión D2 (aprobar / rechazar / refinar). El humano no desaparece.

---

## 6. Preset Sigemad MPA (ilustrativo)

| Dato del caso | Valor usado en el preset |
|---------------|--------------------------|
| Historias (Anexo 7) | 56 ítems |
| Incrementos de implementación | 9 (I-001 … I-009; 0.1.0–0.9.1) |
| Tarifa | 65 USD/h (misma hipótesis didáctica) |
| Densidad | 1× (asistido; revisión humana obligatoria, nivel N2) |

Con las mismas constantes: 11,2 semanas Scrum frente a 22,4 h de flujo IA, aceleración 20×, ahorro `(448 − 22,4) × 65 = 27 664 USD`. Eso **no** afirma que Sigemad se construyó en 22 horas: los incrementos reales incluyeron elicitación, diseño, pruebas y documentación a posteriori.

---

## 7. Lo que el modelo no cubre

- Calidad, alucinación, retrabajo de prompts ni deuda técnica.
- Coste de licencias de IA, tokens ni hardware.
- Tamaño de equipo, vacaciones ni calendario municipal.
- Procesos 12207 de acuerdo, oferta, operación o retiro.
- Generalización a otro producto (p. ej. SGMI) sin repetir el experimento.

Citar en tesis como **simulación de sensibilidad**, no como resultado de campo.
