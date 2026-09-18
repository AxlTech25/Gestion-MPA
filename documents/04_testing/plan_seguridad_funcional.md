# Plan de seguridad funcional

**Prompt:** [T-010](../../prompts/04_testing/T-010_seguridad_funcional_v1.md)  
**Producto:** 0.10.7  
**Oráculo:** [requisitos_no_funcionales.md](../01_requisitos/requisitos_no_funcionales.md) § RNF-SEC  
**No cubre:** pentest, fuzzing, carga (R-005).

---

| ID | RNF | Pasos | Esperado | Cruza |
|----|-----|--------|----------|-------|
| SEC-01 | SEC-01 | `GET /api/v2/equipos` (y otra ruta V2) sin JWT | 401 JSON | INT-002, REG-004 |
| SEC-02 | SEC-02 | JWT Técnico: `PUT`/`DELETE /usuarios?id=` | 403; fila intacta | INT-004, AUTH-007 |
| SEC-03 | SEC-03 | Único Administrador: `DELETE /usuarios?id=` de ese admin | 409 o rechazo; el usuario permanece | CFG-007 |
| SEC-04 | SEC-04 | Crear usuario de prueba; ver `password` en BD (phpMyAdmin local) | Hash `$2y$` (BCRYPT), no texto plano | CFG-004 |
| SEC-05 | SEC-05 | DevTools → Network en inventario/dashboard con ML opcional | Ninguna petición del **navegador** a `:8000` | ADR-001, ML-006 (proxy PHP) |
| SEC-06 | SEC-06 | JWT no admin: `POST /ml/train` | 403. Si FastAPI down: 403 sigue teniendo prioridad sobre 503 | I-007 |
| SEC-07 | SEC-07 | `git ls-files` / búsqueda: `local.php`, secretos JWT | `local.php` no versionado; existe `local.example.php` | M-004 |
| SEC-08 | SEC-08 | Login usuario inexistente y usuario existente con password mala | Mismo tipo de error; no “el usuario no existe” vs “clave incorrecta” distinguibles | AUTH-002, HU-AUTH-001 |
| SEC-09 | SEC-09 | Buscar ficha/inventario con código `740000001001'` o `'` | Respuesta controlada (vacío/validación); no 500 ni SQL en el mensaje | INV, FIC; PDO |
| SEC-10 | SEC-10 | Checklist M-001: seed `admin`/`admin123` | En **producción** hay que cambiarlo. En local el caso es N/A de producto y **recordatorio** | M-001 |

Estados: OK / FALLA / N/A (SEC-06 si no se prueba train; SEC-10 N/A en XAMPP).

### Criterio de salida (ejecución)

SEC-01, 02, 03, 05, 07 en OK. SEC-04, 08, 09 OK o BLOQUEADO con evidencia. 0 Alta de autorización.
