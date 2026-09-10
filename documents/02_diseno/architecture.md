# Arquitectura V2 - Gestión de Equipos de Cómputo

Este documento describe la arquitectura de la versión 2 (V2) del sistema, optimizada para Machine Learning y estructurada para escalabilidad.

## Stack Tecnológico
- **Front-end**: React (Vite), Zustand (Estado global), React Router v6.
- **Back-end**: PHP (PDO Orientado a Objetos), API RESTful.
- **Base de Datos**: MySQL (Estructura relacional optimizada).
- **ML / IA**: Microservicio en Python (FastAPI + Scikit-learn). Ver `documents/03_implementacion/incrementos/incremento_6.md`.

## Estructura de Directorios (Propuesta)

### Front-end (`/src`)
Organizado por "Features" (Dominios de negocio) en lugar de tipo de archivo.
```text
src/
  ├── components/      # Componentes compartidos (Botones, Modales, Inputs)
  ├── features/        # Módulos principales
  │   ├── auth/        # Login, recuperación, JWT
  │   ├── inventario/  # CRUD de equipos, listado, carga Excel
  │   ├── mantenimiento/# Fichas, historial
  │   ├── dashboard/   # Métricas operativas, alertas ML (incremento 6)
  │   └── ml/          # Servicios y UI predictiva (incremento 6)
  ├── hooks/           # Custom hooks genéricos
  ├── lib/             # Clientes (Axios, configuración externa)
  ├── store/           # Zustand stores
  └── App.jsx          # Enrutador principal
```

### Back-end (`/backend/api/v2`)
Patrón MVC enfocado en API (Controladores y Modelos).
```text
backend/
  ├── api/
  │   └── v2/
  │       ├── config/      # Configuración de BD (Database.php)
  │       ├── controllers/ # Lógica de HTTP (Request/Response)
  │       ├── models/      # Acceso a BD (PDO)
  │       ├── routes/      # Definición de endpoints
  │       └── middleware/  # JWT y Roles
  └── sql/                 # Migraciones y DDL

ml/                        # Microservicio Python (FastAPI) — incremento 6, raíz del proyecto
```

### Microservicio ML (`/ml`) — Incremento 6
```text
ml/
  ├── app/           # FastAPI: routers, services, schemas
  ├── models/        # Modelos serializados (.joblib)
  ├── requirements.txt
  └── README.md
```

## Integración ML (Incremento 6)

Ver `documents/03_implementacion/incrementos/incremento_6.md` y `ml/README.md`.

**Evolución (incremento 7):** extensión de telemetría en `v2_equipos` y campos estructurados en `v2_fichas_mantenimiento`. Ver:

- `documents/02_diseno/ml/mantenimiento_predictivo_analisis.md` — análisis de viabilidad
- `documents/03_implementacion/incrementos/incremento_7_extension_schema_v2.md` — plan de implementación Fase 1
- `backend/sql/v2_extension_fase7.sql` — migración SQL

```text
React  →  PHP API V2 (/api/v2/ml/*)  →  FastAPI (:8000)  →  MySQL
```

PHP actúa como proxy autenticado; el servicio Python no es expuesto directamente al navegador.

## Autenticación y autorización (RBAC)

Toda ruta de `/api/v2/*` excepto `/auth` exige JWT (`AuthMiddleware::requireAuth()` en `index.php`).

Las operaciones que cambian privilegios o cuentas **no se delegan a la UI**. El servidor vuelve a comprobar el rol del token:

| Recurso | Lectura (GET) | Escritura |
|---------|---------------|-----------|
| `/usuarios` | Usuario autenticado | Solo **Administrador** (`requireRole`) |
| `/ml/train` | — | Solo **Administrador** |

Reglas de integridad en mutaciones de usuarios:

- Roles admitidos: `Administrador`, `Tecnico`, `Practicante`.
- Un administrador no puede eliminarse a sí mismo (`sub` del JWT).
- No se elimina ni se degrada al último usuario con rol Administrador.

En el frontend, `PrivateRoute` exige sesión y `RoleRoute` limita `/v2/configuracion` a Administrador. Eso es defensa en profundidad; la autorización efectiva está en la API.

## Convenciones
- **API**: Todas las respuestas de la API V2 retornan `application/json` con una estructura estándar:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operación exitosa"
  }
  ```
- **Fechas**: Almacenadas en formato ISO 8601 o estándar SQL (`YYYY-MM-DD HH:MM:SS`).
- **Nomenclatura BD**: Tablas con prefijo `v2_` para distinguirlas de la versión anterior durante la migración. Columnas en `snake_case`.
