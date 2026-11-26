#!/bin/bash
set -euo pipefail

PORT="${PORT:-80}"

# Un solo MPM (prefork) — evita AH00534 en algunos hosts.
a2dismod mpm_event >/dev/null 2>&1 || true
a2dismod mpm_worker >/dev/null 2>&1 || true
a2enmod mpm_prefork >/dev/null 2>&1 || true

# Render / Railway inyectan PORT; Apache debe escucharlo.
if [ -f /etc/apache2/ports.conf ]; then
  sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
fi
if [ -f /etc/apache2/sites-available/000-default.conf ]; then
  sed -i "s/:80>/:${PORT}>/g" /etc/apache2/sites-available/000-default.conf
fi

mkdir -p /var/www/backend/storage/login_throttle \
         /var/www/backend/storage/ticket_throttle \
         /var/www/backend/uploads/fichas_tecnicas
chown -R www-data:www-data /var/www/backend/storage /var/www/backend/uploads || true

exec "$@"
