# Stage 1: Build PHP dependencies
FROM php:8.2-cli AS vendor

# Install system deps + PHP extensions needed for composer install
RUN apt-get update && apt-get install -y \
    unzip git curl libpq-dev libzip-dev libonig-dev libxml2-dev libicu-dev \
    libpng-dev libjpeg-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip mbstring bcmath intl pcntl gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy full application (including artisan)
COPY . .

# Install PHP dependencies
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Stage 2: Production runtime
FROM php:8.2-fpm

# Install system deps + PHP extensions for runtime
RUN apt-get update && apt-get install -y \
    nginx supervisor libpq-dev libzip-dev libonig-dev libxml2-dev libicu-dev \
    libpng-dev libjpeg-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip mbstring bcmath intl pcntl exif intl gd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy vendor from build stage
COPY --from=vendor /app/vendor ./vendor

# Copy app code
COPY . .

# Copy configs
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Make entrypoint executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ensure storage & bootstrap/cache are writable
RUN chown -R www-data:www-data storage bootstrap/cache

# Expose HTTP port
EXPOSE 80

# Entrypoint handles Laravel cache setup
ENTRYPOINT ["entrypoint.sh"]

# Supervisor runs php-fpm + nginx
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
