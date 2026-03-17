#!/bin/bash

# EyeChake Database Backup Script
# Creates backup of existing database before deployment

echo "💾 EyeChake Database Backup Script"

SERVER_IP="62.171.159.62"
PROJECT_DIR="/root/eyechake"
BACKUP_DIR="/var/backups/eyechake"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

echo -e "${YELLOW}📋 Creating backup directory...${NC}"
ssh root@$SERVER_IP "mkdir -p $BACKUP_DIR"

echo -e "${YELLOW}💾 Backing up current database...${NC}"
ssh root@$SERVER_IP "cd $PROJECT_DIR && docker compose exec db mysqldump -u isaac -pIsaac@2025 sikaf > $BACKUP_DIR/sikaf_backup_before_$DATE.sql"

echo -e "${YELLOW}📊 Checking backup file...${NC}"
ssh root@$SERVER_IP "ls -lh $BACKUP_DIR/sikaf_backup_before_$DATE.sql"

echo -e "${GREEN}✅ Database backup completed!${NC}"
echo -e "${BLUE}📍 Backup location: $BACKUP_DIR/sikaf_backup_before_$DATE.sql${NC}"
echo -e "${BLUE}🔑 To restore: ssh root@$SERVER_IP 'cd $PROJECT_DIR && docker compose exec -T db mysql -u isaac -pIsaac@2025 sikaf < $BACKUP_DIR/sikaf_backup_before_$DATE.sql'"
