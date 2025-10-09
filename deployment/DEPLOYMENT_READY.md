# Servebolt + Vercel Deployment Checklist ✅

## 🎯 **Produksjonsklar arkitektur opprettet!**

### **📁 Deployment filer laget:**
- ✅ `deployment/SERVEBOLT_GUIDE.md` - Komplett guide
- ✅ `deployment/deploy-wp.sh` - WordPress deployment script  
- ✅ `deployment/wp-config-production.php` - Produksjonskonfig
- ✅ `.env.production` - Produksjon environment variabler

### **📦 Package.json oppdatert med scripts:**
```bash
npm run build:prod      # Production build
npm run deploy:vercel   # Deploy frontend til Vercel  
npm run deploy:wordpress # Deploy WordPress til Servebolt
npm run deploy:all      # Deploy begge deler
```

---

## 🚀 **Deployment Prosess:**

### **1. WordPress Backend → Servebolt:**
```bash
# Konfigurer først deployment/deploy-wp.sh med dine Servebolt detaljer
# Deretter:
npm run deploy:wordpress
```

### **2. Next.js Frontend → Vercel:**
```bash
# Installer Vercel CLI hvis ikke installert:
npm i -g vercel

# Deploy:
npm run deploy:vercel

# Eller koble GitHub repo til Vercel dashboard (anbefalt)
```

### **3. Konfigurer Environment Variabler:**

**Servebolt (WordPress):**
- Database innstillinger
- CORS headers for din frontend URL
- SSL sertifikat

**Vercel (Frontend):**
```
NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT=https://api.placywp.no/graphql
NODE_ENV=production
```

---

## 🎯 **Foreslått Domain Setup:**

- **Frontend**: `https://placywp.no` (eller ditt hoveddomene)
- **WordPress API**: `https://api.placywp.no` (eller subdomain)
- **GraphQL**: `https://api.placywp.no/graphql`

---

## ✨ **Fordeler med denne løsningen:**

### **🚀 Performance:**
- Vercel CDN for frontend (global hastighet)
- Servebolt optimalisert WordPress hosting
- Static generation + API fetching

### **💰 Kostnader:**
- Vercel: Gratis tier (hobbyprosjekter)
- Servebolt: WordPress hosting fra ~200kr/mnd

### **🔧 Enkel vedlikehold:**
- WordPress: Kjent CMS for innhold
- Next.js: Moderne utvikling med hot reload
- Separate deployments = ingen risiko

---

**🎉 Du er nå klar for produksjon på Servebolt + Vercel!** 

Trenger du hjelp med å konfigurere Servebolt eller Vercel?