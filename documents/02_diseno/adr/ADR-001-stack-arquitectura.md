# ADR-001 — Stack y arquitectura V2

| Campo | Valor |
|-------|-------|
| **Estado** | Aceptado |
| **Fecha** | 2026-04-30 |
| **Fase SDLC** | Diseño |
| **Incremento** | 1 (evolución en incrementos 6–7 para ML) |

## Contexto

Se requería una versión 2 del sistema de gestión de equipos, con API desacoplada, datos numéricos aptos para ML y despliegue en XAMPP / hosting PHP compartido.

## Decisión

- Frontend SPA: **React + Vite**.
- Backend: **API REST PHP** (PDO, patrón controladores/modelos), autenticación **JWT**.
- Base de datos: **MySQL** con tablas `v2_*`.
- ML: **microservicio FastAPI** (Scikit-learn), consumido solo a través del proxy PHP.
- Migración progresiva respecto de V1 (Strangler Fig).

## Consecuencias

- El navegador no llama a Python de forma directa (menor superficie de ataque).
- En Hostinger compartido el ML puede quedar deshabilitado sin romper el resto del sistema.
- El esquema debe mantener campos estructurados (no texto libre en categorías de falla).

## Alternativas descartadas

- Monolito Laravel+Vue (usado en SGMI, no en este producto).
- Exponer FastAPI al cliente.
- Persistencia solo en texto libre (incompatible con el modelo de riesgo).
