#!/bin/bash

# WordPress Deployment Script for Servebolt
# Automatiserer opplasting av WordPress backend til Servebolt

set -e

echo "🚀 Deploying WordPress Backend to Servebolt..."

# Konfigurasjonsvariabler
SERVEBOLT_HOST="your-servebolt-host.serveboltapp.net"
SERVEBOLT_USER="your-username"
SERVEBOLT_PATH="/public_html/wp/"
LOCAL_WP_PATH="/Applications/MAMP/htdocs/placy-wp-backend/"

# Sjekk om vi har alle nødvendige konfigurasjoner
if [ -z "$SERVEBOLT_HOST" ] || [ "$SERVEBOLT_HOST" == "your-servebolt-host.serveboltapp.net" ]; then
    echo "❌ Konfigurer SERVEBOLT_HOST i dette skriptet først!"
    echo "Finn din host i Servebolt control panel"
    exit 1
fi

echo "📁 Syncing WordPress files..."

# Ekskluder filer som ikke skal deployes
rsync -avz --delete \
    --exclude='wp-config.php' \
    --exclude='wp-content/uploads/' \
    --exclude='.git/' \
    --exclude='node_modules/' \
    --exclude='.DS_Store' \
    "$LOCAL_WP_PATH" \
    "$SERVEBOLT_USER@$SERVEBOLT_HOST:$SERVEBOLT_PATH"

echo "🔧 Uploading production wp-config.php..."

# Last opp produksjons wp-config (hvis den finnes)
if [ -f "./deployment/wp-config-production.php" ]; then
    scp "./deployment/wp-config-production.php" \
        "$SERVEBOLT_USER@$SERVEBOLT_HOST:$SERVEBOLT_PATH/wp-config.php"
else
    echo "⚠️  Ingen wp-config-production.php funnet. Husk å konfigurere database på Servebolt!"
fi

echo "🎉 WordPress deployment ferdig!"
echo "🌐 Sjekk: https://$SERVEBOLT_HOST/wp/wp-admin/"
echo ""
echo "📋 Neste steg:"
echo "1. Gå til WordPress admin og aktiver plugins"
echo "2. Importer innhold fra lokal (hvis nødvendig)"  
echo "3. Test GraphQL endpoint: https://$SERVEBOLT_HOST/wp/graphql"
echo "4. Oppdater frontend environment variabler"