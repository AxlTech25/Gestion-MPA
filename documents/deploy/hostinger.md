# Despliegue en Hostinger — Sigemad MPA V2

Guía paso a paso para publicar el sistema en **Hostinger Web Hosting** (plan compartido con PHP + MySQL).

> **Nota sobre ML:** el microservicio FastAPI (Python) **no** corre en hosting compartido. El resto del sistema funciona sin ML; las alertas predictivas quedarán deshabilitadas hasta que use un VPS o un servicio Python externo.

---

## Resumen del despliegue

| Componente | Dónde va en Hostinger |
|------------|------------------------|
| Frontend (React compilado) | `public_html/` (raíz del dominio) |
| Backend PHP + API | `public_html/backend/` |
| Base de datos | MySQL desde hPanel |
| ML (opcional) | No disponible en plan compartido |

**Estructura final en el servidor:**

```text
public_html/
├── index.html              ← build de Vite (carpeta dist/)
├── assets/
├── .htaccess               ← enrutamiento SPA (viene de public/)
├── favicon.ico
└── backend/
    ├── vendor/             ← composer install --no-dev
    ├── api/v2/
    │   ├── index.php
    │   ├── .htaccess
    │   └── config/
    │       └── local.php   ← credenciales (NO subir a Git)
    └── sql/                (opcional, bloqueado por .htaccess)
```

---

## Requisitos en Hostinger

1. Plan **Web Hosting** o superior con PHP **8.1+** y MySQL.
2. Dominio o subdominio apuntando al hosting.
3. Acceso a **hPanel** (Administrador de archivos, Bases de datos, PHP).

---

## Paso 1 — Crear la base de datos

1. En hPanel → **Bases de datos** → **Administración de MySQL**.
2. Cree una base de datos (ej. `u123456789_gestion_mpa`).
3. Cree un usuario y asígnelo a esa BD con todos los privilegios.
4. Anote: **host** (suele ser `localhost`), **nombre BD**, **usuario** y **contraseña**.

### Importar datos

1. Abra **phpMyAdmin** desde hPanel.
2. Seleccione la base de datos creada.
3. Pestaña **Importar** → suba el archivo:
   - `gestion_equipos_mpa_v2.sql` (raíz del proyecto), **o**
   - `backend/sql/v2_estructura.sql` si prefiere solo estructura + datos seed.

Si el archivo es grande y phpMyAdmin falla, use la opción **Importar** del hPanel o divida el SQL.

---

## Paso 2 — Configurar el backend (PHP)

### 2.1 Dependencias Composer (en su PC)

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Esto genera la carpeta `backend/vendor/` que debe subirse al servidor.

### 2.2 Archivo de configuración local

En su PC, copie la plantilla:

```bash
cp backend/api/v2/config/local.example.php backend/api/v2/config/local.php
```

Edite `local.php` con los datos de Hostinger:

```php
return [
    'db_host' => 'localhost',
    'db_name' => 'u123456789_gestion_mpa',
    'db_user' => 'u123456789_admin',
    'db_pass' => 'SuContraseñaSegura',

    'jwt_secret' => 'genere-una-cadena-larga-aleatoria-minimo-32-caracteres',

    'cors_origins' => 'https://tudominio.com,https://www.tudominio.com',

    // Vacío = ML deshabilitado (recomendado en hosting compartido)
    'ml_service_url' => '',
];
```

**Importante:**
- `jwt_secret` debe ser único y secreto en producción.
- `cors_origins` debe incluir la URL exacta con `https://` de su sitio.

### 2.3 Versión de PHP

En hPanel → **Configuración de PHP**:
- Seleccione **PHP 8.1** o **8.2**.
- Active extensiones: `pdo_mysql`, `curl`, `mbstring`, `json` (suelen venir activas).

---

## Paso 3 — Compilar el frontend

En la raíz del proyecto:

```bash
# Copiar plantilla de producción
cp .env.production.example .env.production
```

Edite `.env.production`:

```env
VITE_API_BASE_URL=/backend/api/v2
VITE_BASE_PATH=/
```

Si despliega en una **subcarpeta** (ej. `tudominio.com/gestion_mpa/`):

```env
VITE_API_BASE_URL=/gestion_mpa/backend/api/v2
VITE_BASE_PATH=/gestion_mpa/
```

Compile:

```bash
npm install
npm run build:hostinger
```

Se genera la carpeta `dist/` con `index.html`, `assets/` y `.htaccess`.

### Subcarpeta: ajustar RewriteBase

Si usa subcarpeta, edite `dist/.htaccess` antes de subir:

```apache
RewriteBase /gestion_mpa/
```

Y la regla de backend:

```apache
RewriteRule ^backend/ - [L]
```

(debe seguir siendo relativa a la subcarpeta; la ruta física es `public_html/gestion_mpa/backend/`)

---

## Paso 4 — Subir archivos a Hostinger

### Opción A — Administrador de archivos (hPanel)

1. Entre a **Administrador de archivos** → `public_html`.
2. Suba **todo el contenido** de `dist/` a `public_html/` (no la carpeta `dist` en sí).
3. Suba la carpeta `backend/` completa a `public_html/backend/`.

### Opción B — FTP (FileZilla)

- **Host:** ftp.tudominio.com
- **Usuario/contraseña:** los de FTP del hPanel
- **Puerto:** 21
- Suba `dist/*` → `public_html/` y `backend/` → `public_html/backend/`

### Qué NO subir

- `node_modules/`
- `src/`
- `.git/`
- `backend/tests/`
- Archivos `.env` del frontend (solo se usan al compilar)

---

## Paso 5 — SSL (HTTPS)

1. hPanel → **SSL** → active certificado gratuito (Let's Encrypt).
2. Active **Forzar HTTPS**.
3. Verifique que `cors_origins` en `local.php` use `https://`.

---

## Paso 6 — Verificar el despliegue

### API

Abra en el navegador o con curl:

```text
https://tudominio.com/backend/api/v2/auth/login
```

Debe responder JSON (aunque sea error de método si es GET); no debe mostrar error 404 de Apache ni listado de directorios.

Prueba de login:

```bash
curl -X POST https://tudominio.com/backend/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"admin\",\"password\":\"admin123\"}"
```

### Frontend

Abra `https://tudominio.com` e inicie sesión con las credenciales de la BD.

### Rutas del SPA

Navegue a `/v2/inventario`, `/v2/mantenimiento`, etc. Si al recargar aparece 404, revise que `.htaccess` esté en `public_html` y que `mod_rewrite` esté activo (Hostinger lo tiene por defecto).

---

## Paso 7 — Seguridad post-despliegue

1. **Cambie la contraseña** del usuario `admin` desde Configuración → Personal.
2. Confirme que `backend/vendor/` y `backend/sql/` no son accesibles por URL (los `.htaccess` de protección ya están incluidos).
3. No exponga `local.php` en repositorios públicos.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Error 500 en API | BD mal configurada | Revise `local.php` y credenciales en hPanel |
| CORS / login falla desde el navegador | Origen no permitido | Agregue su dominio en `cors_origins` |
| 401 en todas las rutas | Header Authorization no llega | Confirme `.htaccess` en `backend/api/v2/` |
| Página en blanco | Ruta base incorrecta | Revise `VITE_BASE_PATH` y recompile |
| 404 al recargar rutas | Falta `.htaccess` SPA | Suba `public/.htaccess` a la raíz |
| ML no funciona | Hosting compartido | Normal; deje `ml_service_url` vacío |
| Error al generar PDF | Falta memoria PHP | En hPanel suba `memory_limit` a 256M |

### Ver logs de error PHP

hPanel → **Configuración de PHP** → activar registro de errores, o revise **Logs** en el panel.

---

## Despliegue con ML (VPS Hostinger)

Si contrata un **VPS** de Hostinger:

1. Despliegue la app PHP + React como arriba.
2. En el VPS instale Python 3.10+, dependencias ML y ejecute:

```bash
cd ml
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

3. Use un proceso supervisor (`systemd`, `supervisor`) para mantener FastAPI activo.
4. En `local.php` del servidor web:

```php
'ml_service_url' => 'http://127.0.0.1:8000',
```

(Solo si PHP y Python corren en la misma máquina.)

---

## Checklist rápido

- [ ] BD creada e importada en phpMyAdmin
- [ ] `local.php` configurado en el servidor
- [ ] `composer install --no-dev` y `vendor/` subido
- [ ] `.env.production` correcto y `npm run build:hostinger` ejecutado
- [ ] Contenido de `dist/` en `public_html/`
- [ ] Carpeta `backend/` en `public_html/backend/`
- [ ] SSL activo y `cors_origins` con https
- [ ] Login probado
- [ ] Contraseña de admin cambiada

---

*Volver a [README.md](../../README.md) · [Arquitectura](../architecture.md)*
