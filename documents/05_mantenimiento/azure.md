# Despliegue en Azure (plan estudiante) — Sigemad MPA

Front en **Vercel** · API PHP en **App Service** · BD en **Azure Database for MySQL Flexible** · datos = **seed demo**.

```text
Navegador → https://gestion-mpa.vercel.app
                ↓
         App Service (PHP 8.2)  →  MySQL Flexible (seed demo)
```

ML fuera (`ML_SERVICE_URL` vacío).

---

## 0. Activar Azure for Students

1. Entra a [Azure for Students](https://azure.microsoft.com/free/students/) con tu correo institucional.
2. Verifica la suscripción en [portal.azure.com](https://portal.azure.com).
3. Confirma que tienes crédito o capa gratuita disponible.

> **Starter vs Students con crédito:** Starter limita mucho los servicios. Con **Azure for Students** (crédito ~USD 100) puedes crear MySQL Flexible B1ms y App Service sin tarjeta de cobro mientras dure el crédito / oferta free.

---

## 1. Resource group

Portal → **Resource groups** → Create:

| Campo | Valor sugerido |
|-------|----------------|
| Name | `rg-sigemad` |
| Region | `East US` o la más cercana |

---

## 2. Azure Database for MySQL Flexible Server

Portal → **Create a resource** → **Azure Database for MySQL Flexible Server**:

| Campo | Valor |
|-------|--------|
| Server name | `sigemad-mysql-<tu-iniciales>` (único global) |
| Region | Misma que el RG |
| Workload | Development |
| Compute | Burstable **B1ms** (oferta free 12 meses / crédito) |
| Storage | 20–32 GB |
| Admin username | `sigemadadmin` |
| Password | Guárdala (fuerte) |
| Connectivity | **Public access** |
| Firewall | Allow public access from Azure services = **Yes** |
| Add current client IP | Yes (para seed desde tu PC) |

Luego → **Databases** → Create database: `gestion_equipos_mpa_v2`.

Anota:

- Host: `sigemad-mysql-xxx.mysql.database.azure.com`
- Puerto: `3306`
- User: `sigemadadmin` (a veces `sigemadadmin@servidor`)
- Password y nombre BD

---

## 3. App Service (API PHP)

### Plan

**App Service plan** → Linux · SKU **Free F1** (si alcanza) o **Basic B1** con crédito.

### Web App

| Campo | Valor |
|-------|--------|
| Name | `sigemad-api-<tu-iniciales>` |
| Runtime | **PHP 8.2** (Linux) |
| Publish | Code |

### Configuración

**Configuration → Application settings** (o Environment variables):

| Name | Value |
|------|--------|
| `DB_HOST` | `sigemad-mysql-xxx.mysql.database.azure.com` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `gestion_equipos_mpa_v2` |
| `DB_USER` | `sigemadadmin` |
| `DB_PASS` | *(password MySQL)* |
| `DB_SSL` | `require` |
| `JWT_SECRET` | cadena larga aleatoria |
| `CORS_ORIGINS` | `https://gestion-mpa.vercel.app` |
| `ML_SERVICE_URL` | *(vacío)* |

**Configuration → General** (o Path mappings):

- Document root / startup: apuntar a `api/v2`  
  En muchos planes: **Configuration → Path mappings → Virtual applications**  
  Physical path: `site\wwwroot\api\v2`  
  O startup command que use [`backend/azure/startup.sh`](../../backend/azure/startup.sh).

**Deployment Center** → GitHub → repo `AxlTech25/Gestion-MPA` → carpeta `backend`  
o descarga el **Publish Profile** y úsalo en el workflow [`.github/workflows/azure-api.yml`](../../.github/workflows/azure-api.yml) (secreto `AZURE_WEBAPP_PUBLISH_PROFILE`).

Tras el deploy: `https://sigemad-api-xxx.azurewebsites.net/health.php` → JSON ok.

---

## 4. Seed demo (pocos equipos)

Desde tu PC (con IP permitida en el firewall de MySQL):

```bash
# Variables temporales (PowerShell)
$env:DB_HOST="sigemad-mysql-xxx.mysql.database.azure.com"
$env:DB_PORT="3306"
$env:DB_NAME="gestion_equipos_mpa_v2"
$env:DB_USER="sigemadadmin"
$env:DB_PASS="TuPasswordMySQL"
$env:DB_SSL="require"

php backend/tools/seed_demo.php
```

Login demo:

| Usuario | Contraseña |
|---------|------------|
| `admin` | `DemoMPA2026!Segura` |
| `tecnico` | `DemoMPA2026!Segura` |

Rote después con `php backend/tools/reset_user_passwords.php` si el sitio es público.

Opcional: quita tu IP del firewall MySQL y deja solo “Allow Azure services”.

---

## 5. Vercel (ya desplegado)

Actualiza env y redespliega:

| Variable | Valor |
|----------|--------|
| `VITE_API_BASE_URL` | `https://sigemad-api-xxx.azurewebsites.net` |
| `VITE_BASE_PATH` | `/` |

```bash
npx vercel env add VITE_API_BASE_URL production
npx vercel deploy --prod --scope eco-pfa
```

---

## Checklist

- [ ] Azure for Students activo
- [ ] RG + MySQL Flexible + BD `gestion_equipos_mpa_v2`
- [ ] App Service PHP; `/health.php` ok
- [ ] Seed demo aplicado
- [ ] `CORS_ORIGINS` = URL Vercel
- [ ] `VITE_API_BASE_URL` = URL App Service; front redesplegado
- [ ] Login e inventario (8 equipos) OK

---

*Ver también [produccion.md](produccion.md) · [README](../../README.md)*
