#!/bin/bash

# ------------------------------
# Configuration
# ------------------------------
DB_CONTAINER="eyechake_db"      # Your MySQL Docker container
DB_NAME="sikaf"                 # Database to backup
DB_USER="isaac"                 # MySQL user
DB_PASSWORD="Isaac@2025"      # MySQL password
BACKUP_DIR="$(pwd)"             # Current folder (project root)

# ------------------------------
# Backup filename with date
# ------------------------------
DATE=$(date +%F)  # YYYY-MM-DD
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$DATE.sql.gz"

# ------------------------------
# Perform backup
# ------------------------------
docker exec $DB_CONTAINER sh -c "exec mysqldump -u $DB_USER -p'$DB_PASSWORD' --no-tablespaces $DB_NAME" | gzip > "$BACKUP_FILE"
# ------------------------------
# Done
# ------------------------------
echo "Backup complete: $BACKUP_FILE"