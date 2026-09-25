# Plantilla — ficha de actividad (ISO 9001)

**Cláusula:** 8.5. Copiar a `ACT-NN-NN-NN_{slug}.md`. Una actividad agrupa **una o más** funciones atómicas F-*; no se fusionan login y registro.

---

## Identificación

| Campo | Contenido |
|-------|-----------|
| **ID Actividad** | ACT-NN-NN-NN |
| **Nombre** | |
| **Procedimiento** | PR-NN-NN — |
| **Macroproceso** | MP-NN — |
| **Disparador** | Qué inicia la actividad |
| **Responsable** | Rol |
| **Versión / fecha** | v1 / YYYY-MM-DD |

## Pasos

| # | Paso | Sistema / manual | Resultado |
|---|------|------------------|-----------|
| 1 | | Sigemad / papel | |
| 2 | | | |

## Funciones de software

| ID Función | Función | Prompt I-* | Commit | Archivo | Test |
|------------|---------|------------|--------|---------|------|
| F-NNN | | I-NNN | | | |
| F-NNN | | | | | |

Criterio de grano: si el usuario puede hacer A sin hacer B, son **dos** funciones (login ≠ registro).

## Criterio de aceptación de la actividad

- [ ] El procedimiento queda en el estado de salida declarado
- [ ] Cada F-* tiene SHA y archivo en la matriz V4
- [ ] El test asociado (T-* / UT-*) está en verde o justificado N/A
- [ ] SonarQube de esas funciones: Sí / Parcial / No / No aplica (con evidencia en `06_calidad`)

## Registros que produce

| Registro | Tabla o archivo |
|----------|-----------------|
| | |

---

## Ejemplo rellenado — ACT-03-01-01

| Campo | Contenido |
|-------|-----------|
| **ID Actividad** | ACT-03-01-01 |
| **Nombre** | Iniciar, persistir y cerrar sesión |
| **Procedimiento** | PR-03-01 — Autenticación y control de acceso |
| **Disparador** | El usuario abre `/login` o pulsa Salir |
| **Funciones** | F-001 Login.jsx · F-002 Navbar Salir · F-003 AuthContext |
| **Prompt de código** | I-006 |
| **No incluye** | F-011 registro de usuario (es ACT-03-02-02) |
