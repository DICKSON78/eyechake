#!/bin/bash

# EyeChake Docker Deployment Script
# This script deploys the application using Docker

echo "🐳 Starting EyeChake Docker Deployment..."

# Set variables
CONTAINER_NAME="eyechake_app"
DATE=$(date +%Y%m%d_%H%M%S)

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build new image
echo "🔨 Building Docker image..."
docker build -t eyechake:latest .

# Run new container
echo "🚀 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 8074:8074 \
  -v $(pwd):/var/www \
  -v $(pwd)/docker/php/local.ini:/usr/local/etc/php/conf.d/local.ini \
  -e DB_HOST=db \
  -e DB_DATABASE=sikaf \
  -e DB_USERNAME=isaac \
  -e DB_PASSWORD=Isaac@2025 \
  -e QUEUE_CONNECTION=database \
  -e CACHE_DRIVER=file \
  -e SESSION_DRIVER=file \
  -e COMPOSER_MEMORY_LIMIT=-1 \
  --network eyechake_eyechake-network \
  eyechake:latest

# Install dependencies inside container
echo "📦 Installing dependencies..."
docker exec $CONTAINER_NAME composer install --no-dev --optimize-autoloader

# Clear caches inside container
echo "🧹 Clearing caches..."
docker exec $CONTAINER_NAME php artisan cache:clear
docker exec $CONTAINER_NAME php artisan config:clear
docker exec $CONTAINER_NAME php artisan route:clear
docker exec $CONTAINER_NAME php artisan view:clear

# Run migrations inside container
echo "🗄️ Running migrations..."
docker exec $CONTAINER_NAME php artisan migrate --force

# Seed database inside container
echo "🌱 Seeding database..."
docker exec $CONTAINER_NAME php artisan db:seed --class=ComprehensiveSystemDataSeeder --force

# Optimize inside container
echo "⚡ Optimizing application..."
docker exec $CONTAINER_NAME php artisan config:cache
docker exec $CONTAINER_NAME php artisan route:cache
docker exec $CONTAINER_NAME php artisan view:cache

# Set permissions inside container
echo "🔐 Setting permissions..."
docker exec $CONTAINER_NAME chown -R www-data:www-data /var/www
docker exec $CONTAINER_NAME chmod -R 755 /var/www
docker exec $CONTAINER_NAME chmod -R 777 /var/www/storage
docker exec $CONTAINER_NAME chmod -R 777 /var/www/bootstrap/cache

# Check container status
echo "🔍 Checking container status..."
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Container is running successfully!"
    echo "📊 Application URL: http://localhost:8074"
    echo "📋 Container name: $CONTAINER_NAME"
else
    echo "❌ Container failed to start. Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi

echo "🎉 Docker deployment completed successfully!"
