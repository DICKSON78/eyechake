# Professional Docker Setup for Eyechake

## Overview
Production-ready Docker Compose configuration with comprehensive health checks, automatic initialization, frontend asset building, and optimized performance settings.

## Architecture

### Services
- **app**: PHP 8.1-FPM application (with health checks)
- **nginx**: Optimized web server with compression
- **db**: MySQL 8.0 with performance tuning
- **redis**: Redis for caching and queues
- **soketi**: WebSocket server for real-time features
- **queue**: Dedicated Laravel queue worker
- **scheduler**: Laravel task scheduler
- **frontend**: One-time frontend asset builder
- **node**: Development server with hot reload (dev only)

### Features
✅ **Health Checks**: All services monitored  
✅ **Auto-initialization**: Composer install, migrations, caching  
✅ **Frontend Build**: Automated with legacy peer deps support  
✅ **Performance**: OPcache, Redis caching, Nginx compression  
✅ **Persistent Volumes**: Data persistence across restarts  
✅ **Service Dependencies**: Proper startup ordering  
✅ **Laravel Scheduler**: Automated cron tasks  
✅ **Professional Logging**: Structured logging for all services

## Quick Start

### Using Docker Compose (Recommended)
```bash
# Start all services (production mode)
docker-compose up -d

# Check service health
docker-compose ps

# View startup logs
docker-compose logs -f app
```

### Using Makefile (Easier)
```bash
# Build and start everything
make up

# Check health status
make health

# View logs
make logs

# Access shell
make shell
```

**That's it!** The setup automatically:
1. ✅ Waits for database and Redis to be ready
2. ✅ Installs Composer dependencies
3. ✅ Creates `.env` from example
4. ✅ Generates application key
5. ✅ Runs database migrations
6. ✅ Creates storage symlink
7. ✅ Sets proper permissions
8. ✅ Caches configuration for performance

## Frontend Assets

### Production Build (One-time)
```bash
# Build assets for production
docker-compose --profile build up frontend

# Or using Make
make frontend
```

### Development with Hot Reload
```bash
# Start dev server with live reload
docker-compose --profile development up -d

# Or using Make
make dev
```

Access Vite dev server at http://localhost:5173

## Accessing the Application
- **Application**: http://localhost:8000
- **Health Endpoint**: http://localhost:8000/health
- **WebSocket Server**: ws://localhost:6001
- **WebSocket Health**: http://localhost:9601
- **MySQL**: localhost:3306
- **Redis**: localhost:6379
- **Vite Dev Server**: http://localhost:5173 (dev mode)

## Common Commands

### Using Makefile (Recommended)
```bash
make help           # Show all available commands
make build          # Build Docker images
make up             # Start all containers
make down           # Stop all containers
make restart        # Restart containers
make logs           # View logs
make shell          # Access app container
make clean          # Remove everything
make migrate        # Run migrations
make fresh          # Fresh database install
make test           # Run tests
make frontend       # Build frontend assets
make dev            # Start dev environment
make health         # Check service health
```

### Using Docker Compose Directly
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f queue

# Execute commands
docker-compose exec app php artisan [command]
docker-compose exec app composer [command]

# Access database
docker-compose exec db mysql -u isaac -pIsaac@2025 sikaf

# Access Redis
docker-compose exec redis redis-cli

# Restart specific service
docker-compose restart app
docker-compose restart queue

# Check health
docker-compose exec app php artisan --version
docker-compose exec db mysqladmin ping -u root -prootpassword
docker-compose exec redis redis-cli ping
```

## Health Monitoring

All services include health checks that monitor:
- **App**: PHP-FPM process health
- **Nginx**: HTTP response from health endpoint
- **MySQL**: Database connectivity
- **Redis**: Redis ping response
- **Soketi**: WebSocket server status
- **Queue**: Queue worker monitoring

View health status:
```bash
docker-compose ps
make health
```

## Environment Configuration
Service Won't Start
```bash
# Check detailed logs
docker-compose logs -f [service_name]

# Check health status
docker-compose ps

# Restart specific service
docker-compose restart [service_name]
```

### Permission Issues
```bash
docker-compose exec app chown -R www-data:www-data /var/www
docker-compose exec app chmod -R 775 /var/www/storage /var/www/bootstrap/cache
```

### Clear Laravel Caches
```bash
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
docker-compose exec app php artisan optimize:clear
```

### Re-run Setup
If you need to re-run the automatic setup:
```bash
docker-compose restart app
```

### Database Connection Issues
```bash
# Verify database is running
docker-compose exec db mysqladmin ping -u root -prootpassword

# Check database exists
docker-compose exec db mysql -u root -prootpassword -e "SHOW DATABASES;"

# Verify connection from app
docker-compose exec app php artisan migrate:status
```

### Frontend Build Issues
```bash
# Clean build
docker-compose --profile build down
rm -rf node_modules
docker-compose --profile build build --no-cache frontend
docker-compose --profile build up frontend
```erformance Optimization

### Production Optimizations Included
- ✅ **OPcache**: PHP bytecode caching enabled
- ✅ **Redis**: Session and cache storage
- ✅ **Nginx Compression**: Gzip enabled for text resources
- ✅ **MySQL Tuning**: Optimized buffer sizes and caching
- ✅ **Laravel Caching**: Config, route, view caching
- ✅ **Asset Optimization**: Minified production builds
- ✅ **Persistent Volumes**: Reduce rebuild time

### Additional Optimizations
```bash
# Enable more aggressive OPcache (production only)
# Edit docker/php/opcache.ini and set:
# opcache.validate_timestamps=0

# Optimize autoloader
docker-compose exec app composer dump-autoload --optimize --classmap-authoritative

# Queue optimization
docker-compose exec app php artisan queue:restart
```

## Security Best Practices
Git
git clone https://github.com/yourusername/eyechake.git .

# Or use SCP/SFTP
scp -r ./* yourusername@server:/home/yourusername/eyechake/
```

#### 2. Build Images
```bash
# Build Docker images
docker-compose build --no-cache

# Verify images
docker images | grep eyechake
```

#### 3. Configure Environment
```bash
# Copy Docker-optimized environment
cp .env.docker .env

# Edit for production
nano .env
```

Update production values:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://sikafeyecare.com
SESSION_DOMAIN=.sikafeyecare.com

# Use strong credentials
DB_PASSWORD=your_strong_password
REDIS_PASSWORD=your_redis_password
```

#### 4. Start Services
```bash
# Start all services
docker-compose up -d

# Check health
docker-compose ps
docker-compose logs -f app

# Wait for "Application Ready!" message
```

#### 5. Build Frontend Assets
```bash
# Build production assets
docker-compose --profile build up frontend

# Verify assets exist
ls -la public/build/
```

#### 6. Configure cPanel Reverse Proxy

**Option A: Using cPanel Interface**
1. Go to **cPanel → Application Manager**
2. Create new application pointing to port 8000

**Option B: Using Apache Configuration**
```apache
<VirtualHost *:443>
    ServerName sikafeyecare.com
    ServerAdmin admin@sikafeyecare.com
    
    # Proxy to Docker container
    ProxyPreserveHost On
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    # WebSocket support
    ProxyPass /app/ ws://localhost:6001/app/
    ProxyPassReverse /app/ ws://localhost:6001/app/
    
    # SSL Configuration (cPanel auto-SSL or manual)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/sikafeyecare.com/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/sikafeyecare.com/privkey.pem
    SSLCertificateChainFile /etc/letsencrypt/live/sikafeyecare.com/chain.pem
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</VirtualHost>
```

#### 7. Set Up Auto-Start on Reboot
```bash
# Create systemd service
sudo nano /etc/systemd/system/eyechake-docker.service
```

Service file:
```ini
[Unit]
Description=Eyechake Docker Compose Application
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/yourusername/eyechake
ExecStartPre=/usr/bin/docker-compose pull --quiet --ignore-pull-failures
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
ExecReload=/usr/bin/docker-compose restart
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl enable eyechake-docker.service
sudo systemctl start eyechake-docker.service
sudo systemctl status eyechake-docker.service
```

#### 8. Configure Firewall
```bash
# Allow necessary ports (if needed)
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --permanent --add-port=6001/tcp
sudo firewall-cmd --reload

# Or using iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 6001 -j ACCEPT
```

#### 9. Set Up Scheduled Backups
Create cron jobs in cPanel:
```bash
# Daily database backup at 2 AM
0 2 * * * cd /home/yourusername/eyechake && docker-compose exec -T db mysqldump -u isaac -pYourPassword sikaf | gzip > /home/yourusername/backups/sikaf_$(date +\%Y\%m\%d).sql.gz

# Weekly cleanup of old backups (keep last 30 days)
0 3 * * 0 find /home/yourusername/backups/ -name "*.sql.gz" -mtime +30 -delete

# Daily logs rotation
0 4 * * * cd /home/yourusername/eyechake && docker-compose exec app php artisan queue:flush
```

### Production Monitoring

#### Health Checks
```bash
# Create monitoring script
nano ~/monitor-eyechake.sh
```

Script content:
```bash
#!/bin/bash
cd /home/yourusername/eyechake

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Services down! Restarting..." | mail -s "Eyechake Alert" admin@sikafeyecare.com
    docker-compose up -d
fi

# Check application health
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "Application unhealthy!" | mail -s "Eyechake Alert" admin@sikafeyecare.com
    docker-compose restart app nginx
fi
```

Make executable and add to cron:
```bash
chmod +x ~/monitor-eyechake.sh
# Run every 5 minutes
*/5 * * * * /home/yourusername/monitor-eyechake.sh
```

#### Log Management
```bash
# View real-time logs
docker-compose logs -f --tail=100

# Export logs for analysis
docker-compose logs --since 24h > logs_$(date +%Y%m%d).txt

# Clear old logs (be careful!)
docker-compose exec app php artisan log:clear
```

### Important cPanel Notes
- ✅ Verify Docker is enabled in hosting plan
- ✅ Check available resources (RAM, CPU, disk)
- ✅ Configure firewall rules for required ports
- ✅ Use cPanel SSL certificate manager for HTTPS
- ✅ Monitor resource usage regularly
- ✅ Set up email alerts for failures
- ✅ Keep Docker images updated
- ✅ Regular security patches

### Updating the Application
```bash
# Pull latest code
cd /home/yourusername/eyechake
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Clear caches
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan optimize

# Rebuild assets if needed
docker-compose --profile build up frontend
```

## Notes
- The MySQL initialization script (`sikaf.sql`) runs automatically on first startup
- Queue worker automatically processes jobs from Redis
- Soketi WebSocket server configured via `soketi.json`
- Laravel scheduler runs automatically every minute
- Node container (development) requires `--profile development`
- Frontend build requires `--profile build`
- Application runs on port 8000 by default
- All services include comprehensive health checks
- Volumes persist data across container restarts
- OPcache enabled for PHP performance
- Redis used for sessions, cache, and queues
# Run migrations
docker-compose exec app php artisan migrate --force

# Optimize for production
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache

# Set permissions
docker-compose exec app chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
```

#### 5. Configure cPanel Reverse Proxy
In cPanel, set up a reverse proxy to forward traffic from your domain to the Docker container:

1. Go to **cPanel → Terminal** or SSH
2. Create/edit Apache virtual host configuration
3. Add reverse proxy rules:

```apache
<VirtualHost *:443>
    ServerName sikafeyecare.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    # WebSocket support
    ProxyPass /socket.io/ ws://localhost:6001/socket.io/
    ProxyPassReverse /socket.io/ ws://localhost:6001/socket.io/
    
    # SSL Configuration (use cPanel SSL)
    SSLEngine on
    SSLCertificateFile /path/to/cert.crt
    SSLCertificateKeyFile /path/to/private.key
</VirtualHost>
```

#### 6. Set Up Auto-Start on Server Reboot
```bash
# Create systemd service file
sudo nano /etc/systemd/system/eyechake-docker.service
```

Add this content:
```ini
[Unit]
Description=Eyechake Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/yourusername/eyechake
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable eyechake-docker.service
sudo systemctl start eyechake-docker.service
```

#### 7. Monitor Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app
docker-compose logs -f nginx
```

### Important cPanel Notes
- Ensure Docker is enabled in your hosting plan
- You may need to contact your hosting provider to enable Docker
- Check firewall rules allow ports 8000, 6001, 3306, 6379
- Use cPanel's built-in SSL certificate manager for HTTPS
- Set up cron jobs in cPanel to run scheduled tasks:
  ```bash
  cd /home/yourusername/eyechake && docker-compose exec -T app php artisan schedule:run
  ```

### Backup Strategy
```bash
# Backup database
docker-compose exec db mysqldump -u isaac -pIsaac@2025 sikaf > backup_$(date +%Y%m%d).sql

# Backup volumes
docker-compose exec app tar -czf /tmp/storage-backup.tar.gz /var/www/storage
docker cp eyechake_app:/tmp/storage-backup.tar.gz ./backups/
```

## Notes
- The MySQL initialization script (`sikaf.sql`) will run automatically on first startup
- Queue worker automatically processes jobs from the queue
- Soketi WebSocket server is configured via `soketi.json`
- Node container only runs with `--profile development` flag
- Application runs on port 8000 by default
