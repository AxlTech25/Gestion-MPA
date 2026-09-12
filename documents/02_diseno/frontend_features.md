# Diseño frontend por features

**Prompt:** [D-004](../../prompts/02_diseno/D-004_frontend_features_v1.md)  
**Producto:** 0.9.1  
**Patrón:** carpetas por dominio (`src/features/*`), no por tipo de archivo.

Complementa `architecture.md` (propuesta) con el árbol **real**.

## Rutas SPA

| Ruta | Feature | Guard |
|------|---------|-------|
| `/login` | `auth` | Pública |
| `/v2/dashboard` | `dashboard` | `PrivateRoute` |
| `/v2/inventario` | `inventario` | `PrivateRoute` |
| `/v2/ficha-tecnica` | `inventario` (ficha) | `PrivateRoute` |
| `/v2/mantenimiento` | `mantenimiento` | `PrivateRoute` |
| `/v2/configuracion` | `configuracion` | `PrivateRoute` + `RoleRoute` Administrador |

Sesión: **AuthContext** (token + usuario), no Zustand. `src/lib/api.js` añade `Authorization`.

## Mapa de features

| Feature | UI principal | Servicio | Notas |
|---------|--------------|----------|-------|
| `auth` | `Login.jsx` | `authService.js` | JWT; Salir en Navbar |
| `inventario` | `InventarioPage`, `EquipoForm`, carga masiva, ficha | `equiposService`, `fichaTecnicaService` | Ficha vive aquí, no en feature propio |
| `mantenimiento` | `MantenimientoPage`, Form, Detalle | `mantenimientoService.js` | Timeline; campos I-008 |
| `configuracion` | `ConfiguracionPage`, AreaForm, UsuarioForm | `organizacionService.js` | Solo Administrador en UI |
| `dashboard` | `DashboardPage`, `ConsultaEquiposPanel` | `dashboardService.js` | Métricas + consulta |
| `ml` | `RiesgoBadge` | `mlService.js` | Sin página propia; se incrusta |

Compartido: `src/components/`, `src/lib/` (api, `equipoTipo`), `src/store/` (Zustand residual; sesión no vive ahí).

## Reglas de diseño

1. Un feature no importa controladores PHP; solo su `*Service.js` y `api.js`.
2. ML nunca hace `fetch` a `:8000`.
3. PDF: blob + token (I-006).
4. Campos condicionales (impresora vs laptop) usan utilidades testeables (`equipoTipo`).
5. No añadir feature `reportes`: los PDF se disparan desde inventario/mantenimiento.

## Deuda respecto de `architecture.md`

- `architecture.md` lista Zustand como estado global de sesión; el producto usa AuthContext (I-006).
- Ficha técnica está bajo `inventario/`, no `mantenimiento/`.
- No hay feature `reportes/`.
