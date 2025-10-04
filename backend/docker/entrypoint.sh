#!/bin/sh
set -e

echo "🚀 Starting Laravel container..."

# Ensure storage & bootstrap/cache are writable (in case volume overrides permissions)
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Run Laravel optimizations
echo "⚡ Clearing old caches..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

echo "⚡ Rebuilding caches..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✅ Laravel setup complete, starting services..."

# Execute CMD from Dockerfile (supervisord runs php-fpm + nginx)
exec "$@"
