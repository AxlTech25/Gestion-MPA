# Plantilla — documentación post-cambio (M-02)

**Prompt reutilizable:** [M-003](../../prompts/05_mantenimiento/M-003_documentacion_post_cambio_v1.md)  
**Artefacto vivo:** [changelog.md](./changelog.md)

Tras merge de un incremento o parche:

1. Entrada Keep a Changelog + semver en `changelog.md`.
2. Si cambió API: actualizar [contrato_api_v2.md](../02_diseno/contrato_api_v2.md).
3. Si cambió arquitectura: ADR o nota en `architecture.md`.
4. Si cambió HU: matriz de trazabilidad.
5. Citar el prompt `[I-00N]` en el commit.

No documentar campos o endpoints que no existan. Incluir ejemplo request/response solo si el contrato cambió.
