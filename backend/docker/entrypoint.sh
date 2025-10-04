#!/bin/sh
set -e

echo "Running Laravel optimizations..."

php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting services..."
exec "$@"
