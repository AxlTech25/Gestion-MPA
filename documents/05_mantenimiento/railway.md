# Despliegue en Railway (Hobby $5) — Sigemad MPA

Front en **Vercel** · API PHP en **Railway** · BD **MySQL** en Railway · datos = **seed simulado** (no dump municipal real).

**Proyecto:** `sigemad-mpa` · **API:** https://api-production-d843b279.up.railway.app

```text
Navegador → https://gestion-mpa.vercel.app
                ↓
         Railway (PHP 8.2 + Apache)  →  MySQL (seed simulado 450…)
```

ML fuera (`ML_SERVICE_URL` vacío).

Plan: **Hobby** ($5/mes; incluye $5 de uso). Pon un usage limit en el workspace para no pasarte.

### Datos en producción (Railway)

- **35 equipos** con códigos `450000000001` … `450000000035` (ficticios).
- **8 áreas** / **4 gerencias** de una municipalidad genérica de ejemplo.
- Usuarios: `admin`, `tecnico`, `practicante` — claves fuertes (no están en el repo en texto claro; se entregaron al responsable del deploy). Para rotar: `php backend/tools/reset_user_passwords.php`.

---

## 0. Requisitos

1. Cuenta Railway con plan **Hobby** activo ([railway.com](https://railway.com)).
2. Repo GitHub conectado (p. ej. `AxlTech25/Gestion-MPA`) o deploy con CLI desde `backend/`.
3. Front ya en Vercel: https://gestion-mpa.vercel.app

El backend ya trae:

| Archivo | Rol |
|---------|-----|
| [`backend/Dockerfile`](../../backend/Dockerfile) | PHP 8.2 + Apache, DocumentRoot `api/v2` |
| [`backend/railway.toml`](../../backend/railway.toml) | Healthcheck `/health.php` |
| [`backend/docker-entrypoint.sh`](../../backend/docker-entrypoint.sh) | Escucha `$PORT` |

`LocalConfig` lee `MYSQLHOST` / `MYSQLPORT` / etc. (variables que Railway inyecta desde el servicio MySQL).

---

## 1. Proyecto Railway

Dashboard → **New Project** → nombre sugerido: `sigemad-mpa`.

O con CLI (desde la raíz del repo, tras `railway login`):

```bash
cd backend
railway init
```

---

## 2. MySQL

En el canvas del proyecto → **+ New** → **Database** → **MySQL**.

Anota (Variables del servicio MySQL o referencias):

- `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
- Volumen incluido (1 GB alcanza para seed demo)

---

## 3. Servicio API (PHP)

### Opción A — GitHub

1. **+ New** → **GitHub Repo** → `Gestion-MPA` (o el tuyo).
2. **Root Directory** / Watch Paths: carpeta **`backend`**.
3. Builder: **Dockerfile** (usa `backend/Dockerfile` vía `railway.toml`).

### Opción B — CLI

```bash
cd backend
railway link   # elige proyecto y servicio API
railway up
```

Tras el deploy: `https://<servicio>.up.railway.app/health.php` → JSON ok.

---

## 4. Variables del servicio API

En el servicio PHP → **Variables** (referencia al MySQL con `${{MySQL.VAR}}`; el nombre del servicio puede variar):

| Name | Value |
|------|--------|
| `DB_HOST` / o `MYSQLHOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` / o `MYSQLPORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_NAME` / o `MYSQLDATABASE` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USER` / o `MYSQLUSER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASS` / o `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `JWT_SECRET` | cadena larga aleatoria |
| `CORS_ORIGINS` | `https://gestion-mpa.vercel.app` |
| `ML_SERVICE_URL` | *(vacío)* |

`DB_SSL` no suele hacer falta entre servicios privados de Railway.

**Settings → Networking → Generate Domain** (puerto **80** o el que exponga Apache/`$PORT`).

---

## 5. Seed simulado

Ya aplicado en Railway (códigos `450…`, áreas genéricas). Para reaplicar desde tu PC (TCP Proxy temporal o red privada):

```powershell
php backend/tools/seed_demo.php --force
```

Rote claves con `php backend/tools/reset_user_passwords.php` si alguien más tuvo acceso a las claves del deploy.

---

## 6. Vercel (frontend)

| Variable | Valor |
|----------|--------|
| `VITE_API_BASE_URL` | `https://api-production-d843b279.up.railway.app` |
| `VITE_BASE_PATH` | `/` |

```bash
npx vercel env add VITE_API_BASE_URL production
npx vercel deploy --prod --scope eco-pfa
```

---

## Checklist

- [ ] Plan Hobby activo + usage limit
- [ ] Proyecto + MySQL + servicio API (Dockerfile en `backend/`)
- [ ] Variables DB / JWT / CORS
- [ ] Dominio público; `/health.php` ok
- [ ] Seed demo aplicado
- [ ] `VITE_API_BASE_URL` = URL Railway; front redesplegado
- [ ] Login e inventario (8 equipos) OK

---

*Ver también [produccion.md](produccion.md) · [README](../../README.md)*
