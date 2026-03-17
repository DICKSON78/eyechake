#!/bin/bash

# EyeChake VPS Deployment Script
# Server: 62.171.159.62
# Project: /root/eyechake

echo "🚀 EyeChake VPS Deployment Script"
echo "📍 Server: 62.171.159.62"
echo "📁 Project: /root/eyechake"

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
        exit 1
    fi
}

echo -e "${YELLOW}🔗 Connecting to server...${NC}"

# Test SSH connection
ssh -o ConnectTimeout=10 root@$SERVER_IP "echo 'Connection successful'" > /dev/null 2>&1
check_success "SSH connection test"

echo -e "${YELLOW}📥 Pulling latest changes from main branch...${NC}"
execute_on_server "git checkout master && git pull origin main"
check_success "Git pull"

echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
execute_on_server "docker compose up --build -d"
check_success "Docker compose up"

echo -e "${YELLOW}🏗️ Building frontend...${NC}"
execute_on_server "docker compose --profile build build frontend"
check_success "Frontend build"

echo -e "${YELLOW}🚀 Starting frontend...${NC}"
execute_on_server "docker compose --profile build up frontend"
check_success "Frontend start"

echo -e "${YELLOW}🧹 Clearing caches...${NC}"
execute_on_server "docker compose exec app php artisan cache:clear"
execute_on_server "docker compose exec app php artisan config:clear"
execute_on_server "docker compose exec app php artisan route:clear"
execute_on_server "docker compose exec app php artisan view:clear"
check_success "Cache clearing"

echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
execute_on_server "docker compose exec app php artisan migrate --force"
check_success "Database migrations"

echo -e "${YELLOW}🌱 Seeding database...${NC}"
execute_on_server "docker compose exec app php artisan db:seed --class=ComprehensiveSystemDataSeeder --force"
check_success "Database seeding"

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
execute_on_server "docker compose exec app php artisan config:cache"
execute_on_server "docker compose exec app php artisan route:cache"
execute_on_server "docker compose exec app php artisan view:cache"
check_success "Application optimization"

echo -e "${YELLOW}🔐 Setting permissions...${NC}"
execute_on_server "docker compose exec app chown -R www-data:www-data /var/www"
execute_on_server "docker compose exec app chmod -R 755 /var/www"
execute_on_server "docker compose exec app chmod -R 777 /var/www/storage"
execute_on_server "docker compose exec app chmod -R 777 /var/www/bootstrap/cache"
check_success "Permissions setup"

echo -e "${YELLOW}🔄 Restarting services...${NC}"
execute_on_server "docker compose restart"
check_success "Services restart"

echo -e "${YELLOW}🔍 Checking application status...${NC}"
# Wait a moment for services to start
sleep 10

# Check if application is responding
if curl -f http://62.171.159.62:8074 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 URL: http://62.171.159.62:8074${NC}"
else
    echo -e "${RED}❌ Application is not responding. Checking logs...${NC}"
    execute_on_server "docker compose logs --tail=20 app"
fi

echo -e "${YELLOW}📊 Container status:${NC}"
execute_on_server "docker compose ps"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   📍 Server: $SERVER_IP"
echo -e "   📁 Project: $PROJECT_DIR"
echo -e "   🌐 URL: http://62.171.159.62:8074"
echo -e "   🔑 SSH: ssh root@$SERVER_IP"
echo -e ""
echo -e "${YELLOW}💡 Quick commands for future updates:${NC}"
echo -e "   📥 Update: ssh root@$SERVER_IP 'cd $PROJECT_DIR && git pull && docker compose up --build -d'"
echo -e "   🔄 Restart: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose restart'"
echo -e "   📋 Status: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose ps'"
