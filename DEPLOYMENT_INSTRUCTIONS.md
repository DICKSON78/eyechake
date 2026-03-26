# EyeChake Deployment Instructions

## 🚀 Quick Deployment Guide

### Prerequisites
- Docker & Docker Compose installed
- Git installed
- PHP 8.1+ (for non-Docker deployment)
- MySQL/MariaDB database
- Nginx (for production)

### 📋 Deployment Steps

#### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/GhostWire619/eyechake.git
   cd eyechake
   ```

2. **Set up environment**
   ```bash
   cp .env.production .env
   # Edit .env with your database credentials
   ```

3. **Run deployment script**
   ```bash
   chmod +x docker-deploy.sh
   ./docker-deploy.sh
   ```

4. **Access the application**
   - URL: http://localhost:8074
   - Default admin: tech / yourpassword

#### Option 2: Traditional Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/GhostWire619/eyechake.git
   cd eyechake
   ```

2. **Install dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm install && npm run build
   ```

3. **Set up environment**
   ```bash
   cp .env.production .env
   # Edit .env with your database credentials
   ```

4. **Run deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 🔧 Configuration

#### Database Setup
```sql
CREATE DATABASE sikaf;
CREATE USER 'isaac'@'%' IDENTIFIED BY 'Isaac@2025';
GRANT ALL PRIVILEGES ON sikaf.* TO 'isaac'@'%';
FLUSH PRIVILEGES;
```

#### Environment Variables
Key variables to configure in `.env`:
- `APP_URL` - Your application URL
- `DB_HOST` - Database host
- `DB_DATABASE` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### 🐳 Docker Services

The application uses these Docker services:
- **app** - PHP application (port 8074)
- **db** - MySQL database
- **nginx** - Web server
- **redis** - Caching (optional)

### 📊 Features Deployed

✅ **CRM Reports**
- CRM Report Card with real API data
- Marketing Contact Analytics
- Lead Conversion Report

✅ **Optometry Reports**
- Optometry Performance Report Card
- Real charts with filter functionality
- Professional dashboard design

✅ **Sales Reports**
- Sales Performance Report Card
- Period filters (7 days, 30 days, custom weeks)
- Automatic data refresh

✅ **Access Control**
- Updated privileges for Optometry and Sales reports
- Role-based access control
- Security improvements

✅ **Performance Enhancements**
- WebSocket cleanup fixes
- Cash available calculation (payments - expenses)
- Optimized chart rendering

### 🔍 Troubleshooting

#### Common Issues

1. **Permission Denied**
   ```bash
   sudo chown -R www-data:www-data /var/www/eyechake
   sudo chmod -R 755 /var/www/eyechake
   ```

2. **Database Connection Failed**
   - Check database credentials in `.env`
   - Ensure database server is running
   - Verify database exists

3. **Application Not Loading**
   ```bash
   # Check logs
   docker logs eyechake_app
   
   # Clear caches
   php artisan cache:clear
   php artisan config:clear
   ```

4. **WebSocket Issues**
   - Check WebSocket configuration
   - Verify port 6001 is available
   - Check firewall settings

#### Health Checks

1. **Application Health**
   ```bash
   curl http://localhost:8074/api/health
   ```

2. **Database Connection**
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

3. **WebSocket Status**
   ```bash
   curl http://localhost:6001
   ```

### 🔄 Updates and Maintenance

#### Updating the Application
```bash
git pull origin master
./deploy.sh  # or ./docker-deploy.sh
```

#### Backup Strategy
- Daily database backups
- Weekly file system backups
- Version control with Git tags

#### Monitoring
- Application logs: `storage/logs/laravel.log`
- Docker logs: `docker logs eyechake_app`
- Nginx logs: `/var/log/nginx/`

### 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test database connectivity

### 🎯 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Database connection works
- [ ] Users can log in
- [ ] Reports display correctly
- [ ] WebSocket functionality works
- [ ] File uploads work
- [ ] Email notifications send
- [ ] Backup system is configured
- [ ] Monitoring is set up
- [ ] SSL certificate is installed (for production)

---

**🚀 Your EyeChake application is now ready for production!**
