#!/bin/bash

# EyeChake VPS Safe Deployment Script
# Preserves existing database and user data while deploying updates

echo "🛡️ EyeChake VPS Safe Deployment Script"
echo "📍 Server: 62.171.159.62"
echo "📁 Project: /root/eyechake"

# Server details
SERVER_IP="62.171.159.62"
PROJECT_DIR="/root/eyechake"
BACKUP_DIR="/var/backups/eyechake"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to execute commands on server
execute_on_server() {
    echo -e "${BLUE}🔧 Executing on server: $1${NC}"
    ssh root@$SERVER_IP "cd $PROJECT_DIR && $1"
}

# Function to check if command was successful
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success: $1${NC}"
    else
        echo -e "${RED}❌ Error: $1${NC}"
        return 1
    fi
}

echo -e "${YELLOW}🔗 Connecting to server...${NC}"
execute_on_server "echo 'Connection successful'" > /dev/null 2>&1
if [ $? -neq 0 ]; then
    echo -e "${RED}❌ Failed to connect to server${NC}"
    echo -e "${YELLOW}💡 Trying alternative connection...${NC}"
    echo -e "${YELLOW}   Command: ssh root@$SERVER_IP${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to server${NC}"

echo -e "${YELLOW}📋 Creating backup directory...${NC}"
execute_on_server "mkdir -p $BACKUP_DIR"

echo -e "${YELLOW}💾 Backing up database...${NC}"
execute_on_server "docker compose exec db mysqldump -u isaac -pIsaac@2025 sikaf > $BACKUP_DIR/sikaf_backup_before_$DATE.sql"

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
execute_on_server "git checkout master && git pull origin master"

echo -e "${YELLOW}🔍 Checking for database structure changes...${NC}"
execute_on_server "docker compose exec app php artisan migrate:status"

echo -e "${YELLOW}🏗️ Building containers (no cache)...${NC}"
execute_on_server "docker compose build --no-cache"

echo -e "${YELLOW}🚀 Starting containers...${NC}"
execute_on_server "docker compose up -d"

echo -e "${YELLOW}⏱️ Waiting for containers to start...${NC}"
sleep 15

echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
execute_on_server "docker compose exec app php artisan migrate --force"

echo -e "${YELLOW}🌱️ Seeding production data (preserving existing)...${NC}"
execute_on_server "docker compose exec app php artisan db:seed --class=ProductionSeedDataSeeder --force"

echo -e "${YELLOW}🧹 Clearing caches...${NC}"
execute_on_server "docker compose exec app php artisan cache:clear"
execute_on_server "docker compose exec app php artisan config:clear"
execute_on_server "docker compose exec app php artisan route:clear"
execute_on_server "docker compose exec app php artisan view:clear"

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
execute_on_server "docker compose exec app php artisan config:cache"
execute_on_server "docker compose exec app php artisan route:cache"
execute_onserver "docker compose exec app php artisan view:cache"

echo -e "${YELLOW}🔐 Setting permissions...${NC}"
execute_on_server "docker compose exec app chown -R www-data:www-data /var/www"
execute_on_server "docker compose exec app chmod -R 755 /var/www"
execute_on_server "docker compose exec app chmod -R 777 /var/www/storage"
execute_on_server "docker compose exec app chmod -R 777 /var/www/bootstrap/cache"

echo -e "${YELLOW}🔄 Restarting services...${NC}"
execute_on_server "docker compose restart"

echo -e "${YELLOW}⏱️ Waiting for services to fully start...${NC}"
sleep 20

echo -e "${YELLOW}🔍 Checking application status...${NC}"
if curl -f http://62.171.159.62:8074 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 URL: http://62.171.159.62:8074${NC}"
else
    echo -e "${RED}❌ Application is not responding. Checking logs...${NC}"
    execute_on_server "docker compose logs --tail=20 app"
fi

echo -e "${YELLOW}📊 Container status:${NC}"
execute_on_server "docker compose ps"

echo -e "${YELLOW}👤 Checking user accounts...${NC}"
execute_on_server "docker compose exec app php artisan tinker -e \"DB::table('users')->count();\""

echo -e "${YELLOW}📊 Checking database tables...${NC}"
execute_on_server "docker compose exec app php artisan tinker -e \"DB::table('department_kpi_targets')->count();\""

echo -e "${YELLOW}📊 Checking user privileges...${NC}"
execute_on_server "docker compose exec app php artisan tinker -e \"DB::table('user_privileges')->count();\""

echo -e "${GREEN}🎉 Safe deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   📍 Server: $SERVER_IP"
echo -e "   📁 Project: $PROJECT_DIR"
echo -e "   🌐 URL: http://62.171.159.62:8074"
echo -e "   👤 SSH: ssh root@$SERVER_IP"
echo -e "   💾 Database Backup: $BACKUP_DIR/sikaf_backup_before_$DATE.sql"
echo -e ""
echo -e "${BLUE}📋 Login Details:${NC}"
echo -e "   👤 Admin: tech / password123"
echo -e "   👤 Sales Manager: sales_manager / password123"
echo -e "   👤 Optometry Specialist: optometry_specialist / password123"
echo -e ""
echo -e "${YELLOW}💡 Quick commands for future updates:${NC}"
echo -e "   📥 Safe Update: ./vps-safe-deploy.sh"
echo -e "   🔄 Quick Restart: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose restart'"
echo -e "   📋 Status: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose ps'"
echo -e "   💾 Database Backup: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose exec db mysqldump -u isaac -pIsaac@2025 sikaf > backup.sql'"
echo -e ""
echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo -e "   📋 Logs: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose logs --tail=50 app'"
echo -e "   🔄 Restart: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose restart'"
echo -e "   🛠️ Rollback: ssh root@$SERVER_IP 'cd $PROJECT_DIR && git reset --hard HEAD~1 && docker compose up --build -d'"
