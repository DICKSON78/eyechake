#!/bin/bash

# EyeChake Full Redeploy Script
# Complete rebuild and redeployment

echo "🔄 EyeChake Full Redeploy"

# Server details
SERVER_IP="62.171.159.62"
PROJECT_DIR="/root/eyechake"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && git checkout master && git pull origin main"

echo -e "${YELLOW}🛑 Stopping containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose down"

echo -e "${YELLOW}🏗️ Building without cache...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose build --no-cache"

echo -e "${YELLOW}🚀 Starting containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose up -d"

echo -e "${YELLOW}🏗️ Building frontend without cache...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build build --no-cache frontend"

echo -e "${YELLOW}🚀 Starting frontend...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose --profile build up frontend"

echo -e "${YELLOW}🧹 Clearing all caches...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan cache:clear && docker compose exec app php artisan config:clear && docker compose exec app php artisan route:clear && docker compose exec app php artisan view:clear"

echo -e "${YELLOW}🗄️ Running migrations...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan migrate --force"

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan config:cache && docker compose exec app php artisan route:cache && docker compose exec app php artisan view:cache"

echo -e "${GREEN}✅ Full redeploy completed!${NC}"
echo -e "${BLUE}🌐 URL: http://62.171.159.62:8074${NC}"
