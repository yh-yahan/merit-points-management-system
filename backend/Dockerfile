# Stage 1: Build PHP dependencies
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
COPY . .
RUN composer dump-autoload --optimize


# Stage 2: Production image
FROM php:8.2-fpm

# Install system dependencies & PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    nginx \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql zip mbstring bcmath pcntl intl exif \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy vendor from build stage
COPY --from=vendor /app/vendor ./vendor

# Copy app code
COPY . .

# Copy nginx & supervisor configs
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy entrypoint script (into final image)
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ensure storage & bootstrap/cache are writable
RUN chown -R www-data:www-data storage bootstrap/cache

# Expose HTTP port
EXPOSE 80

# Run entrypoint first, then supervisor
ENTRYPOINT ["entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
