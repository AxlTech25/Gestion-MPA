# Guía de uso — Simulador Scrum vs SDLC + ISO 12207

Guía para abrir y usar esta carpeta en una **laptop** (Windows, macOS o Linux). No instala nada: son páginas HTML que se abren en el navegador.

**Qué es:** un instrumento **didáctico**. Compara el ciclo Scrum tradicional (semanas) con un flujo de ciclo de vida (SDLC) alineado a ISO/IEC 12207 y asistido por IA (horas).

**Qué no es:** no es una medición real de un proyecto ni un presupuesto de contrato.

---

## 1. Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---------|----------------|
| `simulador_metodologia.html` | Ver **cómo fluye** cada metodología (ceremonias Scrum vs fases R–D–I–T–M + ISO 12207) |
| `index.html` | Calcular **tiempos, costes y ahorro** al cambiar backlog, tarifa y densidad de agentes |
| `modelo.md` | Fórmulas y constantes (si quieres entender los números) |
| `README.md` | Resumen técnico de la carpeta |

Empieza por `simulador_metodologia.html` (el flujo) y luego abre `index.html` (los números).

---

## 2. Cómo abrirlo en la laptop

### Opción A — La más simple (recomendada)

1. Copia toda la carpeta `simulador_impacto_scrum_ia` a la laptop (USB, Drive, WhatsApp, correo, etc.).
2. Entra a la carpeta.
3. Haz **doble clic** en:
   - `simulador_metodologia.html` → flujo de las metodologías
   - `index.html` → simulador de tiempos y costes
4. Se abre en el navegador (Chrome, Edge, Firefox o Safari).

No hace falta XAMPP, Node, Python ni internet. Todo corre en local.

### Opción B — Si el doble clic no abre el navegador

1. Clic derecho sobre el archivo `.html`.
2. **Abrir con** → Google Chrome o Microsoft Edge.

### Opción C — Arrastrar al navegador

1. Abre Chrome o Edge.
2. Arrastra el archivo `.html` a la ventana del navegador.

### Pantalla

Usa la laptop en **horizontal** y, si puedes, a pantalla completa (`F11`). Los dos paneles se leen mejor así.

---

## 3. Simulador de flujo (`simulador_metodologia.html`)

Muestra **dos carriles a la vez**:

| Izquierda | Derecha |
|-----------|---------|
| **Ciclo Scrum tradicional** | **SDLC Prompt-Centered + ISO 12207** |
| Planning → Daily → Review → Retro | Requisitos → Diseño → Implementación → Pruebas → Mantenimiento |
| Unidad: sprint (semanas) | Unidad: fase + prompt (horas) |
| Vuelve a empezar el ciclo | Cada fase cita el proceso ISO 12207 y la decisión humana **D2** |

### Controles

1. **Botón ▶ / ❚❚** (esquina superior derecha)  
   Pausa o reanuda la animación. Úsalo para explicar una fase sin que el punto se mueva.

2. **Slider “Duración del sprint (Scrum)”** (1–4 semanas)  
   Alarga o acorta la caja de tiempo de Scrum. El ciclo de la izquierda se mueve más lento si el sprint es más largo. El KPI “Tiempo Scrum” cambia (40 h por semana).

3. **Slider “Duración del flujo SDLC + ISO 12207”** (4–48 horas)  
   Simula cuánto tarda el flujo continuo. El KPI de la derecha y el factor “más rápido” se recalculan.

### Qué mirar mientras corre

- En Scrum: el punto ámbar recorre las **ceremonias** y el texto dice qué hace cada una.
- En el SDLC: la fila activa (R, D, I, T o M) se ilumina y muestra el **proceso ISO 12207** y el código de prompts (R-001…, I-001…).
- Abajo: **D2 · aprobar / rechazar / refinar**. La IA acelera; el humano no desaparece.
- Los tres números del centro (horas Scrum, horas SDLC, factor de aceleración) cambian con los sliders.

---

## 4. Simulador de impacto (`index.html`)

Aquí se **cuantifica** el mismo contraste: plazo, coste y ahorro.

### Cómo usarlo, paso a paso

1. Abre `index.html`.
2. Pulsa **▶** para ver los dos carriles (sprints arriba, procesos ISO abajo). El punto amarillo es lento (semanas); el azul es rápido (horas).
3. Mueve **Requisitos totales (backlog)** (8–80 ítems). Más ítems = más semanas en Scrum y más horas en el flujo IA.
4. Mueve **Coste promedio de ingeniería** (25–150 USD/h). Solo afecta al dinero, no al plazo.
5. Elige densidad de agentes:
   - **Estándar (1×)** — un hilo: implementar → verificar → validar
   - **Avanzado (2×)** — dos hilos coordinados
   - **Enjambre (3,5×)** — varios agentes; el humano sigue aprobando
6. Opcional: marca **Incluir fricción ceremonial Scrum** si quieres sumar el recargo de Planning / Daily / Review / Retro.
7. Atajos:
   - **Preset captura (40)** — escenario didáctico por defecto (40 ítems, 65 USD/h).
   - **Preset Sigemad (56 HU)** — 56 historias del caso de estudio.

### Cómo leer los resultados

| Bloque | Significado |
|--------|-------------|
| Plazo Scrum / Plazo flujo IA / Aceleración | Comparación de calendario |
| Ahorro estimado (ROI) | `(horas Scrum − horas IA) × tarifa` |
| Desglose de horas y coste | Misma cuenta en tabla |
| Reparto del flujo IA (12207) | 50 % implementación, 30 % verificación, 20 % validación |

Valores por defecto: **40 ítems**, **65 USD/h**, densidad **1×** → 8 semanas Scrum, 16 h flujo IA, **20×**, ahorro **19 760 USD**.

El detalle de las fórmulas está en `modelo.md`.

---

## 5. Recorrido sugerido para explicárselo a otra persona

1. Abre `simulador_metodologia.html` y deja correr la animación 20–30 segundos.
2. Pausa en **Planning** (izquierda) y en **R Requisitos** (derecha): “aquí se define el trabajo”.
3. Sigue hasta **Daily** vs **I Implementación**: en Scrum la gente programa durante semanas; en el SDLC la implementación se comprime y el esfuerzo pasa a verificar.
4. Pausa en **T Pruebas** y señala **Verification / Validation** y **D2**.
5. Abre `index.html`, pulsa **Preset Sigemad (56 HU)** y muestra el ahorro.
6. Sube la densidad a **Avanzado** o **Enjambre** y explica que no son “más programadores”, sino más orquestación concurrente con revisión humana.

---

## 6. Si algo no se ve bien

| Problema | Qué hacer |
|----------|-----------|
| El archivo se abre en Word o en el Bloc de notas | Clic derecho → Abrir con → Chrome o Edge |
| La página sale en blanco | Usa Chrome, Edge o Firefox recientes (no Internet Explorer) |
| Los paneles se apilan y se corta el texto | Maximiza la ventana o usa `F11` |
| “Esta página no funciona” con `localhost` | No uses una URL de XAMPP. Abre el `.html` por doble clic |
| Faltan archivos | Copia **toda** la carpeta, no un solo HTML |

---

## 7. Recordatorio al citarlo

Esto es una **simulación de sensibilidad**, no un resultado de campo. No afirma que un sistema real se construyó en 16 o 22 horas: ilustra el cambio de unidad (del sprint a la fase + prompt bajo ISO 12207).
