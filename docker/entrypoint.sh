#!/bin/bash
set -e

echo "========================================="
echo "  Eyechake Application Initialization"
echo "========================================="

# Function to check service health
check_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if [ "$service" == "database" ]; then
            if php -r "new PDO('mysql:host=db;dbname=sikaf', 'isaac', 'Isaac@2025');" 2>/dev/null; then
                echo "✓ $service is ready!"
                return 0
            fi
        fi
        
        echo "  Attempt $attempt/$max_attempts - $service not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "✗ Failed to connect to $service after $max_attempts attempts"
    exit 1
}

# Wait for required services
check_service "database"

# Install/update composer dependencies
echo ""
echo "📦 Managing Composer dependencies..."
if [ ! -f "vendor/autoload.php" ] || [ ! -d "vendor/symfony/polyfill-mbstring" ]; then
    echo "  Installing composer dependencies..."
    composer install --no-interaction --no-dev --optimize-autoloader --prefer-dist
else
    echo "  ✓ Composer dependencies already installed"
fi

# Copy .env if it doesn't exist
echo ""
echo "⚙️  Configuring environment..."
if [ ! -f ".env" ]; then
    echo "  Creating .env file from example..."
    cp .env.example .env
    echo "  ✓ Environment file created"
else
    echo "  ✓ Environment file exists"
fi

# Generate app key if not set
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null || [ -z "$(grep 'APP_KEY=base64:' .env | cut -d '=' -f2)" ]; then
    echo "  Generating application key..."
    php artisan key:generate --force --no-interaction
    echo "  ✓ Application key generated"
else
    echo "  ✓ Application key already set"
fi

# Create required directories
echo ""
echo "📁 Setting up directory structure..."
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache
mkdir -p public/storage
echo "  ✓ Directories created"

# Set proper permissions
echo ""
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache
echo "  ✓ Permissions set"

# Run migrations (skip if database already populated)
echo ""
echo "🗄️  Running database migrations..."

# Check how many tables exist in the `sikaf` schema; if >0 skip migrations to avoid
# duplicate-table failures when the database was pre-populated by an init SQL dump.
cat > /tmp/check_tables.php << 'PHPEOF'
<?php
try {
    $pdo = new PDO("mysql:host=db;dbname=information_schema", "isaac", "Isaac@2025");
    $stmt = $pdo->query("SELECT COUNT(*) FROM tables WHERE table_schema='sikaf'");
    echo (int)$stmt->fetchColumn();
} catch (Exception $e) {
    echo 0;
}
PHPEOF
TABLE_COUNT=$(php /tmp/check_tables.php)

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "  ✓ Database already contains tables (count=$TABLE_COUNT); skipping migrations"
else
    if php artisan migrate:status >/dev/null 2>&1; then
        php artisan migrate --force --no-interaction
        echo "  ✓ Migrations completed"
    else
        echo "  Running initial migrations..."
        php artisan migrate --force --no-interaction
        echo "  ✓ Initial migrations completed"
    fi
fi

# Create storage link
echo ""
echo "🔗 Creating storage symlink..."
if [ ! -L "public/storage" ]; then
    php artisan storage:link --force 2>/dev/null || echo "  Storage link already exists or failed"
    echo "  ✓ Storage link created"
else
    echo "  ✓ Storage link already exists"
fi

# Clear and cache configuration for better performance
echo ""
echo "⚡ Optimizing application..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache
php artisan event:cache
echo "  ✓ Application optimized"

# Final verification
echo ""
echo "🔍 Running final checks..."
if php artisan --version >/dev/null 2>&1; then
    echo "  ✓ Laravel is responding"
fi

if php artisan migrate:status >/dev/null 2>&1; then
    echo "  ✓ Database connection verified"
fi

echo ""
echo "========================================="
echo "  ✓ Application Ready!"
echo "========================================="
echo ""

# Execute the command passed to the container (e.g., php artisan serve or php-fpm)
exec "$@"
