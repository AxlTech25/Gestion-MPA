# Política mínima de uso de IA — Sigemad MPA

**Versión:** 1.0  
**Metodología:** Prompt-Centered SDLC v1.2 (cap. 8.2)

---

1. Todo código generado por IA pasa por **revisión humana** antes de integrarse.
2. No pegar en prompts: credenciales, `.env`, datos personales reales, secretos de producción.
3. Los prompts reutilizables se **versionan** en `prompts/` con código, fase, métricas y decisión.
4. Decisiones arquitectónicas significativas se registran como **ADR** en `documents/02_diseno/adr/`.
5. Los outputs se verifican con **Vitest, PHPUnit y pytest**, más el plan funcional.
6. El equipo debe poder **explicar y mantener** el código generado sin depender exclusivamente del LLM.

**Responsable prompts / IA:** equipo de desarrollo Sigemad MPA.  
**Herramienta principal:** Cursor Agent + plantillas de la guía SDLC.
