#!/bin/bash

# 🔄 Placy Backend Watch & Sync
# Overvåker endringer i functions.php og syncer automatisk til WordPress

# Farger
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

FRONTEND_DIR="/Users/andreasharstad/placy-wp"
BACKEND_DIR="/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy"
WATCH_FILE="$FRONTEND_DIR/functions.php"

echo -e "${BLUE}👀 Watching for changes in functions.php...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Kjør initial sync
./sync-backend.sh

# Overvåk endringer (macOS fswatch)
if command -v fswatch &> /dev/null; then
    fswatch -o "$WATCH_FILE" | while read change; do
        echo -e "\n${YELLOW}📝 Change detected!${NC}"
        ./sync-backend.sh
    done
else
    echo -e "${YELLOW}⚠️  fswatch not installed. Install with: brew install fswatch${NC}"
    echo -e "${BLUE}💡 For now, run ./sync-backend.sh manually after changes${NC}"
fi
