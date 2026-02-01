# EyeChake Eye Care Management System

A comprehensive eye care clinic management system built with Laravel and React. This system manages all aspects of an eye care clinic including patient records, consultations, billing, inventory, and staff management.

## Features

- **Patient Management**: Complete patient records and history
- **Consultation System**: Clinical notes, examinations, and diagnosis
- **Real-time Notifications**: WebSocket-based live updates
- **Inventory Management**: Medicine and equipment tracking
- **Financial Management**: Billing, payments, and reports
- **Staff Management**: Employee records and privilege system
- **Appointment Scheduling**: Calendar and appointment management

## System Requirements

- **PHP**: 8.1 or higher
- **Node.js**: 16.x or higher
- **MySQL**: 5.7 or higher
- **Composer**: Latest version
- **Git**: For version control

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/GhostWire619/eyechake.git
cd eyechake
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

**Configure your `.env` file with database credentials:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eyechake
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Run database migrations and seeders:**

```bash
# Create database tables
php artisan migrate

# Seed initial data
php artisan db:seed
```

### 5. WebSocket Configuration

**Add WebSocket settings to `.env`:**

```env
PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 6. Build Assets

```bash
# For development
npm run dev

# For production
npm run build
```

### 7. Start the Application

```bash
# Start Laravel development server
php artisan serve

# Start WebSocket server (in another terminal)
php artisan websockets:serve

# For development with hot reload
npm run dev
```

## Resolving Common Conflicts and Issues

### Git Conflicts

```bash
# Fetch latest changes
git fetch origin

# If you have uncommitted changes
git stash

# Pull latest changes
git pull origin main

# Apply your stashed changes
git stash pop

# Resolve conflicts in your editor, then:
git add .
git commit -m "Resolve merge conflicts"
```

### Composer Dependency Conflicts

```bash
# Clear composer cache
composer clear-cache

# Update dependencies
composer update

# If conflicts persist
rm -rf vendor/
rm composer.lock
composer install
```

### NPM Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules/
rm package-lock.json
npm install
```

### Database Migration Issues

```bash
# Reset database (WARNING: This will delete all data)
php artisan migrate:fresh --seed

# Or rollback and re-run specific migrations
php artisan migrate:rollback
php artisan migrate
```

### Permission Issues (Linux/Mac)

```bash
# Set correct permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

## cPanel Deployment Guide

### 1. Prepare Files for Upload

```bash
# Build production assets
npm run build

# Create deployment package (exclude dev files)
zip -r eyechake-production.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "tests/*" \
  -x ".env.example" \
  -x "vite.config.js" \
  -x "package*.json"
```

### 2. cPanel File Upload

1. **Login to cPanel** and open File Manager
2. **Navigate** to `public_html/` directory
3. **Upload** the zip file and extract it
4. **Move Laravel files**: Move all files except `public` folder contents to a directory above `public_html` (e.g., `laravel/`)
5. **Copy public folder**: Copy contents of `public/` folder to `public_html/`

### 3. Update Index File

**Edit `public_html/index.php`:**

```php
<?php
// Update the paths to point to your Laravel installation
require __DIR__.'/../laravel/vendor/autoload.php';
$app = require_once __DIR__.'/../laravel/bootstrap/app.php';
```

### 4. Database Setup in cPanel

1. **Create Database**: Go to MySQL Databases in cPanel
2. **Create database** named `yourdomain_eyechake`
3. **Create user** and assign to database with all privileges
4. **Import database**: Use phpMyAdmin or Import feature to import your SQL dump

### 5. Environment Configuration

**Create `.env` file in Laravel directory (above public_html):**

```env
APP_NAME="EyeChake"
APP_ENV=production
APP_KEY=your_generated_key
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourdomain_eyechake
DB_USERNAME=yourdomain_user
DB_PASSWORD=your_secure_password

# Email configuration (use cPanel email)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls

# WebSocket settings (for shared hosting, use alternative)
PUSHER_APP_ID=production
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_APP_CLUSTER=your_region
```

### 6. Run Artisan Commands via SSH/Terminal

**If SSH is available:**

```bash
cd /path/to/laravel
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan db:seed --force
```

**If SSH is not available, create a temporary script:**

Create `deploy.php` in `public_html`:

```php
<?php
// Include Laravel bootstrap
require_once '../laravel/vendor/autoload.php';
$app = require_once '../laravel/bootstrap/app.php';

// Run commands
echo "Generating key...\n";
Artisan::call('key:generate', ['--force' => true]);

echo "Caching config...\n";
Artisan::call('config:cache');

echo "Caching routes...\n";
Artisan::call('route:cache');

echo "Running migrations...\n";
Artisan::call('migrate', ['--force' => true]);

echo "Seeding database...\n";
Artisan::call('db:seed', ['--force' => true]);

echo "Deployment complete!";

// DELETE THIS FILE AFTER USE FOR SECURITY
unlink(__FILE__);
?>
```

### 7. Security Considerations

```bash
# Set proper permissions
chmod -R 644 files/
chmod -R 755 directories/
chmod 600 .env

# Ensure these directories are writable
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

### 8. SSL Certificate Setup

1. **Generate SSL** in cPanel (Let's Encrypt is usually free)
2. **Force HTTPS** by adding to `.htaccess` in `public_html`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 9. Cron Jobs Setup

**Add in cPanel Cron Jobs:**

```bash
# Laravel scheduler (run every minute)
* * * * * cd /path/to/laravel && php artisan schedule:run >> /dev/null 2>&1

# Clear expired sessions (daily)
0 2 * * * cd /path/to/laravel && php artisan session:gc
```

## Default Login Credentials

After seeding the database:
- **Username**: admin
- **Password**: password
- **Role**: Administrator

**⚠️ Change default credentials immediately after first login!**

## Troubleshooting

### Common Issues

1. **500 Error**: Check storage permissions and `.env` configuration
2. **Database Connection**: Verify database credentials in `.env`
3. **Assets Not Loading**: Run `npm run build` and check public path
4. **WebSocket Issues**: Ensure correct ports and firewall settings

### Log Files

- **Laravel Logs**: `storage/logs/laravel.log`
- **Web Server Logs**: Check cPanel Error Logs
- **Database Logs**: Check MySQL error logs in cPanel

## Support

For issues and support:
- Check the logs first
- Verify all dependencies are installed
- Ensure correct file permissions
- Contact system administrator for server-specific issues
