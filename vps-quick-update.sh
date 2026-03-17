#!/bin/bash

# EyeChake VPS Quick Update Script
# Updates application without touching database data

echo "⚡ EyeChake VPS Quick Update Script"

SERVER_IP="62.171.159.62"
PROJECT_DIR="/root/eyechake"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && git checkout master && git pull origin master"

echo -e "${YELLOW}🏗️ Rebuilding containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose build --no-cache"

echo -e "${YELLOW}🚀 Restarting containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose up -d"

echo -e "${YELLOW}🏗️ Rebuilding frontend...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build build --no-cache frontend"

echo -e "${YELLOW}🚀 Starting frontend...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build up frontend"

echo -e "${YELLOW}🧹 Clearing caches...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan cache:clear && docker compose exec app php artisan config:clear && docker compose exec app php artisan route:clear"

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan config:cache && docker compose exec app php artisan route:cache"

echo -e "${YELLOW}🔄 Restarting services...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose restart"

echo -e "${YELLOW}⏱️ Waiting for services to start...${NC}"
sleep 10

echo -e "${YELLOW}🔍 Checking application status...${NC}"
if curl -f http://62.171.159.62:8074 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application updated successfully!${NC}"
    echo -e "${GREEN}🌐 URL: http://62.171.159.62:8074${NC}"
else
    echo -e "${YELLOW}⚠️ Application might be starting up...${NC}"
    echo -e "${YELLOW}📋 Check logs: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose logs --tail=20 app'${NC}"
fi

echo -e "${GREEN}⚡ Quick update completed!${NC}"
echo -e "${BLUE}🌐 URL: http://62.171.159.62:8074${NC}"
