#!/bin/bash

# WordPress Plugin Installer Script
# Kjør dette skriptet etter WordPress er installert

echo "🚀 Installerer WordPress plugins for headless setup..."

# Naviger til WordPress-katalog
if [ -d "/Applications/MAMP/htdocs/placy-wp-backend" ]; then
    WP_PATH="/Applications/MAMP/htdocs/placy-wp-backend"
    echo "📁 Fant MAMP WordPress i: $WP_PATH"
elif [ -d "./wordpress" ]; then
    WP_PATH="./wordpress"
    echo "📁 Fant Docker WordPress i: $WP_PATH"
else
    echo "❌ Kunne ikke finne WordPress installasjon"
    echo "Sørg for at WordPress er installert først!"
    exit 1
fi

# Sjekk om wp-cli er installert
if ! command -v wp &> /dev/null; then
    echo "⚠️  WP-CLI ikke funnet. Installer WP-CLI for automatisk plugin-installasjon:"
    echo "   https://wp-cli.org/#installing"
    echo ""
    echo "Eller installer plugins manuelt via WordPress admin:"
    echo "1. Gå til wp-admin > Plugins > Add New"
    echo "2. Søk etter 'WPGraphQL'"
    echo "3. Installer og aktiver"
    echo "4. Gjenta for 'WPGraphQL for Advanced Custom Fields' (valgfritt)"
    exit 0
fi

echo "📦 Installerer WPGraphQL..."
wp plugin install wp-graphql --activate --path="$WP_PATH"

echo "📦 Installerer WPGraphQL for ACF (valgfritt)..."
wp plugin install wp-graphql-acf --activate --path="$WP_PATH" || echo "⚠️  ACF plugin ikke funnet (dette er OK)"

echo "🔧 Konfigurerer permalink struktur..."
wp rewrite structure '/%postname%/' --path="$WP_PATH"
wp rewrite flush --path="$WP_PATH"

echo "✅ Plugin-installasjon fullført!"
echo ""
echo "🌐 GraphQL endpoint er nå tilgjengelig på:"
if [ "$WP_PATH" = "/Applications/MAMP/htdocs/placy-wp-backend" ]; then
    echo "   http://localhost:8888/placy-wp-backend/graphql"
    echo ""
    echo "🔧 Oppdater .env.local med:"
    echo "   NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8888/placy-wp-backend/graphql"
else
    echo "   http://localhost:8080/graphql"
    echo ""
    echo "🔧 Oppdater .env.local med:"
    echo "   NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8080/graphql"
fi

echo ""
echo "🎯 Neste steg:"
echo "1. Gå til WordPress admin og publiser noen testinnlegg"
echo "2. Start Next.js frontend: npm run dev"
echo "3. Besøk http://localhost:3000 for å se resultatet!"