#!/usr/bin/env bash
# Arranque App Service Linux (PHP): DocumentRoot = api/v2
set -euo pipefail

APP_PATH="${HOME}/site/wwwroot"
DOCROOT="${APP_PATH}/api/v2"

if [ -d "$DOCROOT" ]; then
  # Enlace o config Apache/nginx según stack PHP de App Service
  export APACHE_DOCUMENT_ROOT="$DOCROOT"
  if [ -f /etc/apache2/sites-available/000-default.conf ]; then
    sed -i "s|/home/site/wwwroot|${DOCROOT}|g" /etc/apache2/sites-available/000-default.conf || true
  fi
fi

mkdir -p "${APP_PATH}/storage/login_throttle" \
         "${APP_PATH}/storage/ticket_throttle" \
         "${APP_PATH}/uploads/fichas_tecnicas" || true

# Comando por defecto del contenedor PHP de App Service
if command -v apache2-foreground >/dev/null 2>&1; then
  exec apache2-foreground
fi

# Fallback: dejar que la plataforma arranque PHP-FPM/nginx
exec "$@"
