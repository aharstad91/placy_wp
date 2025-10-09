# Lokal WordPress Oppsett Guide

## Alternativ 1: MAMP Setup (Anbefalt for rask utvikling)

### 1. Last ned og installer MAMP
- Last ned fra: https://www.mamp.info/
- Installer og start MAMP

### 2. Konfigurer MAMP
```
Apache Port: 8888 (standard)
MySQL Port: 8889 (standard)
Document Root: /Applications/MAMP/htdocs
```

### 3. Last ned WordPress
```bash
# Naviger til MAMP htdocs mappe
cd /Applications/MAMP/htdocs

# Last ned WordPress
curl -O https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress placy-wp-backend
rm latest.zip
```

### 4. Opprett database
- Gå til: http://localhost:8888/phpMyAdmin
- Logg inn (brukernavn: root, passord: root)
- Opprett ny database: `placy_wp_local`

### 5. WordPress installasjon
- Gå til: http://localhost:8888/placy-wp-backend
- Følg installasjonsguiden:
  ```
  Database navn: placy_wp_local
  Brukernavn: root
  Passord: root
  Database host: localhost:8889
  ```

### 6. Installer nødvendige plugins
Logg inn på WordPress admin og installer:
- **WPGraphQL** (søk i Plugin-biblioteket)
- **WPGraphQL for Advanced Custom Fields** (valgfritt)

### 7. Aktiver GraphQL
- Gå til: http://localhost:8888/placy-wp-backend/wp-admin
- Aktiver WPGraphQL plugin
- Test GraphQL endpoint: http://localhost:8888/placy-wp-backend/graphql

---

## Alternativ 2: Docker Setup

### 1. Opprett docker-compose.yml
Se filen i prosjektet for full konfigurasjon.

### 2. Start Docker containers
```bash
docker-compose up -d
```

### 3. WordPress tilgjengelig på:
- WordPress: http://localhost:8080
- Database (phpMyAdmin): http://localhost:8081

---

## Frontend Konfigurasjon

### Oppdater .env.local
```
# For MAMP:
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8888/placy-wp-backend/graphql

# For Docker:
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

### Start frontend
```bash
npm run dev
```

Frontend vil være tilgjengelig på: http://localhost:3000

---

## Test GraphQL Connection

1. Gå til WordPress admin
2. Publiser noen testinnlegg
3. Besøk frontend på http://localhost:3000/posts
4. Sjekk at innlegg vises (eller se feilmelding hvis ikke tilkoblet)

---

## Feilsøking

### CORS Issues
Legg til i WordPress `wp-config.php`:
```php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### GraphQL ikke tilgjengelig
1. Sjekk at WPGraphQL plugin er aktivert
2. Test endpoint direkte i nettleser
3. Sjekk WordPress permalink settings (skal være "Post name")