# Plantilla — no conformidad y acción correctiva (ISO 9001 cl. 10.2)

Copiar a `documents/06_calidad/no_conformidades/NC-YYYY-NNN.md`. Origen típico: SonarQube, suite T-*, UAT, incidente en producción.

---

## Identificación

| Campo | Contenido |
|-------|-----------|
| **ID** | NC-YYYY-NNN |
| **Fecha** | YYYY-MM-DD |
| **Origen** | SonarQube / UT / INT / E2E / UAT / Producción / Revisión |
| **Severidad** | Bloqueante / Alta / Media / Baja |
| **Proceso afectado** | MP-NN / PR-NN-NN / ACT-NN-NN-NN / F-NNN |
| **Reportó** | |
| **Estado** | Abierta / En corrección / Verificada / Cerrada / Rechazada |

## Descripción

**Qué se observó** (hecho, no opinión):

**Evidencia** (ruta o enlace; sin secretos):

`documents/06_calidad/sonarqube/evidencias/YYYY-MM-DD/` o captura T-*

## Causa (cuando se conozca)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Fallo de requisito, de diseño o de implementación? | |
| ¿Hubo prompt? ¿Cuál? | I-NNN / N/A |
| ¿El test existía y no cubría el caso? | |

## Corrección (contención) y acción correctiva

| Tipo | Acción | Responsable | Fecha |
|------|--------|-------------|-------|
| Corrección | Qué se repara ahora | | |
| Acción correctiva | Qué evita que se repita (test, prompt, ADR) | | |

## Verificación

- [ ] Reproducción cerrada
- [ ] Test asociado en verde o nuevo caso T-*/UT-*
- [ ] SonarQube de la función: Sí o Parcial documentado
- [ ] Matriz V4 actualizada (commit, resultado, evidencia)

| Cierre | Nombre | Fecha |
|--------|--------|-------|
| Quién verificó | | |

---

## Ejemplo — hallazgo estático

| Campo | Contenido |
|-------|-----------|
| **ID** | NC-2026-001 |
| **Origen** | SonarQube |
| **Proceso** | PR-03-01 / F-004 |
| **Descripción** | (rellenar con la regla real del reporte; no inventar bugs) |
| **Evidencia** | `documents/06_calidad/sonarqube/evidencias/2026-09-24/F-004.md` |
