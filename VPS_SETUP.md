# EyeChake VPS Setup & Deployment Guide

## 🖥️ Server Details
- **IP Address:** `62.171.159.62`
- **Password:** `htaR978cfnPX`
- **SSH Command:** `ssh root@62.171.159.62`
- **Project Directory:** `/root/eyechake`

## 🚀 Quick Deployment Commands

### 1. First Time Setup
```bash
# Connect to server
ssh root@62.171.159.62

# Navigate to project
cd eyechake

# Pull latest changes
git checkout master
git pull origin main

# Deploy
docker compose up --build -d
docker compose --profile build build frontend
docker compose --profile build up frontend
```

### 2. Quick Update (Daily)
```bash
ssh root@62.171.159.62 "cd eyechake && git pull && docker compose restart"
```

### 3. Full Redeploy (When needed)
```bash
ssh root@62.171.159.62 "cd eyechake && docker compose down && docker compose build --no-cache && docker compose up -d && docker compose --profile build build --no-cache frontend && docker compose --profile build up frontend"
```

## 📋 Deployment Scripts

### Automated Scripts Available:
1. **`vps-deploy.sh`** - Complete deployment with all steps
2. **`quick-update.sh`** - Quick update and restart
3. **`full-redeploy.sh`** - Complete rebuild and redeploy

### Usage:
```bash
# From local machine
./vps-deploy.sh      # Full deployment
./quick-update.sh   # Quick update
./full-redeploy.sh  # Full redeploy
```

## 🔧 Manual Deployment Steps

### Step 1: Connect to Server
```bash
ssh root@62.171.159.62
```

### Step 2: Navigate to Project
```bash
cd eyechake
```

### Step 3: Pull Latest Changes
```bash
git checkout master
git pull origin main
```

### Step 4: Deploy Application
```bash
# Build and start containers
docker compose up --build -d

# Build frontend
docker compose --profile build build frontend

# Start frontend
docker compose --profile build up frontend
```

### Step 5: Clear Caches
```bash
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear
```

### Step 6: Run Migrations
```bash
docker compose exec app php artisan migrate --force
```

### Step 7: Seed Database (if needed)
```bash
docker compose exec app php artisan db:seed --class=ComprehensiveSystemDataSeeder --force
```

### Step 8: Optimize Application
```bash
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
```

## 🔍 Troubleshooting

### Check Application Status
```bash
# Check containers
docker compose ps

# Check logs
docker compose logs --tail=50 app

# Test application
curl http://localhost:8074
```

### Common Issues

#### 1. Application Not Loading
```bash
# Restart containers
docker compose restart

# Clear caches
docker compose exec app php artisan cache:clear
```

#### 2. Frontend Not Updated
```bash
# Rebuild frontend
docker compose --profile build build --no-cache frontend
docker compose --profile build up frontend
```

#### 3. Database Issues
```bash
# Check database connection
docker compose exec app php artisan tinker
>>> DB::connection()->getPdo();

# Run migrations
docker compose exec app php artisan migrate --force
```

#### 4. Permission Issues
```bash
# Fix permissions
docker compose exec app chown -R www-data:www-data /var/www
docker compose exec app chmod -R 755 /var/www
docker compose exec app chmod -R 777 /var/www/storage
```

## 🔄 Git Workflow

### Local Development to Production
1. **Make changes locally**
2. **Commit changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to main**
   ```bash
   git checkout master
   git merge your-branch
   git push origin master
   ```
4. **Deploy to VPS**
   ```bash
   ssh root@62.171.159.62 "cd eyechake && git pull && docker compose restart"
   ```

### Automatic Updates
The VPS is configured to automatically pull from the main branch when you run the deployment scripts.

## 📊 Monitoring

### Check Application Health
```bash
# Application URL
http://62.171.159.62:8074

# Health check endpoint
curl http://62.171.159.62:8074/api/health
```

### Monitor Resources
```bash
# System resources
htop
df -h
free -h

# Docker resources
docker stats
docker compose ps
```

## 🎯 Best Practices

### Daily Routine
1. **Quick update:** `./quick-update.sh`
2. **Check logs:** `ssh root@62.171.159.62 "cd eyechake && docker compose logs --tail=20"`
3. **Monitor performance:** Check application response time

### Weekly Routine
1. **Full redeploy:** `./full-redeploy.sh`
2. **Database backup:** `mysqldump -u isaac -p sikaf > backup.sql`
3. **System updates:** `apt update && apt upgrade`

### Monthly Routine
1. **Security updates**
2. **Performance optimization**
3. **Log rotation**

## 🚨 Emergency Procedures

### Application Down
```bash
# Quick restart
ssh root@62.171.159.62 "cd eyechake && docker compose restart"

# Full rebuild if needed
ssh root@62.171.159.62 "cd eyechake && docker compose down && docker compose up -d"
```

### Database Issues
```bash
# Check database status
docker compose exec db mysql -u isaac -p sikaf -e "SHOW STATUS;"

# Backup database
docker compose exec db mysqldump -u isaac -p sikaf > backup.sql
```

---

## 📞 Support

For any issues:
1. Check the troubleshooting section
2. Review application logs
3. Test database connectivity
4. Verify Docker containers are running

**🎉 Your EyeChake application is now ready for production on VPS!**
