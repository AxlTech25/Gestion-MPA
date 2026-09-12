# Requisitos no funcionales — Sigemad MPA V2

**Prompt:** [R-005](../../prompts/01_requisitos/R-005_rnf_v1.md)  
**Versión:** 1.0  
**Producto de referencia:** 0.9.1  
**Roles de sistema:** Administrador, Tecnico, Practicante

Los RNF no sustituyen historias. Complementan R-001 (alcance) y R-004 (ambigüedades).

---

## Seguridad (RNF-SEC)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-SEC-01 | Toda ruta `/api/v2/*` excepto `/auth` exige JWT | `index.php` + I-006 |
| RNF-SEC-02 | Mutaciones de `/usuarios` solo Administrador | I-009 `requireRole` |
| RNF-SEC-03 | No autoeliminación ni degradación del último Administrador | I-009 |
| RNF-SEC-04 | Contraseñas con `password_hash` BCRYPT | I-005 |
| RNF-SEC-05 | El navegador no llama a FastAPI (`:8000`) | ADR-001, ADR-002, I-007 |
| RNF-SEC-06 | `/ml/train` solo Administrador | I-007 / architecture.md |
| RNF-SEC-07 | Secretos (`local.php`, JWT, BD) fuera de Git | M-001, M-004 |
| RNF-SEC-08 | Login fallido no revela si el usuario existe | HU-AUTH-001 |
| RNF-SEC-09 | SQL solo con PDO parametrizado | D-002 / I-* |
| RNF-SEC-10 | Tras despliegue, cambiar seed `admin` / `admin123` | M-001 checklist |

## Disponibilidad y degradación (RNF-AVA)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-AVA-01 | Inventario, auth, fichas y mantenimiento operan si FastAPI está caído | HU-ML-005, ADR-002 |
| RNF-AVA-02 | UI ML (badges, alertas) en estado N/A u oculto, sin pantalla en blanco | I-007 |
| RNF-AVA-03 | Recálculo post-mantenimiento no impide guardar la ficha si ML falla | I-008 |
| RNF-AVA-04 | Hosting compartido puede dejar `ml_service_url` vacío | M-001 |

## Datos e integridad (RNF-DAT)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-DAT-01 | Código patrimonial: 12 dígitos numéricos, único | INV |
| RNF-DAT-02 | RAM, almacenamiento y telemetría numéricos | D-001, I-008 |
| RNF-DAT-03 | Categoría de falla por catálogo (`categoria_falla_id`) | D-001, I-003 |
| RNF-DAT-04 | Tablas con prefijo `v2_` | D-001 |
| RNF-DAT-05 | Migraciones incrementales no borran filas existentes | I-008 |

## Usabilidad y cliente (RNF-UX)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-UX-01 | SPA en `/v2/*`; recarga no da 404 (`.htaccess`) | M-001 |
| RNF-UX-02 | Respuestas API `{success, data, message}` | D-003 |
| RNF-UX-03 | Configuración visible solo a Administrador (defensa en profundidad) | I-009 |
| RNF-UX-04 | Campos de telemetría condicionales por tipo de equipo | I-008 |

## Entorno y despliegue (RNF-OPS)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-OPS-01 | Desarrollo: XAMPP (Apache + MySQL) + Vite | ficha R-001 |
| RNF-OPS-02 | Producción mínima: Hostinger PHP 8.1+ y MySQL | M-001 |
| RNF-OPS-03 | Build front: `npm run build:hostinger`; PHP: `composer install --no-dev` | M-001 |
| RNF-OPS-04 | Rollback = dump SQL + restore de `dist/` y `backend/` | M-004 |
| RNF-OPS-05 | PDF: `memory_limit` ≥ 256M si Dompdf falla | hostinger.md |

## Calidad (RNF-QUA)

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-QUA-01 | Plan funcional por módulo (T-001) antes de release | `documents/04_testing/` |
| RNF-QUA-02 | Suites Vitest, PHPUnit y pytest en verde para críticos | T-002…T-004 |
| RNF-QUA-03 | Código de IA con revisión humana | política de prompts |

---

Fuera de este documento (no son RNF del producto 0.9.1): pruebas de carga, pentest formal, alta disponibilidad multi-región, SLA contractual.
