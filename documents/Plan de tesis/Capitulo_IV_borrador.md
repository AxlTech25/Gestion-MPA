# CAPÍTULO IV
# RESULTADOS Y DISCUSIÓN

> Borrador de trabajo para pegar en la plantilla de la Universidad Continental.
> Sigue los apartados 4.1 a 4.4 de la plantilla y el modo de redactar de Arana Caparachin (2021): enunciado, hipótesis nula y alterna, criterio de decisión con α = 0,05, tabla, lectura del p-valor y decisión.
> SmartPLS ya está redactado con la corrida de 100 equipos (`smartpls_listo.xlsx`). La preprueba y la posprueba del cuasiexperimento siguen en **[PENDIENTE]**.
> Nota de autor (borrar antes de entregar): el conteo de prompts del apartado 4.1 quedó cerrado en 48. El Anexo 07 y el capítulo III todavía citan el corte anterior (29). Se afinan más adelante.

---

## 4.1. Resumen de Resultados de Intervención Metodológica

La construcción, el despliegue y la validación de SIGEMAD MPA V2 se realizaron con el ciclo Prompt-Centered SDLC, versión 1.2, y el componente analítico se organizó con CRISP-DM. El desarrollo operó con autonomía N2: la salida de cada prompt se revisó antes de integrarse. El prompt quedó como artefacto versionado, con criterio de aceptación y evaluación D2. El catálogo vigente del ciclo reúne 48 prompts: seis de requisitos (R-001 a R-006), siete de diseño (D-001 a D-007), diecisiete de implementación (I-001 a I-017), catorce de pruebas (T-001 a T-014) y cuatro de mantenimiento (M-001 a M-004). Los dos registros superados y los tres prompts de mapas de proceso (P-ISO-001 a P-ISO-003) quedan fuera de este total. Tres de los 48 permanecen como plantilla: T-005, el M-002 de análisis de impacto y M-003. El detalle de fases, prompts y entregables consta en el Anexo 07.

El producto resultante es una arquitectura desacoplada: API REST en PHP 8.1 o superior, cliente web en React y base de datos MySQL, más un microservicio analítico en Python (FastAPI y scikit-learn). La indisponibilidad de la inferencia no detiene el inventario ni las fichas técnicas: esa degradación está registrada en el ADR-002. El modelo clasifica el riesgo del equipo en Bajo, Medio, Alto y Crítico a partir del historial de mantenimiento y de atributos del hardware.

**Tabla 35. Síntesis de la intervención metodológica**

| Evidencia | Resultado observado | Dónde consta |
|-----------|---------------------|--------------|
| Fases del ciclo | Requisitos, diseño, implementación, pruebas y mantenimiento | Anexo 07 |
| Prompts vigentes | 48 (R×6, D×7, I×17, T×14, M×4) | Anexo 07, catálogo D3 |
| Historias de usuario | 56 historias en 8 épicas | Anexo 07 |
| Incrementos | 7 incrementos modulares y parche de seguridad (0.1.0 a 0.9.1); el cronograma anual cerró después, en 0.10.7 | Anexo 07 |
| Modelo predictivo | Random Forest de riesgo por equipo; degradación controlada si el microservicio no responde | ADR-002; apartado 4.2.1 |

*Nota.* Elaboración propia a partir del Anexo 07.

Este apartado documenta que la intervención se ejecutó y que el sistema quedó operativo. No contrasta hipótesis. La contrastación se presenta en el apartado 4.3.

---

## 4.2. Resultados Estadísticos

La unidad de análisis del modelo estructural es el equipo informático. SmartPLS 4 se estimó sobre 100 equipos tomados del dataset sintético de riesgo que alimenta el clasificador (200 registros, prefijo patrimonial 990), conservando la proporción del nivel de riesgo: 57 bajo, 21 medio, 13 alto y 9 crítico. La variable intermedia, medida con ISO/IEC 25000, no entra en esta corrida.

Las dimensiones D1, D2 y D3 de Machine Learning describen el modelo completo y no varían de un equipo a otro. Se reportan en el apartado 4.2.1. SmartPLS estima la relación entre el monitoreo de la condición, el historial de mantenimiento y el pronóstico de riesgo, que son las dimensiones de la optimización del mantenimiento disponibles por equipo.

El nivel de significancia es α = 0,05. Se rechaza la hipótesis nula cuando p ≤ 0,05.

### 4.2.1. Estadística descriptiva

#### A. Preprocesamiento y tratamiento de datos

El dataset de origen tiene 200 equipos y 12 atributos de calidad revisados (memoria, almacenamiento, tipo de disco, antigüedad, estado de conservación, estado operativo, mantenimientos, correctivos, preventivos, días desde el último mantenimiento, severidad máxima y fallas altas o críticas). La proporción media de campos válidos en esos atributos fue de 83,5 %. Los vacíos numéricos se imputaron con la mediana y los vacíos de texto con la categoría «Desconocido», dentro del pipeline de entrenamiento. No se aplicó reducción de dimensionalidad ni balanceo SMOTE: la partición se estratificó por el nivel de riesgo.

#### B. Configuración del algoritmo

Se entrenó un Random Forest con 200 árboles, profundidad máxima 12, mínimo de 2 observaciones por hoja y ponderación de clases `balanced`. La semilla fue 42. De los 200 registros, 160 se usaron para entrenar y 40 para probar (20 %), con estratificación.

#### C. Evaluación del rendimiento del modelo

**Tabla 36. Métricas del Random Forest en el conjunto de prueba (n = 40)**

| Clase | Precisión | Recall | F1 | Soporte |
|-------|-----------|--------|----|---------|
| Bajo | 0,958 | 1,000 | 0,979 | 23 |
| Medio | 1,000 | 0,875 | 0,933 | 8 |
| Alto | 0,833 | 1,000 | 0,909 | 5 |
| Crítico | 1,000 | 0,750 | 0,857 | 4 |
| Accuracy | 0,950 |  |  | 40 |
| Macro | 0,948 | 0,906 | 0,920 | 40 |

*Nota.* Elaboración propia. Criterio de evaluación del clasificador: accuracy superior a 0,85.

El accuracy obtenido fue 0,950, superior al umbral de 0,85. El recall de la clase Crítico fue 0,750, sobre 4 casos de prueba. Esa clase es la de menor respaldo muestral.

### 4.2.2. Estadística inferencial

#### A. Modelo de medida

El modelo es reflectivo. Monitoreo se midió con el estado operativo, las fallas altas o críticas en 12 meses y la severidad máxima histórica. Historial se midió con los correctivos en 12 meses, los preventivos en 12 meses y el total de mantenimientos. Pronóstico se midió con el nivel de riesgo y el deterioro. El deterioro recodifica el estado de conservación para que el valor crezca cuando el equipo está peor (1 = Nuevo, 4 = Malo). Se retiraron del modelo la antigüedad, los días desde el último mantenimiento y el score de riesgo. El score repetía el nivel de riesgo con correlación 1 y SmartPLS no estimaba la matriz. El estado operativo se conservó, aunque en el bootstrapping no produjo t ni p, porque solo toma dos valores.

**Figura 11. Modelo estructural estimado en SmartPLS 4.**  
*Nota.* Elaboración propia. En el círculo Pronóstico se lee R² = 0,716. [Pegar la captura del modelo.]

**Tabla 37. Cargas externas**

| Indicador | Constructo | Carga |
|-----------|------------|-------|
| Estado operativo | Monitoreo | 0,743 |
| Fallas altas o críticas en 12 meses | Monitoreo | 0,890 |
| Severidad máxima histórica | Monitoreo | 0,826 |
| Correctivos en 12 meses | Historial | 0,854 |
| Preventivos en 12 meses | Historial | 0,686 |
| Total de mantenimientos | Historial | 0,955 |
| Deterioro | Pronóstico | 0,921 |
| Nivel de riesgo | Pronóstico | 0,947 |

*Nota.* Elaboración propia. Software: SmartPLS 4.

Siete cargas superan 0,70. La de preventivos en 12 meses es 0,686. Se conservó porque el constructo Historial mantiene un AVE de 0,704 y un alfa de 0,788, y porque en el bootstrapping esa carga tiene p = 0,000.

**Tabla 38. Fiabilidad y validez convergente**

| Constructo | Alfa de Cronbach | rho_a | Fiabilidad compuesta (rho_c) | AVE |
|------------|------------------|-------|------------------------------|-----|
| Historial | 0,788 | 0,857 | 0,875 | 0,704 |
| Monitoreo | 0,759 | 0,776 | 0,862 | 0,676 |
| Pronóstico | 0,855 | 0,878 | 0,932 | 0,872 |

*Nota.* Elaboración propia. Criterios: alfa y fiabilidad compuesta ≥ 0,70; AVE ≥ 0,50.

Los tres constructos cumplen los tres criterios.

**Tabla 39. Validez discriminante (HTMT)**

|  | Historial | Monitoreo | Pronóstico |
|--|-----------|-----------|------------|
| Historial |  |  |  |
| Monitoreo | 0,910 |  |  |
| Pronóstico | 0,900 | 0,976 |  |

*Nota.* Elaboración propia. El criterio adoptado es HTMT < 0,90.

El HTMT entre Historial y Pronóstico queda en el límite (0,900). Los de Monitoreo con Historial (0,910) y de Monitoreo con Pronóstico (0,976) lo superan. Los constructos no quedan plenamente diferenciados. El nivel de riesgo del dataset se asigna con reglas que usan las fallas, el estado operativo y los correctivos, de modo que el pronóstico comparte información con el monitoreo y con el historial. Ese solapamiento se declara y no se oculta.

#### B. Modelo estructural

**Tabla 40. Coeficientes de camino (bootstrapping, 5 000 submuestras)**

| Camino | β | Media | DE | t | p |
|--------|---|-------|----|---|---|
| Monitoreo → Pronóstico | 0,514 | 0,513 | 0,070 | 7,355 | 0,000 |
| Historial → Pronóstico | 0,398 | 0,401 | 0,078 | 5,087 | 0,000 |

*Nota.* Elaboración propia. Dos colas, α = 0,05. El R² de Pronóstico es 0,716 y proviene del algoritmo PLS. El bootstrapping en modo completo no estimó la tabla de R² porque el estado operativo, al tener solo dos valores, singulariza parte de las submuestras.

Ambos caminos tienen p ≤ 0,05. El monitoreo aporta el coeficiente mayor. En conjunto, monitoreo e historial explican el 71,6 % de la varianza del pronóstico.

---

## 4.3. Contrastación de Hipótesis

El criterio de decisión es el siguiente: si p ≤ 0,05 se rechaza H0 y se acepta Ha; si p > 0,05 se acepta H0.

### 4.3.1. Para la hipótesis general

**Ha.** La implementación de un modelo predictivo basado en machine learning influye significativamente en la optimización del mantenimiento de los equipos informáticos en la Municipalidad Provincial de Acobamba, 2026.

**H0.** La implementación de un modelo predictivo basado en machine learning no influye significativamente en la optimización del mantenimiento de los equipos informáticos en la Municipalidad Provincial de Acobamba, 2026.

La hipótesis general reúne el monitoreo, el pronóstico y la gestión. En esta corrida, la parte estimada es el pronóstico: Monitoreo → Pronóstico obtuvo β = 0,514 y p = 0,000; Historial → Pronóstico obtuvo β = 0,398 y p = 0,000. El pronóstico queda explicado en un 71,6 %. Esa asociación se contrasta en la hipótesis específica 2.

La mejora del monitoreo frente al régimen vigente y la reducción del tiempo de inactividad y del costo corresponden a la preprueba y la posprueba. Esa parte de la hipótesis general permanece pendiente de la medición institucional.

### 4.3.2. Para la hipótesis específica 1

**Ha.** El modelo predictivo mediante Machine Learning mejora el monitoreo de la condición de los equipos informáticos, medido en el estado operativo, las fallas y el historial de mantenimiento, en la Municipalidad Provincial de Acobamba, 2026.

**H0.** El modelo predictivo mediante Machine Learning no mejora el monitoreo de la condición de los equipos informáticos en la Municipalidad Provincial de Acobamba, 2026.

El modelo estimado mide el monitoreo con el estado operativo, las fallas altas o críticas y la severidad máxima, y el historial con los correctivos, los preventivos y el total de mantenimientos. Esos indicadores forman constructos fiables (apartado 4.2.2). La hipótesis pide una mejora frente al régimen de mantenimiento vigente. Esa comparación exige la preprueba y la posprueba del cuasiexperimento, que todavía no están medidas. La hipótesis específica 1 queda pendiente.

### 4.3.3. Para la hipótesis específica 2

**Ha.** El monitoreo de la condición y el historial de mantenimiento se asocian de forma significativa con el pronóstico de riesgo de los equipos informáticos en la Municipalidad Provincial de Acobamba, 2026.

**H0.** El monitoreo de la condición y el historial de mantenimiento no se asocian de forma significativa con el pronóstico de riesgo de los equipos informáticos en la Municipalidad Provincial de Acobamba, 2026.

Monitoreo → Pronóstico obtuvo β = 0,514, t = 7,355 y p = 0,000. Historial → Pronóstico obtuvo β = 0,398, t = 5,087 y p = 0,000. El R² del pronóstico es 0,716. Se rechaza H0 y se acepta Ha. El HTMT de 0,976 entre monitoreo y pronóstico limita la separación de ambos constructos: parte de la asociación reproduce las variables con las que se etiquetó el riesgo. La aceptación se refiere a la asociación estimada en los 100 registros del dataset sintético, no a la medición censal de los 215 equipos.

### 4.3.4. Para la hipótesis específica 3

**Ha.** El modelo predictivo mediante Machine Learning reduce el tiempo de inactividad y el costo del mantenimiento correctivo frente al régimen vigente, con un nivel de significancia α = 0,05, en la Municipalidad Provincial de Acobamba, 2026.

**H0.** El modelo predictivo mediante Machine Learning no reduce el tiempo de inactividad ni el costo del mantenimiento correctivo frente al régimen vigente en la Municipalidad Provincial de Acobamba, 2026.

El dataset estimado en SmartPLS no contiene horas de inactividad ni costos antes y después de la implantación. La contrastación de esta hipótesis queda pendiente de la preprueba y la posprueba en el grupo experimental y en el grupo de control.

---

## 4.4. Discusión de Resultados

El objetivo general buscaba determinar la influencia del modelo predictivo en la optimización del mantenimiento. En la corrida de SmartPLS, el monitoreo (β = 0,514, p = 0,000) y el historial (β = 0,398, p = 0,000) se asocian con el pronóstico, y juntos explican el 71,6 % de su varianza. El resultado se alinea con el uso del aprendizaje automático para anticipar la condición del activo, como plantean Çınar et al. [1] y la revisión de Tapia et al. [14]. La diferencia de este estudio es que el pronóstico sale de reglas y de un Random Forest aplicados al historial de cada equipo, no de una encuesta. El HTMT de 0,976 entre monitoreo y pronóstico limita la lectura: parte de esa explicación reproduce las mismas variables con las que se etiquetó el riesgo. Quijano y Crisostomo [7] también modelan el mantenimiento de computadoras con técnicas predictivas; aquí el aporte local es ligar ese pronóstico al registro de fallas y de mantenimientos del caso municipal. La comparación con un grupo de control institucional todavía no está en estos datos.

El objetivo específico 1 pide determinar la influencia del modelo en el monitoreo de la condición. El estado operativo, las fallas y el historial están registrados, y el constructo Monitoreo cumple los criterios de fiabilidad del apartado 4.2.2. La mejora de ese monitoreo frente al régimen anterior no tiene preprueba ni posprueba, así que la hipótesis específica 1 queda pendiente.

El objetivo específico 2 pide la asociación del monitoreo y del historial con el pronóstico del estado de salud. Esa asociación es significativa y el pronóstico queda explicado en un 71,6 %. El clasificador que alimenta el riesgo obtuvo un accuracy de 0,950 en 40 casos de prueba; el recall de la clase Crítico fue 0,750 sobre 4 casos. Romero Magdaleno et al. [2] subrayan que la clasificación de fallas depende del equilibrio entre precisión y captura de la clase positiva. El HTMT de 0,976 limita la separación entre monitoreo y pronóstico.

El objetivo específico 3, la reducción del tiempo de inactividad y del costo del mantenimiento correctivo, no se contrasta todavía. Lara Meneses et al. [23], Chipana y Franck [21] y Calsina Quispe [22] documentan efectos de software de gestión o de inventario en municipios; la comparación numérica con Acobamba espera la preprueba y la posprueba.

En conjunto, se acepta la hipótesis específica 2. Quedan pendientes la hipótesis específica 1, sobre la mejora del monitoreo, y la hipótesis específica 3, sobre el tiempo de inactividad y el costo. El límite principal es que los 100 equipos proceden del dataset sintético de riesgo del clasificador y no de la medición censal de 215 equipos con grupo de control.
