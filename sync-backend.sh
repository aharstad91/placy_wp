#!/bin/bash

# 🔄 Placy Backend Sync Script
# Synkroniserer WordPress tema-filer fra frontend repo til MAMP WordPress

# Farger for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
FRONTEND_DIR="/Users/andreasharstad/placy-wp"
BACKEND_DIR="/Applications/MAMP/htdocs/placy-wp-backend/wp-content/themes/placy"

echo -e "${BLUE}🔄 Syncing Placy Backend...${NC}\n"

# Sjekk om backend directory eksisterer
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    echo -e "${YELLOW}💡 Make sure MAMP WordPress is installed${NC}"
    exit 1
fi

# Sync functions.php
if [ -f "$FRONTEND_DIR/functions.php" ]; then
    cp "$FRONTEND_DIR/functions.php" "$BACKEND_DIR/functions.php"
    echo -e "${GREEN}✅ functions.php synced${NC}"
else
    echo -e "${RED}❌ functions.php not found in frontend${NC}"
    exit 1
fi

# Sync style.css (hvis den finnes)
if [ -f "$FRONTEND_DIR/style.css" ]; then
    cp "$FRONTEND_DIR/style.css" "$BACKEND_DIR/style.css"
    echo -e "${GREEN}✅ style.css synced${NC}"
fi

# Sync screenshot.png (hvis den finnes)
if [ -f "$FRONTEND_DIR/screenshot.png" ]; then
    cp "$FRONTEND_DIR/screenshot.png" "$BACKEND_DIR/screenshot.png"
    echo -e "${GREEN}✅ screenshot.png synced${NC}"
fi

# Sync mapbox-draw-admin.js (for Earth Studio export)
if [ -f "$FRONTEND_DIR/mapbox-draw-admin.js" ]; then
    cp "$FRONTEND_DIR/mapbox-draw-admin.js" "$BACKEND_DIR/mapbox-draw-admin.js"
    echo -e "${GREEN}✅ mapbox-draw-admin.js synced${NC}"
fi

# Sync mapbox-draw-admin.css (for Mapbox Draw styling)
if [ -f "$FRONTEND_DIR/mapbox-draw-admin.css" ]; then
    cp "$FRONTEND_DIR/mapbox-draw-admin.css" "$BACKEND_DIR/mapbox-draw-admin.css"
    echo -e "${GREEN}✅ mapbox-draw-admin.css synced${NC}"
fi

echo -e "\n${GREEN}✨ Backend sync complete!${NC}"
echo -e "${BLUE}📍 WordPress: http://localhost:8888/placy-wp-backend/wp-admin${NC}"
echo -e "${BLUE}🔌 GraphQL: http://localhost:8888/placy-wp-backend/graphql${NC}"
