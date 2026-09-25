# Despliegue en producción — Sigemad MPA V2

Guía para publicar el sistema en un servidor web convencional (Apache + PHP + MySQL), igual que cualquier aplicación PHP con frontend compilado.

> **ML (opcional):** FastAPI es un proceso aparte. Si el servidor no lo ejecuta, deje `ml_service_url` vacío: inventario, login, fichas y mantenimiento siguen operando. Para activar predicciones, despliegue el microservicio en la misma máquina o en una red privada y apunte la URL en `local.php`.

---

## Resumen del despliegue

| Componente | Dónde va en el servidor |
|------------|-------------------------|
| Frontend (React compilado) | DocumentRoot (raíz del sitio) |
| Backend PHP + API | `{DocumentRoot}/backend/` |
| Base de datos | MySQL / MariaDB del servidor |
| ML (opcional) | Proceso FastAPI en `127.0.0.1:8000` o URL interna |

**Estructura final en el servidor:**

```text
{DocumentRoot}/          ← p. ej. /var/www/html o htdocs de Apache
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

## Requisitos del servidor

1. Apache (o compatible) con PHP **8.1+**, `mod_rewrite` y MySQL/MariaDB.
2. Dominio o subdominio apuntando al DocumentRoot.
3. Acceso para copiar archivos (SFTP, SCP, rsync o administrador de archivos) y para crear la base de datos (phpMyAdmin, cliente MySQL o panel del hosting).

Extensiones PHP: `pdo_mysql`, `curl`, `mbstring`, `json`. `memory_limit` ≥ 256M si Dompdf falla al generar PDF.

---

## Paso 1 — Crear la base de datos

1. Cree una base de datos (ej. `gestion_equipos_mpa_v2`).
2. Cree un usuario con privilegios sobre esa BD.
3. Anote: **host** (suele ser `localhost`), **nombre BD**, **usuario** y **contraseña**.

### Importar datos

Importe con phpMyAdmin, `mysql` CLI o la herramienta que use el servidor:

- `gestion_equipos_mpa_v2.sql` (raíz del proyecto), **o**
- `backend/sql/v2_estructura.sql` si prefiere solo estructura + datos seed.

Si el archivo es grande, use la CLI (`mysql < archivo.sql`) o divida el SQL.

---

## Paso 2 — Configurar el backend (PHP)

### 2.1 Dependencias Composer (en su PC)

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Esto genera la carpeta `backend/vendor/` que debe copiarse al servidor.

### 2.2 Archivo de configuración local

En su PC, copie la plantilla:

```bash
cp backend/api/v2/config/local.example.php backend/api/v2/config/local.php
```

Edite `local.php` con los datos del servidor de producción:

```php
return [
    'db_host' => 'localhost',
    'db_name' => 'gestion_equipos_mpa_v2',
    'db_user' => 'usuario_produccion',
    'db_pass' => 'SuContraseñaSegura',

    'jwt_secret' => 'genere-una-cadena-larga-aleatoria-minimo-32-caracteres',

    'cors_origins' => 'https://tudominio.com,https://www.tudominio.com',

    // Vacío = ML deshabilitado. Con FastAPI en el mismo servidor:
    // 'ml_service_url' => 'http://127.0.0.1:8000',
    'ml_service_url' => '',
];
```

**Importante:**
- `jwt_secret` debe ser único y secreto en producción.
- `cors_origins` debe incluir la URL exacta con `https://` de su sitio.

### 2.3 Versión de PHP

Seleccione **PHP 8.1** o **8.2** en la configuración del servidor (panel, `php.ini` o virtual host).

---

## Paso 3 — Compilar el frontend

En la raíz del proyecto:

```bash
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
npm run build
```

Se genera la carpeta `dist/` con `index.html`, `assets/` y `.htaccess`.

### Subcarpeta: ajustar RewriteBase

Si usa subcarpeta, edite `dist/.htaccess` antes de copiar:

```apache
RewriteBase /gestion_mpa/
```

La regla de backend debe seguir siendo relativa a la subcarpeta:

```apache
RewriteRule ^backend/ - [L]
```

---

## Paso 4 — Copiar archivos al servidor

Use el método habitual del entorno (SFTP, SCP, rsync, FileZilla o administrador de archivos):

1. Copie **todo el contenido** de `dist/` a `{DocumentRoot}/` (no la carpeta `dist` en sí).
2. Copie la carpeta `backend/` completa a `{DocumentRoot}/backend/`.

Ejemplo con rsync:

```bash
rsync -avz dist/ usuario@servidor:/var/www/html/
rsync -avz backend/ usuario@servidor:/var/www/html/backend/
```

### Qué NO subir

- `node_modules/`
- `src/`
- `.git/`
- `backend/tests/`
- Archivos `.env` del frontend (solo se usan al compilar)

---

## Paso 5 — SSL (HTTPS)

1. Instale un certificado (Let's Encrypt / Certbot, o el que provea el servidor).
2. Redirija HTTP a HTTPS.
3. Verifique que `cors_origins` en `local.php` use `https://`.

---

## Paso 6 — Verificar el despliegue

### API

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

Navegue a `/v2/inventario`, `/v2/mantenimiento`, etc. Si al recargar aparece 404, revise que `.htaccess` esté en el DocumentRoot y que `mod_rewrite` esté activo (`AllowOverride All` en el virtual host).

---

## Paso 7 — Seguridad post-despliegue

1. **Cambie la contraseña** del usuario `admin` desde Configuración → Personal.
2. Confirme que `backend/vendor/` y `backend/sql/` no son accesibles por URL (los `.htaccess` de protección ya están incluidos).
3. No exponga `local.php` en repositorios públicos.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Error 500 en API | BD mal configurada | Revise `local.php` y credenciales MySQL |
| CORS / login falla desde el navegador | Origen no permitido | Agregue su dominio en `cors_origins` |
| 401 en todas las rutas | Header Authorization no llega | Confirme `.htaccess` en `backend/api/v2/` |
| Página en blanco | Ruta base incorrecta | Revise `VITE_BASE_PATH` y recompile |
| 404 al recargar rutas | Falta `.htaccess` SPA | Copie `public/.htaccess` a la raíz |
| ML no funciona | FastAPI no está en ejecución | Normal si `ml_service_url` está vacío; ver sección siguiente |
| Error al generar PDF | Falta memoria PHP | Suba `memory_limit` a 256M |

### Ver logs de error PHP

Revise el error log de Apache (`error.log`) o active el registro de errores en `php.ini` del entorno de producción.

---

## Despliegue con ML

Si el servidor puede ejecutar Python (VPS, máquina institucional, contenedor):

1. Despliegue la app PHP + React como arriba.
2. Instale Python 3.10+, dependencias ML y ejecute:

```bash
cd ml
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

3. Use un supervisor (`systemd`, `supervisor`) para mantener FastAPI activo.
4. En `local.php` del servidor web:

```php
'ml_service_url' => 'http://127.0.0.1:8000',
```

(Solo si PHP y Python corren en la misma máquina, o use una URL interna equivalente.)

---

## Rollback (M-004)

Si el servidor no tiene el repositorio Git, el rollback es **restaurar artefactos**, no un force-push.

### Antes de cada publicación

1. Exportar la base MySQL (`mysqldump` o phpMyAdmin → Exportar). Guardar el `.sql` **fuera** del repo, con fecha.
2. Copiar el DocumentRoot actual (al menos `index.html`, `assets/`, `backend/` excepto `local.php` si va a reutilizarse).
3. No sobrescribir `local.php` del servidor con una plantilla vacía.

### Cómo volver atrás

1. Poner el sitio en aviso breve si es posible (o aceptar downtime corto).
2. Restaurar `dist/` anterior en el DocumentRoot (HTML + `assets/` + `.htaccess` SPA).
3. Restaurar `{DocumentRoot}/backend/` (código PHP + `vendor/`). **Reponer** `backend/api/v2/config/local.php` con las credenciales vigentes.
4. Si el cambio incluía migración SQL: importar el dump **previo**. No aplicar a ciegas un ALTER inverso si no está ensayado en XAMPP.
5. Smoke: `POST /backend/api/v2/auth/login` y una pantalla `/v2/inventario`.
6. ML: si `ml_service_url` está vacío, no es un fallo de rollback.

### Secretos

- `local.php`, JWT secret y passwords de base de datos **no** van a Git ni a un prompt.
- Tras un restore, confirmar que no quedó un `local.php` de ejemplo en una URL pública.
- Rotar `admin` / `admin123` si ese seed se reimportó.

---

## Checklist rápido

- [ ] BD creada e importada
- [ ] `local.php` configurado en el servidor
- [ ] `composer install --no-dev` y `vendor/` copiado
- [ ] `.env.production` correcto y `npm run build` ejecutado
- [ ] Contenido de `dist/` en el DocumentRoot
- [ ] Carpeta `backend/` en `{DocumentRoot}/backend/`
- [ ] SSL activo y `cors_origins` con https
- [ ] Login probado
- [ ] Contraseña de admin cambiada
- [ ] Dump de BD y copia del DocumentRoot guardados (rollback)

---

*Volver a [README.md](../../README.md) · [Arquitectura](../02_diseno/architecture.md)*
