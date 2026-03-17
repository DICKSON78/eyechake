#!/bin/bash

# EyeChake Quick Update Script
# For quick updates without full redeployment

echo "⚡ EyeChake Quick Update"

# Server details
SERVER_IP="62.171.159.62"
PROJECT_DIR="/root/eyechake"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && git checkout master && git pull origin main"

echo -e "${YELLOW}🔄 Restarting containers...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose restart"

echo -e "${YELLOW}🧹 Clearing caches...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec app php artisan cache:clear && docker compose exec app php artisan config:clear && docker compose exec app php artisan route:clear"

echo -e "${GREEN}✅ Quick update completed!${NC}"
echo -e "${BLUE}🌐 URL: http://62.171.159.62:8074${NC}"
