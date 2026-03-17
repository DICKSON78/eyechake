#!/bin/bash

# EyeChake Deployment Script
# This script deploys the application to VPS

echo "🚀 Starting EyeChake Deployment..."

# Set variables
APP_DIR="/var/www/eyechake"
BACKUP_DIR="/var/backups/eyechake"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR

# Backup current deployment
echo "📦 Creating backup..."
sudo cp -r $APP_DIR $BACKUP_DIR/backup_$DATE

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Install/update composer dependencies
echo "📦 Installing composer dependencies..."
composer install --no-dev --optimize-autoloader

# Clear caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Seed database (if needed)
echo "🌱 Seeding database..."
php artisan db:seed --class=ComprehensiveSystemDataSeeder --force

# Optimize application
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 777 $APP_DIR/storage
sudo chmod -R 777 $APP_DIR/bootstrap/cache

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm
sudo systemctl restart supervisor

# Check if application is running
echo "🔍 Checking application status..."
if curl -f http://localhost:8074 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
else
    echo "❌ Application is not responding. Please check logs."
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Application URL: http://your-domain.com:8074"
echo "📋 Backup location: $BACKUP_DIR/backup_$DATE"
