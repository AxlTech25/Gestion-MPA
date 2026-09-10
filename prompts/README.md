# Repositorio de prompts — Sigemad MPA

Estructura según la propuesta **Prompt-Centered SDLC v1.2** (en validación con Sigemad). Algunos registros se documentaron de forma retrospectiva; eso es una limitación conocida del caso.

```
prompts/
├── 01_requisitos/       R-001, R-002
├── 02_diseno/           D-001, D-002
├── 03_implementacion/   I-001, I-002
├── 04_testing/          T-001
├── 05_mantenimiento/    M-001
└── gobernanza/          registro_metricas.md, politicas_uso_ia.md
```

Cada registro incluye: código, fase, versión, prompt, resultado, métricas y decisión D2.

Trazabilidad de mantenimiento (prompt → commit GitHub → archivo): [matriz de doble entrada](../documents/matriz_doble_entrada/README.md).

Metodología del producto: [documents/metodologia.md](../documents/metodologia.md).
