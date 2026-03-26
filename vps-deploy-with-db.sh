#!/bin/bash

# EyeChake VPS Deployment with Database Seeding
# Server: 62.171.159.62

echo "🚀 EyeChake VPS Deployment with Database Seeding"

# Server details
SERVER_IP="62.171.159.62"
SERVER_USER="root"
PROJECT_DIR="/root/eyechake"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔗 Connecting to server...${NC}"
ssh root@$SERVER_IP "echo 'Connection successful'" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connected to server${NC}"
else
    echo -e "${RED}❌ Failed to connect to server${NC}"
    exit 1
fi

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && git checkout master && git pull origin main"

echo -e "${YELLOW}🐳 Building and starting containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose up --build -d"

echo -e "${YELLOW}🏗️ Building frontend...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build build frontend"

echo -e "${YELLOW}🚀 Starting frontend...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build up frontend"

echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan migrate --force"

echo -e "${YELLOW}🌱 Seeding production data...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan db:seed --class=ProductionSeedDataSeeder --force"

echo -e "${YELLOW}🧹 Clearing caches...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan cache:clear && docker compose exec app php artisan config:clear && docker compose exec app php artisan route:clear && docker compose exec app php artisan view:clear"

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan config:cache && docker compose exec app php artisan route:cache && docker compose exec app php artisan view:cache"

echo -e "${YELLOW}🔐 Setting permissions...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app chown -R www-data:www-data /var/www && docker compose exec app chmod -R 755 /var/www && docker compose exec app chmod -R 777 /var/www/storage && docker compose exec app chmod -R 777 /var/www/bootstrap/cache"

echo -e "${YELLOW}🔄 Restarting services...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose restart"

echo -e "${YELLOW}⏱️ Waiting for services to start...${NC}"
sleep 10

echo -e "${YELLOW}🔍 Checking application status...${NC}"
if curl -f http://62.171.159.62:8074 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 URL: http://62.171.159.62:8074${NC}"
else
    echo -e "${RED}❌ Application is not responding. Checking logs...${NC}"
    ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose logs --tail=20 app"
fi

echo -e "${YELLOW}📊 Container status:${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose ps"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Login Details:${NC}"
echo -e "   👤 Admin: tech / password123"
echo -e "   👤 Sales Manager: sales_manager / password123"
echo -e "   👤 Optometry Specialist: optometry_specialist / password123"
echo -e ""
echo -e "${BLUE}🌐 Application URL: http://62.171.159.62:8074${NC}"
echo -e "${BLUE}🔑 SSH: ssh root@$SERVER_IP${NC}"
echo -e ""
echo -e "${YELLOW}💡 Quick commands for future updates:${NC}"
echo -e "   📥 Update: ssh root@$SERVER_IP 'cd $PROJECT_DIR && git pull && docker compose restart'"
echo -e "   🔄 Restart: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose restart'"
echo -e "   📋 Status: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose ps'"
