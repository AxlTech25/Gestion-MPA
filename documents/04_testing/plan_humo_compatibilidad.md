# Plan de humo y compatibilidad

**Prompt:** [T-009](../../prompts/04_testing/T-009_humo_compatibilidad_v1.md)  
**Producto:** 0.10.7  
**Duración humo:** ≤ 15 minutos  
**Entrada de:** [M-001](../../prompts/05_mantenimiento/M-001_deploy_produccion_v1.md)

Estrategia: [estrategia_pruebas.md](./estrategia_pruebas.md).

---

## 1. Humo (`SMOKE-*`)

Entorno: Apache + MySQL + `npm run dev` (o `dist/` en producción). Login `admin` / `admin123` solo en local.

| ID | Pasos | Esperado | Cruza |
|----|--------|----------|-------|
| SMOKE-001 | `/login` → admin | Redirección a `/v2/dashboard`; navbar | AUTH-001 |
| SMOKE-002 | Abrir dashboard | 4 tarjetas con números; sin pantalla en blanco | DSH-001 |
| SMOKE-003 | `/v2/inventario` | Tabla o vacío coherente; HTTP no 500 | INV-001 |
| SMOKE-004 | `/v2/cronograma` | Historial o vacío; no abre `/v2/mantenimiento` | CRN-001/002 |
| SMOKE-005 | Recargar dashboard / red `/ml/status` | UI no crashea si ML caído o N/A | DEG-001, INT-013 |

Si **cualquiera** de SMOKE-001…004 FALLA: no publicar. SMOKE-005 FALLA solo si la UI queda en blanco (ML caído con mensaje ámbar = OK).

---

## 2. Compatibilidad (`CMP-*`)

| ID | Pasos | Esperado | RNF |
|----|--------|----------|-----|
| CMP-001 | Login → `/v2/inventario` → F5 | Sigue en inventario; **no** 404 Apache | RNF-UX-01 (`.htaccess`) |
| CMP-002 | `npm run build`; servir `dist/` | Rutas `/v2/dashboard`, inventario, cronograma cargan assets | RNF-OPS-03 |
| CMP-003 | Config sin `ml_service_url` (producción o local) | Inventario y login OK; alertas ML N/A | RNF-AVA-04; detalle T-013 |

Navegadores: Chrome o Edge actuales en Windows (entorno del caso). No se planifica matriz iOS/Android.

---

## 3. Criterio de salida

Humo OK en el entorno que se va a entregar. CMP-001 OK antes de M-001. CMP-002 OK si el release es el build de producción.
