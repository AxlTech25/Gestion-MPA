# Simulador de impacto — Scrum vs flujo IA + ISO 12207

Carpeta aparte del anexo metodológico. Desarrolla el **flujo simulado** de tiempos y costes: Scrum tradicional (semanas) frente a un flujo autónomo de IA orquestado sobre procesos de ISO/IEC 12207 (horas).

| Archivo | Uso |
|---------|-----|
| [GUIA_DE_USO.md](./GUIA_DE_USO.md) | Cómo abrirlo en una laptop y cómo usarlo |
| [simulador_metodologia.html](./simulador_metodologia.html) | Flujo Scrum vs SDLC + ISO 12207 |
| [index.html](./index.html) | Simulador de tiempos y costes |
| [modelo.md](./modelo.md) | Constantes, fórmulas, límites y preset Sigemad |

Metodología: [../metodologia.md](../metodologia.md) · Anexo 7: [../Intervencion metodologica y plan de tesis/Anexo07_Plantillas_Figuras_Tablas.md](../Intervencion%20metodologica%20y%20plan%20de%20tesis/Anexo07_Plantillas_Figuras_Tablas.md).

## Cómo abrirlo

Con XAMPP (este repo vive en `htdocs`):

```text
http://localhost/gestion_mpa/documents/simulador_impacto_scrum_ia/
```

O doble clic en `index.html`. No hace falta build ni dependencias.

## Qué se puede ajustar

- **Requisitos (backlog):** 8–80 ítems.
- **Coste de ingeniería:** 25–150 USD/h.
- **Densidad de agentes:** estándar 1×, avanzado 2×, enjambre 3,5×.
- **Fricción ceremonial:** recargo opcional sobre las horas Scrum (para acercarse a la cifra de la captura de referencia).
- **Presets:** captura didáctica (40 ítems) y caso Sigemad (56 HU).

Escenario por defecto: 40 ítems, 65 USD/h, densidad 1× → **8 semanas** Scrum, **16 h** flujo IA, **20×**, ahorro **19 760 USD** (fórmula transparente). Ver [modelo.md](./modelo.md).
