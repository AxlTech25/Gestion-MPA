# Política mínima de uso de IA — Sigemad MPA

**Versión:** 1.3  
**Metodología:** Prompt-Centered SDLC v1.2 (cap. 8.2)  
**Actualización:** 2026-09-11 (oleada 1 — plantilla y registro D2)

---

1. Todo código generado por IA pasa por **revisión humana** antes de integrarse.
2. No pegar en prompts: credenciales, `.env`, `local.php`, datos personales reales, secretos de producción.
3. Los prompts reutilizables se **versionan** en `prompts/` con la [plantilla maestra](./_plantilla_prompt.md): código, fase, anatomía D1, métricas D2 y decisión. No se versiona el chat completo.
4. Decisiones arquitectónicas significativas se registran como **ADR** en `documents/02_diseno/adr/` (ADR-001 stack, ADR-002 degradación ML). Antes de tocar BD o contrato API: ficha [M-002](../05_mantenimiento/M-002_analisis_impacto_v1.md).
5. Los outputs se verifican con **Vitest, PHPUnit y pytest**, más el plan funcional.
6. El equipo debe poder **explicar y mantener** el código generado sin depender exclusivamente del LLM.
7. Si el artefacto ya existía, el registro se marca **Reconstruido a posteriori**. Los prompts nuevos se escriben **antes o durante** el cambio.
8. Un prompt de implementación debe ser **acotable en una revisión** (un incremento). Los macros I-001 / I-002-ML están Superados; los commits nuevos citan I-001…I-009.

**Responsable prompts / IA:** equipo de desarrollo Sigemad MPA.  
**Herramienta principal:** Cursor Agent + plantillas de la guía SDLC.

Índice vivo: [catalogo.md](./catalogo.md). Métricas: [registro_metricas.md](./registro_metricas.md).
