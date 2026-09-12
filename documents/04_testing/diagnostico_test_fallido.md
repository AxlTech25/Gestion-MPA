# Plantilla — diagnóstico de test fallido (T-02)

**Prompt reutilizable:** [T-005](../../prompts/04_testing/T-005_diagnostico_test_fallido_v1.md)  
**Uso:** copiar la sección “Ficha” por cada fallo; no reescribir el módulo entero si el error es local.

---

## Ficha

| Campo | Contenido |
|-------|-----------|
| **ID caso** | UT-… / MOD-NNN |
| **Runner** | Vitest / PHPUnit / pytest / funcional |
| **Entorno** | local XAMPP / CI / otro |
| **Fecha** | |
| **Prompt** | T-005 |

```text
Stack trace:
[pegar]

Código relacionado:
[archivo:líneas]

Resultado esperado:
[assert o criterio]
```

### Salida del análisis (llenar)

| Campo | Contenido |
|-------|-----------|
| **Causa probable** | |
| **Evidencia** | |
| **Cambio mínimo propuesto** | |
| **Riesgo del cambio** | Bajo / Medio / Alto |
| **Test de regresión** | ¿Basta el que falló o hay que añadir otro? |
| **Decisión** | Corregir local / dividir tarea / no es defecto (test mal escrito) |

### No hacer

- No proponer reescritura del feature.
- No añadir `sleep` fijos.
- No marcar verde relajando el assert sin justificación.
