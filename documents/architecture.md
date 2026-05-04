# Arquitectura V2 - Gestión de Equipos de Cómputo

Este documento describe la arquitectura de la versión 2 (V2) del sistema, optimizada para Machine Learning y estructurada para escalabilidad.

## Stack Tecnológico
- **Front-end**: React (Vite), Zustand (Estado global), React Router v6.
- **Back-end**: PHP (PDO Orientado a Objetos), API RESTful.
- **Base de Datos**: MySQL (Estructura relacional optimizada).
- **ML / IA (Próximamente)**: Microservicio en Python (FastAPI + Scikit-learn).

## Estructura de Directorios (Propuesta)

### Front-end (`/src`)
Organizado por "Features" (Dominios de negocio) en lugar de tipo de archivo.
```text
src/
  ├── components/      # Componentes compartidos (Botones, Modales, Inputs)
  ├── features/        # Módulos principales
  │   ├── auth/        # Login, recuperación, JWT
  │   ├── inventario/  # CRUD de equipos, listado
  │   ├── mantenimiento/# Fichas, historial
  │   └── dashboard/   # Integración BI, reportes
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
```

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
