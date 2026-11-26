FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libzip-dev unzip git \
        libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql zip gd \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .

RUN mkdir -p storage/login_throttle storage/ticket_throttle uploads/fichas_tecnicas \
    && chown -R www-data:www-data /var/www/backend/storage /var/www/backend/uploads \
    && printf '%s\n' \
        '<Directory /var/www/backend/api/v2>' \
        '    Options -Indexes' \
        '    AllowOverride All' \
        '    Require all granted' \
        '</Directory>' \
        'Alias /uploads /var/www/backend/uploads' \
        '<Directory /var/www/backend/uploads>' \
        '    Options -Indexes' \
        '    Require all granted' \
        '</Directory>' \
        > /etc/apache2/conf-available/api-v2.conf \
    && a2enconf api-v2

ENV APACHE_DOCUMENT_ROOT=/var/www/backend/api/v2

# Solo sites-available: el sed amplio sobre apache2.conf puede dejar 2 MPM cargados.
RUN sed -ri -e 's!/var/www/html!/var/www/backend/api/v2!g' /etc/apache2/sites-available/*.conf \
    && a2dismod mpm_event 2>/dev/null || true \
    && a2dismod mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
