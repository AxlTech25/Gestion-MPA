# Repositorio de prompts — Sigemad MPA

Estructura según **Prompt-Centered SDLC v1.2**. Cada registro es una instrucción de ingeniería (D1) con evaluación (D2), no el volcado de un chat.

**Oleada 1:** plantilla y anatomía. **Oleada 2:** I-001…I-009. **Oleada 3 (2026-09-11):** R-003–R-005, D-003–D-006, T-002–T-005, M-002–M-004.  
**Oleada 4 (2026-09-17):** T-006 estrategia; T-007…T-014; T-001 v1.7.

```
prompts/
├── 01_requisitos/          R-001 … R-006
├── 02_diseno/              D-001 … D-007
├── 03_implementacion/      I-001 … I-017 (+ 2 macros Superados)
├── 04_testing/             T-001 … T-014
├── 05_mantenimiento/       M-001 … M-004
└── gobernanza/
```

| Recurso | Uso |
|---------|-----|
| [Plantilla](./gobernanza/_plantilla_prompt.md) | Copiar antes de un prompt nuevo |
| [Catálogo](./gobernanza/catalogo.md) | Mapa vigente |
| [Implementación](./03_implementacion/README.md) | I-001…I-017 |
| [Métricas D2](./gobernanza/registro_metricas.md) | Decisión y lección |
| [Política de IA](./gobernanza/politicas_uso_ia.md) | Revisión humana, secretos, ADR |

Trazabilidad: [matriz de doble entrada](../documents/matriz_doble_entrada/README.md).  
Metodología: [documents/metodologia.md](../documents/metodologia.md).
