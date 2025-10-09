# Servebolt Deployment Guide 🚀

## Anbefalt Produksjonsarkitektur

### **WordPress Backend → Servebolt**
### **Next.js Frontend → Vercel (eller Servebolt)**

---

## 🎯 **Deployment Alternativ 1: WordPress på Servebolt + Frontend på Vercel (ANBEFALT)**

### **WordPress Backend (Servebolt):**

#### 1. **Servebolt WordPress Setup:**
```bash
# På Servebolt control panel:
1. Opprett ny WordPress installasjon
2. Domene: api.placywp.no (eller subdomain)
3. Installer WPGraphQL plugin
4. Import lokalt innhold hvis nødvendig
```

#### 2. **WordPress Konfigurasjon:**
```php
// wp-config.php på Servebolt
define('WP_DEBUG', false);
define('GRAPHQL_DEBUG', false);

// CORS for produksjon
header('Access-Control-Allow-Origin: https://placywp.no');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Sikkerhet
define('FORCE_SSL_ADMIN', true);
```

### **Next.js Frontend (Vercel):**

#### 1. **Deploy til Vercel:**
```bash
# Fra prosjektmappen
npx vercel

# Eller koble GitHub repo til Vercel dashboard
```

#### 2. **Environment Variables på Vercel:**
```
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://api.placywp.no/graphql
NODE_ENV=production
```

---

## 🎯 **Deployment Alternativ 2: Alt på Servebolt**

### **WordPress Backend:**
- Plasser i: `public_html/wp/` eller `public_html/api/`

### **Next.js Frontend:**
- Build static export: `npm run build && npm run export`
- Plasser i: `public_html/` (main domain)

### **Servebolt Konfigurasjon:**
```bash
# .htaccess for Next.js routing
RewriteEngine On
RewriteRule ^api/(.*)$ /wp/$1 [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 📋 **Deployment Scripts (Automatisering)**

### **package.json scripts:**
```json
{
  "scripts": {
    "build:prod": "npm run build",
    "deploy:frontend": "vercel --prod",
    "deploy:wordpress": "./deployment/deploy-wp.sh",
    "deploy:all": "npm run deploy:wordpress && npm run deploy:frontend"
  }
}
```

---

## 🔒 **Sikkerhet for Produksjon**

### **WordPress Security:**
- SSL sertifikat (gratis via Servebolt)
- Strong admin passwords
- Security plugins (Wordfence)
- Regular backups (Servebolt backup)

### **Frontend Security:**
- HTTPS only (Vercel automatisk)
- Environment secrets
- GraphQL rate limiting

---

## 🚀 **Fordeler med denne arkitekturen:**

### **✅ Servebolt + Vercel:**
- **Performance**: CDN for frontend, optimalisert WP hosting
- **Sikkerhet**: Separert admin og frontend
- **Skalerbarhet**: Auto-scaling på Vercel
- **Kostnader**: Vercel gratis tier + Servebolt WP hosting

### **✅ Alt på Servebolt:**
- **Enklere**: Ett hosting-sted
- **Billigere**: Kun Servebolt kostnad
- **Kontroll**: Full server kontroll

---

## 📊 **Anbefaling:**

**Start med Alternativ 1 (Servebolt + Vercel)**
- Enklest deployment
- Beste performance
- Kan alltid flytte til Servebolt senere

**Eksempel produksjon URLs:**
- WordPress: `https://api.placywp.no`
- Frontend: `https://placywp.no`
- GraphQL: `https://api.placywp.no/graphql`